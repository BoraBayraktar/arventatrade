ALTER TABLE "Order" ADD COLUMN "customerAccountId" TEXT;

CREATE INDEX "Order_customerAccountId_idx" ON "Order"("customerAccountId");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_customerAccountId_fkey"
FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
