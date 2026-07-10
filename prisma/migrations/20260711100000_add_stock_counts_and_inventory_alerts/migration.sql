CREATE TYPE "StockCountStatus" AS ENUM ('DRAFT', 'COUNTED', 'APPLIED');
CREATE TYPE "InventoryAlertType" AS ENUM ('LOW_STOCK', 'OUT_OF_STOCK');
CREATE TYPE "InventoryAlertStatus" AS ENUM ('ACTIVE', 'RESOLVED');

ALTER TYPE "InventoryMovementType" ADD VALUE IF NOT EXISTS 'COUNT_ADJUSTMENT';
ALTER TYPE "InventoryTransactionType" ADD VALUE IF NOT EXISTS 'STOCK_COUNT';
ALTER TYPE "UserNotificationType" ADD VALUE IF NOT EXISTS 'INVENTORY_ALERT_CREATED';
ALTER TYPE "UserNotificationType" ADD VALUE IF NOT EXISTS 'STOCK_COUNT_APPLIED';

CREATE TABLE "StockCount" (
  "id" TEXT NOT NULL,
  "countNumber" TEXT NOT NULL,
  "warehouseId" TEXT,
  "status" "StockCountStatus" NOT NULL DEFAULT 'DRAFT',
  "countedAt" TIMESTAMP(3) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StockCount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockCountLine" (
  "id" TEXT NOT NULL,
  "stockCountId" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "systemOnHand" INTEGER NOT NULL,
  "countedOnHand" INTEGER,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StockCountLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryAlert" (
  "id" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "type" "InventoryAlertType" NOT NULL,
  "status" "InventoryAlertStatus" NOT NULL DEFAULT 'ACTIVE',
  "message" TEXT NOT NULL,
  "createdMovementId" TEXT,
  "resolvedMovementId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InventoryAlert_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockCount_countNumber_key" ON "StockCount"("countNumber");
CREATE UNIQUE INDEX "StockCountLine_stockCountId_inventoryItemId_warehouseId_key" ON "StockCountLine"("stockCountId","inventoryItemId","warehouseId");
CREATE INDEX "StockCount_status_countedAt_idx" ON "StockCount"("status","countedAt");
CREATE INDEX "StockCount_warehouseId_idx" ON "StockCount"("warehouseId");
CREATE INDEX "StockCountLine_warehouseId_idx" ON "StockCountLine"("warehouseId");
CREATE INDEX "StockCountLine_inventoryItemId_idx" ON "StockCountLine"("inventoryItemId");
CREATE INDEX "InventoryAlert_status_type_createdAt_idx" ON "InventoryAlert"("status","type","createdAt");
CREATE INDEX "InventoryAlert_warehouseId_idx" ON "InventoryAlert"("warehouseId");
CREATE INDEX "InventoryAlert_inventoryItemId_idx" ON "InventoryAlert"("inventoryItemId");

ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockCountLine" ADD CONSTRAINT "StockCountLine_stockCountId_fkey" FOREIGN KEY ("stockCountId") REFERENCES "StockCount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockCountLine" ADD CONSTRAINT "StockCountLine_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockCountLine" ADD CONSTRAINT "StockCountLine_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_createdMovementId_fkey" FOREIGN KEY ("createdMovementId") REFERENCES "InventoryMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_resolvedMovementId_fkey" FOREIGN KEY ("resolvedMovementId") REFERENCES "InventoryMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
