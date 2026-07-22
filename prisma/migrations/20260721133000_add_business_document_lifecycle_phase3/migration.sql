CREATE TABLE "BusinessDocumentLifecycleEvent" (
  "id" TEXT NOT NULL,
  "businessDocumentId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "status" TEXT,
  "externalStatus" TEXT,
  "providerCode" TEXT,
  "integrationJobId" TEXT,
  "dispatchId" TEXT,
  "auditLogId" TEXT,
  "actorUserId" TEXT,
  "actorType" TEXT NOT NULL DEFAULT 'SYSTEM',
  "requestId" TEXT,
  "correlationId" TEXT,
  "summary" TEXT NOT NULL,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BusinessDocumentLifecycleEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessDocumentIntegrationMessage" (
  "id" TEXT NOT NULL,
  "businessDocumentId" TEXT NOT NULL,
  "lifecycleEventId" TEXT,
  "integrationJobId" TEXT,
  "direction" TEXT NOT NULL,
  "channel" TEXT,
  "providerCode" TEXT,
  "endpoint" TEXT,
  "messageType" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "hashAlgorithm" TEXT NOT NULL DEFAULT 'SHA-256',
  "payload" JSONB,
  "headers" JSONB,
  "statusCode" INTEGER,
  "errorMessage" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BusinessDocumentIntegrationMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BusinessDocumentLifecycleEvent_businessDocumentId_occurredAt_idx" ON "BusinessDocumentLifecycleEvent"("businessDocumentId", "occurredAt");
CREATE INDEX "BusinessDocumentLifecycleEvent_eventType_occurredAt_idx" ON "BusinessDocumentLifecycleEvent"("eventType", "occurredAt");
CREATE INDEX "BusinessDocumentLifecycleEvent_integrationJobId_idx" ON "BusinessDocumentLifecycleEvent"("integrationJobId");
CREATE INDEX "BusinessDocumentLifecycleEvent_requestId_idx" ON "BusinessDocumentLifecycleEvent"("requestId");

CREATE INDEX "BusinessDocumentIntegrationMessage_businessDocumentId_occurredAt_idx" ON "BusinessDocumentIntegrationMessage"("businessDocumentId", "occurredAt");
CREATE INDEX "BusinessDocumentIntegrationMessage_lifecycleEventId_idx" ON "BusinessDocumentIntegrationMessage"("lifecycleEventId");
CREATE INDEX "BusinessDocumentIntegrationMessage_integrationJobId_idx" ON "BusinessDocumentIntegrationMessage"("integrationJobId");
CREATE INDEX "BusinessDocumentIntegrationMessage_payloadHash_idx" ON "BusinessDocumentIntegrationMessage"("payloadHash");

ALTER TABLE "BusinessDocumentLifecycleEvent"
ADD CONSTRAINT "BusinessDocumentLifecycleEvent_businessDocumentId_fkey"
FOREIGN KEY ("businessDocumentId") REFERENCES "BusinessDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BusinessDocumentIntegrationMessage"
ADD CONSTRAINT "BusinessDocumentIntegrationMessage_businessDocumentId_fkey"
FOREIGN KEY ("businessDocumentId") REFERENCES "BusinessDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BusinessDocumentIntegrationMessage"
ADD CONSTRAINT "BusinessDocumentIntegrationMessage_lifecycleEventId_fkey"
FOREIGN KEY ("lifecycleEventId") REFERENCES "BusinessDocumentLifecycleEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
