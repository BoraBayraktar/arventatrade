import type { ChannelConnector, ConnectorDispatchResult, ConnectorSyncJob } from "@/modules/integration/connectors/channel.connector";

export class EDocsMockConnector implements ChannelConnector {
  channel = "EDOCS_MOCK" as const;

  async dispatch(job: ConnectorSyncJob): Promise<ConnectorDispatchResult> {
    if (job.payload?.forceFail) {
      throw new Error("EDOCS_MOCK_FORCED_FAILURE");
    }

    if (job.jobType === "DOCUMENT_STATUS_SYNC") {
      return {
        providerKey: typeof job.payload?.providerCode === "string" ? job.payload.providerCode : "mock-edocs-provider",
        externalReference: typeof job.payload?.externalReference === "string" ? job.payload.externalReference : null,
        responsePayload: {
          accepted: true,
          documentStatus: "SENT",
          checkedAt: new Date().toISOString(),
        },
      };
    }

    const documentNumber = typeof job.payload?.documentNumber === "string" ? job.payload.documentNumber : job.entityId;
    const issuedAt = new Date().toISOString();

    return {
      providerKey: typeof job.payload?.providerCode === "string" ? job.payload.providerCode : "mock-edocs-provider",
      externalReference: `MOCK-${documentNumber}-${Date.now()}`,
      responsePayload: {
        accepted: true,
        issuedAt,
        transportMode: "OUTBOUND",
      },
    };
  }
}
