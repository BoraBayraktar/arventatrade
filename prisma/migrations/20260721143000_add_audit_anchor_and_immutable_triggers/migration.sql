CREATE TABLE "AuditAnchor" (
  "id" TEXT NOT NULL,
  "anchorType" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "recordCount" INTEGER NOT NULL,
  "firstAuditLogId" TEXT,
  "lastAuditLogId" TEXT,
  "firstChainHash" TEXT,
  "lastChainHash" TEXT,
  "manifestHash" TEXT NOT NULL,
  "storageBucket" TEXT,
  "storageObjectKey" TEXT,
  "storageUrl" TEXT,
  "storageMode" TEXT NOT NULL DEFAULT 'LOCAL',
  "status" TEXT NOT NULL DEFAULT 'CREATED',
  "errorMessage" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditAnchor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditAnchor_periodStart_periodEnd_idx" ON "AuditAnchor"("periodStart", "periodEnd");
CREATE INDEX "AuditAnchor_manifestHash_idx" ON "AuditAnchor"("manifestHash");
CREATE INDEX "AuditAnchor_createdAt_idx" ON "AuditAnchor"("createdAt");

CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Audit evidence tables are append-only. Write a correction event instead.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AuditLog_prevent_update"
BEFORE UPDATE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

CREATE TRIGGER "AuditLog_prevent_delete"
BEFORE DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

CREATE TRIGGER "BusinessDocumentLifecycleEvent_prevent_update"
BEFORE UPDATE ON "BusinessDocumentLifecycleEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

CREATE TRIGGER "BusinessDocumentLifecycleEvent_prevent_delete"
BEFORE DELETE ON "BusinessDocumentLifecycleEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

CREATE TRIGGER "BusinessDocumentIntegrationMessage_prevent_update"
BEFORE UPDATE ON "BusinessDocumentIntegrationMessage"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

CREATE TRIGGER "BusinessDocumentIntegrationMessage_prevent_delete"
BEFORE DELETE ON "BusinessDocumentIntegrationMessage"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
