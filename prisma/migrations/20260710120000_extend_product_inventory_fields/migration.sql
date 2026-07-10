CREATE TYPE "ProductType" AS ENUM (
  'PHYSICAL',
  'SERVICE',
  'RAW_MATERIAL',
  'SEMI_FINISHED'
);

CREATE TYPE "ProductUnitType" AS ENUM (
  'PIECE',
  'KILOGRAM',
  'GRAM',
  'LITER',
  'MILLILITER',
  'METER',
  'CENTIMETER',
  'BOX',
  'PACK'
);

ALTER TABLE "Product"
ADD COLUMN "barcode" TEXT,
ADD COLUMN "unitType" "ProductUnitType" NOT NULL DEFAULT 'PIECE',
ADD COLUMN "productType" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN "purchasePrice" DECIMAL(10, 2),
ADD COLUMN "vatRate" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN "stockTrackingEnabled" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");
