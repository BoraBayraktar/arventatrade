export type ConnectorJobPayload = {
  forceFail?: boolean;
  [key: string]: unknown;
};

export type ConnectorDispatchResult = {
  externalReference?: string | null;
  providerKey?: string;
  responsePayload?: Record<string, unknown> | null;
};

export type ConnectorSyncJob = {
  id: string;
  channel: "TRENDYOL" | "N11" | "PAZARAMA" | "HEPSIBURADA" | "EDOCS_MOCK";
  jobType: "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC" | "ORDER_IMPORT" | "ORDER_STATUS_SYNC" | "DOCUMENT_OUTBOUND" | "DOCUMENT_STATUS_SYNC";
  entityType: "PRODUCT" | "MARKETPLACE_ACCOUNT" | "MARKETPLACE_PACKAGE" | "ORDER" | "BUSINESS_DOCUMENT";
  entityId: string;
  payload: ConnectorJobPayload | null;
};

export interface ChannelConnector {
  channel: "TRENDYOL" | "N11" | "PAZARAMA" | "HEPSIBURADA" | "EDOCS_MOCK";
  dispatch(job: ConnectorSyncJob): Promise<ConnectorDispatchResult | void>;
}
