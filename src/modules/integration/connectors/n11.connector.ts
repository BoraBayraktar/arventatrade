import type { ChannelConnector, ConnectorSyncJob } from "@/modules/integration/connectors/channel.connector";

export class N11Connector implements ChannelConnector {
  channel = "N11" as const;

  async dispatch(job: ConnectorSyncJob): Promise<void> {
    if (job.payload?.forceFail) {
      throw new Error("N11_SYNC_FORCED_FAILURE");
    }

    return Promise.resolve();
  }
}
