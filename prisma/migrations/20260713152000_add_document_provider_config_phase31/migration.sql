-- Phase 3.1 provider configuration and status sync readiness

ALTER TABLE "BusinessDocument"
ADD COLUMN IF NOT EXISTS "providerConfigId" TEXT;

CREATE TABLE IF NOT EXISTS "DocumentProviderConfig" (
  "id" TEXT NOT NULL,
  "providerCode" TEXT NOT NULL,
  "channel" "IntegrationChannel" NOT NULL,
  "displayName" TEXT NOT NULL,
  "endpointUrl" TEXT,
  "senderLabel" TEXT,
  "senderVkn" TEXT,
  "username" TEXT,
  "secretKey" TEXT,
  "companyName" TEXT,
  "webhookSecret" TEXT,
  "supportsStatusSync" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,

  CONSTRAINT "DocumentProviderConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DocumentProviderConfig_providerCode_key"
ON "DocumentProviderConfig"("providerCode");

CREATE INDEX IF NOT EXISTS "DocumentProviderConfig_channel_isActive_deleted_idx"
ON "DocumentProviderConfig"("channel", "isActive", "deleted");

CREATE INDEX IF NOT EXISTS "DocumentProviderConfig_isDefault_deleted_idx"
ON "DocumentProviderConfig"("isDefault", "deleted");

CREATE INDEX IF NOT EXISTS "BusinessDocument_providerConfigId_idx"
ON "BusinessDocument"("providerConfigId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'BusinessDocument_providerConfigId_fkey'
      AND table_name = 'BusinessDocument'
  ) THEN
    ALTER TABLE "BusinessDocument"
    ADD CONSTRAINT "BusinessDocument_providerConfigId_fkey"
    FOREIGN KEY ("providerConfigId") REFERENCES "DocumentProviderConfig"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
