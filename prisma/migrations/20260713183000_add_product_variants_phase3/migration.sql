CREATE TYPE "ProductAttributeDisplayType" AS ENUM (
  'TEXT',
  'COLOR',
  'NUMBER'
);

CREATE TABLE "ProductAttributeDefinition" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "displayType" "ProductAttributeDisplayType" NOT NULL DEFAULT 'TEXT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,

  CONSTRAINT "ProductAttributeDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductAttributeLink" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "attributeDefinitionId" TEXT NOT NULL,
  "isVariantAxis" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProductAttributeLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "barcode" TEXT,
  "title" TEXT NOT NULL,
  "optionSummary" TEXT NOT NULL,
  "priceOverride" DECIMAL(10, 2),
  "purchasePriceOverride" DECIMAL(10, 2),
  "compareAtPriceOverride" DECIMAL(10, 2),
  "imageUrl" TEXT,
  "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "stockOverride" INTEGER,
  "salesEnabled" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,

  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariantAttributeValue" (
  "id" TEXT NOT NULL,
  "productVariantId" TEXT NOT NULL,
  "attributeDefinitionId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProductVariantAttributeValue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductAttributeDefinition_slug_key" ON "ProductAttributeDefinition"("slug");
CREATE UNIQUE INDEX "ProductAttributeLink_productId_attributeDefinitionId_key" ON "ProductAttributeLink"("productId", "attributeDefinitionId");
CREATE UNIQUE INDEX "ProductVariant_slug_key" ON "ProductVariant"("slug");
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");
CREATE UNIQUE INDEX "ProductVariantAttributeValue_productVariantId_attributeDefinitionId_key" ON "ProductVariantAttributeValue"("productVariantId", "attributeDefinitionId");

CREATE INDEX "ProductAttributeDefinition_deleted_isActive_sortOrder_idx" ON "ProductAttributeDefinition"("deleted", "isActive", "sortOrder");
CREATE INDEX "ProductAttributeLink_attributeDefinitionId_isVariantAxis_idx" ON "ProductAttributeLink"("attributeDefinitionId", "isVariantAxis");
CREATE INDEX "ProductAttributeLink_productId_sortOrder_idx" ON "ProductAttributeLink"("productId", "sortOrder");
CREATE INDEX "ProductVariant_productId_deleted_salesEnabled_sortOrder_idx" ON "ProductVariant"("productId", "deleted", "salesEnabled", "sortOrder");
CREATE INDEX "ProductVariant_barcode_idx" ON "ProductVariant"("barcode");
CREATE INDEX "ProductVariantAttributeValue_attributeDefinitionId_value_idx" ON "ProductVariantAttributeValue"("attributeDefinitionId", "value");

ALTER TABLE "ProductAttributeLink"
ADD CONSTRAINT "ProductAttributeLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductAttributeLink"
ADD CONSTRAINT "ProductAttributeLink_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "ProductAttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductVariantAttributeValue"
ADD CONSTRAINT "ProductVariantAttributeValue_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductVariantAttributeValue"
ADD CONSTRAINT "ProductVariantAttributeValue_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "ProductAttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
