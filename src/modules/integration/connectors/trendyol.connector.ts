import type { ChannelConnector, ConnectorSyncJob } from "@/modules/integration/connectors/channel.connector";

export class TrendyolConnector implements ChannelConnector {
  channel = "TRENDYOL" as const;

  async dispatch(job: ConnectorSyncJob): Promise<void> {
    if (job.payload?.forceFail) {
      throw new Error("TRENDYOL_SYNC_FORCED_FAILURE");
    }

    return Promise.resolve();
  }
}
