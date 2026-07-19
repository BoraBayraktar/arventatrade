import { z } from "zod";

import { PazaramaClient, type PazaramaOrder, type PazaramaOrderLine } from "@/modules/integration/connectors/pazarama.client";
import { MarketplaceIntegrationRepository } from "@/modules/integration/repositories/marketplace-integration.repository";
import { integrationSecretCryptoService } from "@/modules/integration/services/integration-secret-crypto.service";

const importPayloadSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  maxPages: z.coerce.number().int().min(1).max(100).optional(),
});

export type PazaramaOrderImportInput = {
  configId: string;
  payload?: Record<string, unknown> | null;
};

export type PazaramaOrderImportResult = {
  importedPackages: number;
  readyForOrder: number;
  needsReview: number;
  cursorAt: string | null;
};

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

function parseDate(value: unknown) {
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

function normalizeRawObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function normalizeLine(line: PazaramaOrderLine, index: number) {
  const externalLineId = String(line.id ?? line.lineId ?? line.orderItemId ?? line.barcode ?? line.productCode ?? index);
  const quantity = Math.max(Math.trunc(readNumber(line.quantity) ?? 1), 1);
  const unitPrice = readNumber(line.salePrice) ?? readNumber(line.price) ?? readNumber(line.amount);

  return {
    externalLineId,
    merchantSku: readString(line.merchantSku) ?? readString(line.sellerSku) ?? readString(line.stockCode) ?? readString(line.productCode),
    barcode: readString(line.barcode),
    productName: readString(line.productName) ?? readString(line.name) ?? "Pazarama ürünü",
    quantity,
    unitPrice,
    currency: "TRY",
    rawPayload: line,
  };
}

function normalizePackage(configId: string, item: PazaramaOrder) {
  const externalPackageId = String(item.packageNumber ?? item.orderId ?? item.id ?? item.orderNumber ?? "");
  const externalOrderNumber = readString(item.orderNumber) ?? readString(item.orderCode) ?? externalPackageId;

  if (!externalPackageId || !externalOrderNumber) {
    throw new Error("PAZARAMA_ORDER_MISSING_ID");
  }

  return {
    channel: "PAZARAMA" as const,
    configId,
    externalPackageId,
    externalOrderNumber,
    packageStatus: readString(item.status) ?? "UNKNOWN",
    orderDate: parseDate(item.orderDate),
    lastModifiedDate: parseDate(item.updatedDate) ?? parseDate(item.lastModifiedDate),
    customerName: readString(item.customerName) ?? readString(item.customerFullName),
    customerEmail: readString(item.customerEmail),
    shipmentAddress: normalizeRawObject(item.shippingAddress) ?? normalizeRawObject(item.shipmentAddress),
    invoiceAddress: normalizeRawObject(item.billingAddress) ?? normalizeRawObject(item.invoiceAddress),
    cargoProviderName: readString(item.cargoCompanyName) ?? readString(item.cargoProviderName),
    cargoTrackingNumber: readString(item.cargoTrackingNumber),
    rawPayload: item,
    lines: (item.lines ?? item.orderItems ?? item.items ?? []).map(normalizeLine),
  };
}

export class PazaramaOrderImportService {
  constructor(private readonly repository = new MarketplaceIntegrationRepository()) {}

  async importOrders(input: PazaramaOrderImportInput): Promise<PazaramaOrderImportResult> {
    const config = await this.repository.findActiveConfigById(input.configId);

    if (!config || config.channel !== "PAZARAMA") {
      throw new Error("PAZARAMA_CONFIG_NOT_FOUND");
    }

    const apiKey = integrationSecretCryptoService.decrypt(config.apiKeyEncrypted);
    const apiSecret = integrationSecretCryptoService.decrypt(config.apiSecretEncrypted);

    if (!apiKey || !apiSecret) {
      throw new Error("PAZARAMA_CONFIG_INCOMPLETE");
    }

    const payload = importPayloadSchema.parse(input.payload ?? {});
    const now = new Date();
    const endDate = payload.endDate ? new Date(payload.endDate) : now;
    const startDate = payload.startDate
      ? new Date(payload.startDate)
      : new Date((config.lastCursorAt ?? new Date(now.getTime() - config.syncWindowMinutes * 60000)).getTime() - 5 * 60000);

    const client = new PazaramaClient({
      apiKey,
      apiSecret,
      endpointUrl: config.endpointUrl,
    });

    const orders = await client.getOrders({
      startDate,
      endDate,
      pageSize: payload.pageSize,
      maxPages: payload.maxPages,
    });

    let readyForOrder = 0;
    let needsReview = 0;
    let cursorAt: Date | null = null;

    for (const item of orders) {
      const normalized = normalizePackage(config.id, item);
      const saved = await this.repository.upsertPackage(normalized);

      if (saved.importStatus === "READY_FOR_ORDER") {
        readyForOrder += 1;
      } else {
        needsReview += 1;
      }

      if (normalized.lastModifiedDate && (!cursorAt || normalized.lastModifiedDate > cursorAt)) {
        cursorAt = normalized.lastModifiedDate;
      }
    }

    await this.repository.markConfigSynced({
      id: config.id,
      cursorAt: cursorAt ?? endDate,
      syncedAt: now,
    });

    return {
      importedPackages: orders.length,
      readyForOrder,
      needsReview,
      cursorAt: (cursorAt ?? endDate).toISOString(),
    };
  }
}

export const pazaramaOrderImportService = new PazaramaOrderImportService();
