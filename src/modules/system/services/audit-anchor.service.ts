import { z } from "zod";

import { AuditEvidenceStorageRepository } from "@/modules/system/repositories/audit-evidence-storage.repository";
import { AuditLogRepository } from "@/modules/system/repositories/audit-log.repository";
import { sha256 } from "@/modules/system/services/audit-integrity.service";

const anchorSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  createdByUserId: z.string().trim().min(1).optional().nullable(),
});

function getPayloadForHash(item: Awaited<ReturnType<AuditLogRepository["listForIntegrity"]>>[number]) {
  return {
    entityType: item.entityType,
    entityId: item.entityId ?? null,
    action: item.action,
    actorUserId: item.actorUserId ?? null,
    actorType: item.actorType ?? "USER",
    tenantId: item.tenantId ?? null,
    module: item.module ?? null,
    route: item.route ?? null,
    operation: item.operation ?? null,
    requestId: item.requestId ?? null,
    correlationId: item.correlationId ?? item.requestId ?? null,
    ipAddress: item.ipAddress ?? null,
    userAgent: item.userAgent ?? null,
    summary: item.summary ?? null,
    metadata: item.metadata ?? null,
    occurredAt: item.occurredAt.toISOString(),
    serverReceivedAt: item.serverReceivedAt.toISOString(),
  };
}

export class AuditAnchorService {
  constructor(
    private readonly repository: AuditLogRepository,
    private readonly storageRepository: AuditEvidenceStorageRepository,
  ) {}

  async verifyRange(input: { startDate?: string; endDate?: string; take?: number }) {
    const items = await this.repository.listForIntegrity(input);
    const errors: Array<{ id: string; message: string }> = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const expectedPayloadHash = sha256(getPayloadForHash(item));
      const expectedPreviousHash = index === 0 ? item.previousHash : items[index - 1]?.chainHash ?? null;
      const expectedChainHash = sha256({
        payloadHash: item.payloadHash,
        previousHash: item.previousHash,
      });

      if (item.payloadHash !== expectedPayloadHash) {
        errors.push({ id: item.id, message: "Payload hash eşleşmiyor." });
      }

      if (item.previousHash !== expectedPreviousHash) {
        errors.push({ id: item.id, message: "Önceki zincir hash eşleşmiyor." });
      }

      if (item.chainHash !== expectedChainHash) {
        errors.push({ id: item.id, message: "Zincir hash eşleşmiyor." });
      }
    }

    return {
      ok: errors.length === 0,
      checkedAt: new Date().toISOString(),
      recordCount: items.length,
      firstAuditLogId: items[0]?.id ?? null,
      lastAuditLogId: items[items.length - 1]?.id ?? null,
      firstChainHash: items[0]?.chainHash ?? null,
      lastChainHash: items[items.length - 1]?.chainHash ?? null,
      errors,
    };
  }

  async createDailyAnchor(input: { startDate: string; endDate: string; createdByUserId?: string | null }) {
    const parsed = anchorSchema.parse(input);
    const items = await this.repository.listForIntegrity({
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      take: 10000,
    });
    const verification = await this.verifyRange({
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      take: 10000,
    });
    const manifest = {
      generatedAt: new Date().toISOString(),
      anchorType: "DAILY",
      periodStart: `${parsed.startDate}T00:00:00.000Z`,
      periodEnd: `${parsed.endDate}T23:59:59.999Z`,
      hashAlgorithm: "SHA-256",
      verification,
      records: items.map((item) => ({
        id: item.id,
        entityType: item.entityType,
        action: item.action,
        requestId: item.requestId,
        payloadHash: item.payloadHash,
        previousHash: item.previousHash,
        chainHash: item.chainHash,
        createdAt: item.createdAt.toISOString(),
      })),
    };
    const manifestHash = sha256(manifest);
    const objectKey = `audit-anchors/${parsed.startDate}/${manifestHash}.json`;
    const storage = await this.storageRepository.putJson({
      objectKey,
      payload: {
        ...manifest,
        manifestHash,
      },
    });

    return this.repository.createAnchor({
      anchorType: "DAILY",
      periodStart: new Date(`${parsed.startDate}T00:00:00.000Z`),
      periodEnd: new Date(`${parsed.endDate}T23:59:59.999Z`),
      recordCount: items.length,
      firstAuditLogId: items[0]?.id ?? null,
      lastAuditLogId: items[items.length - 1]?.id ?? null,
      firstChainHash: items[0]?.chainHash ?? null,
      lastChainHash: items[items.length - 1]?.chainHash ?? null,
      manifestHash,
      storageBucket: storage.bucket,
      storageObjectKey: storage.objectKey,
      storageUrl: storage.url,
      storageMode: storage.mode,
      status: verification.ok ? "CREATED" : "CREATED_WITH_VERIFICATION_ERRORS",
      errorMessage: verification.ok ? null : `${verification.errors.length} doğrulama hatası var.`,
      createdByUserId: parsed.createdByUserId ?? null,
    });
  }
}

export const auditAnchorService = new AuditAnchorService(new AuditLogRepository(), new AuditEvidenceStorageRepository());
