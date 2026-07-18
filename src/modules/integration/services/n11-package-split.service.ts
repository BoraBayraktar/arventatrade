import { z } from "zod";

import { N11Client } from "@/modules/integration/connectors/n11.client";
import { MarketplaceIntegrationRepository } from "@/modules/integration/repositories/marketplace-integration.repository";
import { integrationSecretCryptoService } from "@/modules/integration/services/integration-secret-crypto.service";
import { n11OrderImportService } from "@/modules/integration/services/n11-order-import.service";

const splitPackageSchema = z.object({
  packageId: z.string().trim().min(1),
  splits: z.array(z.object({
    lineId: z.string().trim().min(1),
    quantity: z.coerce.number().int().positive(),
  })).min(1),
});

export class N11PackageSplitService {
  constructor(private readonly repository = new MarketplaceIntegrationRepository()) {}

  async splitPackage(input: unknown) {
    const parsed = splitPackageSchema.parse(input);
    const targetPackage = await this.repository.findPackageForSplit(parsed.packageId);

    if (!targetPackage) {
      throw new Error("MARKETPLACE_PACKAGE_NOT_FOUND");
    }

    if (targetPackage.channel !== "N11") {
      throw new Error("MARKETPLACE_PACKAGE_UNSUPPORTED_CHANNEL");
    }

    if (targetPackage.packageStatus !== "Picking") {
      throw new Error("N11_PACKAGE_SPLIT_STATUS_INVALID");
    }

    const apiKey = integrationSecretCryptoService.decrypt(targetPackage.config.apiKeyEncrypted);
    const apiSecret = integrationSecretCryptoService.decrypt(targetPackage.config.apiSecretEncrypted);

    if (!apiKey || !apiSecret) {
      throw new Error("N11_CONFIG_INCOMPLETE");
    }

    const lineMap = new Map(targetPackage.lines.map((line) => [line.id, line]));
    const packageDetails = parsed.splits.map((split) => {
      const line = lineMap.get(split.lineId);

      if (!line) {
        throw new Error("MARKETPLACE_LINE_NOT_FOUND");
      }

      if (split.quantity > line.quantity) {
        throw new Error("N11_PACKAGE_SPLIT_QUANTITY_INVALID");
      }

      return {
        orderLineId: line.externalLineId,
        quantities: split.quantity,
      };
    });

    const client = new N11Client({
      sellerId: targetPackage.config.sellerId,
      apiKey,
      apiSecret,
      endpointUrl: targetPackage.config.endpointUrl,
    });

    const result = await client.splitPackageByQuantity([
      {
        packageDetails,
      },
    ]);

    await n11OrderImportService.importShipmentPackages({
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

export const n11PackageSplitService = new N11PackageSplitService();
