import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  AuditLogEntityType,
  AuditLogAction,
} from "@/modules/system/contracts/audit-log.contract";

export class AuditLogRepository {
  async create(input: {
    entityType: AuditLogEntityType;
    entityId?: string | null;
    action: AuditLogAction;
    actorUserId?: string | null;
    summary?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return prisma.auditLog.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        action: input.action,
        actorUserId: input.actorUserId ?? null,
        summary: input.summary ?? null,
        metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  }

  async list(args: {
    search?: string;
    entityType?: AuditLogEntityType;
    actorUserId?: string;
    page: number;
    pageSize: number;
  }) {
    return prisma.auditLog.findMany({
      where: {
        ...(args.search
          ? {
              OR: [
                { summary: { contains: args.search, mode: "insensitive" as const } },
                { entityId: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(args.entityType ? { entityType: args.entityType } : {}),
        ...(args.actorUserId ? { actorUserId: args.actorUserId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (args.page - 1) * args.pageSize,
      take: args.pageSize,
    });
  }

  async count(args: {
    search?: string;
    entityType?: AuditLogEntityType;
    actorUserId?: string;
  }) {
    return prisma.auditLog.count({
      where: {
        ...(args.search
          ? {
              OR: [
                { summary: { contains: args.search, mode: "insensitive" as const } },
                { entityId: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(args.entityType ? { entityType: args.entityType } : {}),
        ...(args.actorUserId ? { actorUserId: args.actorUserId } : {}),
      },
    });
  }
}
