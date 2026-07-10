import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  AdminCreateStockCountInput,
  AdminCreateWarehouseInput,
  AdminUpdateStockCountLineInput,
  AdminUpdateWarehouseInput,
} from "@/modules/inventory/contracts/inventory.contract";

type SyncInventoryStateArgs = {
  productId: string;
  sku: string;
  warehouseCode?: string;
  targetOnHandStock?: number;
  reorderPoint?: number;
  safetyStock?: number;
  note?: string;
};

type TransferInventoryArgs = {
  productId: string;
  sku: string;
  fromWarehouseCode: string;
  toWarehouseCode: string;
  quantity: number;
  note?: string;
};

type RecordInventoryMovementArgs = {
  productId: string;
  sku: string;
  warehouseCode: string;
  quantity: number;
  type: "PURCHASE_RECEIPT" | "DAMAGE_WRITE_OFF";
  note?: string;
};

export class InventoryRepository {
  private toAvailableStock(onHand: number, reserved: number) {
    return Math.max(0, onHand - reserved);
  }

  private async createInventoryTransaction(
    tx: Prisma.TransactionClient,
    args: {
      type: "MANUAL_ADJUSTMENT" | "STOCK_IN" | "STOCK_OUT" | "TRANSFER" | "STOCK_COUNT";
      reference?: string | null;
      note?: string | null;
    },
  ) {
    const transactionNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    return tx.inventoryTransaction.create({
      data: {
        transactionNumber,
        type: args.type,
        reference: args.reference ?? null,
        note: args.note ?? null,
      },
      select: {
        id: true,
        transactionNumber: true,
      },
    });
  }

  private async recalculateProductStock(tx: Prisma.TransactionClient, productId: string, inventoryItemId: string) {
    const activeLevels = await tx.inventoryLevel.findMany({
      where: {
        inventoryItemId,
        warehouse: {
          isActive: true,
        },
      },
      select: {
        onHand: true,
        reserved: true,
      },
    });

    const availableStock = activeLevels.reduce((sum, level) => sum + this.toAvailableStock(level.onHand, level.reserved), 0);

    await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: availableStock,
      },
    });
  }

  async listInventoryOverview(args: { search?: string; warehouseCode?: string }) {
    return prisma.product.findMany({
      where: {
        deleted: false,
        ...(args.search
          ? {
              OR: [
                { name: { contains: args.search, mode: "insensitive" as const } },
                { slug: { contains: args.search, mode: "insensitive" as const } },
                { sku: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        sku: true,
        name: true,
        imageUrl: true,
        currency: true,
        stock: true,
        inventoryItem: {
          select: {
            id: true,
            inventoryLevels: {
              where: {
                warehouse: {
                  isActive: true,
                  ...(args.warehouseCode
                    ? {
                        code: args.warehouseCode,
                      }
                    : {}),
                },
              },
              select: {
                onHand: true,
                reserved: true,
                reorderPoint: true,
                safetyStock: true,
                warehouse: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    isDefault: true,
                  },
                },
              },
            },
            inventoryMovements: {
              orderBy: {
                createdAt: "desc",
              },
              take: 40,
              select: {
                warehouseId: true,
                createdAt: true,
                type: true,
                quantity: true,
                note: true,
                metadata: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async listActiveProductInventoryByIds(productIds: string[]) {
    return prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        deleted: false,
      },
      select: {
        id: true,
        slug: true,
        sku: true,
        name: true,
        imageUrl: true,
        currency: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        inventoryItem: {
          select: {
            id: true,
            inventoryLevels: {
              where: {
                warehouse: {
                  isActive: true,
                },
              },
              select: {
                onHand: true,
                reserved: true,
                reorderPoint: true,
                safetyStock: true,
                warehouse: {
                  select: {
                    code: true,
                    isDefault: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async listInventoryTransactions(args: {
    search?: string;
    type?: "all" | "MANUAL_ADJUSTMENT" | "STOCK_IN" | "STOCK_OUT" | "TRANSFER" | "STOCK_COUNT";
    warehouseCode?: string;
    sku?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }) {
    return prisma.inventoryTransaction.findMany({
      where: {
        ...(args.type && args.type !== "all" ? { type: args.type } : {}),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate ? { gte: args.startDate } : {}),
                ...(args.endDate ? { lte: args.endDate } : {}),
              },
            }
          : {}),
        ...((args.warehouseCode || args.sku)
          ? {
              lines: {
                some: {
                  ...(args.warehouseCode
                    ? {
                        OR: [
                          { fromWarehouse: { code: args.warehouseCode } },
                          { toWarehouse: { code: args.warehouseCode } },
                        ],
                      }
                    : {}),
                  ...(args.sku
                    ? {
                        inventoryItem: {
                          skuSnapshot: {
                            contains: args.sku,
                            mode: "insensitive" as const,
                          },
                        },
                      }
                    : {}),
                },
              },
            }
          : {}),
        ...(args.search
          ? {
              OR: [
                { transactionNumber: { contains: args.search, mode: "insensitive" as const } },
                { reference: { contains: args.search, mode: "insensitive" as const } },
                { note: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: ((args.page ?? 1) - 1) * (args.pageSize ?? 10),
      take: args.pageSize ?? 10,
      include: {
        lines: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            inventoryItem: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            fromWarehouse: {
              select: {
                code: true,
              },
            },
            toWarehouse: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async countInventoryTransactions(args?: {
    search?: string;
    type?: "all" | "MANUAL_ADJUSTMENT" | "STOCK_IN" | "STOCK_OUT" | "TRANSFER" | "STOCK_COUNT";
    warehouseCode?: string;
    sku?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.inventoryTransaction.count({
      where: {
        ...(args?.type && args.type !== "all" ? { type: args.type } : {}),
        ...(args?.startDate || args?.endDate
          ? {
              createdAt: {
                ...(args?.startDate ? { gte: args.startDate } : {}),
                ...(args?.endDate ? { lte: args.endDate } : {}),
              },
            }
          : {}),
        ...((args?.warehouseCode || args?.sku)
          ? {
              lines: {
                some: {
                  ...(args?.warehouseCode
                    ? {
                        OR: [
                          { fromWarehouse: { code: args.warehouseCode } },
                          { toWarehouse: { code: args.warehouseCode } },
                        ],
                      }
                    : {}),
                  ...(args?.sku
                    ? {
                        inventoryItem: {
                          skuSnapshot: {
                            contains: args.sku,
                            mode: "insensitive" as const,
                          },
                        },
                      }
                    : {}),
                },
              },
            }
          : {}),
        ...(args?.search
          ? {
              OR: [
                { transactionNumber: { contains: args.search, mode: "insensitive" as const } },
                { reference: { contains: args.search, mode: "insensitive" as const } },
                { note: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    });
  }

  async listWarehouses() {
    return prisma.warehouse.findMany({
      orderBy: [
        { isDefault: "desc" },
        { priority: "asc" },
        { code: "asc" },
      ],
      include: {
        _count: {
          select: {
            inventoryLevels: true,
          },
        },
      },
    });
  }

  async createWarehouse(input: AdminCreateWarehouseInput) {
    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.warehouse.updateMany({
          where: {
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.warehouse.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description ?? null,
          address: input.address ?? null,
          contactName: input.contactName ?? null,
          contactPhone: input.contactPhone ?? null,
          priority: input.priority ?? 100,
          isActive: input.isActive ?? true,
          isDefault: input.isDefault ?? false,
        },
        include: {
          _count: {
            select: {
              inventoryLevels: true,
            },
          },
        },
      });
    });
  }

  async updateWarehouse(input: AdminUpdateWarehouseInput) {
    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.warehouse.updateMany({
          where: {
            isDefault: true,
            NOT: {
              id: input.id,
            },
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.warehouse.update({
        where: {
          id: input.id,
        },
        data: {
          ...(input.code !== undefined ? { code: input.code } : {}),
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.address !== undefined ? { address: input.address } : {}),
          ...(input.contactName !== undefined ? { contactName: input.contactName } : {}),
          ...(input.contactPhone !== undefined ? { contactPhone: input.contactPhone } : {}),
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
        include: {
          _count: {
            select: {
              inventoryLevels: true,
            },
          },
        },
      });
    });
  }

  async syncProductInventoryState(args: SyncInventoryStateArgs) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: args.productId,
          deleted: false,
        },
        select: {
          id: true,
          sku: true,
          stock: true,
          inventoryItem: {
            select: {
              id: true,
              skuSnapshot: true,
              inventoryLevels: {
                where: {
                  warehouse: {
                    isActive: true,
                  },
                },
                select: {
                  id: true,
                  onHand: true,
                  reserved: true,
                  reorderPoint: true,
                  safetyStock: true,
                  warehouseId: true,
                  warehouse: {
                    select: {
                      id: true,
                      isDefault: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND:${args.productId}`);
      }

      let warehouse = args.warehouseCode
        ? await tx.warehouse.findFirst({
            where: {
              code: args.warehouseCode,
              isActive: true,
            },
            select: {
              id: true,
            },
          })
        : await tx.warehouse.findFirst({
            where: {
              isActive: true,
              isDefault: true,
            },
            select: {
              id: true,
            },
          });

      if (!warehouse && args.warehouseCode) {
        throw new Error(`WAREHOUSE_NOT_FOUND:${args.warehouseCode}`);
      }

      if (!warehouse) {
        warehouse = await tx.warehouse.upsert({
          where: {
            code: "MAIN",
          },
          update: {
            isActive: true,
            isDefault: true,
          },
          create: {
            code: "MAIN",
            name: "Main Warehouse",
            isActive: true,
            isDefault: true,
          },
          select: {
            id: true,
          },
        });
      }

      let inventoryItemId = product.inventoryItem?.id;
      if (!inventoryItemId) {
        const inventoryItem = await tx.inventoryItem.create({
          data: {
            productId: product.id,
            skuSnapshot: args.sku,
          },
          select: {
            id: true,
          },
        });
        inventoryItemId = inventoryItem.id;
      } else if (product.inventoryItem?.skuSnapshot !== args.sku) {
        await tx.inventoryItem.update({
          where: {
            id: inventoryItemId,
          },
          data: {
            skuSnapshot: args.sku,
          },
        });
      }

      const existingLevel = product.inventoryItem?.inventoryLevels.find((level) => level.warehouse.id === warehouse.id);
      let onHandStock = existingLevel?.onHand ?? product.stock;
      const reservedStock = existingLevel?.reserved ?? 0;

      if (!existingLevel) {
        await tx.inventoryLevel.create({
          data: {
            inventoryItemId,
            warehouseId: warehouse.id,
            onHand: onHandStock,
            reserved: reservedStock,
            reorderPoint: args.reorderPoint ?? 0,
            safetyStock: args.safetyStock ?? 0,
          },
        });

        if (onHandStock > 0) {
          await tx.inventoryMovement.create({
            data: {
              inventoryItemId,
              warehouseId: warehouse.id,
              type: "INITIAL_LOAD",
              quantity: onHandStock,
              note: "Inventory foundation lazy initialization from Product.stock",
            },
          });
        }
      }

      const shouldUpdateLevel = (
        (args.targetOnHandStock !== undefined && args.targetOnHandStock !== onHandStock)
        || (args.reorderPoint !== undefined && args.reorderPoint !== (existingLevel?.reorderPoint ?? 0))
        || (args.safetyStock !== undefined && args.safetyStock !== (existingLevel?.safetyStock ?? 0))
      );

      if (shouldUpdateLevel) {
        const delta = args.targetOnHandStock !== undefined
          ? args.targetOnHandStock - onHandStock
          : 0;
        if (args.targetOnHandStock !== undefined) {
          onHandStock = args.targetOnHandStock;
        }

        await tx.inventoryLevel.update({
          where: {
            inventoryItemId_warehouseId: {
              inventoryItemId,
              warehouseId: warehouse.id,
            },
          },
          data: {
            onHand: onHandStock,
            ...(args.reorderPoint !== undefined ? { reorderPoint: args.reorderPoint } : {}),
            ...(args.safetyStock !== undefined ? { safetyStock: args.safetyStock } : {}),
          },
        });

        if (args.targetOnHandStock !== undefined && delta !== 0) {
          const inventoryTransaction = await this.createInventoryTransaction(tx, {
            type: "MANUAL_ADJUSTMENT",
            note: args.note ?? "Catalog admin stock synchronization",
          });

          await tx.inventoryTransactionLine.create({
            data: {
              transactionId: inventoryTransaction.id,
              inventoryItemId,
              toWarehouseId: warehouse.id,
              quantity: Math.abs(delta),
              note: args.note ?? "Catalog admin stock synchronization",
            },
          });

          await tx.inventoryMovement.create({
            data: {
              inventoryItemId,
              warehouseId: warehouse.id,
              transactionId: inventoryTransaction.id,
              type: "MANUAL_ADJUSTMENT",
              quantity: delta,
              note: args.note ?? "Catalog admin stock synchronization",
              metadata: {
                transactionNumber: inventoryTransaction.transactionNumber,
              },
            },
          });
        }
      }

      const activeLevels = product.inventoryItem?.inventoryLevels ?? [];
      const availableStock = activeLevels.length > 0
        ? activeLevels.reduce((sum, level) => sum + this.toAvailableStock(
          level.warehouse.id === warehouse.id ? onHandStock : level.onHand,
          level.reserved,
        ), 0)
        : this.toAvailableStock(onHandStock, reservedStock);

      await tx.product.update({
        where: {
          id: product.id,
        },
        data: {
          stock: availableStock,
        },
      });
    });
  }

  async transferProductInventory(args: TransferInventoryArgs) {
    return prisma.$transaction(async (tx) => {
      if (args.fromWarehouseCode === args.toWarehouseCode) {
        throw new Error("WAREHOUSE_TRANSFER_SAME_SOURCE_TARGET");
      }

      const product = await tx.product.findFirst({
        where: {
          id: args.productId,
          deleted: false,
        },
        select: {
          id: true,
          sku: true,
          inventoryItem: {
            select: {
              id: true,
              skuSnapshot: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND:${args.productId}`);
      }

      const [fromWarehouse, toWarehouse] = await Promise.all([
        tx.warehouse.findFirst({
          where: {
            code: args.fromWarehouseCode,
            isActive: true,
          },
          select: {
            id: true,
            code: true,
          },
        }),
        tx.warehouse.findFirst({
          where: {
            code: args.toWarehouseCode,
            isActive: true,
          },
          select: {
            id: true,
            code: true,
          },
        }),
      ]);

      if (!fromWarehouse) {
        throw new Error(`WAREHOUSE_NOT_FOUND:${args.fromWarehouseCode}`);
      }

      if (!toWarehouse) {
        throw new Error(`WAREHOUSE_NOT_FOUND:${args.toWarehouseCode}`);
      }

      let inventoryItemId = product.inventoryItem?.id;
      if (!inventoryItemId) {
        const inventoryItem = await tx.inventoryItem.create({
          data: {
            productId: product.id,
            skuSnapshot: args.sku,
          },
          select: {
            id: true,
          },
        });
        inventoryItemId = inventoryItem.id;
      } else if (product.inventoryItem?.skuSnapshot !== args.sku) {
        await tx.inventoryItem.update({
          where: {
            id: inventoryItemId,
          },
          data: {
            skuSnapshot: args.sku,
          },
        });
      }

      const levels = await tx.inventoryLevel.findMany({
        where: {
          inventoryItemId,
          warehouseId: {
            in: [fromWarehouse.id, toWarehouse.id],
          },
        },
        select: {
          id: true,
          warehouseId: true,
          onHand: true,
          reserved: true,
          reorderPoint: true,
          safetyStock: true,
        },
      });

      const fromLevel = levels.find((level) => level.warehouseId === fromWarehouse.id);
      if (!fromLevel) {
        throw new Error(`WAREHOUSE_LEVEL_NOT_FOUND:${args.fromWarehouseCode}`);
      }

      const transferableStock = this.toAvailableStock(fromLevel.onHand, fromLevel.reserved);
      if (transferableStock < args.quantity) {
        throw new Error(`INSUFFICIENT_TRANSFER_STOCK:${transferableStock}`);
      }

      const toLevel = levels.find((level) => level.warehouseId === toWarehouse.id);

      await tx.inventoryLevel.update({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId,
            warehouseId: fromWarehouse.id,
          },
        },
        data: {
          onHand: fromLevel.onHand - args.quantity,
        },
      });

      if (toLevel) {
        await tx.inventoryLevel.update({
          where: {
            inventoryItemId_warehouseId: {
              inventoryItemId,
              warehouseId: toWarehouse.id,
            },
          },
          data: {
            onHand: toLevel.onHand + args.quantity,
          },
        });
      } else {
        await tx.inventoryLevel.create({
          data: {
            inventoryItemId,
            warehouseId: toWarehouse.id,
            onHand: args.quantity,
            reserved: 0,
            reorderPoint: 0,
            safetyStock: 0,
          },
        });
      }

      const transferReference = `TRANSFER:${product.id}:${fromWarehouse.code}:${toWarehouse.code}:${Date.now()}`;
      const inventoryTransaction = await this.createInventoryTransaction(tx, {
        type: "TRANSFER",
        reference: transferReference,
        note: args.note ?? `Transfer ${fromWarehouse.code} -> ${toWarehouse.code}`,
      });

      await tx.inventoryTransactionLine.create({
        data: {
          transactionId: inventoryTransaction.id,
          inventoryItemId,
          fromWarehouseId: fromWarehouse.id,
          toWarehouseId: toWarehouse.id,
          quantity: args.quantity,
          note: args.note ?? `Transfer ${fromWarehouse.code} -> ${toWarehouse.code}`,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId,
          warehouseId: fromWarehouse.id,
          transactionId: inventoryTransaction.id,
          type: "TRANSFER_OUT",
          quantity: -args.quantity,
          note: args.note ?? `Transfer to ${toWarehouse.code}`,
          metadata: {
            transferReference,
            transactionNumber: inventoryTransaction.transactionNumber,
            fromWarehouseCode: fromWarehouse.code,
            toWarehouseCode: toWarehouse.code,
          },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId,
          warehouseId: toWarehouse.id,
          transactionId: inventoryTransaction.id,
          type: "TRANSFER_IN",
          quantity: args.quantity,
          note: args.note ?? `Transfer from ${fromWarehouse.code}`,
          metadata: {
            transferReference,
            transactionNumber: inventoryTransaction.transactionNumber,
            fromWarehouseCode: fromWarehouse.code,
            toWarehouseCode: toWarehouse.code,
          },
        },
      });

      await this.recalculateProductStock(tx, product.id, inventoryItemId);
    });
  }

  async recordProductInventoryMovement(args: RecordInventoryMovementArgs) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: args.productId,
          deleted: false,
        },
        select: {
          id: true,
          inventoryItem: {
            select: {
              id: true,
              skuSnapshot: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND:${args.productId}`);
      }

      const warehouse = await tx.warehouse.findFirst({
        where: {
          code: args.warehouseCode,
          isActive: true,
        },
        select: {
          id: true,
          code: true,
        },
      });

      if (!warehouse) {
        throw new Error(`WAREHOUSE_NOT_FOUND:${args.warehouseCode}`);
      }

      let inventoryItemId = product.inventoryItem?.id;
      if (!inventoryItemId) {
        const inventoryItem = await tx.inventoryItem.create({
          data: {
            productId: product.id,
            skuSnapshot: args.sku,
          },
          select: {
            id: true,
          },
        });
        inventoryItemId = inventoryItem.id;
      } else if (product.inventoryItem?.skuSnapshot !== args.sku) {
        await tx.inventoryItem.update({
          where: {
            id: inventoryItemId,
          },
          data: {
            skuSnapshot: args.sku,
          },
        });
      }

      const existingLevel = await tx.inventoryLevel.findUnique({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId,
            warehouseId: warehouse.id,
          },
        },
        select: {
          onHand: true,
          reserved: true,
        },
      });

      if (args.type === "DAMAGE_WRITE_OFF") {
        const availableStock = this.toAvailableStock(existingLevel?.onHand ?? 0, existingLevel?.reserved ?? 0);
        if (availableStock < args.quantity) {
          throw new Error(`INSUFFICIENT_MOVEMENT_STOCK:${availableStock}`);
        }
      }

      if (existingLevel) {
        await tx.inventoryLevel.update({
          where: {
            inventoryItemId_warehouseId: {
              inventoryItemId,
              warehouseId: warehouse.id,
            },
          },
          data: {
            onHand: existingLevel.onHand + (args.type === "PURCHASE_RECEIPT" ? args.quantity : -args.quantity),
          },
        });
      } else {
        if (args.type !== "PURCHASE_RECEIPT") {
          throw new Error(`WAREHOUSE_LEVEL_NOT_FOUND:${args.warehouseCode}`);
        }

        await tx.inventoryLevel.create({
          data: {
            inventoryItemId,
            warehouseId: warehouse.id,
            onHand: args.quantity,
            reserved: 0,
            reorderPoint: 0,
            safetyStock: 0,
          },
        });
      }

      const inventoryTransaction = await this.createInventoryTransaction(tx, {
        type: args.type === "PURCHASE_RECEIPT" ? "STOCK_IN" : "STOCK_OUT",
        note: args.note ?? (args.type === "PURCHASE_RECEIPT" ? "Manual stock entry" : "Manual stock issue"),
      });

      await tx.inventoryTransactionLine.create({
        data: {
          transactionId: inventoryTransaction.id,
          inventoryItemId,
          toWarehouseId: args.type === "PURCHASE_RECEIPT" ? warehouse.id : null,
          fromWarehouseId: args.type === "DAMAGE_WRITE_OFF" ? warehouse.id : null,
          quantity: args.quantity,
          note: args.note ?? (args.type === "PURCHASE_RECEIPT" ? "Manual stock entry" : "Manual stock issue"),
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId,
          warehouseId: warehouse.id,
          transactionId: inventoryTransaction.id,
          type: args.type,
          quantity: args.type === "PURCHASE_RECEIPT" ? args.quantity : -args.quantity,
          note: args.note ?? (args.type === "PURCHASE_RECEIPT" ? "Manual stock entry" : "Manual stock issue"),
          metadata: {
            transactionNumber: inventoryTransaction.transactionNumber,
          },
        },
      });

      await this.recalculateProductStock(tx, product.id, inventoryItemId);
    });
  }

  async listInventoryAlerts() {
    return prisma.inventoryAlert.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: [
        { type: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        warehouse: {
          select: {
            code: true,
            name: true,
          },
        },
        inventoryItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            inventoryLevels: {
              select: {
                warehouseId: true,
                onHand: true,
                reserved: true,
                reorderPoint: true,
                safetyStock: true,
              },
            },
          },
        },
      },
    });
  }

  async listStockCounts() {
    return prisma.stockCount.findMany({
      orderBy: [
        { countedAt: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        warehouse: {
          select: {
            code: true,
            name: true,
          },
        },
        lines: {
          orderBy: [
            { warehouse: { code: "asc" } },
            { inventoryItem: { skuSnapshot: "asc" } },
          ],
          include: {
            warehouse: {
              select: {
                code: true,
                name: true,
              },
            },
            inventoryItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async createStockCount(input: AdminCreateStockCountInput) {
    return prisma.$transaction(async (tx) => {
      const warehouse = input.warehouseCode
        ? await tx.warehouse.findFirst({
            where: {
              code: input.warehouseCode,
              isActive: true,
            },
            select: {
              id: true,
              code: true,
              name: true,
            },
          })
        : null;

      if (input.warehouseCode && !warehouse) {
        throw new Error(`WAREHOUSE_NOT_FOUND:${input.warehouseCode}`);
      }

      const levels = await tx.inventoryLevel.findMany({
        where: {
          warehouse: {
            isActive: true,
            ...(warehouse ? { id: warehouse.id } : {}),
          },
          inventoryItem: {
            product: {
              deleted: false,
              ...(input.search
                ? {
                    OR: [
                      { name: { contains: input.search, mode: "insensitive" } },
                      { sku: { contains: input.search, mode: "insensitive" } },
                      { barcode: { contains: input.search, mode: "insensitive" } },
                    ],
                  }
                : {}),
            },
          },
        },
        orderBy: [
          { warehouse: { code: "asc" } },
          { inventoryItem: { skuSnapshot: "asc" } },
        ],
        include: {
          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          inventoryItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (levels.length === 0) {
        throw new Error("STOCK_COUNT_EMPTY_SCOPE");
      }

      const countNumber = `SC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const stockCount = await tx.stockCount.create({
        data: {
          countNumber,
          warehouseId: warehouse?.id ?? null,
          countedAt: new Date(input.countedAt),
          note: input.note ?? null,
        },
        select: {
          id: true,
        },
      });

      await tx.stockCountLine.createMany({
        data: levels.map((level) => ({
          stockCountId: stockCount.id,
          inventoryItemId: level.inventoryItemId,
          warehouseId: level.warehouseId,
          systemOnHand: level.onHand,
          countedOnHand: null,
          note: null,
        })),
      });

      return tx.stockCount.findUniqueOrThrow({
        where: {
          id: stockCount.id,
        },
        include: {
          warehouse: {
            select: {
              code: true,
              name: true,
            },
          },
          lines: {
            orderBy: [
              { warehouse: { code: "asc" } },
              { inventoryItem: { skuSnapshot: "asc" } },
            ],
            include: {
              warehouse: {
                select: {
                  code: true,
                  name: true,
                },
              },
              inventoryItem: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  }

  async updateStockCountLine(input: AdminUpdateStockCountLineInput) {
    return prisma.$transaction(async (tx) => {
      const line = await tx.stockCountLine.findFirst({
        where: {
          id: input.lineId,
          stockCountId: input.stockCountId,
        },
        include: {
          stockCount: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!line) {
        throw new Error(`STOCK_COUNT_LINE_NOT_FOUND:${input.lineId}`);
      }

      if (line.stockCount.status === "APPLIED") {
        throw new Error("STOCK_COUNT_ALREADY_APPLIED");
      }

      await tx.stockCountLine.update({
        where: {
          id: input.lineId,
        },
        data: {
          countedOnHand: input.countedOnHand,
          note: input.note ?? null,
        },
      });

      await tx.stockCount.update({
        where: {
          id: input.stockCountId,
        },
        data: {
          status: "COUNTED",
        },
      });
    });
  }

  async applyStockCount(stockCountId: string) {
    return prisma.$transaction(async (tx) => {
      const stockCount = await tx.stockCount.findUnique({
        where: {
          id: stockCountId,
        },
        include: {
          lines: {
            include: {
              inventoryItem: {
                include: {
                  product: {
                    select: {
                      id: true,
                      sku: true,
                      name: true,
                    },
                  },
                },
              },
              warehouse: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!stockCount) {
        throw new Error(`STOCK_COUNT_NOT_FOUND:${stockCountId}`);
      }

      if (stockCount.status === "APPLIED") {
        throw new Error("STOCK_COUNT_ALREADY_APPLIED");
      }

      const linesToApply = stockCount.lines.filter((line) => line.countedOnHand !== null);
      if (linesToApply.length === 0) {
        throw new Error("STOCK_COUNT_NOT_READY");
      }

      const transaction = await this.createInventoryTransaction(tx, {
        type: "STOCK_COUNT",
        reference: stockCount.countNumber,
        note: stockCount.note ?? `Stock count ${stockCount.countNumber}`,
      });

      const touchedInventoryItemIds = new Set<string>();

      for (const line of linesToApply) {
        const countedOnHand = line.countedOnHand ?? line.systemOnHand;
        const delta = countedOnHand - line.systemOnHand;
        touchedInventoryItemIds.add(line.inventoryItemId);

        await tx.inventoryLevel.update({
          where: {
            inventoryItemId_warehouseId: {
              inventoryItemId: line.inventoryItemId,
              warehouseId: line.warehouseId,
            },
          },
          data: {
            onHand: countedOnHand,
          },
        });

        if (delta !== 0) {
          await tx.inventoryTransactionLine.create({
            data: {
              transactionId: transaction.id,
              inventoryItemId: line.inventoryItemId,
              toWarehouseId: line.warehouseId,
              quantity: Math.abs(delta),
              note: line.note ?? `Stock count variance for ${stockCount.countNumber}`,
            },
          });

          await tx.inventoryMovement.create({
            data: {
              inventoryItemId: line.inventoryItemId,
              warehouseId: line.warehouseId,
              transactionId: transaction.id,
              type: "COUNT_ADJUSTMENT",
              quantity: delta,
              note: line.note ?? `Stock count variance for ${stockCount.countNumber}`,
              metadata: {
                transactionNumber: transaction.transactionNumber,
                stockCountNumber: stockCount.countNumber,
                systemOnHand: line.systemOnHand,
                countedOnHand,
              },
            },
          });
        }
      }

      for (const inventoryItemId of touchedInventoryItemIds) {
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: {
            id: inventoryItemId,
          },
          select: {
            id: true,
            productId: true,
          },
        });

        if (inventoryItem) {
          await this.recalculateProductStock(tx, inventoryItem.productId, inventoryItem.id);
        }
      }

      await tx.stockCount.update({
        where: {
          id: stockCount.id,
        },
        data: {
          status: "APPLIED",
        },
      });

      return {
        transactionNumber: transaction.transactionNumber,
        countNumber: stockCount.countNumber,
        productIds: Array.from(new Set(linesToApply.map((line) => line.inventoryItem.product.id))),
        touchedTargets: linesToApply.map((line) => ({
          inventoryItemId: line.inventoryItemId,
          warehouseId: line.warehouseId,
        })),
      };
    });
  }

  async refreshInventoryAlerts(targets: Array<{ inventoryItemId: string; warehouseId: string }>) {
    if (targets.length === 0) {
      return [];
    }

    const uniqueTargets = Array.from(
      new Map(targets.map((target) => [`${target.inventoryItemId}:${target.warehouseId}`, target])).values(),
    );

    return prisma.$transaction(async (tx) => {
      const levels = await tx.inventoryLevel.findMany({
        where: {
          OR: uniqueTargets.map((target) => ({
            inventoryItemId: target.inventoryItemId,
            warehouseId: target.warehouseId,
          })),
        },
        include: {
          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          inventoryItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const activeAlerts = await tx.inventoryAlert.findMany({
        where: {
          status: "ACTIVE",
          OR: uniqueTargets.map((target) => ({
            inventoryItemId: target.inventoryItemId,
            warehouseId: target.warehouseId,
          })),
        },
      });

      const createdAlerts: Array<{
        id: string;
        type: "LOW_STOCK" | "OUT_OF_STOCK";
        message: string;
        warehouseCode: string;
        productName: string;
      }> = [];

      for (const level of levels) {
        const keyMatches = activeAlerts.filter((alert) => (
          alert.inventoryItemId === level.inventoryItemId && alert.warehouseId === level.warehouseId
        ));
        const availableStock = this.toAvailableStock(level.onHand, level.reserved);
        const threshold = Math.max(level.reorderPoint, level.safetyStock);
        const nextType = availableStock <= 0
          ? "OUT_OF_STOCK"
          : threshold > 0 && availableStock <= threshold
            ? "LOW_STOCK"
            : null;
        const message = nextType === "OUT_OF_STOCK"
          ? `${level.inventoryItem.product.name} is out of stock in ${level.warehouse.code}`
          : nextType === "LOW_STOCK"
            ? `${level.inventoryItem.product.name} is below critical stock in ${level.warehouse.code}`
            : null;

        if (!nextType || !message) {
          if (keyMatches.length > 0) {
            await tx.inventoryAlert.updateMany({
              where: {
                id: {
                  in: keyMatches.map((alert) => alert.id),
                },
              },
              data: {
                status: "RESOLVED",
              },
            });
          }
          continue;
        }

        const existingMatch = keyMatches.find((alert) => alert.type === nextType);
        const staleAlerts = keyMatches.filter((alert) => alert.type !== nextType);

        if (staleAlerts.length > 0) {
          await tx.inventoryAlert.updateMany({
            where: {
              id: {
                in: staleAlerts.map((alert) => alert.id),
              },
            },
            data: {
              status: "RESOLVED",
            },
          });
        }

        if (existingMatch) {
          await tx.inventoryAlert.update({
            where: {
              id: existingMatch.id,
            },
            data: {
              message,
            },
          });
          continue;
        }

        const created = await tx.inventoryAlert.create({
          data: {
            inventoryItemId: level.inventoryItemId,
            warehouseId: level.warehouseId,
            type: nextType,
            status: "ACTIVE",
            message,
          },
          select: {
            id: true,
            type: true,
            message: true,
          },
        });

        createdAlerts.push({
          id: created.id,
          type: created.type,
          message: created.message,
          warehouseCode: level.warehouse.code,
          productName: level.inventoryItem.product.name,
        });
      }

      return createdAlerts;
    });
  }

  async listInventoryReportLevels() {
    return prisma.inventoryLevel.findMany({
      where: {
        warehouse: {
          isActive: true,
        },
        inventoryItem: {
          product: {
            deleted: false,
          },
        },
      },
      include: {
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        inventoryItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                purchasePrice: true,
              },
            },
          },
        },
      },
      orderBy: [
        { warehouse: { code: "asc" } },
        { inventoryItem: { skuSnapshot: "asc" } },
      ],
    });
  }

  async listInventoryReportMovements(days: number) {
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days + 1);
    startDate.setUTCHours(0, 0, 0, 0);

    return prisma.inventoryMovement.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        type: true,
        quantity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}
