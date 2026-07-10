import { z } from "zod";

import type {
  AdminInventoryItem,
  AdminInventoryListQuery,
  AdminInventoryListResult,
  ProductInventoryAvailability,
  SyncProductInventoryInput,
} from "@/modules/inventory/contracts/inventory.contract";
import { InventoryRepository } from "@/modules/inventory/repositories/inventory.repository";

const availabilityQuerySchema = z.object({
  productIds: z.array(z.string().trim().min(1)).min(1).max(100),
});

const syncProductInventorySchema = z.object({
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(64),
  warehouseCode: z.string().trim().min(1).max(32).optional(),
  targetOnHandStock: z.coerce.number().int().min(0).optional(),
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

function toAvailableStock(onHandStock: number, reservedStock: number) {
  return Math.max(0, onHandStock - reservedStock);
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
          warehouseCode: null,
          warehouseName: null,
          isDefaultWarehouse: false,
          hasReservations: false,
          lastMovementType: inventoryMovements[0]?.type ?? null,
          recentMovements: inventoryMovements.slice(0, 30).map((movement) => ({
            type: movement.type,
            quantity: movement.quantity,
            note: movement.note,
            createdAt: movement.createdAt.toISOString(),
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
          .map((movement) => ({
            type: movement.type,
            quantity: movement.quantity,
            note: movement.note,
            createdAt: movement.createdAt.toISOString(),
          }));

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
  }
}

export const inventoryService = new InventoryService(new InventoryRepository());
