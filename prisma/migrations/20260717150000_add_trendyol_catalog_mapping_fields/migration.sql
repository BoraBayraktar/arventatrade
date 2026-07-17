ALTER TABLE "Category"
ADD COLUMN IF NOT EXISTS "trendyolCategoryId" INTEGER;

ALTER TABLE "Brand"
ADD COLUMN IF NOT EXISTS "trendyolBrandId" INTEGER;

ALTER TABLE "ProductAttributeDefinition"
ADD COLUMN IF NOT EXISTS "trendyolAttributeId" INTEGER;

CREATE INDEX IF NOT EXISTS "Category_trendyolCategoryId_idx"
ON "Category"("trendyolCategoryId");

CREATE INDEX IF NOT EXISTS "Brand_trendyolBrandId_idx"
ON "Brand"("trendyolBrandId");

CREATE INDEX IF NOT EXISTS "ProductAttributeDefinition_trendyolAttributeId_idx"
ON "ProductAttributeDefinition"("trendyolAttributeId");
