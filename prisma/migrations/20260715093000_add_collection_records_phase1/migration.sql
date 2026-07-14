CREATE TYPE "CollectionRecordStatus" AS ENUM ('RECORDED', 'CANCELLED');

CREATE TABLE "CollectionRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "CollectionRecordStatus" NOT NULL DEFAULT 'RECORDED',
    "collectedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "recordedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedDate" TIMESTAMP(3),
    "deletedUserId" TEXT,

    CONSTRAINT "CollectionRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CollectionRecord_orderId_collectedAt_idx" ON "CollectionRecord"("orderId", "collectedAt");
CREATE INDEX "CollectionRecord_status_collectedAt_idx" ON "CollectionRecord"("status", "collectedAt");
CREATE INDEX "CollectionRecord_deleted_collectedAt_idx" ON "CollectionRecord"("deleted", "collectedAt");

ALTER TABLE "CollectionRecord" ADD CONSTRAINT "CollectionRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
