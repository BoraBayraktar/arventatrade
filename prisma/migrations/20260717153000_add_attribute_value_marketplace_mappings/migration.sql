CREATE TABLE IF NOT EXISTS "ProductAttributeValueMarketplaceMapping" (
  "id" TEXT NOT NULL,
  "attributeDefinitionId" TEXT NOT NULL,
  "channel" "IntegrationChannel" NOT NULL,
  "localValue" TEXT NOT NULL,
  "externalAttributeValueId" INTEGER,
  "externalAttributeValueName" TEXT,
  "customAttributeValue" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,

  CONSTRAINT "ProductAttributeValueMarketplaceMapping_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ProductAttributeValueMarketplaceMapping_attributeDefinitionId_fkey'
  ) THEN
    ALTER TABLE "ProductAttributeValueMarketplaceMapping"
    ADD CONSTRAINT "ProductAttributeValueMarketplaceMapping_attributeDefinitionId_fkey"
    FOREIGN KEY ("attributeDefinitionId") REFERENCES "ProductAttributeDefinition"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "ProductAttributeValueMarketplaceMapping_attributeDefinitionId_channel_localValue_key"
ON "ProductAttributeValueMarketplaceMapping"("attributeDefinitionId", "channel", "localValue");

CREATE INDEX IF NOT EXISTS "ProductAttributeValueMarketplaceMapping_channel_deleted_isActive_idx"
ON "ProductAttributeValueMarketplaceMapping"("channel", "deleted", "isActive");

CREATE INDEX IF NOT EXISTS "ProductAttributeValueMarketplaceMapping_attributeDefinitionId_deleted_idx"
ON "ProductAttributeValueMarketplaceMapping"("attributeDefinitionId", "deleted");
