ALTER TABLE "BusinessDocument"
ADD COLUMN "supplierId" TEXT,
ADD COLUMN "customerAccountId" TEXT;

CREATE INDEX "BusinessDocument_supplierId_idx" ON "BusinessDocument"("supplierId");
CREATE INDEX "BusinessDocument_customerAccountId_idx" ON "BusinessDocument"("customerAccountId");

ALTER TABLE "BusinessDocument"
ADD CONSTRAINT "BusinessDocument_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BusinessDocument"
ADD CONSTRAINT "BusinessDocument_customerAccountId_fkey"
FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
