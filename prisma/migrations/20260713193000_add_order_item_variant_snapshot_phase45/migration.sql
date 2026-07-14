ALTER TABLE "OrderItem"
ADD COLUMN "productVariantId" TEXT,
ADD COLUMN "productVariantSlug" TEXT,
ADD COLUMN "productVariantSku" TEXT,
ADD COLUMN "productVariantTitle" TEXT,
ADD COLUMN "productVariantOptionSummary" TEXT;

CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_productVariantId_fkey"
FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
