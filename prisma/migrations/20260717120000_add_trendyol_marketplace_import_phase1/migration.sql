-- Phase 1 marketplace order import support for Trendyol.

ALTER TYPE "IntegrationJobType" ADD VALUE IF NOT EXISTS 'ORDER_IMPORT';
ALTER TYPE "IntegrationJobType" ADD VALUE IF NOT EXISTS 'ORDER_STATUS_SYNC';

ALTER TYPE "IntegrationEntityType" ADD VALUE IF NOT EXISTS 'MARKETPLACE_ACCOUNT';
ALTER TYPE "IntegrationEntityType" ADD VALUE IF NOT EXISTS 'MARKETPLACE_PACKAGE';
ALTER TYPE "IntegrationEntityType" ADD VALUE IF NOT EXISTS 'ORDER';

DO $$ BEGIN
  CREATE TYPE "MarketplaceEnvironment" AS ENUM ('PRODUCTION', 'STAGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "MarketplacePackageImportStatus" AS ENUM ('RECEIVED', 'READY_FOR_ORDER', 'NEEDS_REVIEW', 'ORDER_CREATED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "MarketplaceOrderLineMatchStatus" AS ENUM ('MATCHED', 'UNMATCHED', 'AMBIGUOUS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "MarketplaceIntegrationConfig" (
  "id" TEXT NOT NULL,
  "channel" "IntegrationChannel" NOT NULL,
  "displayName" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "apiKeyEncrypted" TEXT NOT NULL,
  "apiSecretEncrypted" TEXT NOT NULL,
  "userAgent" TEXT NOT NULL,
  "endpointUrl" TEXT,
  "environment" "MarketplaceEnvironment" NOT NULL DEFAULT 'PRODUCTION',
  "syncWindowMinutes" INTEGER NOT NULL DEFAULT 60,
  "lastSuccessfulSyncAt" TIMESTAMP(3),
  "lastCursorAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,
  CONSTRAINT "MarketplaceIntegrationConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MarketplaceOrderPackage" (
  "id" TEXT NOT NULL,
  "configId" TEXT NOT NULL,
  "channel" "IntegrationChannel" NOT NULL,
  "externalPackageId" TEXT NOT NULL,
  "externalOrderNumber" TEXT NOT NULL,
  "packageStatus" TEXT NOT NULL,
  "importStatus" "MarketplacePackageImportStatus" NOT NULL DEFAULT 'RECEIVED',
  "orderDate" TIMESTAMP(3),
  "lastModifiedDate" TIMESTAMP(3),
  "customerName" TEXT,
  "customerEmail" TEXT,
  "shipmentAddress" JSONB,
  "invoiceAddress" JSONB,
  "cargoProviderName" TEXT,
  "cargoTrackingNumber" TEXT,
  "rawPayload" JSONB,
  "matchedOrderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,
  CONSTRAINT "MarketplaceOrderPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MarketplaceOrderLine" (
  "id" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "externalLineId" TEXT NOT NULL,
  "merchantSku" TEXT,
  "barcode" TEXT,
  "productName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "matchStatus" "MarketplaceOrderLineMatchStatus" NOT NULL DEFAULT 'UNMATCHED',
  "productId" TEXT,
  "productVariantId" TEXT,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,
  CONSTRAINT "MarketplaceOrderLine_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MarketplaceIntegrationConfig_channel_isActive_deleted_idx"
ON "MarketplaceIntegrationConfig"("channel", "isActive", "deleted");

CREATE UNIQUE INDEX IF NOT EXISTS "MarketplaceIntegrationConfig_channel_sellerId_deleted_key"
ON "MarketplaceIntegrationConfig"("channel", "sellerId", "deleted");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderPackage_configId_deleted_idx"
ON "MarketplaceOrderPackage"("configId", "deleted");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderPackage_channel_packageStatus_deleted_idx"
ON "MarketplaceOrderPackage"("channel", "packageStatus", "deleted");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderPackage_externalOrderNumber_idx"
ON "MarketplaceOrderPackage"("externalOrderNumber");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderPackage_matchedOrderId_idx"
ON "MarketplaceOrderPackage"("matchedOrderId");

CREATE UNIQUE INDEX IF NOT EXISTS "MarketplaceOrderPackage_channel_configId_externalPackageId_key"
ON "MarketplaceOrderPackage"("channel", "configId", "externalPackageId");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderLine_packageId_deleted_idx"
ON "MarketplaceOrderLine"("packageId", "deleted");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderLine_merchantSku_idx"
ON "MarketplaceOrderLine"("merchantSku");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderLine_barcode_idx"
ON "MarketplaceOrderLine"("barcode");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderLine_productId_idx"
ON "MarketplaceOrderLine"("productId");

CREATE INDEX IF NOT EXISTS "MarketplaceOrderLine_productVariantId_idx"
ON "MarketplaceOrderLine"("productVariantId");

CREATE UNIQUE INDEX IF NOT EXISTS "MarketplaceOrderLine_packageId_externalLineId_key"
ON "MarketplaceOrderLine"("packageId", "externalLineId");

ALTER TABLE "MarketplaceOrderPackage"
ADD CONSTRAINT "MarketplaceOrderPackage_configId_fkey"
FOREIGN KEY ("configId") REFERENCES "MarketplaceIntegrationConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MarketplaceOrderPackage"
ADD CONSTRAINT "MarketplaceOrderPackage_matchedOrderId_fkey"
FOREIGN KEY ("matchedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MarketplaceOrderLine"
ADD CONSTRAINT "MarketplaceOrderLine_packageId_fkey"
FOREIGN KEY ("packageId") REFERENCES "MarketplaceOrderPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MarketplaceOrderLine"
ADD CONSTRAINT "MarketplaceOrderLine_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MarketplaceOrderLine"
ADD CONSTRAINT "MarketplaceOrderLine_productVariantId_fkey"
FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
