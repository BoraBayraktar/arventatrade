CREATE TYPE "InventoryTransactionType" AS ENUM ('MANUAL_ADJUSTMENT', 'STOCK_IN', 'STOCK_OUT', 'TRANSFER');

ALTER TABLE "InventoryMovement" ADD COLUMN "transactionId" TEXT;

CREATE TABLE "InventoryTransaction" (
  "id" TEXT NOT NULL,
  "transactionNumber" TEXT NOT NULL,
  "type" "InventoryTransactionType" NOT NULL,
  "reference" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryTransactionLine" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "fromWarehouseId" TEXT,
  "toWarehouseId" TEXT,
  "quantity" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryTransactionLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InventoryTransaction_transactionNumber_key" ON "InventoryTransaction"("transactionNumber");
CREATE INDEX "InventoryTransaction_type_createdAt_idx" ON "InventoryTransaction"("type", "createdAt");
CREATE INDEX "InventoryMovement_transactionId_idx" ON "InventoryMovement"("transactionId");
CREATE INDEX "InventoryTransactionLine_transactionId_idx" ON "InventoryTransactionLine"("transactionId");
CREATE INDEX "InventoryTransactionLine_inventoryItemId_idx" ON "InventoryTransactionLine"("inventoryItemId");
CREATE INDEX "InventoryTransactionLine_fromWarehouseId_idx" ON "InventoryTransactionLine"("fromWarehouseId");
CREATE INDEX "InventoryTransactionLine_toWarehouseId_idx" ON "InventoryTransactionLine"("toWarehouseId");

ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "InventoryTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "InventoryTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryTransactionLine" ADD CONSTRAINT "InventoryTransactionLine_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
