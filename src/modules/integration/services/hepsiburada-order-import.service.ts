import { z } from "zod";

import { HepsiburadaClient, type HepsiburadaOrderRow } from "@/modules/integration/connectors/hepsiburada.client";
import { MarketplaceIntegrationRepository } from "@/modules/integration/repositories/marketplace-integration.repository";
import { integrationSecretCryptoService } from "@/modules/integration/services/integration-secret-crypto.service";

const importPayloadSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  maxPages: z.coerce.number().int().min(1).max(100).optional(),
});

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeRawObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function normalizeDate(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function normalizeLine(rawLine: Record<string, unknown>, index: number) {
  const externalLineId = String(
    rawLine.lineId
      ?? rawLine.itemId
      ?? rawLine.orderLineId
      ?? rawLine.packageItemId
      ?? rawLine.barcode
      ?? rawLine.merchantSku
      ?? rawLine.merchantSKU
      ?? rawLine.sku
      ?? rawLine.stockCode
      ?? index,
  );

  return {
    externalLineId,
    merchantSku: readString(rawLine.merchantSku) ?? readString(rawLine.merchantSKU) ?? readString(rawLine.sku) ?? readString(rawLine.stockCode),
    barcode: readString(rawLine.barcode),
    productName: readString(rawLine.productName) ?? readString(rawLine.productTitle) ?? "Hepsiburada urunu",
    quantity: Math.max(Math.trunc(readNumber(rawLine.quantity) ?? 1), 1),
    unitPrice: readNumber(rawLine.unitPrice) ?? readNumber(rawLine.totalPrice) ?? readNumber(rawLine.price),
    currency: readString(rawLine.currency) ?? readString(rawLine.currencyCode) ?? "TRY",
    rawPayload: rawLine,
  };
}

function getRowLines(row: HepsiburadaOrderRow) {
  const explicitLines = [row.lines, row.items, row.lineItems, row.packageItems].find(Array.isArray);

  if (explicitLines && explicitLines.length > 0) {
    return explicitLines.map((line, index) => normalizeLine(line as Record<string, unknown>, index));
  }

  return [normalizeLine(row as Record<string, unknown>, 0)];
}

function getPackageKey(row: HepsiburadaOrderRow) {
  return String(
    row.packageNumber
      ?? row.packageNo
      ?? row.packageId
      ?? row.orderNumber
      ?? row.orderNo
      ?? row.merchantOrderNumber
      ?? "",
  ).trim();
}

function getOrderKey(row: HepsiburadaOrderRow) {
  return String(
    row.orderNumber
      ?? row.orderNo
      ?? row.merchantOrderNumber
      ?? row.packageNumber
      ?? row.packageNo
      ?? row.packageId
      ?? "",
  ).trim();
}

function createBasePackage(
  configId: string,
  row: HepsiburadaOrderRow,
  externalPackageId: string,
  externalOrderNumber: string,
  orderDate: Date | null,
  lastModifiedDate: Date | null,
) {
  return {
    configId,
    externalPackageId,
    externalOrderNumber,
    packageStatus: readString(row.status) ?? "UNKNOWN",
    orderDate,
    lastModifiedDate,
    customerName: readString(row.customerName) ?? readString(row.customerFullName),
    customerEmail: readString(row.customerEmail),
    shipmentAddress: normalizeRawObject(row.shipmentAddress) ?? normalizeRawObject(row.shippingAddress),
    invoiceAddress: normalizeRawObject(row.invoiceAddress) ?? normalizeRawObject(row.billingAddress),
    cargoProviderName: readString(row.cargoCompanyName) ?? readString(row.cargoProviderName),
    cargoTrackingNumber: readString(row.cargoTrackingNumber) ?? readString(row.trackingNumber),
    lines: [] as ReturnType<typeof normalizeLine>[],
    rawRows: [] as Record<string, unknown>[],
  };
}

function groupRows(configId: string, rows: HepsiburadaOrderRow[]) {
  const grouped = new Map<string, ReturnType<typeof createBasePackage>>();

  for (const row of rows) {
    const externalPackageId = getPackageKey(row);
    const externalOrderNumber = getOrderKey(row);

    if (!externalPackageId || !externalOrderNumber) {
      throw new Error("HEPSIBURADA_ORDER_MISSING_ID");
    }

    const key = `${externalPackageId}:${externalOrderNumber}`;
    const orderDate = normalizeDate(row.orderDate);
    const lastModifiedDate = normalizeDate(row.lastModifiedDate) ?? orderDate;
    const current = grouped.get(key) ?? createBasePackage(
      configId,
      row,
      externalPackageId,
      externalOrderNumber,
      orderDate,
      lastModifiedDate,
    );

    current.lines.push(...getRowLines(row));
    current.rawRows.push(row as Record<string, unknown>);

    if (lastModifiedDate && (!current.lastModifiedDate || lastModifiedDate > current.lastModifiedDate)) {
      current.lastModifiedDate = lastModifiedDate;
    }

    grouped.set(key, current);
  }

  return Array.from(grouped.values()).map((item) => ({
    channel: "HEPSIBURADA" as const,
    configId: item.configId,
    externalPackageId: item.externalPackageId,
    externalOrderNumber: item.externalOrderNumber,
    packageStatus: item.packageStatus,
    orderDate: item.orderDate,
    lastModifiedDate: item.lastModifiedDate,
    customerName: item.customerName,
    customerEmail: item.customerEmail,
    shipmentAddress: item.shipmentAddress,
    invoiceAddress: item.invoiceAddress,
    cargoProviderName: item.cargoProviderName,
    cargoTrackingNumber: item.cargoTrackingNumber,
    rawPayload: {
      rows: item.rawRows,
    },
    lines: item.lines,
  }));
}

export class HepsiburadaOrderImportService {
  constructor(private readonly repository = new MarketplaceIntegrationRepository()) {}

  async importOrders(input: { configId: string; payload?: Record<string, unknown> | null }) {
    const config = await this.repository.findActiveConfigById(input.configId);

    if (!config || config.channel !== "HEPSIBURADA") {
      throw new Error("HEPSIBURADA_CONFIG_NOT_FOUND");
    }

    const apiKey = integrationSecretCryptoService.decrypt(config.apiKeyEncrypted);
    const apiSecret = integrationSecretCryptoService.decrypt(config.apiSecretEncrypted);

    if (!apiKey || !apiSecret || !config.userAgent) {
      throw new Error("HEPSIBURADA_CONFIG_INCOMPLETE");
    }

    const payload = importPayloadSchema.parse(input.payload ?? {});
    const now = new Date();
    const endDate = payload.endDate ? new Date(payload.endDate) : now;
    const startDate = payload.startDate
      ? new Date(payload.startDate)
      : new Date((config.lastCursorAt ?? new Date(now.getTime() - config.syncWindowMinutes * 60000)).getTime() - 5 * 60000);

    const client = new HepsiburadaClient({
      merchantId: config.sellerId,
      apiKey,
      apiSecret,
      userAgent: config.userAgent,
      endpointUrl: config.endpointUrl,
    });

    const rows = await client.getOrders({
      startDate,
      endDate,
      pageSize: payload.pageSize,
      maxPages: payload.maxPages,
    });

    const packages = groupRows(config.id, rows);
    let readyForOrder = 0;
    let needsReview = 0;
    let cursorAt: Date | null = null;

    for (const item of packages) {
      const saved = await this.repository.upsertPackage(item);

      if (saved.importStatus === "READY_FOR_ORDER") {
        readyForOrder += 1;
      } else {
        needsReview += 1;
      }

      if (item.lastModifiedDate && (!cursorAt || item.lastModifiedDate > cursorAt)) {
        cursorAt = item.lastModifiedDate;
      }
    }

    await this.repository.markConfigSynced({
      id: config.id,
      cursorAt: cursorAt ?? endDate,
      syncedAt: now,
    });

    return {
      importedPackages: packages.length,
      readyForOrder,
      needsReview,
      cursorAt: (cursorAt ?? endDate).toISOString(),
    };
  }
}

export const hepsiburadaOrderImportService = new HepsiburadaOrderImportService();
