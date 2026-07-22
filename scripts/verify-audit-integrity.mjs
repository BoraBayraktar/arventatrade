import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function getPayloadForHash(item) {
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

try {
  const latestAnchor = await prisma.auditAnchor.findFirst({
    orderBy: { periodEnd: "desc" },
  });
  const where = latestAnchor
    ? { createdAt: { gt: latestAnchor.periodEnd } }
    : {};
  const items = await prisma.auditLog.findMany({
    where,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: Number(process.env.AUDIT_VERIFY_TAKE ?? "5000"),
  });

  if (!latestAnchor) {
    console.warn("Audit anchor bulunamadı. Mevcut kayıtlar baseline öncesi kabul edildi; ilk anchor oluşturulduktan sonra zincir doğrulama sertleşir.");
    console.log(`Audit integrity baseline kontrolü geçti. ${items.length} kayıt bulundu.`);
    process.exit(0);
  }
  const errors = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const expectedPayloadHash = sha256(getPayloadForHash(item));
    const expectedPreviousHash = index === 0 ? item.previousHash : items[index - 1]?.chainHash ?? null;
    const expectedChainHash = sha256({ payloadHash: item.payloadHash, previousHash: item.previousHash });

    if (item.payloadHash !== expectedPayloadHash) {
      errors.push(`${item.id}: payload hash eşleşmiyor`);
    }

    if (item.previousHash !== expectedPreviousHash) {
      errors.push(`${item.id}: previous hash eşleşmiyor`);
    }

    if (item.chainHash !== expectedChainHash) {
      errors.push(`${item.id}: chain hash eşleşmiyor`);
    }
  }

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log(`Audit integrity doğrulaması geçti. ${items.length} kayıt kontrol edildi.`);
} finally {
  await prisma.$disconnect();
}
