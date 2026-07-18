import type { ChannelConnector, ConnectorSyncJob } from "@/modules/integration/connectors/channel.connector";
import { n11OrderImportService } from "@/modules/integration/services/n11-order-import.service";
import { n11ProductSyncService } from "@/modules/integration/services/n11-product-sync.service";
import { n11PackageStatusService } from "@/modules/integration/services/n11-package-status.service";
import { n11StockSyncService } from "@/modules/integration/services/n11-stock-sync.service";

export class N11Connector implements ChannelConnector {
  channel = "N11" as const;

  async dispatch(job: ConnectorSyncJob) {
    if (job.payload?.forceFail) {
      throw new Error("N11_SYNC_FORCED_FAILURE");
    }

    if (job.jobType === "ORDER_IMPORT" && job.entityType === "MARKETPLACE_ACCOUNT") {
      const result = await n11OrderImportService.importShipmentPackages({
        configId: job.entityId,
        payload: job.payload,
      });

      return {
        providerKey: "n11",
        externalReference: job.entityId,
        responsePayload: result,
      };
    }

    if (job.jobType === "ORDER_STATUS_SYNC" && job.entityType === "MARKETPLACE_PACKAGE") {
      return n11PackageStatusService.syncPackageStatus({
        packageId: job.entityId,
        payload: job.payload,
      });
    }

    if ((job.jobType === "STOCK_SYNC" || job.jobType === "PRICE_SYNC") && job.entityType === "PRODUCT") {
      return n11StockSyncService.syncProduct({
        productId: job.entityId,
        payload: job.payload,
      });
    }

    if (job.jobType === "PRODUCT_SYNC" && job.entityType === "PRODUCT") {
      return n11ProductSyncService.syncProduct(job.entityId);
    }

    throw new Error(`N11_UNSUPPORTED_JOB:${job.jobType}:${job.entityType}`);
  }
}
