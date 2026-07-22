import { createHash } from "node:crypto";
import { z } from "zod";

import type { RecordBusinessDocumentLifecycleEventInput } from "@/modules/documents/contracts/document-lifecycle.contract";
import { DocumentLifecycleRepository } from "@/modules/documents/repositories/document-lifecycle.repository";

const lifecycleEventSchema = z.object({
  businessDocumentId: z.string().trim().min(1),
  eventType: z.enum([
    "DOCUMENT_CREATED",
    "DOCUMENT_UPDATED",
    "INVOICE_CREATED_FROM_DELIVERY_NOTE",
    "OUTBOUND_QUEUED",
    "OUTBOUND_SENT",
    "OUTBOUND_FAILED",
    "STATUS_SYNC_QUEUED",
    "STATUS_SYNCED",
    "WEBHOOK_RECEIVED",
  ]),
  status: z.string().trim().optional().nullable(),
  externalStatus: z.string().trim().optional().nullable(),
  providerCode: z.string().trim().optional().nullable(),
  integrationJobId: z.string().trim().optional().nullable(),
  dispatchId: z.string().trim().optional().nullable(),
  auditLogId: z.string().trim().optional().nullable(),
  actorUserId: z.string().trim().optional().nullable(),
  actorType: z.enum(["USER", "SYSTEM", "INTEGRATION"]).default("SYSTEM"),
  requestId: z.string().trim().optional().nullable(),
  correlationId: z.string().trim().optional().nullable(),
  summary: z.string().trim().min(1).max(280),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  occurredAt: z.union([z.date(), z.string().datetime()]).optional().nullable(),
  message: z.object({
    direction: z.enum(["OUTBOUND", "INBOUND", "INTERNAL"]),
    channel: z.string().trim().optional().nullable(),
    providerCode: z.string().trim().optional().nullable(),
    endpoint: z.string().trim().optional().nullable(),
    messageType: z.string().trim().min(1).max(120),
    payload: z.record(z.string(), z.unknown()).optional().nullable(),
    headers: z.record(z.string(), z.unknown()).optional().nullable(),
    statusCode: z.number().int().optional().nullable(),
    errorMessage: z.string().trim().optional().nullable(),
  }).optional(),
});

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}

function hashPayload(payload: unknown) {
  return createHash("sha256").update(stableStringify(payload ?? null)).digest("hex");
}

function shouldMaskKey(key: string) {
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.includes("authorization")
    || lowerKey.includes("secret")
    || lowerKey.includes("token")
    || lowerKey.includes("signature")
    || lowerKey.includes("password")
    || lowerKey.includes("apikey")
    || lowerKey.includes("api_key")
  );
}

function maskSensitiveValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => maskSensitiveValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => (
      shouldMaskKey(key) ? [key, "MASKED"] : [key, maskSensitiveValue(item)]
    )));
  }

  return value;
}

function maskObject(value: Record<string, unknown> | null | undefined) {
  if (!value) {
    return null;
  }

  return maskSensitiveValue(value) as Record<string, unknown>;
}

export class DocumentLifecycleService {
  constructor(private readonly repository: DocumentLifecycleRepository) {}

  async recordEvent(input: RecordBusinessDocumentLifecycleEventInput) {
    const parsed = lifecycleEventSchema.parse(input);
    const payloadHash = parsed.message ? hashPayload(parsed.message.payload ?? null) : null;

    return this.repository.createEvent({
      ...parsed,
      message: parsed.message
        ? {
            ...parsed.message,
            payload: maskObject(parsed.message.payload),
            headers: maskObject(parsed.message.headers),
          }
        : undefined,
      payloadHash,
    });
  }
}

export const documentLifecycleService = new DocumentLifecycleService(new DocumentLifecycleRepository());
