-- Phase 2 Trendyol outbound status sync support.

ALTER TABLE "MarketplaceIntegrationConfig"
ADD COLUMN IF NOT EXISTS "storeFrontCode" TEXT;
