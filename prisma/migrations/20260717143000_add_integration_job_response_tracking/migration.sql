ALTER TABLE "IntegrationSyncJob"
ADD COLUMN IF NOT EXISTS "externalReference" TEXT,
ADD COLUMN IF NOT EXISTS "responsePayload" JSONB;

CREATE INDEX IF NOT EXISTS "IntegrationSyncJob_externalReference_idx"
ON "IntegrationSyncJob"("externalReference");
