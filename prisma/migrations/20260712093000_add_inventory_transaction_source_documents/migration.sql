ALTER TABLE "InventoryTransaction"
ADD COLUMN IF NOT EXISTS "sourceDocumentType" TEXT,
ADD COLUMN IF NOT EXISTS "sourceDocumentId" TEXT,
ADD COLUMN IF NOT EXISTS "sourceDocumentNumber" TEXT,
ADD COLUMN IF NOT EXISTS "sourceDocumentUrl" TEXT,
ADD COLUMN IF NOT EXISTS "sourceDocumentDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "externalReference" TEXT,
ADD COLUMN IF NOT EXISTS "counterpartyName" TEXT;

CREATE INDEX IF NOT EXISTS "InventoryTransaction_sourceDocumentType_sourceDocumentNumber_idx"
ON "InventoryTransaction"("sourceDocumentType", "sourceDocumentNumber");
