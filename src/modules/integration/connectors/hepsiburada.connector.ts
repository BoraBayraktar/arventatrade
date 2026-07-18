import type { ChannelConnector, ConnectorSyncJob } from "@/modules/integration/connectors/channel.connector";
import { hepsiburadaOrderImportService } from "@/modules/integration/services/hepsiburada-order-import.service";
import { hepsiburadaPackageStatusService } from "@/modules/integration/services/hepsiburada-package-status.service";
import { hepsiburadaProductSyncService } from "@/modules/integration/services/hepsiburada-product-sync.service";
import { hepsiburadaStockSyncService } from "@/modules/integration/services/hepsiburada-stock-sync.service";

export class HepsiburadaConnector implements ChannelConnector {
  channel = "HEPSIBURADA" as const;

  async dispatch(job: ConnectorSyncJob) {
    if (job.payload?.forceFail) {
      throw new Error("HEPSIBURADA_SYNC_FORCED_FAILURE");
    }

    if (job.jobType === "ORDER_IMPORT" && job.entityType === "MARKETPLACE_ACCOUNT") {
      const result = await hepsiburadaOrderImportService.importOrders({
        configId: job.entityId,
        payload: job.payload,
      });

      return {
        providerKey: "hepsiburada",
        externalReference: job.entityId,
        responsePayload: result,
      };
    }

    if (job.jobType === "ORDER_STATUS_SYNC" && job.entityType === "MARKETPLACE_PACKAGE") {
      return hepsiburadaPackageStatusService.syncPackageStatus({
        packageId: job.entityId,
        payload: job.payload,
      });
    }

    if ((job.jobType === "STOCK_SYNC" || job.jobType === "PRICE_SYNC") && job.entityType === "PRODUCT") {
      return hepsiburadaStockSyncService.syncProduct({
        productId: job.entityId,
        payload: job.payload,
      });
    }

    if (job.jobType === "PRODUCT_SYNC" && job.entityType === "PRODUCT") {
      return hepsiburadaProductSyncService.syncProduct(job.entityId);
    }

    throw new Error(`HEPSIBURADA_UNSUPPORTED_JOB:${job.jobType}:${job.entityType}`);
  }
}
