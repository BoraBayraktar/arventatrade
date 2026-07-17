import type { ChannelConnector, ConnectorSyncJob } from "@/modules/integration/connectors/channel.connector";
import { trendyolPackageStatusService } from "@/modules/integration/services/trendyol-package-status.service";
import { trendyolOrderImportService } from "@/modules/integration/services/trendyol-order-import.service";
import { trendyolProductSyncService } from "@/modules/integration/services/trendyol-product-sync.service";
import { trendyolStockSyncService } from "@/modules/integration/services/trendyol-stock-sync.service";

export class TrendyolConnector implements ChannelConnector {
  channel = "TRENDYOL" as const;

  async dispatch(job: ConnectorSyncJob) {
    if (job.payload?.forceFail) {
      throw new Error("TRENDYOL_SYNC_FORCED_FAILURE");
    }

    if (job.jobType === "ORDER_IMPORT" && job.entityType === "MARKETPLACE_ACCOUNT") {
      const result = await trendyolOrderImportService.importShipmentPackages({
        configId: job.entityId,
        payload: job.payload,
      });

      return {
        providerKey: "trendyol",
        externalReference: job.entityId,
        responsePayload: result,
      };
    }

    if (job.jobType === "ORDER_STATUS_SYNC" && job.entityType === "MARKETPLACE_PACKAGE") {
      return trendyolPackageStatusService.syncPackageStatus({
        packageId: job.entityId,
        payload: job.payload,
      });
    }

    if ((job.jobType === "STOCK_SYNC" || job.jobType === "PRICE_SYNC") && job.entityType === "PRODUCT") {
      return trendyolStockSyncService.syncProduct({
        productId: job.entityId,
        payload: job.payload,
      });
    }

    if (job.jobType === "PRODUCT_SYNC" && job.entityType === "PRODUCT") {
      return trendyolProductSyncService.syncProduct(job.entityId);
    }

    throw new Error(`TRENDYOL_UNSUPPORTED_JOB:${job.jobType}:${job.entityType}`);
  }
}
