ALTER TABLE "AuditLog"
ADD COLUMN "actorType" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN "tenantId" TEXT,
ADD COLUMN "module" TEXT,
ADD COLUMN "route" TEXT,
ADD COLUMN "operation" TEXT,
ADD COLUMN "requestId" TEXT,
ADD COLUMN "correlationId" TEXT,
ADD COLUMN "ipAddress" TEXT,
ADD COLUMN "userAgent" TEXT,
ADD COLUMN "payloadHash" TEXT,
ADD COLUMN "previousHash" TEXT,
ADD COLUMN "chainHash" TEXT,
ADD COLUMN "hashAlgorithm" TEXT NOT NULL DEFAULT 'SHA-256',
ADD COLUMN "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "serverReceivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul';

CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");
CREATE INDEX "AuditLog_chainHash_idx" ON "AuditLog"("chainHash");
