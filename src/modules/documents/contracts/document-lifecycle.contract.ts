export type BusinessDocumentLifecycleEventType =
  | "DOCUMENT_CREATED"
  | "DOCUMENT_UPDATED"
  | "INVOICE_CREATED_FROM_DELIVERY_NOTE"
  | "OUTBOUND_QUEUED"
  | "OUTBOUND_SENT"
  | "OUTBOUND_FAILED"
  | "STATUS_SYNC_QUEUED"
  | "STATUS_SYNCED"
  | "WEBHOOK_RECEIVED";

export type BusinessDocumentMessageDirection = "OUTBOUND" | "INBOUND" | "INTERNAL";

export type RecordBusinessDocumentLifecycleEventInput = {
  businessDocumentId: string;
  eventType: BusinessDocumentLifecycleEventType;
  status?: string | null;
  externalStatus?: string | null;
  providerCode?: string | null;
  integrationJobId?: string | null;
  dispatchId?: string | null;
  auditLogId?: string | null;
  actorUserId?: string | null;
  actorType?: "USER" | "SYSTEM" | "INTEGRATION";
  requestId?: string | null;
  correlationId?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  occurredAt?: Date | string | null;
  message?: {
    direction: BusinessDocumentMessageDirection;
    channel?: string | null;
    providerCode?: string | null;
    endpoint?: string | null;
    messageType: string;
    payload?: Record<string, unknown> | null;
    headers?: Record<string, unknown> | null;
    statusCode?: number | null;
    errorMessage?: string | null;
  };
};
