CREATE TYPE "PaymentRecordStatus" AS ENUM ('RECORDED', 'CANCELLED');

CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "PaymentRecordStatus" NOT NULL DEFAULT 'RECORDED',
    "paidAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "recordedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedDate" TIMESTAMP(3),
    "deletedUserId" TEXT,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentRecord_supplierId_paidAt_idx" ON "PaymentRecord"("supplierId", "paidAt");
CREATE INDEX "PaymentRecord_status_paidAt_idx" ON "PaymentRecord"("status", "paidAt");
CREATE INDEX "PaymentRecord_deleted_paidAt_idx" ON "PaymentRecord"("deleted", "paidAt");

ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
