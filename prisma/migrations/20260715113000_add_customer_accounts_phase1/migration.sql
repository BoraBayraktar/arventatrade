CREATE TABLE "CustomerAccount" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "taxNumber" TEXT,
    "address" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedDate" TIMESTAMP(3),
    "deletedUserId" TEXT,

    CONSTRAINT "CustomerAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerAccount_slug_key" ON "CustomerAccount"("slug");
CREATE INDEX "CustomerAccount_deleted_isActive_idx" ON "CustomerAccount"("deleted", "isActive");
CREATE INDEX "CustomerAccount_email_idx" ON "CustomerAccount"("email");
CREATE INDEX "CustomerAccount_taxNumber_idx" ON "CustomerAccount"("taxNumber");
