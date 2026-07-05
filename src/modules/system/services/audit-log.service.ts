import { z } from "zod";

import type {
  AuditLogItem,
  AuditLogListQuery,
  AuditLogListResult,
  CreateAuditLogInput,
} from "@/modules/system/contracts/audit-log.contract";
import { AuditLogRepository } from "@/modules/system/repositories/audit-log.repository";

const createAuditLogSchema = z.object({
  entityType: z.enum(["USER", "PRODUCT", "CATEGORY", "ORDER", "STOREFRONT_ITEM", "AUTH"]),
  entityId: z.string().trim().min(1).optional().nullable(),
  action: z.enum(["CREATE", "UPDATE", "DELETE", "STATUS_UPDATE", "LOGIN", "LOGOUT"]),
  actorUserId: z.string().trim().min(1).optional().nullable(),
  summary: z.string().trim().min(1).max(280).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

const listAuditLogSchema = z.object({
  search: z.string().trim().optional(),
  entityType: z.enum(["USER", "PRODUCT", "CATEGORY", "ORDER", "STOREFRONT_ITEM", "AUTH"]).optional(),
  actorUserId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

function mapItem(item: {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  actorUserId: string | null;
  summary: string | null;
  metadata: unknown;
  createdAt: Date;
}): AuditLogItem {
  return {
    id: item.id,
    entityType: item.entityType as AuditLogItem["entityType"],
    entityId: item.entityId,
    action: item.action as AuditLogItem["action"],
    actorUserId: item.actorUserId,
    summary: item.summary,
    metadata: (item.metadata as Record<string, unknown> | null) ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async record(input: CreateAuditLogInput) {
    const parsed = createAuditLogSchema.parse(input);
    await this.repository.create(parsed);
  }

  async list(query: AuditLogListQuery): Promise<AuditLogListResult> {
    const parsed = listAuditLogSchema.parse(query);

    const [items, total] = await Promise.all([
      this.repository.list(parsed),
      this.repository.count({
        search: parsed.search,
        entityType: parsed.entityType,
        actorUserId: parsed.actorUserId,
      }),
    ]);

    return {
      items: items.map(mapItem),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }
}

export const auditLogService = new AuditLogService(new AuditLogRepository());
