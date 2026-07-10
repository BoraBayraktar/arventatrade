-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "preferredPurchaseWarehouseId" TEXT,
ADD COLUMN "preferredSalesWarehouseId" TEXT;

-- AlterTable
ALTER TABLE "Warehouse"
ADD COLUMN "address" TEXT,
ADD COLUMN "contactName" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 100;

-- CreateIndex
CREATE INDEX "Product_preferredPurchaseWarehouseId_idx" ON "Product"("preferredPurchaseWarehouseId");

-- CreateIndex
CREATE INDEX "Product_preferredSalesWarehouseId_idx" ON "Product"("preferredSalesWarehouseId");

-- CreateIndex
CREATE INDEX "Warehouse_priority_idx" ON "Warehouse"("priority");

-- AddForeignKey
ALTER TABLE "Product"
ADD CONSTRAINT "Product_preferredPurchaseWarehouseId_fkey"
FOREIGN KEY ("preferredPurchaseWarehouseId") REFERENCES "Warehouse"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product"
ADD CONSTRAINT "Product_preferredSalesWarehouseId_fkey"
FOREIGN KEY ("preferredSalesWarehouseId") REFERENCES "Warehouse"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
