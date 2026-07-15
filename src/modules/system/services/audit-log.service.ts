import { z } from "zod";

import type {
  AuditLogItem,
  AuditLogListQuery,
  AuditLogListResult,
  CreateAuditLogInput,
} from "@/modules/system/contracts/audit-log.contract";
import { AuditLogRepository } from "@/modules/system/repositories/audit-log.repository";

const createAuditLogSchema = z.object({
  entityType: z.enum(["USER", "PRODUCT", "SUPPLIER", "CUSTOMER_ACCOUNT", "CATEGORY", "ORDER", "WAREHOUSE", "STOREFRONT_ITEM", "AUTH"]),
  entityId: z.string().trim().min(1).optional().nullable(),
  action: z.enum(["CREATE", "UPDATE", "DELETE", "STATUS_UPDATE", "LOGIN", "LOGOUT"]),
  actorUserId: z.string().trim().min(1).optional().nullable(),
  summary: z.string().trim().min(1).max(280).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

const listAuditLogSchema = z.object({
  search: z.string().trim().optional(),
  entityType: z.enum(["USER", "PRODUCT", "SUPPLIER", "CUSTOMER_ACCOUNT", "CATEGORY", "ORDER", "WAREHOUSE", "STOREFRONT_ITEM", "AUTH"]).optional(),
  action: z.enum(["CREATE", "UPDATE", "DELETE", "STATUS_UPDATE", "LOGIN", "LOGOUT"]).optional(),
  actorUserId: z.string().trim().optional(),
  startDate: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().date().optional()),
  endDate: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().date().optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

function mapItem(item: {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  actorUserId: string | null;
  entityLabel: string;
  actorLabel: string | null;
  summary: string | null;
  metadata: unknown;
  createdAt: Date;
}): AuditLogItem {
  return {
    id: item.id,
    entityType: item.entityType as AuditLogItem["entityType"],
    entityId: item.entityId,
    entityLabel: item.entityLabel,
    action: item.action as AuditLogItem["action"],
    actorUserId: item.actorUserId,
    actorLabel: item.actorLabel,
    summary: item.summary,
    metadata: (item.metadata as Record<string, unknown> | null) ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

function formatFallbackEntityLabel(entityType: string, entityId: string | null) {
  const entityTypeLabelMap: Record<string, string> = {
    USER: "Kullanıcı",
    PRODUCT: "Ürün",
    CATEGORY: "Kategori",
    SUPPLIER: "Tedarikçi",
    CUSTOMER_ACCOUNT: "Cari Müşteri Kartı",
    ORDER: "Sipariş",
    WAREHOUSE: "Depo",
    STOREFRONT_ITEM: "Mağaza İçeriği",
    AUTH: "Oturum",
  };
  const entityLabel = entityTypeLabelMap[entityType] ?? entityType;

  if (!entityId) {
    return entityLabel;
  }

  return `${entityLabel} • ${entityId.slice(0, 8)}`;
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
        action: parsed.action,
        actorUserId: parsed.actorUserId,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
      }),
    ]);

    const actorIds = Array.from(new Set(items.map((item) => item.actorUserId).filter((value): value is string => Boolean(value))));
    const productIds = Array.from(new Set(items.filter((item) => item.entityType === "PRODUCT" && item.entityId).map((item) => item.entityId as string)));
    const categoryIds = Array.from(new Set(items.filter((item) => item.entityType === "CATEGORY" && item.entityId).map((item) => item.entityId as string)));
    const orderIds = Array.from(new Set(items.filter((item) => item.entityType === "ORDER" && item.entityId).map((item) => item.entityId as string)));
    const storefrontItemIds = Array.from(new Set(items.filter((item) => item.entityType === "STOREFRONT_ITEM" && item.entityId).map((item) => item.entityId as string)));
    const userEntityIds = Array.from(new Set(items.filter((item) => item.entityType === "USER" && item.entityId).map((item) => item.entityId as string)));
    const warehouseIds = Array.from(new Set(items.filter((item) => item.entityType === "WAREHOUSE" && item.entityId).map((item) => item.entityId as string)));
    const customerAccountIds = Array.from(new Set(items.filter((item) => item.entityType === "CUSTOMER_ACCOUNT" && item.entityId).map((item) => item.entityId as string)));

    const [actors, userEntities, products, categories, orders, warehouses, storefrontItems, customerAccounts] = await Promise.all([
      this.repository.findUsersByIds(actorIds),
      this.repository.findUsersByIds(userEntityIds),
      this.repository.findProductsByIds(productIds),
      this.repository.findCategoriesByIds(categoryIds),
      this.repository.findOrdersByIds(orderIds),
      this.repository.findWarehousesByIds(warehouseIds),
      this.repository.findStorefrontItemsByIds(storefrontItemIds),
      this.repository.findCustomerAccountsByIds(customerAccountIds),
    ]);

    const actorMap = new Map(actors.map((item) => [item.id, `${item.name} • ${item.email}`]));
    const userEntityMap = new Map(userEntities.map((item) => [item.id, `${item.name} • ${item.email}`]));
    const productMap = new Map(products.map((item) => [item.id, `${item.name} • ${item.sku}`]));
    const categoryMap = new Map(categories.map((item) => [item.id, `${item.name} • ${item.slug}`]));
    const orderMap = new Map(orders.map((item) => [item.id, `Sipariş • ${item.orderNumber}`]));
    const warehouseMap = new Map(warehouses.map((item) => [item.id, `${item.name} • ${item.code}`]));
    const storefrontMap = new Map(storefrontItems.map((item) => [item.id, `${item.titleTr} • ${item.section}`]));
    const customerAccountMap = new Map<string, string>(
      customerAccounts.map((item: { id: string; name: string; email: string | null }) => [item.id, `${item.name}${item.email ? ` • ${item.email}` : ""}`]),
    );

    return {
      items: items.map((item) => mapItem({
        ...item,
        entityLabel:
          (item.entityType === "USER" ? userEntityMap.get(item.entityId ?? "") : undefined)
          ?? (item.entityType === "PRODUCT" ? productMap.get(item.entityId ?? "") : undefined)
          ?? (item.entityType === "CATEGORY" ? categoryMap.get(item.entityId ?? "") : undefined)
          ?? (item.entityType === "ORDER" ? orderMap.get(item.entityId ?? "") : undefined)
          ?? (item.entityType === "WAREHOUSE" ? warehouseMap.get(item.entityId ?? "") : undefined)
          ?? (item.entityType === "STOREFRONT_ITEM" ? storefrontMap.get(item.entityId ?? "") : undefined)
          ?? (item.entityType === "CUSTOMER_ACCOUNT" ? customerAccountMap.get(item.entityId ?? "") : undefined)
          ?? formatFallbackEntityLabel(item.entityType, item.entityId),
        actorLabel: item.actorUserId ? (actorMap.get(item.actorUserId) ?? item.actorUserId.slice(0, 8)) : null,
      })),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }
}

export const auditLogService = new AuditLogService(new AuditLogRepository());
