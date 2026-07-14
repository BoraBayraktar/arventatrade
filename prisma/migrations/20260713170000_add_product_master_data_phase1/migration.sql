CREATE TYPE "ProductStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'ARCHIVED'
);

CREATE TABLE "Brand" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,

  CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Supplier" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "taxNumber" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,

  CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Product"
ADD COLUMN "brandId" TEXT,
ADD COLUMN "primarySupplierId" TEXT,
ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "salesEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "purchaseEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "internalNote" TEXT,
ADD COLUMN "searchKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");

CREATE INDEX "Brand_deleted_isActive_idx" ON "Brand"("deleted", "isActive");
CREATE INDEX "Supplier_deleted_isActive_idx" ON "Supplier"("deleted", "isActive");
CREATE INDEX "Supplier_taxNumber_idx" ON "Supplier"("taxNumber");
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX "Product_primarySupplierId_idx" ON "Product"("primarySupplierId");
CREATE INDEX "Product_status_salesEnabled_idx" ON "Product"("status", "salesEnabled");

ALTER TABLE "Product"
ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_primarySupplierId_fkey" FOREIGN KEY ("primarySupplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
