export type ConnectorJobPayload = {
  forceFail?: boolean;
  [key: string]: unknown;
};

export type ConnectorSyncJob = {
  id: string;
  channel: "TRENDYOL" | "N11";
  jobType: "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC";
  entityType: "PRODUCT";
  entityId: string;
  payload: ConnectorJobPayload | null;
};

export interface ChannelConnector {
  channel: "TRENDYOL" | "N11";
  dispatch(job: ConnectorSyncJob): Promise<void>;
}
