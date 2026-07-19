import type { ChannelConnector, ConnectorSyncJob } from "@/modules/integration/connectors/channel.connector";
import { pazaramaOrderImportService } from "@/modules/integration/services/pazarama-order-import.service";
import { pazaramaPackageStatusService } from "@/modules/integration/services/pazarama-package-status.service";
import { pazaramaProductSyncService } from "@/modules/integration/services/pazarama-product-sync.service";
import { pazaramaStockSyncService } from "@/modules/integration/services/pazarama-stock-sync.service";

export class PazaramaConnector implements ChannelConnector {
  channel = "PAZARAMA" as const;

  async dispatch(job: ConnectorSyncJob) {
    if (job.payload?.forceFail) {
      throw new Error("PAZARAMA_SYNC_FORCED_FAILURE");
    }

    if (job.jobType === "ORDER_IMPORT" && job.entityType === "MARKETPLACE_ACCOUNT") {
      const result = await pazaramaOrderImportService.importOrders({
        configId: job.entityId,
        payload: job.payload,
      });

      return {
        providerKey: "pazarama",
        externalReference: job.entityId,
        responsePayload: result,
      };
    }

    if (job.jobType === "PRODUCT_SYNC" && job.entityType === "PRODUCT") {
      return pazaramaProductSyncService.syncProduct(job.entityId);
    }

    if ((job.jobType === "STOCK_SYNC" || job.jobType === "PRICE_SYNC") && job.entityType === "PRODUCT") {
      return pazaramaStockSyncService.syncProduct({
        productId: job.entityId,
        jobType: job.jobType,
        payload: job.payload,
      });
    }

    if (job.jobType === "ORDER_STATUS_SYNC" && job.entityType === "MARKETPLACE_PACKAGE") {
      return pazaramaPackageStatusService.syncPackageStatus({
        packageId: job.entityId,
        payload: job.payload,
      });
    }

    throw new Error(`PAZARAMA_UNSUPPORTED_JOB:${job.jobType}:${job.entityType}`);
  }
}
