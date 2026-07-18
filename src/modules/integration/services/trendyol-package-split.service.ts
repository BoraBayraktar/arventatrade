import { z } from "zod";

import { TrendyolClient } from "@/modules/integration/connectors/trendyol.client";
import { MarketplaceIntegrationRepository } from "@/modules/integration/repositories/marketplace-integration.repository";
import { integrationSecretCryptoService } from "@/modules/integration/services/integration-secret-crypto.service";
import { trendyolOrderImportService } from "@/modules/integration/services/trendyol-order-import.service";

const splitPackageSchema = z.object({
  packageId: z.string().trim().min(1),
  splits: z.array(z.object({
    lineId: z.string().trim().min(1),
    quantity: z.coerce.number().int().positive(),
  })).min(1),
});

export class TrendyolPackageSplitService {
  constructor(private readonly repository = new MarketplaceIntegrationRepository()) {}

  async splitPackage(input: unknown) {
    const parsed = splitPackageSchema.parse(input);
    const targetPackage = await this.repository.findPackageForSplit(parsed.packageId);

    if (!targetPackage) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
    }

    if (targetPackage.channel !== "TRENDYOL") {
      throw new Error("MARKETPLACE_PACKAGE_UNSUPPORTED_CHANNEL");
    }

    if (targetPackage.packageStatus === "Invoiced" || targetPackage.packageStatus === "Shipped" || targetPackage.packageStatus === "Delivered") {
      throw new Error("TRENDYOL_PACKAGE_SPLIT_STATUS_INVALID");
    }

    const apiKey = integrationSecretCryptoService.decrypt(targetPackage.config.apiKeyEncrypted);
    const apiSecret = integrationSecretCryptoService.decrypt(targetPackage.config.apiSecretEncrypted);

    if (!apiKey || !apiSecret || !targetPackage.config.userAgent) {
      throw new Error("TRENDYOL_CONFIG_INCOMPLETE");
    }

    const lineMap = new Map(targetPackage.lines.map((line) => [line.id, line]));
    const packageDetails = parsed.splits.map((split) => {
      const line = lineMap.get(split.lineId);

      if (!line) {
        throw new Error("MARKETPLACE_LINE_NOT_FOUND");
      }

      if (split.quantity > line.quantity) {
        throw new Error("TRENDYOL_PACKAGE_SPLIT_QUANTITY_INVALID");
      }

      return {
        orderLineId: line.externalLineId,
        quantity: split.quantity,
      };
    });
    const selectedLineIds = new Set(parsed.splits.map((split) => split.lineId));
    const allLinesSelectedAtFullQuantity = targetPackage.lines.every((line) => {
      if (!selectedLineIds.has(line.id)) {
        return false;
      }

      const split = parsed.splits.find((item) => item.lineId === line.id);
      return Boolean(split && split.quantity >= line.quantity);
    });

    if (allLinesSelectedAtFullQuantity) {
      throw new Error("TRENDYOL_PACKAGE_SPLIT_ALL_LINES_INVALID");
    }

    const client = new TrendyolClient({
      sellerId: targetPackage.config.sellerId,
      apiKey,
      apiSecret,
      userAgent: targetPackage.config.userAgent,
      storeFrontCode: targetPackage.config.storeFrontCode,
      endpointUrl: targetPackage.config.endpointUrl,
    });

    const result = await client.splitShipmentPackage({
      packageId: targetPackage.externalPackageId,
      packageDetails,
    });

    await trendyolOrderImportService.importShipmentPackages({
      configId: targetPackage.configId,
      payload: {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        maxPages: 10,
      },
    });

    return {
      ok: true,
      refreshedPackageId: parsed.packageId,
      responsePayload: result,
    };
  }
}

export const trendyolPackageSplitService = new TrendyolPackageSplitService();
