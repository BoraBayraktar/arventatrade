CREATE TYPE "InventoryMovementType" AS ENUM (
  'INITIAL_LOAD',
  'MANUAL_ADJUSTMENT',
  'PURCHASE_RECEIPT',
  'RESERVATION_HOLD',
  'RESERVATION_RELEASE',
  'ORDER_COMMIT',
  'ORDER_CANCEL_RESTOCK',
  'RETURN_RESTOCK',
  'DAMAGE_WRITE_OFF'
);

CREATE TYPE "StockReservationStatus" AS ENUM (
  'ACTIVE',
  'RELEASED',
  'COMMITTED',
  'EXPIRED',
  'CANCELLED'
);

CREATE TABLE "Warehouse" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryItem" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "skuSnapshot" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryLevel" (
  "id" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "onHand" INTEGER NOT NULL DEFAULT 0,
  "reserved" INTEGER NOT NULL DEFAULT 0,
  "reorderPoint" INTEGER NOT NULL DEFAULT 0,
  "safetyStock" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InventoryLevel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockReservation" (
  "id" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "orderId" TEXT,
  "reference" TEXT,
  "quantity" INTEGER NOT NULL,
  "status" "StockReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryMovement" (
  "id" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "orderId" TEXT,
  "reservationId" TEXT,
  "type" "InventoryMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");
CREATE UNIQUE INDEX "InventoryItem_productId_key" ON "InventoryItem"("productId");
CREATE UNIQUE INDEX "InventoryLevel_inventoryItemId_warehouseId_key" ON "InventoryLevel"("inventoryItemId", "warehouseId");

CREATE INDEX "Warehouse_isActive_isDefault_idx" ON "Warehouse"("isActive", "isDefault");
CREATE INDEX "InventoryItem_productId_idx" ON "InventoryItem"("productId");
CREATE INDEX "InventoryLevel_warehouseId_idx" ON "InventoryLevel"("warehouseId");
CREATE INDEX "InventoryLevel_onHand_reserved_idx" ON "InventoryLevel"("onHand", "reserved");
CREATE INDEX "StockReservation_inventoryItemId_status_idx" ON "StockReservation"("inventoryItemId", "status");
CREATE INDEX "StockReservation_warehouseId_status_idx" ON "StockReservation"("warehouseId", "status");
CREATE INDEX "StockReservation_orderId_idx" ON "StockReservation"("orderId");
CREATE INDEX "StockReservation_expiresAt_idx" ON "StockReservation"("expiresAt");
CREATE INDEX "InventoryMovement_inventoryItemId_createdAt_idx" ON "InventoryMovement"("inventoryItemId", "createdAt");
CREATE INDEX "InventoryMovement_warehouseId_createdAt_idx" ON "InventoryMovement"("warehouseId", "createdAt");
CREATE INDEX "InventoryMovement_orderId_idx" ON "InventoryMovement"("orderId");
CREATE INDEX "InventoryMovement_reservationId_idx" ON "InventoryMovement"("reservationId");
CREATE INDEX "InventoryMovement_type_createdAt_idx" ON "InventoryMovement"("type", "createdAt");

ALTER TABLE "InventoryItem"
ADD CONSTRAINT "InventoryItem_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InventoryLevel"
ADD CONSTRAINT "InventoryLevel_inventoryItemId_fkey"
FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InventoryLevel"
ADD CONSTRAINT "InventoryLevel_warehouseId_fkey"
FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockReservation"
ADD CONSTRAINT "StockReservation_inventoryItemId_fkey"
FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockReservation"
ADD CONSTRAINT "StockReservation_warehouseId_fkey"
FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockReservation"
ADD CONSTRAINT "StockReservation_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_inventoryItemId_fkey"
FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_warehouseId_fkey"
FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_reservationId_fkey"
FOREIGN KEY ("reservationId") REFERENCES "StockReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Warehouse" ("id", "code", "name", "isActive", "isDefault", "createdAt", "updatedAt")
SELECT 'warehouse_main', 'MAIN', 'Main Warehouse', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Warehouse" WHERE "code" = 'MAIN'
);

INSERT INTO "InventoryItem" ("id", "productId", "skuSnapshot", "createdAt", "updatedAt")
SELECT
  CONCAT('inv_', md5(p."id" || ':' || p."sku")),
  p."id",
  p."sku",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Product" p
LEFT JOIN "InventoryItem" ii ON ii."productId" = p."id"
WHERE ii."id" IS NULL;

INSERT INTO "InventoryLevel" (
  "id",
  "inventoryItemId",
  "warehouseId",
  "onHand",
  "reserved",
  "reorderPoint",
  "safetyStock",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('lvl_', md5(ii."id" || ':warehouse_main')),
  ii."id",
  'warehouse_main',
  p."stock",
  0,
  0,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "InventoryItem" ii
INNER JOIN "Product" p ON p."id" = ii."productId"
LEFT JOIN "InventoryLevel" il
  ON il."inventoryItemId" = ii."id"
 AND il."warehouseId" = 'warehouse_main'
WHERE il."id" IS NULL;

INSERT INTO "InventoryMovement" (
  "id",
  "inventoryItemId",
  "warehouseId",
  "type",
  "quantity",
  "note",
  "createdAt"
)
SELECT
  CONCAT('mov_', md5(ii."id" || ':initial_load')),
  ii."id",
  'warehouse_main',
  'INITIAL_LOAD',
  p."stock",
  'Phase 1 inventory foundation backfill from Product.stock',
  CURRENT_TIMESTAMP
FROM "InventoryItem" ii
INNER JOIN "Product" p ON p."id" = ii."productId"
LEFT JOIN "InventoryMovement" im
  ON im."inventoryItemId" = ii."id"
 AND im."warehouseId" = 'warehouse_main'
 AND im."type" = 'INITIAL_LOAD'
WHERE im."id" IS NULL;