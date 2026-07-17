ALTER TABLE "MarketplaceIntegrationConfig"
ADD COLUMN IF NOT EXISTS "trendyolCargoCompanyId" INTEGER,
ADD COLUMN IF NOT EXISTS "trendyolShipmentAddressId" INTEGER,
ADD COLUMN IF NOT EXISTS "trendyolReturningAddressId" INTEGER,
ADD COLUMN IF NOT EXISTS "trendyolOrigin" TEXT,
ADD COLUMN IF NOT EXISTS "trendyolDimensionalWeight" DECIMAL(10, 2);
