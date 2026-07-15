-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('CASH', 'BANK');

-- CreateEnum
CREATE TYPE "CashTransactionDirection" AS ENUM ('IN', 'OUT', 'TRANSFER');

-- CreateEnum
CREATE TYPE "CashTransactionSourceType" AS ENUM ('MANUAL', 'COLLECTION', 'PAYMENT', 'TRANSFER', 'ORDER', 'DOCUMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "CashTransactionCategory" AS ENUM ('GENERAL_INCOME', 'GENERAL_EXPENSE', 'MARKETPLACE_COMMISSION', 'SHIPPING_EXPENSE', 'SERVICE_FEE', 'REFUND', 'TRANSFER');

-- CreateEnum
CREATE TYPE "CashTransactionStatus" AS ENUM ('RECORDED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."ProductAttributeLink" DROP CONSTRAINT "ProductAttributeLink_attributeDefinitionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductAttributeLink" DROP CONSTRAINT "ProductAttributeLink_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariantAttributeValue" DROP CONSTRAINT "ProductVariantAttributeValue_attributeDefinitionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariantAttributeValue" DROP CONSTRAINT "ProductVariantAttributeValue_productVariantId_fkey";

-- AlterTable
ALTER TABLE "CollectionRecord" ADD COLUMN     "financialAccountId" TEXT;

-- AlterTable
ALTER TABLE "PaymentRecord" ADD COLUMN     "financialAccountId" TEXT;

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "openingBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedDate" TIMESTAMP(3),
    "deletedUserId" TEXT,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "direction" "CashTransactionDirection" NOT NULL,
    "sourceType" "CashTransactionSourceType" NOT NULL DEFAULT 'MANUAL',
    "category" "CashTransactionCategory",
    "status" "CashTransactionStatus" NOT NULL DEFAULT 'RECORDED',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "transactionAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "sourceReferenceId" TEXT,
    "counterpartyName" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedDate" TIMESTAMP(3),
    "deletedUserId" TEXT,

    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialAccount_deleted_isActive_idx" ON "FinancialAccount"("deleted", "isActive");

-- CreateIndex
CREATE INDEX "FinancialAccount_type_isActive_idx" ON "FinancialAccount"("type", "isActive");

-- CreateIndex
CREATE INDEX "CashTransaction_accountId_transactionAt_idx" ON "CashTransaction"("accountId", "transactionAt");

-- CreateIndex
CREATE INDEX "CashTransaction_status_transactionAt_idx" ON "CashTransaction"("status", "transactionAt");

-- CreateIndex
CREATE INDEX "CashTransaction_deleted_transactionAt_idx" ON "CashTransaction"("deleted", "transactionAt");

-- CreateIndex
CREATE INDEX "CashTransaction_sourceType_sourceReferenceId_idx" ON "CashTransaction"("sourceType", "sourceReferenceId");

-- CreateIndex
CREATE INDEX "CollectionRecord_financialAccountId_collectedAt_idx" ON "CollectionRecord"("financialAccountId", "collectedAt");

-- CreateIndex
CREATE INDEX "PaymentRecord_financialAccountId_paidAt_idx" ON "PaymentRecord"("financialAccountId", "paidAt");

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeLink" ADD CONSTRAINT "ProductAttributeLink_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "ProductAttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeLink" ADD CONSTRAINT "ProductAttributeLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValue" ADD CONSTRAINT "ProductVariantAttributeValue_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "ProductAttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValue" ADD CONSTRAINT "ProductVariantAttributeValue_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionRecord" ADD CONSTRAINT "CollectionRecord_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "ProductVariantAttributeValue_productVariantId_attributeDefiniti" RENAME TO "ProductVariantAttributeValue_productVariantId_attributeDefi_key";
