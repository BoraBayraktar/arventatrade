ALTER TABLE "InventoryItem"
ADD COLUMN IF NOT EXISTS "productVariantId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

ALTER TABLE "PurchaseReceiptLine"
ADD COLUMN IF NOT EXISTS "productVariantId" TEXT;

ALTER TABLE "BusinessDocumentLine"
ADD COLUMN IF NOT EXISTS "productVariantId" TEXT,
ADD COLUMN IF NOT EXISTS "productVariantSku" TEXT,
ADD COLUMN IF NOT EXISTS "productVariantTitle" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "InventoryItem_productVariantId_key" ON "InventoryItem"("productVariantId");
CREATE UNIQUE INDEX IF NOT EXISTS "InventoryItem_productId_key" ON "InventoryItem"("productId");
CREATE INDEX IF NOT EXISTS "InventoryItem_productVariantId_idx" ON "InventoryItem"("productVariantId");
CREATE INDEX IF NOT EXISTS "PurchaseReceiptLine_productVariantId_idx" ON "PurchaseReceiptLine"("productVariantId");
CREATE INDEX IF NOT EXISTS "BusinessDocumentLine_productVariantId_idx" ON "BusinessDocumentLine"("productVariantId");

DO $$ BEGIN
  ALTER TABLE "InventoryItem"
  ADD CONSTRAINT "InventoryItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "PurchaseReceiptLine"
  ADD CONSTRAINT "PurchaseReceiptLine_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessDocumentLine"
  ADD CONSTRAINT "BusinessDocumentLine_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
