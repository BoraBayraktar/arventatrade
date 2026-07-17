import { z } from "zod";

import { marketplaceOrderService, MarketplaceOrderCreationError } from "@/modules/commerce/services/marketplace-order.service";
import { TrendyolClient } from "@/modules/integration/connectors/trendyol.client";
import { MarketplaceIntegrationRepository } from "@/modules/integration/repositories/marketplace-integration.repository";
import { integrationService } from "@/modules/integration/services/integration.service";
import { integrationSecretCryptoService } from "@/modules/integration/services/integration-secret-crypto.service";
import { trendyolStockSyncService } from "@/modules/integration/services/trendyol-stock-sync.service";

const upsertConfigSchema = z.object({
  id: z.string().trim().min(1).optional(),
  channel: z.literal("TRENDYOL").default("TRENDYOL"),
  displayName: z.string().trim().min(1).max(120),
  sellerId: z.string().trim().min(1).max(80),
  apiKey: z.string().trim().min(1).max(240).optional(),
  apiSecret: z.string().trim().min(1).max(240).optional(),
  userAgent: z.string().trim().min(1).max(180),
  storeFrontCode: z.string().trim().min(1).max(80).optional().nullable().or(z.literal("")).transform((value) => value || null),
  endpointUrl: z.string().trim().url().optional().nullable().or(z.literal("")).transform((value) => value || null),
  trendyolCargoCompanyId: z.coerce.number().int().positive().optional().nullable(),
  trendyolShipmentAddressId: z.coerce.number().int().min(0).optional().nullable(),
  trendyolReturningAddressId: z.coerce.number().int().min(0).optional().nullable(),
  trendyolOrigin: z.string().trim().min(2).max(3).optional().nullable().or(z.literal("")).transform((value) => value || null),
  trendyolDimensionalWeight: z.coerce.number().positive().optional().nullable(),
  environment: z.enum(["PRODUCTION", "STAGE"]).default("PRODUCTION"),
  syncWindowMinutes: z.coerce.number().int().min(15).max(1440).default(60),
  isActive: z.boolean().default(true),
});

const testConfigSchema = z.object({
  id: z.string().trim().min(1).optional(),
  sellerId: z.string().trim().min(1).max(80).optional(),
  apiKey: z.string().trim().min(1).max(240).optional(),
  apiSecret: z.string().trim().min(1).max(240).optional(),
  userAgent: z.string().trim().min(1).max(180).optional(),
  storeFrontCode: z.string().trim().min(1).max(80).optional().nullable().or(z.literal("")).transform((value) => value || null),
  endpointUrl: z.string().trim().url().optional().nullable().or(z.literal("")).transform((value) => value || null),
}).refine((value) => Boolean(value.id) || Boolean(value.sellerId && value.apiKey && value.apiSecret && value.userAgent), {
  message: "Connection credentials are required",
});

const syncConfigSchema = z.object({
  id: z.string().trim().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.string().trim().min(1).max(80).optional(),
});

const scheduledSyncSchema = z.object({
  processQueue: z.boolean().default(true),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  followUpBatches: z.boolean().default(true),
  batchLimit: z.coerce.number().int().min(1).max(50).default(10),
  batchMinCheckIntervalMinutes: z.coerce.number().int().min(1).max(1440).default(15),
});

const packageIdSchema = z.object({
  id: z.string().trim().min(1),
});

const matchLineSchema = z.object({
  lineId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  productVariantId: z.string().trim().min(1).optional().nullable(),
});

const lineIdSchema = z.object({
  lineId: z.string().trim().min(1),
});

const createOrderSchema = z.object({
  packageId: z.string().trim().min(1),
});

const queueStatusSyncSchema = z.object({
  packageId: z.string().trim().min(1),
  status: z.enum(["Picking", "Invoiced"]),
  invoiceNumber: z.string().trim().min(1).max(120).optional(),
}).refine((value) => value.status !== "Invoiced" || Boolean(value.invoiceNumber), {
  message: "Invoice number is required for Invoiced status",
});

const retryStatusJobSchema = z.object({
  packageId: z.string().trim().min(1),
  jobId: z.string().trim().min(1),
  resolvedByUserId: z.string().trim().min(1),
});

const catalogLookupSchema = z.object({
  query: z.string().trim().min(2).max(120),
});

const categoryAttributeLookupSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
});

const categoryAttributeValueLookupSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  attributeId: z.coerce.number().int().positive(),
});

function maskSecret(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return "********";
}

function mapConfig(item: Awaited<ReturnType<MarketplaceIntegrationRepository["listConfigs"]>>[number]) {
  return {
    id: item.id,
    channel: item.channel,
    displayName: item.displayName,
    sellerId: item.sellerId,
    apiKeyMasked: maskSecret(item.apiKeyEncrypted),
    apiSecretMasked: maskSecret(item.apiSecretEncrypted),
    userAgent: item.userAgent,
    storeFrontCode: item.storeFrontCode,
    endpointUrl: item.endpointUrl,
    trendyolCargoCompanyId: item.trendyolCargoCompanyId,
    trendyolShipmentAddressId: item.trendyolShipmentAddressId,
    trendyolReturningAddressId: item.trendyolReturningAddressId,
    trendyolOrigin: item.trendyolOrigin,
    trendyolDimensionalWeight: item.trendyolDimensionalWeight?.toNumber() ?? null,
    environment: item.environment,
    syncWindowMinutes: item.syncWindowMinutes,
    lastSuccessfulSyncAt: item.lastSuccessfulSyncAt?.toISOString() ?? null,
    lastCursorAt: item.lastCursorAt?.toISOString() ?? null,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
  };
}

function mapPackage(item: Awaited<ReturnType<MarketplaceIntegrationRepository["listRecentPackages"]>>[number]) {
  const matchedLineCount = item.lines.filter((line) => line.matchStatus === "MATCHED").length;
  const needsReviewLineCount = item.lines.length - matchedLineCount;

  return {
    id: item.id,
    channel: item.channel,
    configId: item.configId,
    configName: item.config.displayName,
    sellerId: item.config.sellerId,
    externalPackageId: item.externalPackageId,
    externalOrderNumber: item.externalOrderNumber,
    packageStatus: item.packageStatus,
    importStatus: item.importStatus,
    orderDate: item.orderDate?.toISOString() ?? null,
    lastModifiedDate: item.lastModifiedDate?.toISOString() ?? null,
    customerName: item.customerName,
    cargoProviderName: item.cargoProviderName,
    cargoTrackingNumber: item.cargoTrackingNumber,
    lineCount: item.lines.length,
    matchedLineCount,
    needsReviewLineCount,
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapPackageStatusJob(item: Awaited<ReturnType<MarketplaceIntegrationRepository["listPackageStatusJobs"]>>[number]) {
  const payload = item.payload as Record<string, unknown> | null;

  return {
    id: item.id,
    status: item.status,
    targetStatus: typeof payload?.status === "string" ? payload.status : null,
    invoiceNumber: typeof payload?.invoiceNumber === "string" ? payload.invoiceNumber : null,
    attemptCount: item.attemptCount,
    maxAttempts: item.maxAttempts,
    nextAttemptAt: item.nextAttemptAt.toISOString(),
    lastAttemptAt: item.lastAttemptAt?.toISOString() ?? null,
    processedAt: item.processedAt?.toISOString() ?? null,
    lastError: item.lastError,
    createdAt: item.createdAt.toISOString(),
    deadLetter: item.deadLetter ? {
      id: item.deadLetter.id,
      resolved: item.deadLetter.resolved,
      resolvedAt: item.deadLetter.resolvedAt?.toISOString() ?? null,
    } : null,
  };
}

async function mapPackageDetail(
  repository: MarketplaceIntegrationRepository,
  item: NonNullable<Awaited<ReturnType<MarketplaceIntegrationRepository["findPackageById"]>>>,
) {
  const statusJobs = await repository.listPackageStatusJobs(item.id);

  return {
    ...mapPackage({
      ...item,
      lines: item.lines.map((line) => ({
        id: line.id,
        matchStatus: line.matchStatus,
      })),
    }),
    lines: item.lines.map((line) => ({
      id: line.id,
      externalLineId: line.externalLineId,
      merchantSku: line.merchantSku,
      barcode: line.barcode,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice?.toNumber() ?? null,
      currency: line.currency,
      matchStatus: line.matchStatus,
      productId: line.productId,
      productVariantId: line.productVariantId,
      matchedProductName: line.product?.name ?? null,
      matchedProductSku: line.product?.sku ?? null,
      matchedVariantTitle: line.productVariant?.title ?? null,
      matchedVariantSku: line.productVariant?.sku ?? null,
    })),
    statusHistory: statusJobs.map(mapPackageStatusJob),
  };
}

export class MarketplaceIntegrationService {
  constructor(private readonly repository = new MarketplaceIntegrationRepository()) {}

  private async getActiveTrendyolClient() {
    const [config] = await this.repository.listActiveConfigsByChannel("TRENDYOL");

    if (!config) {
      throw new Error("TRENDYOL_CONFIG_NOT_FOUND");
    }

    const apiKey = integrationSecretCryptoService.decrypt(config.apiKeyEncrypted);
    const apiSecret = integrationSecretCryptoService.decrypt(config.apiSecretEncrypted);

    if (!apiKey || !apiSecret || !config.userAgent) {
      throw new Error("TRENDYOL_CONFIG_INCOMPLETE");
    }

    return new TrendyolClient({
      sellerId: config.sellerId,
      apiKey,
      apiSecret,
      userAgent: config.userAgent,
      storeFrontCode: config.storeFrontCode,
      endpointUrl: config.endpointUrl,
    });
  }

  async listConfigs() {
    const items = await this.repository.listConfigs();
    return {
      items: items.map(mapConfig),
    };
  }

  async getDashboard() {
    const [configs, packages] = await Promise.all([
      this.repository.listConfigs(),
      this.repository.listRecentPackages(30),
    ]);

    return {
      configs: configs.map(mapConfig),
      packages: packages.map(mapPackage),
      summary: {
        activeConfigCount: configs.filter((item) => item.isActive).length,
        packageCount: packages.length,
        readyForOrderCount: packages.filter((item) => item.importStatus === "READY_FOR_ORDER").length,
        needsReviewCount: packages.filter((item) => item.importStatus === "NEEDS_REVIEW").length,
      },
    };
  }

  async searchTrendyolBrands(input: unknown) {
    const parsed = catalogLookupSchema.parse(input);
    const client = await this.getActiveTrendyolClient();

    return {
      items: await client.searchBrands(parsed.query),
    };
  }

  async searchTrendyolCategories(input: unknown) {
    const parsed = catalogLookupSchema.parse(input);
    const client = await this.getActiveTrendyolClient();

    return {
      items: await client.searchCategories(parsed.query),
    };
  }

  async listTrendyolCategoryAttributes(input: unknown) {
    const parsed = categoryAttributeLookupSchema.parse(input);
    const client = await this.getActiveTrendyolClient();

    return {
      items: await client.getCategoryAttributes(parsed.categoryId),
    };
  }

  async listTrendyolCategoryAttributeValues(input: unknown) {
    const parsed = categoryAttributeValueLookupSchema.parse(input);
    const client = await this.getActiveTrendyolClient();

    return {
      items: await client.getCategoryAttributeValues(parsed.categoryId, parsed.attributeId),
    };
  }

  async getPackageDetail(input: unknown) {
    const parsed = packageIdSchema.parse(input);
    const item = await this.repository.findPackageById(parsed.id);

    if (!item) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
    }

    return mapPackageDetail(this.repository, item);
  }

  async upsertConfig(input: unknown) {
    const parsed = upsertConfigSchema.parse(input);

    if (!parsed.id && (!parsed.apiKey || !parsed.apiSecret)) {
      throw new Error("MARKETPLACE_CONFIG_SECRET_REQUIRED");
    }

    const item = await this.repository.upsertConfig({
      id: parsed.id,
      channel: parsed.channel,
      displayName: parsed.displayName,
      sellerId: parsed.sellerId,
      ...(parsed.apiKey ? { apiKeyEncrypted: integrationSecretCryptoService.encrypt(parsed.apiKey) ?? undefined } : {}),
      ...(parsed.apiSecret ? { apiSecretEncrypted: integrationSecretCryptoService.encrypt(parsed.apiSecret) ?? undefined } : {}),
      userAgent: parsed.userAgent,
      storeFrontCode: parsed.storeFrontCode,
      endpointUrl: parsed.endpointUrl,
      trendyolCargoCompanyId: parsed.trendyolCargoCompanyId,
      trendyolShipmentAddressId: parsed.trendyolShipmentAddressId,
      trendyolReturningAddressId: parsed.trendyolReturningAddressId,
      trendyolOrigin: parsed.trendyolOrigin,
      trendyolDimensionalWeight: parsed.trendyolDimensionalWeight,
      environment: parsed.environment,
      syncWindowMinutes: parsed.syncWindowMinutes,
      isActive: parsed.isActive,
    });

    return mapConfig(item);
  }

  async testConnection(input: unknown) {
    const parsed = testConfigSchema.parse(input);
    let sellerId = parsed.sellerId ?? null;
    let apiKey = parsed.apiKey ?? null;
    let apiSecret = parsed.apiSecret ?? null;
    let userAgent = parsed.userAgent ?? null;
    let storeFrontCode = parsed.storeFrontCode ?? null;
    let endpointUrl = parsed.endpointUrl ?? null;

    if (parsed.id) {
      const config = await this.repository.findActiveConfigById(parsed.id);

      if (!config || config.channel !== "TRENDYOL") {
        throw new Error("TRENDYOL_CONFIG_NOT_FOUND");
      }

      sellerId = sellerId ?? config.sellerId;
      apiKey = apiKey ?? integrationSecretCryptoService.decrypt(config.apiKeyEncrypted);
      apiSecret = apiSecret ?? integrationSecretCryptoService.decrypt(config.apiSecretEncrypted);
      userAgent = userAgent ?? config.userAgent;
      storeFrontCode = storeFrontCode ?? config.storeFrontCode;
      endpointUrl = endpointUrl ?? config.endpointUrl;
    }

    if (!sellerId || !apiKey || !apiSecret || !userAgent) {
      throw new Error("TRENDYOL_CONFIG_INCOMPLETE");
    }

    const client = new TrendyolClient({
      sellerId,
      apiKey,
      apiSecret,
      userAgent,
      storeFrontCode,
      endpointUrl,
    });

    await client.testConnection();

    return {
      ok: true,
      checkedAt: new Date().toISOString(),
    };
  }

  async queueOrderImport(input: unknown) {
    const parsed = syncConfigSchema.parse(input);
    const payload = {
      ...(parsed.startDate ? { startDate: parsed.startDate } : {}),
      ...(parsed.endDate ? { endDate: parsed.endDate } : {}),
      ...(parsed.status ? { status: parsed.status } : {}),
    };

    return integrationService.dispatchJobs({
      channel: "TRENDYOL",
      jobType: "ORDER_IMPORT",
      entityType: "MARKETPLACE_ACCOUNT",
      entityIds: [parsed.id],
      maxAttempts: 3,
      payload,
      idempotencySuffix: new Date().toISOString(),
    });
  }

  async queuePackageStatusSync(input: unknown) {
    const parsed = queueStatusSyncSchema.parse(input);
    const item = await this.repository.findPackageById(parsed.packageId);

    if (!item) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
    }

    if (parsed.status === "Picking" && (item.packageStatus === "Picking" || item.packageStatus === "Invoiced")) {
      throw new Error("MARKETPLACE_PACKAGE_STATUS_ORDER_INVALID");
    }

    if (parsed.status === "Invoiced" && item.packageStatus !== "Picking") {
      throw new Error("MARKETPLACE_PACKAGE_STATUS_ORDER_INVALID");
    }

    return integrationService.dispatchJobs({
      channel: "TRENDYOL",
      jobType: "ORDER_STATUS_SYNC",
      entityType: "MARKETPLACE_PACKAGE",
      entityIds: [parsed.packageId],
      maxAttempts: 3,
      payload: {
        status: parsed.status,
        ...(parsed.invoiceNumber ? { invoiceNumber: parsed.invoiceNumber } : {}),
      },
      idempotencySuffix: `${parsed.status}:${parsed.invoiceNumber ?? "no-invoice"}:${new Date().toISOString()}`,
    });
  }

  async retryPackageStatusJob(input: unknown) {
    const parsed = retryStatusJobSchema.parse(input);
    const job = await this.repository.findPackageStatusJob({
      packageId: parsed.packageId,
      jobId: parsed.jobId,
    });

    if (!job) {
      throw new Error("MARKETPLACE_STATUS_JOB_NOT_FOUND");
    }

    return integrationService.retryDeadLetter({
      jobId: parsed.jobId,
      resolvedByUserId: parsed.resolvedByUserId,
    });
  }

  async scheduleActiveTrendyolImports(input: unknown) {
    const parsed = scheduledSyncSchema.parse(input ?? {});
    const configs = await this.repository.listActiveConfigsByChannel("TRENDYOL");

    let accepted = 0;
    let deduplicated = 0;

    for (const config of configs) {
      const result = await integrationService.dispatchJobs({
        channel: "TRENDYOL",
        jobType: "ORDER_IMPORT",
        entityType: "MARKETPLACE_ACCOUNT",
        entityIds: [config.id],
        maxAttempts: 3,
        payload: {},
        idempotencySuffix: new Date().toISOString(),
      });
      accepted += result.accepted;
      deduplicated += result.deduplicated;
    }

    const processed = parsed.processQueue
      ? await integrationService.processQueue({ limit: parsed.limit })
      : null;
    const batchFollowUp = parsed.followUpBatches
      ? await trendyolStockSyncService.followUpPendingBatches({
          limit: parsed.batchLimit,
          minCheckIntervalMinutes: parsed.batchMinCheckIntervalMinutes,
        })
      : null;

    return {
      configCount: configs.length,
      accepted,
      deduplicated,
      processed,
      batchFollowUp,
    };
  }

  async matchPackageLine(input: unknown) {
    const parsed = matchLineSchema.parse(input);
    const target = await this.repository.findProductTarget({
      productId: parsed.productId,
      productVariantId: parsed.productVariantId ?? null,
    });

    if (!target) {
      throw new Error("MARKETPLACE_PRODUCT_TARGET_NOT_FOUND");
    }

    const item = await this.repository.updateLineMatch({
      lineId: parsed.lineId,
      productId: target.productId,
      productVariantId: target.productVariantId,
    });

    if (!item) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
    }

    return mapPackageDetail(this.repository, item);
  }

  async ignorePackageLine(input: unknown) {
    const parsed = lineIdSchema.parse(input);
    const item = await this.repository.ignoreLine({
      lineId: parsed.lineId,
    });

    if (!item) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
    }

    return mapPackageDetail(this.repository, item);
  }

  async createOrderFromPackage(input: unknown) {
    const parsed = createOrderSchema.parse(input);
    const item = await this.repository.findPackageById(parsed.packageId);

    if (!item) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
    }

    if (item.matchedOrderId || item.importStatus === "ORDER_CREATED") {
      return mapPackageDetail(this.repository, item);
    }

    if (item.importStatus !== "READY_FOR_ORDER") {
      throw new Error("MARKETPLACE_PACKAGE_NOT_READY");
    }

    const orderLines = item.lines.filter((line) => line.matchStatus !== "IGNORED");
    const invalidLine = orderLines.find((line) => line.matchStatus !== "MATCHED" || !line.productId);
    if (invalidLine) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_READY");
    }

    try {
      const created = await marketplaceOrderService.createOrderFromMarketplace({
        channel: item.channel,
        externalOrderNumber: item.externalOrderNumber,
        lines: orderLines.map((line) => ({
          productId: line.productId!,
          productVariantId: line.productVariantId,
          quantity: line.quantity,
          unitPrice: line.unitPrice?.toNumber() ?? null,
          currency: line.currency,
        })),
      });

      await this.repository.markPackageOrderCreated({
        packageId: item.id,
        orderNumber: created.orderNumber,
      });

      const updated = await this.repository.findPackageById(item.id);
      if (!updated) {
        throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
      }

      return mapPackageDetail(this.repository, updated);
    } catch (error) {
      if (error instanceof MarketplaceOrderCreationError) {
        throw error;
      }

      throw error;
    }
  }

}

export const marketplaceIntegrationService = new MarketplaceIntegrationService();
