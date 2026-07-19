ALTER TABLE "Category" ADD COLUMN "pazaramaCategoryId" TEXT;
ALTER TABLE "Brand" ADD COLUMN "pazaramaBrandId" TEXT;

CREATE INDEX "Category_pazaramaCategoryId_idx" ON "Category"("pazaramaCategoryId");
CREATE INDEX "Brand_pazaramaBrandId_idx" ON "Brand"("pazaramaBrandId");
