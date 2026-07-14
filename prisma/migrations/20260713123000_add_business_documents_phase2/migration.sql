CREATE TYPE "BusinessDocumentType" AS ENUM ('PURCHASE_DOCUMENT', 'DELIVERY_NOTE', 'E_INVOICE', 'E_DISPATCH');
CREATE TYPE "BusinessDocumentStatus" AS ENUM ('DRAFT', 'LINKED', 'ISSUED', 'CANCELLED');
CREATE TYPE "BusinessDocumentSyncStatus" AS ENUM ('NOT_SENT', 'QUEUED', 'SENT', 'FAILED');

CREATE TABLE "BusinessDocument" (
  "id" TEXT NOT NULL,
  "documentNumber" TEXT NOT NULL,
  "documentType" "BusinessDocumentType" NOT NULL,
  "status" "BusinessDocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "issueDate" TIMESTAMP(3) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "totalAmount" DECIMAL(10,2),
  "externalReference" TEXT,
  "externalSystemStatus" "BusinessDocumentSyncStatus" NOT NULL DEFAULT 'NOT_SENT',
  "counterpartyName" TEXT NOT NULL,
  "counterpartyTaxNumber" TEXT,
  "counterpartyTaxOffice" TEXT,
  "counterpartyEmail" TEXT,
  "counterpartyAddress" TEXT,
  "note" TEXT,
  "orderId" TEXT,
  "inventoryTransactionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedDate" TIMESTAMP(3),
  "deletedUserId" TEXT,
  CONSTRAINT "BusinessDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessDocumentLine" (
  "id" TEXT NOT NULL,
  "businessDocumentId" TEXT NOT NULL,
  "productId" TEXT,
  "productSku" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(10,2),
  "lineTotal" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessDocumentLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessDocument_documentNumber_key" ON "BusinessDocument"("documentNumber");
CREATE INDEX "BusinessDocument_documentType_issueDate_idx" ON "BusinessDocument"("documentType", "issueDate");
CREATE INDEX "BusinessDocument_status_issueDate_idx" ON "BusinessDocument"("status", "issueDate");
CREATE INDEX "BusinessDocument_orderId_idx" ON "BusinessDocument"("orderId");
CREATE INDEX "BusinessDocument_inventoryTransactionId_idx" ON "BusinessDocument"("inventoryTransactionId");
CREATE INDEX "BusinessDocument_deleted_issueDate_idx" ON "BusinessDocument"("deleted", "issueDate");
CREATE INDEX "BusinessDocumentLine_businessDocumentId_idx" ON "BusinessDocumentLine"("businessDocumentId");
CREATE INDEX "BusinessDocumentLine_productId_idx" ON "BusinessDocumentLine"("productId");

ALTER TABLE "BusinessDocument"
ADD CONSTRAINT "BusinessDocument_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BusinessDocument"
ADD CONSTRAINT "BusinessDocument_inventoryTransactionId_fkey" FOREIGN KEY ("inventoryTransactionId") REFERENCES "InventoryTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BusinessDocumentLine"
ADD CONSTRAINT "BusinessDocumentLine_businessDocumentId_fkey" FOREIGN KEY ("businessDocumentId") REFERENCES "BusinessDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BusinessDocumentLine"
ADD CONSTRAINT "BusinessDocumentLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
