import { z } from "zod";

import { redisCache } from "@/lib/redis";
import { identityAdminService } from "@/modules/identity/services/identity-admin.service";
import { integrationService } from "@/modules/integration/services/integration.service";
import type {
  AdminCreateStockCountInput,
  AdminCreateWarehouseInput,
  AdminInventoryAlertItem,
  AdminInventoryIntegrationSummary,
  AdminInventoryAlertSummary,
  AdminInventoryItem,
  AdminInventoryListQuery,
  AdminInventoryListResult,
  AdminInventoryReportsResult,
  AdminStockCountItem,
  AdminUpdateStockCountLineInput,
  AdminInventoryTransactionItem,
  AdminInventoryTransactionListQuery,
  AdminInventoryTransactionListResult,
  AdminUpdateWarehouseInput,
  AdminWarehouseItem,
  ProductInventoryAvailability,
  RecordProductInventoryMovementInput,
  SyncProductInventoryInput,
  TransferProductInventoryInput,
} from "@/modules/inventory/contracts/inventory.contract";
import { InventoryRepository } from "@/modules/inventory/repositories/inventory.repository";
import { notificationService } from "@/modules/system/services/notification.service";

const availabilityQuerySchema = z.object({
  productIds: z.array(z.string().trim().min(1)).min(1).max(100),
});

const syncProductInventorySchema = z.object({
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(64),
  warehouseCode: z.string().trim().min(1).max(32).optional(),
  targetOnHandStock: z.coerce.number().int().min(0).optional(),
  reorderPoint: z.coerce.number().int().min(0).optional(),
  safetyStock: z.coerce.number().int().min(0).optional(),
  note: z.string().trim().min(3).max(280).optional(),
});

const transferInventorySchema = z.object({
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(64),
  fromWarehouseCode: z.string().trim().min(1).max(32),
  toWarehouseCode: z.string().trim().min(1).max(32),
  quantity: z.coerce.number().int().min(1),
  note: z.string().trim().min(3).max(280).optional(),
});

const recordInventoryMovementSchema = z.object({
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(64),
  warehouseCode: z.string().trim().min(1).max(32),
  quantity: z.coerce.number().int().min(1),
  type: z.enum(["PURCHASE_RECEIPT", "DAMAGE_WRITE_OFF"]),
  note: z.string().trim().min(3).max(280).optional(),
});

const adminInventoryListQuerySchema = z.object({
  search: z.string().trim().optional(),
  stockStatusFilter: z.enum(["all", "in_stock", "low_stock", "out_of_stock"]).default("all"),
  reservationFilter: z.enum(["all", "with_reserved", "without_reserved"]).default("all"),
  warehouseFilter: z.string().trim().max(32).optional(),
  movementTypeFilter: z
    .enum([
      "all",
      "INITIAL_LOAD",
      "MANUAL_ADJUSTMENT",
      "PURCHASE_RECEIPT",
      "TRANSFER_OUT",
      "TRANSFER_IN",
      "RESERVATION_HOLD",
      "RESERVATION_RELEASE",
      "ORDER_COMMIT",
      "ORDER_CANCEL_RESTOCK",
      "RETURN_RESTOCK",
      "DAMAGE_WRITE_OFF",
    ])
    .default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

const createWarehouseSchema = z.object({
  code: z.string().trim().min(2).max(32),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  contactName: z.string().trim().max(120).optional().nullable(),
  contactPhone: z.string().trim().max(40).optional().nullable(),
  priority: z.coerce.number().int().min(0).max(9999).default(100),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

const adminInventoryTransactionListQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(["all", "MANUAL_ADJUSTMENT", "STOCK_IN", "STOCK_OUT", "TRANSFER", "STOCK_COUNT"]).default("all"),
  warehouseCode: z.string().trim().max(32).optional(),
  sku: z.string().trim().max(64).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(8),
});

const createStockCountSchema = z.object({
  warehouseCode: z.string().trim().min(1).max(32).optional().nullable(),
  countedAt: z.string().datetime(),
  note: z.string().trim().max(500).optional().nullable(),
  search: z.string().trim().max(120).optional().nullable(),
});

const updateStockCountLineSchema = z.object({
  stockCountId: z.string().trim().min(1),
  lineId: z.string().trim().min(1),
  countedOnHand: z.coerce.number().int().min(0),
  note: z.string().trim().max(500).optional().nullable(),
});

const updateWarehouseSchema = z.object({
  id: z.string().trim().min(1),
  code: z.string().trim().min(2).max(32).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  contactName: z.string().trim().max(120).optional().nullable(),
  contactPhone: z.string().trim().max(40).optional().nullable(),
  priority: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
}).refine((value) => (
  value.code !== undefined
  || value.name !== undefined
  || value.description !== undefined
  || value.address !== undefined
  || value.contactName !== undefined
  || value.contactPhone !== undefined
  || value.priority !== undefined
  || value.isActive !== undefined
  || value.isDefault !== undefined
), {
  message: "At least one warehouse field must be provided",
});

function toAvailableStock(onHandStock: number, reservedStock: number) {
  return Math.max(0, onHandStock - reservedStock);
}

function mapMovementPreview(movement: {
  type: string;
  quantity: number;
  note: string | null;
  createdAt: Date;
  metadata?: unknown;
}) {
  const metadata = movement.metadata && typeof movement.metadata === "object" && !Array.isArray(movement.metadata)
    ? movement.metadata as Record<string, unknown>
    : null;

  const fromWarehouseCode = typeof metadata?.fromWarehouseCode === "string" ? metadata.fromWarehouseCode : null;
  const toWarehouseCode = typeof metadata?.toWarehouseCode === "string" ? metadata.toWarehouseCode : null;
  const transferReference = typeof metadata?.transferReference === "string" ? metadata.transferReference : null;
  const transactionNumber = typeof metadata?.transactionNumber === "string" ? metadata.transactionNumber : null;

  const counterpartyWarehouseCode = movement.type === "TRANSFER_OUT"
    ? toWarehouseCode
    : movement.type === "TRANSFER_IN"
      ? fromWarehouseCode
      : null;

  return {
    type: movement.type,
    quantity: movement.quantity,
    note: movement.note,
    reference: transactionNumber ?? transferReference,
    counterpartyWarehouseCode,
    createdAt: movement.createdAt.toISOString(),
  };
}

function toStockStatus(availableStock: number): AdminInventoryItem["stockStatus"] {
  if (availableStock <= 0) {
    return "OUT_OF_STOCK";
  }

  if (availableStock <= 5) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

function mapWarehouse(warehouse: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    inventoryLevels: number;
  };
}): AdminWarehouseItem {
  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    description: warehouse.description,
    address: warehouse.address,
    contactName: warehouse.contactName,
    contactPhone: warehouse.contactPhone,
    priority: warehouse.priority,
    isActive: warehouse.isActive,
    isDefault: warehouse.isDefault,
    levelCount: warehouse._count.inventoryLevels,
    createdAt: warehouse.createdAt.toISOString(),
    updatedAt: warehouse.updatedAt.toISOString(),
  };
}

function mapInventoryTransaction(item: {
  id: string;
  transactionNumber: string;
  type: "MANUAL_ADJUSTMENT" | "STOCK_IN" | "STOCK_OUT" | "TRANSFER" | "STOCK_COUNT";
  reference: string | null;
  note: string | null;
  createdAt: Date;
  lines: Array<{
    id: string;
    quantity: number;
    note: string | null;
    fromWarehouse: { code: string } | null;
    toWarehouse: { code: string } | null;
    inventoryItem: {
      skuSnapshot: string;
      product: {
        name: string;
      };
    };
  }>;
}): AdminInventoryTransactionItem {
  return {
    id: item.id,
    transactionNumber: item.transactionNumber,
    type: item.type,
    reference: item.reference,
    note: item.note,
    createdAt: item.createdAt.toISOString(),
    lines: item.lines.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      note: line.note,
      fromWarehouseCode: line.fromWarehouse?.code ?? null,
      toWarehouseCode: line.toWarehouse?.code ?? null,
      inventoryItemSku: line.inventoryItem.skuSnapshot,
      inventoryItemName: line.inventoryItem.product.name,
    })),
  };
}

function mapInventoryAlert(item: {
  id: string;
  warehouseId: string;
  type: "LOW_STOCK" | "OUT_OF_STOCK";
  status: "ACTIVE" | "RESOLVED";
  message: string;
  createdAt: Date;
  updatedAt: Date;
  warehouse: {
    code: string;
    name: string;
  };
  inventoryItem: {
    product: {
      id: string;
      name: string;
    };
    skuSnapshot: string;
    inventoryLevels: Array<{
      warehouseId: string;
      onHand: number;
      reserved: number;
      reorderPoint: number;
      safetyStock: number;
    }>;
  };
}): AdminInventoryAlertItem {
  const level = item.inventoryItem.inventoryLevels.find((entry) => entry.warehouseId === (item as { warehouseId?: string }).warehouseId)
    ?? item.inventoryItem.inventoryLevels[0];
  const availableStock = level ? toAvailableStock(level.onHand, level.reserved) : 0;

  return {
    id: item.id,
    productId: item.inventoryItem.product.id,
    sku: item.inventoryItem.skuSnapshot,
    productName: item.inventoryItem.product.name,
    warehouseCode: item.warehouse.code,
    warehouseName: item.warehouse.name,
    availableStock,
    reorderPoint: level?.reorderPoint ?? 0,
    safetyStock: level?.safetyStock ?? 0,
    type: item.type,
    status: item.status,
    message: item.message,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapStockCount(item: {
  id: string;
  countNumber: string;
  status: "DRAFT" | "COUNTED" | "APPLIED";
  countedAt: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  warehouse: {
    code: string;
    name: string;
  } | null;
  lines: Array<{
    id: string;
    systemOnHand: number;
    countedOnHand: number | null;
    note: string | null;
    warehouse: {
      code: string;
      name: string;
    };
    inventoryItem: {
      id: string;
      skuSnapshot: string;
      product: {
        id: string;
        name: string;
      };
    };
  }>;
}): AdminStockCountItem {
  const lines = item.lines.map((line) => ({
    id: line.id,
    inventoryItemId: line.inventoryItem.id,
    productId: line.inventoryItem.product.id,
    sku: line.inventoryItem.skuSnapshot,
    productName: line.inventoryItem.product.name,
    warehouseCode: line.warehouse.code,
    warehouseName: line.warehouse.name,
    systemOnHand: line.systemOnHand,
    countedOnHand: line.countedOnHand,
    difference: line.countedOnHand === null ? null : line.countedOnHand - line.systemOnHand,
    note: line.note,
  }));

  return {
    id: item.id,
    countNumber: item.countNumber,
    status: item.status,
    countedAt: item.countedAt.toISOString(),
    note: item.note,
    warehouseCode: item.warehouse?.code ?? null,
    warehouseName: item.warehouse?.name ?? null,
    lineCount: lines.length,
    varianceLineCount: lines.filter((line) => line.difference !== null && line.difference !== 0).length,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    lines,
  };
}

async function invalidateCatalogCache() {
  await Promise.all([
    redisCache.delByPrefix("catalog:list:"),
    redisCache.delByPrefix("catalog:detail:"),
  ]);
}

async function invalidateInventoryCache() {
  await Promise.all([
    redisCache.delByPrefix("inventory:reports:"),
    redisCache.delByPrefix("inventory:integrations:"),
  ]);
}

async function queueInventoryStockSync(args: {
  productIds: string[];
  trigger: string;
  reference: string;
  warehouseCode?: string;
}) {
  const uniqueProductIds = Array.from(new Set(args.productIds.filter((item) => item.trim().length > 0)));
  if (uniqueProductIds.length === 0) {
    return;
  }

  const channels: Array<"TRENDYOL" | "N11"> = ["TRENDYOL", "N11"];

  await Promise.all(channels.map((channel) => integrationService.dispatchJobs({
    channel,
    jobType: "STOCK_SYNC",
    entityType: "PRODUCT",
    entityIds: uniqueProductIds,
    idempotencySuffix: args.reference,
    payload: {
      trigger: args.trigger,
      reference: args.reference,
      warehouseCode: args.warehouseCode ?? null,
    },
  })));
}

async function notifyBackofficeUsersForInventoryAlerts(alerts: Array<{
  type: "LOW_STOCK" | "OUT_OF_STOCK";
  message: string;
  warehouseCode: string;
  productName: string;
}>) {
  if (alerts.length === 0) {
    return;
  }

  const recipients = await identityAdminService.listBackofficeUsers();
  if (recipients.length === 0) {
    return;
  }

  await Promise.all(alerts.map((alert) => (
    notificationService.createForRecipients({
      recipients: recipients.map((recipient) => ({ id: recipient.id })),
      type: "INVENTORY_ALERT_CREATED",
      title: alert.type === "OUT_OF_STOCK" ? "Inventory out of stock alert" : "Inventory low stock alert",
      message: alert.message,
      linkUrl: "/admin/inventory",
      channels: ["IN_APP"],
    })
  )));
}

export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async listInventoryOverview(query: AdminInventoryListQuery): Promise<AdminInventoryListResult> {
    const parsed = adminInventoryListQuerySchema.parse(query);
    const products = await this.repository.listInventoryOverview({
      search: parsed.search,
      warehouseCode: parsed.warehouseFilter,
    });

    const mappedItems: AdminInventoryItem[] = products.flatMap<AdminInventoryItem>((product) => {
      const inventoryLevels = product.inventoryItem?.inventoryLevels ?? [];
      const inventoryMovements = product.inventoryItem?.inventoryMovements ?? [];

      if (inventoryLevels.length === 0) {
        return [{
          productId: product.id,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          imageUrl: product.imageUrl,
          currency: product.currency,
          onHandStock: product.stock,
          reservedStock: 0,
          availableStock: product.stock,
          reorderPoint: 0,
          safetyStock: 0,
          warehouseCode: null,
          warehouseName: null,
          isDefaultWarehouse: false,
          hasReservations: false,
          lastMovementType: inventoryMovements[0]?.type ?? null,
          recentMovements: inventoryMovements.slice(0, 30).map((movement) => ({
            ...mapMovementPreview(movement),
          })),
          stockStatus: toStockStatus(product.stock),
          lastMovementAt: inventoryMovements[0]?.createdAt?.toISOString() ?? null,
        }];
      }

      return inventoryLevels.map((level) => {
        const availableStock = toAvailableStock(level.onHand, level.reserved);
        const lastWarehouseMovement = inventoryMovements.find((movement) => movement.warehouseId === level.warehouse.id);
        const recentWarehouseMovements = inventoryMovements
          .filter((movement) => movement.warehouseId === level.warehouse.id)
          .slice(0, 30)
          .map((movement) => mapMovementPreview(movement));

        return {
          productId: product.id,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          imageUrl: product.imageUrl,
          currency: product.currency,
          onHandStock: level.onHand,
          reservedStock: level.reserved,
          availableStock,
          reorderPoint: level.reorderPoint,
          safetyStock: level.safetyStock,
          warehouseCode: level.warehouse.code,
          warehouseName: level.warehouse.name,
          isDefaultWarehouse: level.warehouse.isDefault,
          hasReservations: level.reserved > 0,
          lastMovementType: lastWarehouseMovement?.type ?? null,
          recentMovements: recentWarehouseMovements,
          stockStatus: toStockStatus(availableStock),
          lastMovementAt: lastWarehouseMovement?.createdAt?.toISOString() ?? null,
        };
      });
    });

    const filteredItems = mappedItems.filter((item) => {
      const stockStatusMatch = parsed.stockStatusFilter === "all"
        || (parsed.stockStatusFilter === "in_stock" && item.stockStatus === "IN_STOCK")
        || (parsed.stockStatusFilter === "low_stock" && item.stockStatus === "LOW_STOCK")
        || (parsed.stockStatusFilter === "out_of_stock" && item.stockStatus === "OUT_OF_STOCK");

      const reservationMatch = parsed.reservationFilter === "all"
        || (parsed.reservationFilter === "with_reserved" && item.hasReservations)
        || (parsed.reservationFilter === "without_reserved" && !item.hasReservations);

      const movementMatch = parsed.movementTypeFilter === "all"
        || item.lastMovementType === parsed.movementTypeFilter;

      return stockStatusMatch && reservationMatch && movementMatch;
    });

    const total = filteredItems.length;
    const pagedItems = filteredItems.slice((parsed.page - 1) * parsed.pageSize, parsed.page * parsed.pageSize);

    return {
      items: pagedItems,
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
      summary: {
        totalProducts: total,
        lowStockCount: filteredItems.filter((item) => item.stockStatus === "LOW_STOCK").length,
        outOfStockCount: filteredItems.filter((item) => item.stockStatus === "OUT_OF_STOCK").length,
        totalAvailableStock: filteredItems.reduce((sum, item) => sum + item.availableStock, 0),
        totalReservedStock: filteredItems.reduce((sum, item) => sum + item.reservedStock, 0),
        rowsWithReservations: filteredItems.filter((item) => item.hasReservations).length,
      },
    };
  }

  async listInventoryTransactions(query: AdminInventoryTransactionListQuery): Promise<AdminInventoryTransactionListResult> {
    const parsed = adminInventoryTransactionListQuerySchema.parse(query);
    const startDate = parsed.startDate ? new Date(`${parsed.startDate}T00:00:00.000Z`) : undefined;
    const endDate = parsed.endDate ? new Date(`${parsed.endDate}T23:59:59.999Z`) : undefined;
    const [items, total] = await Promise.all([
      this.repository.listInventoryTransactions({
        ...parsed,
        startDate,
        endDate,
      }),
      this.repository.countInventoryTransactions({
        search: parsed.search,
        type: parsed.type,
        warehouseCode: parsed.warehouseCode,
        sku: parsed.sku,
        startDate,
        endDate,
      }),
    ]);

    return {
      items: items.map(mapInventoryTransaction),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }

  async listInventoryAlerts(): Promise<{
    items: AdminInventoryAlertItem[];
    summary: AdminInventoryAlertSummary;
  }> {
    const alerts = await this.repository.listInventoryAlerts();
    const items = alerts.map(mapInventoryAlert);

    return {
      items,
      summary: {
        activeCount: items.length,
        outOfStockCount: items.filter((item) => item.type === "OUT_OF_STOCK").length,
        lowStockCount: items.filter((item) => item.type === "LOW_STOCK").length,
      },
    };
  }

  async listStockCounts(): Promise<AdminStockCountItem[]> {
    const items = await this.repository.listStockCounts();
    return items.map(mapStockCount);
  }

  async getInventoryReports(): Promise<AdminInventoryReportsResult> {
    const cacheKey = "inventory:reports:dashboard:v1";
    const cached = await redisCache.get<AdminInventoryReportsResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const [levels, movements] = await Promise.all([
      this.repository.listInventoryReportLevels(),
      this.repository.listInventoryReportMovements(30),
    ]);

    const warehouseMap = new Map<string, AdminInventoryReportsResult["warehouses"][number]>();
    const lowStock = levels
      .filter((level) => {
        const availableUnits = toAvailableStock(level.onHand, level.reserved);
        const threshold = Math.max(level.reorderPoint, level.safetyStock);
        return threshold > 0 && availableUnits <= threshold;
      })
      .map((level) => ({
        productId: level.inventoryItem.product.id,
        productName: level.inventoryItem.product.name,
        sku: level.inventoryItem.product.sku,
        warehouseCode: level.warehouse.code,
        warehouseName: level.warehouse.name,
        availableUnits: toAvailableStock(level.onHand, level.reserved),
        reorderPoint: level.reorderPoint,
        safetyStock: level.safetyStock,
        unitCost: level.inventoryItem.product.purchasePrice?.toNumber() ?? 0,
        unitPrice: level.inventoryItem.product.price.toNumber(),
      }))
      .sort((left, right) => left.availableUnits - right.availableUnits)
      .slice(0, 8);

    let totalOnHandUnits = 0;
    let totalAvailableUnits = 0;
    let totalCostValue = 0;
    let totalSalesValue = 0;
    let lowStockRowCount = 0;
    let outOfStockRowCount = 0;

    for (const level of levels) {
      const onHandUnits = level.onHand;
      const availableUnits = toAvailableStock(level.onHand, level.reserved);
      const unitCost = level.inventoryItem.product.purchasePrice?.toNumber() ?? 0;
      const unitPrice = level.inventoryItem.product.price.toNumber();
      const threshold = Math.max(level.reorderPoint, level.safetyStock);

      totalOnHandUnits += onHandUnits;
      totalAvailableUnits += availableUnits;
      totalCostValue += onHandUnits * unitCost;
      totalSalesValue += availableUnits * unitPrice;

      if (availableUnits <= 0) {
        outOfStockRowCount += 1;
      } else if (threshold > 0 && availableUnits <= threshold) {
        lowStockRowCount += 1;
      }

      const existingWarehouse = warehouseMap.get(level.warehouse.id);
      if (existingWarehouse) {
        existingWarehouse.skuCount += 1;
        existingWarehouse.onHandUnits += onHandUnits;
        existingWarehouse.availableUnits += availableUnits;
        existingWarehouse.costValue += onHandUnits * unitCost;
        existingWarehouse.salesValue += availableUnits * unitPrice;
      } else {
        warehouseMap.set(level.warehouse.id, {
          warehouseCode: level.warehouse.code,
          warehouseName: level.warehouse.name,
          skuCount: 1,
          onHandUnits,
          availableUnits,
          costValue: onHandUnits * unitCost,
          salesValue: availableUnits * unitPrice,
        });
      }
    }

    const movementSummaryMap = new Map<string, AdminInventoryReportsResult["movementSummary"][number]>();
    const trendMap = new Map<string, { stockInQuantity: number; stockOutQuantity: number }>();

    for (const movement of movements) {
      const existingMovement = movementSummaryMap.get(movement.type);
      const movementAbsQuantity = Math.abs(movement.quantity);

      if (existingMovement) {
        existingMovement.movementCount += 1;
        existingMovement.totalQuantity += movementAbsQuantity;
        existingMovement.lastMovementAt = movement.createdAt.toISOString();
      } else {
        movementSummaryMap.set(movement.type, {
          movementType: movement.type,
          movementCount: 1,
          totalQuantity: movementAbsQuantity,
          lastMovementAt: movement.createdAt.toISOString(),
        });
      }

      const dateKey = movement.createdAt.toISOString().slice(0, 10);
      const trendItem = trendMap.get(dateKey) ?? { stockInQuantity: 0, stockOutQuantity: 0 };
      if (movement.quantity >= 0) {
        trendItem.stockInQuantity += movement.quantity;
      } else {
        trendItem.stockOutQuantity += Math.abs(movement.quantity);
      }
      trendMap.set(dateKey, trendItem);
    }

    const trend: AdminInventoryReportsResult["trend"] = [];
    for (let index = 29; index >= 0; index -= 1) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - index);
      const dateKey = date.toISOString().slice(0, 10);
      const point = trendMap.get(dateKey) ?? { stockInQuantity: 0, stockOutQuantity: 0 };
      trend.push({
        date: dateKey,
        stockInQuantity: point.stockInQuantity,
        stockOutQuantity: point.stockOutQuantity,
        netQuantity: point.stockInQuantity - point.stockOutQuantity,
      });
    }

    const result: AdminInventoryReportsResult = {
      overview: {
        totalOnHandUnits,
        totalAvailableUnits,
        totalCostValue,
        totalSalesValue,
        totalPotentialProfit: totalSalesValue - totalCostValue,
        warehouseCount: warehouseMap.size,
        lowStockRowCount,
        outOfStockRowCount,
      },
      warehouses: Array.from(warehouseMap.values()).sort((left, right) => right.salesValue - left.salesValue),
      lowStock,
      movementSummary: Array.from(movementSummaryMap.values()).sort((left, right) => right.totalQuantity - left.totalQuantity),
      trend,
    };

    await redisCache.set(cacheKey, result, 300);
    return result;
  }

  async getInventoryIntegrationSummary(): Promise<AdminInventoryIntegrationSummary> {
    const cacheKey = "inventory:integrations:dashboard:v1";
    const cached = await redisCache.get<AdminInventoryIntegrationSummary>(cacheKey);
    if (cached) {
      return cached;
    }

    const dashboard = await integrationService.getStockSyncDashboard();
    const result: AdminInventoryIntegrationSummary = {
      pendingCount: dashboard.pendingCount,
      processingCount: dashboard.processingCount,
      failedCount: dashboard.failedCount,
      deadLetterCount: dashboard.deadLetterCount,
      successCount: dashboard.successCount,
      recentJobs: dashboard.recentJobs.map((job) => ({
        id: job.id,
        channel: job.channel,
        status: job.status,
        entityId: job.entityId,
        createdAt: job.createdAt,
        lastError: job.lastError,
      })),
    };

    await redisCache.set(cacheKey, result, 300);
    return result;
  }

  async getProductAvailability(productIds: string[]): Promise<ProductInventoryAvailability[]> {
    const parsed = availabilityQuerySchema.parse({
      productIds,
    });

    const products = await this.repository.listActiveProductInventoryByIds(parsed.productIds);

    return products.map((product) => {
      const inventoryLevels = product.inventoryItem?.inventoryLevels ?? [];
      const onHandStock = inventoryLevels.length > 0
        ? inventoryLevels.reduce((sum, level) => sum + level.onHand, 0)
        : product.stock;
      const reservedStock = inventoryLevels.reduce((sum, level) => sum + level.reserved, 0);
      const availableStock = inventoryLevels.length > 0
        ? toAvailableStock(onHandStock, reservedStock)
        : product.stock;
      const defaultWarehouse = inventoryLevels.find((level) => level.warehouse.isDefault) ?? inventoryLevels[0];

      return {
        productId: product.id,
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        imageUrl: product.imageUrl,
        currency: product.currency,
        unitPrice: product.price.toNumber(),
        compareAtPrice: product.compareAtPrice?.toNumber() ?? null,
        onHandStock,
        reservedStock,
        availableStock,
        inStock: availableStock > 0,
        warehouseCode: defaultWarehouse?.warehouse.code ?? null,
      };
    });
  }

  async syncProductInventoryState(input: SyncProductInventoryInput): Promise<void> {
    const parsed = syncProductInventorySchema.parse(input);
    await this.repository.syncProductInventoryState(parsed);
    const product = await this.repository.listActiveProductInventoryByIds([parsed.productId]);
    const inventoryItemId = product[0]?.inventoryItem?.id;
    const warehouseCode = parsed.warehouseCode ?? product[0]?.inventoryItem?.inventoryLevels.find((level) => level.warehouse.isDefault)?.warehouse.code;
    if (inventoryItemId && warehouseCode) {
      const warehouses = await this.repository.listWarehouses();
      const warehouse = warehouses.find((item) => item.code === warehouseCode);
      if (warehouse) {
        const alerts = await this.repository.refreshInventoryAlerts([{ inventoryItemId, warehouseId: warehouse.id }]);
        await notifyBackofficeUsersForInventoryAlerts(alerts);
      }
    }
    await queueInventoryStockSync({
      productIds: [parsed.productId],
      trigger: "MANUAL_ADJUSTMENT",
      reference: `inventory-adjust:${parsed.productId}:${Date.now()}`,
      warehouseCode,
    });
    await invalidateCatalogCache();
    await invalidateInventoryCache();
  }

  async transferProductInventory(input: TransferProductInventoryInput): Promise<void> {
    const parsed = transferInventorySchema.parse(input);
    await this.repository.transferProductInventory(parsed);
    const product = await this.repository.listActiveProductInventoryByIds([parsed.productId]);
    const inventoryItemId = product[0]?.inventoryItem?.id;
    if (inventoryItemId) {
      const warehouses = await this.repository.listWarehouses();
      const targets = warehouses
        .filter((warehouse) => warehouse.code === parsed.fromWarehouseCode || warehouse.code === parsed.toWarehouseCode)
        .map((warehouse) => ({ inventoryItemId, warehouseId: warehouse.id }));
      const alerts = await this.repository.refreshInventoryAlerts(targets);
      await notifyBackofficeUsersForInventoryAlerts(alerts);
    }
    await queueInventoryStockSync({
      productIds: [parsed.productId],
      trigger: "TRANSFER",
      reference: `inventory-transfer:${parsed.productId}:${parsed.fromWarehouseCode}:${parsed.toWarehouseCode}:${Date.now()}`,
    });
    await invalidateCatalogCache();
    await invalidateInventoryCache();
  }

  async recordProductInventoryMovement(input: RecordProductInventoryMovementInput): Promise<void> {
    const parsed = recordInventoryMovementSchema.parse(input);
    await this.repository.recordProductInventoryMovement(parsed);
    const product = await this.repository.listActiveProductInventoryByIds([parsed.productId]);
    const inventoryItemId = product[0]?.inventoryItem?.id;
    if (inventoryItemId) {
      const warehouses = await this.repository.listWarehouses();
      const warehouse = warehouses.find((item) => item.code === parsed.warehouseCode);
      if (warehouse) {
        const alerts = await this.repository.refreshInventoryAlerts([{ inventoryItemId, warehouseId: warehouse.id }]);
        await notifyBackofficeUsersForInventoryAlerts(alerts);
      }
    }
    await queueInventoryStockSync({
      productIds: [parsed.productId],
      trigger: parsed.type,
      reference: `inventory-movement:${parsed.type}:${parsed.productId}:${Date.now()}`,
      warehouseCode: parsed.warehouseCode,
    });
    await invalidateCatalogCache();
    await invalidateInventoryCache();
  }

  async listWarehouses(): Promise<AdminWarehouseItem[]> {
    const warehouses = await this.repository.listWarehouses();
    return warehouses.map(mapWarehouse);
  }

  async createWarehouse(input: AdminCreateWarehouseInput): Promise<AdminWarehouseItem> {
    const parsed = createWarehouseSchema.parse(input);
    const created = await this.repository.createWarehouse(parsed);
    await invalidateInventoryCache();
    return mapWarehouse(created);
  }

  async updateWarehouse(input: AdminUpdateWarehouseInput): Promise<AdminWarehouseItem> {
    const parsed = updateWarehouseSchema.parse(input);
    const updated = await this.repository.updateWarehouse(parsed);
    await invalidateInventoryCache();
    return mapWarehouse(updated);
  }

  async createStockCount(input: AdminCreateStockCountInput): Promise<AdminStockCountItem> {
    const parsed = createStockCountSchema.parse(input);
    const created = await this.repository.createStockCount(parsed);
    return mapStockCount(created);
  }

  async updateStockCountLine(input: AdminUpdateStockCountLineInput): Promise<void> {
    const parsed = updateStockCountLineSchema.parse(input);
    await this.repository.updateStockCountLine(parsed);
  }

  async applyStockCount(stockCountId: string): Promise<{ transactionNumber: string; countNumber: string }> {
    const parsedId = z.string().trim().min(1).parse(stockCountId);
    const applied = await this.repository.applyStockCount(parsedId);
    const alerts = await this.repository.refreshInventoryAlerts(applied.touchedTargets);
    await notifyBackofficeUsersForInventoryAlerts(alerts);

    const recipients = await identityAdminService.listBackofficeUsers();
    if (recipients.length > 0) {
      await notificationService.createForRecipients({
        recipients: recipients.map((recipient) => ({ id: recipient.id })),
        type: "STOCK_COUNT_APPLIED",
        title: "Stock count applied",
        message: `${applied.countNumber} was applied with transaction ${applied.transactionNumber}.`,
        linkUrl: "/admin/inventory",
        channels: ["IN_APP"],
      });
    }

    await invalidateCatalogCache();
    await invalidateInventoryCache();
    await queueInventoryStockSync({
      productIds: applied.productIds,
      trigger: "STOCK_COUNT",
      reference: applied.countNumber,
    });

    return {
      transactionNumber: applied.transactionNumber,
      countNumber: applied.countNumber,
    };
  }
}

export const inventoryService = new InventoryService(new InventoryRepository());
