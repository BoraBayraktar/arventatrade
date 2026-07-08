import { prisma } from "@/lib/prisma";

type SyncInventoryStateArgs = {
  productId: string;
  sku: string;
  warehouseCode?: string;
  targetOnHandStock?: number;
  note?: string;
};

export class InventoryRepository {
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
            inventoryLevels: {
              where: {
                warehouse: {
                  isActive: true,
                },
              },
              select: {
                onHand: true,
                reserved: true,
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

      if (args.targetOnHandStock !== undefined && args.targetOnHandStock !== onHandStock) {
        const delta = args.targetOnHandStock - onHandStock;
        onHandStock = args.targetOnHandStock;

        await tx.inventoryLevel.update({
          where: {
            inventoryItemId_warehouseId: {
              inventoryItemId,
              warehouseId: warehouse.id,
            },
          },
          data: {
            onHand: onHandStock,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId,
            warehouseId: warehouse.id,
            type: "MANUAL_ADJUSTMENT",
            quantity: delta,
            note: args.note ?? "Catalog admin stock synchronization",
          },
        });
      }

      const availableStock = Math.max(0, onHandStock - reservedStock);

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
}
