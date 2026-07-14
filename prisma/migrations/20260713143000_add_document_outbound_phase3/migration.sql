-- Phase 3 document outbound integration support

ALTER TYPE "IntegrationChannel" ADD VALUE IF NOT EXISTS 'EDOCS_MOCK';
ALTER TYPE "IntegrationJobType" ADD VALUE IF NOT EXISTS 'DOCUMENT_OUTBOUND';
ALTER TYPE "IntegrationJobType" ADD VALUE IF NOT EXISTS 'DOCUMENT_STATUS_SYNC';
ALTER TYPE "IntegrationEntityType" ADD VALUE IF NOT EXISTS 'BUSINESS_DOCUMENT';

CREATE TABLE IF NOT EXISTS "BusinessDocumentDispatch" (
  "id" TEXT NOT NULL,
  "businessDocumentId" TEXT NOT NULL,
  "integrationJobId" TEXT,
  "channel" "IntegrationChannel" NOT NULL,
  "providerKey" TEXT NOT NULL,
  "status" "BusinessDocumentSyncStatus" NOT NULL DEFAULT 'QUEUED',
  "externalReference" TEXT,
  "requestPayload" JSONB,
  "responsePayload" JSONB,
  "errorMessage" TEXT,
  "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dispatchedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BusinessDocumentDispatch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BusinessDocumentDispatch_businessDocumentId_createdAt_idx"
ON "BusinessDocumentDispatch"("businessDocumentId", "createdAt");

CREATE INDEX IF NOT EXISTS "BusinessDocumentDispatch_integrationJobId_idx"
ON "BusinessDocumentDispatch"("integrationJobId");

CREATE INDEX IF NOT EXISTS "BusinessDocumentDispatch_channel_status_idx"
ON "BusinessDocumentDispatch"("channel", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'BusinessDocumentDispatch_businessDocumentId_fkey'
      AND table_name = 'BusinessDocumentDispatch'
  ) THEN
    ALTER TABLE "BusinessDocumentDispatch"
    ADD CONSTRAINT "BusinessDocumentDispatch_businessDocumentId_fkey"
    FOREIGN KEY ("businessDocumentId") REFERENCES "BusinessDocument"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
