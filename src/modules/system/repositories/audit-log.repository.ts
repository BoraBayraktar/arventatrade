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
    action?: AuditLogAction;
    actorUserId?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    pageSize: number;
  }) {
    const createdAtFilter = args.startDate || args.endDate
      ? {
          ...(args.startDate ? { gte: new Date(`${args.startDate}T00:00:00.000Z`) } : {}),
          ...(args.endDate ? { lte: new Date(`${args.endDate}T23:59:59.999Z`) } : {}),
        }
      : undefined;

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
        ...(args.action ? { action: args.action } : {}),
        ...(args.actorUserId ? { actorUserId: args.actorUserId } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
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
    action?: AuditLogAction;
    actorUserId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const createdAtFilter = args.startDate || args.endDate
      ? {
          ...(args.startDate ? { gte: new Date(`${args.startDate}T00:00:00.000Z`) } : {}),
          ...(args.endDate ? { lte: new Date(`${args.endDate}T23:59:59.999Z`) } : {}),
        }
      : undefined;

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
        ...(args.action ? { action: args.action } : {}),
        ...(args.actorUserId ? { actorUserId: args.actorUserId } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      },
    });
  }

  async findUsersByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findProductsByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
      },
    });
  }

  async findCategoriesByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return prisma.category.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  async findOrdersByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return prisma.order.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
      },
    });
  }

  async findWarehousesByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return prisma.warehouse.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }

  async findStorefrontItemsByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return prisma.storefrontItem.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        section: true,
        variant: true,
        titleTr: true,
      },
    });
  }

  async findCustomerAccountsByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return (prisma.customerAccount as any).findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
