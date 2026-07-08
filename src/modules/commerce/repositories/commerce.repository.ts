import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AdminOrderListQuery, CommerceLineQuote } from "@/modules/commerce/contracts/commerce.contract";

type CheckoutLine = {
  productId: string;
  quantity: number;
};

export class CommerceRepository {
  private async getOrCreateDefaultWarehouse(tx: Prisma.TransactionClient) {
    const defaultWarehouse = await tx.warehouse.findFirst({
      where: {
        isActive: true,
        isDefault: true,
      },
      select: {
        id: true,
      },
    });

    if (defaultWarehouse) {
      return defaultWarehouse;
    }

    return tx.warehouse.upsert({
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

  private async ensureInventoryState(tx: Prisma.TransactionClient, productId: string) {
    const product = await tx.product.findFirst({
      where: {
        id: productId,
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
                onHand: true,
                reserved: true,
                warehouseId: true,
                warehouse: {
                  select: {
                    id: true,
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

    if (!product) {
      throw new Error(`INSUFFICIENT_STOCK:${productId}`);
    }

    const defaultWarehouse = await this.getOrCreateDefaultWarehouse(tx);

    let inventoryItemId = product.inventoryItem?.id;
    if (!inventoryItemId) {
      const createdInventoryItem = await tx.inventoryItem.create({
        data: {
          productId: product.id,
          skuSnapshot: product.sku,
        },
        select: {
          id: true,
        },
      });
      inventoryItemId = createdInventoryItem.id;
    } else if (product.inventoryItem?.skuSnapshot !== product.sku) {
      await tx.inventoryItem.update({
        where: {
          id: inventoryItemId,
        },
        data: {
          skuSnapshot: product.sku,
        },
      });
    }

    let levels = product.inventoryItem?.inventoryLevels.map((level) => ({
      warehouseId: level.warehouseId,
      onHand: level.onHand,
      reserved: level.reserved,
      isDefault: level.warehouse.isDefault,
      warehouseCode: level.warehouse.code,
    })) ?? [];

    if (levels.length === 0) {
      await tx.inventoryLevel.create({
        data: {
          inventoryItemId,
          warehouseId: defaultWarehouse.id,
          onHand: product.stock,
          reserved: 0,
        },
      });

      if (product.stock > 0) {
        await tx.inventoryMovement.create({
          data: {
            inventoryItemId,
            warehouseId: defaultWarehouse.id,
            type: "INITIAL_LOAD",
            quantity: product.stock,
            note: "Lazy inventory initialization during checkout",
          },
        });
      }

      levels = [{
        warehouseId: defaultWarehouse.id,
        onHand: product.stock,
        reserved: 0,
        isDefault: true,
        warehouseCode: "MAIN",
      }];
    }

    levels.sort((left, right) => {
      if (left.isDefault !== right.isDefault) {
        return left.isDefault ? -1 : 1;
      }

      const leftAvailable = Math.max(0, left.onHand - left.reserved);
      const rightAvailable = Math.max(0, right.onHand - right.reserved);
      return rightAvailable - leftAvailable;
    });

    return {
      productId: product.id,
      inventoryItemId,
      levels,
    };
  }

  async listActiveProductsByIds(productIds: string[]) {
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
      },
    });
  }

  async createOrderAndCommitInventory(args: {
    orderNumber: string;
    lines: CommerceLineQuote[];
    subtotal: number;
    discountTotal: number;
    total: number;
    promotionCode: string | null;
    currency: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const holds: Array<{
        productId: string;
        inventoryItemId: string;
        warehouseId: string;
        reservationId: string;
        quantity: number;
      }> = [];
      const availableAfterCommitByProduct = new Map<string, number>();

      for (const line of args.lines) {
        const state = await this.ensureInventoryState(tx, line.productId);
        const availableStock = state.levels.reduce((sum, level) => sum + Math.max(0, level.onHand - level.reserved), 0);

        if (availableStock < line.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${line.productId}`);
        }

        let remainingQuantity = line.quantity;

        for (const level of state.levels) {
          if (remainingQuantity <= 0) {
            break;
          }

          const levelAvailable = Math.max(0, level.onHand - level.reserved);
          if (levelAvailable <= 0) {
            continue;
          }

          const reservedQuantity = Math.min(levelAvailable, remainingQuantity);

          const reservation = await tx.stockReservation.create({
            data: {
              inventoryItemId: state.inventoryItemId,
              warehouseId: level.warehouseId,
              quantity: reservedQuantity,
              status: "ACTIVE",
              reference: args.orderNumber,
            },
          });

          await tx.inventoryLevel.update({
            where: {
              inventoryItemId_warehouseId: {
                inventoryItemId: state.inventoryItemId,
                warehouseId: level.warehouseId,
              },
            },
            data: {
              reserved: {
                increment: reservedQuantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              inventoryItemId: state.inventoryItemId,
              warehouseId: level.warehouseId,
              reservationId: reservation.id,
              type: "RESERVATION_HOLD",
              quantity: reservedQuantity,
              note: `Checkout reservation hold for ${args.orderNumber}`,
            },
          });

          holds.push({
            productId: state.productId,
            inventoryItemId: state.inventoryItemId,
            warehouseId: level.warehouseId,
            reservationId: reservation.id,
            quantity: reservedQuantity,
          });

          remainingQuantity -= reservedQuantity;
        }

        if (remainingQuantity > 0) {
          throw new Error(`INSUFFICIENT_STOCK:${line.productId}`);
        }

        availableAfterCommitByProduct.set(line.productId, availableStock - line.quantity);
      }

      const order = await tx.order.create({
        data: {
          orderNumber: args.orderNumber,
          status: "CONFIRMED",
          paymentStatus: "PENDING",
          subtotal: args.subtotal,
          discountTotal: args.discountTotal,
          total: args.total,
          promotionCode: args.promotionCode,
          currency: args.currency,
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: "CONFIRMED",
              source: "SYSTEM",
              note: "Checkout created order",
            },
          },
          paymentStatusHistory: {
            create: {
              fromStatus: null,
              toStatus: "PENDING",
              source: "SYSTEM",
              note: "Checkout initialized payment status",
            },
          },
          items: {
            create: args.lines.map((line) => ({
              productId: line.productId,
              productSlug: line.slug,
              productSku: line.sku,
              productName: line.name,
              productImageUrl: line.imageUrl,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              compareAtPrice: line.compareAtPrice,
              lineTotal: line.lineTotal,
              currency: line.currency,
            })),
          },
        },
        select: {
          id: true,
          orderNumber: true,
        },
      });

      for (const hold of holds) {
        await tx.inventoryLevel.update({
          where: {
            inventoryItemId_warehouseId: {
              inventoryItemId: hold.inventoryItemId,
              warehouseId: hold.warehouseId,
            },
          },
          data: {
            onHand: {
              decrement: hold.quantity,
            },
            reserved: {
              decrement: hold.quantity,
            },
          },
        });

        await tx.stockReservation.update({
          where: {
            id: hold.reservationId,
          },
          data: {
            status: "COMMITTED",
            orderId: order.id,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: hold.inventoryItemId,
            warehouseId: hold.warehouseId,
            orderId: order.id,
            reservationId: hold.reservationId,
            type: "ORDER_COMMIT",
            quantity: -hold.quantity,
            note: `Checkout inventory commit for ${args.orderNumber}`,
          },
        });

      }

      for (const [productId, availableAfterCommit] of availableAfterCommitByProduct.entries()) {
        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            stock: availableAfterCommit,
          },
        });
      }

      return {
        orderNumber: order.orderNumber,
      };
    });
  }

  async listOrders(args: Required<Pick<AdminOrderListQuery, "page" | "pageSize">> & Pick<AdminOrderListQuery, "search" | "status" | "paymentStatus">) {
    return prisma.order.findMany({
      where: {
        deleted: false,
        ...(args.search
          ? {
              orderNumber: {
                contains: args.search,
                mode: "insensitive" as const,
              },
            }
          : {}),
        ...(args.status ? { status: args.status } : {}),
        ...(args.paymentStatus ? { paymentStatus: args.paymentStatus } : {}),
      },
      include: {
        items: {
          where: {
            deleted: false,
          },
        },
        stockReservations: {
          select: {
            id: true,
            inventoryMovements: {
              where: {
                type: {
                  in: ["ORDER_CANCEL_RESTOCK", "RETURN_RESTOCK"],
                },
              },
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (args.page - 1) * args.pageSize,
      take: args.pageSize,
    });
  }

  async countOrders(args: Pick<AdminOrderListQuery, "search" | "status" | "paymentStatus">) {
    return prisma.order.count({
      where: {
        deleted: false,
        ...(args.search
          ? {
              orderNumber: {
                contains: args.search,
                mode: "insensitive" as const,
              },
            }
          : {}),
        ...(args.status ? { status: args.status } : {}),
        ...(args.paymentStatus ? { paymentStatus: args.paymentStatus } : {}),
      },
    });
  }

  async aggregateRevenue() {
    const where = {
      deleted: false,
      status: "CONFIRMED" as const,
    };

    const [aggregate, paidOrders, pendingPayments] = await Promise.all([
      prisma.order.aggregate({
        where,
        _sum: {
          total: true,
          discountTotal: true,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.order.count({
        where: {
          ...where,
          paymentStatus: "PAID",
        },
      }),
      prisma.order.count({
        where: {
          ...where,
          paymentStatus: "PENDING",
        },
      }),
    ]);

    return {
      aggregate,
      paidOrders,
      pendingPayments,
    };
  }

  async findOrderById(id: string) {
    return prisma.order.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        items: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        statusHistory: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        paymentStatusHistory: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        stockReservations: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            warehouse: {
              select: {
                code: true,
              },
            },
            inventoryMovements: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                type: true,
                quantity: true,
                note: true,
                reservationId: true,
                createdAt: true,
                warehouse: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateOrderStatus(args: {
    id: string;
    fromStatus: "CONFIRMED" | "CANCELLED";
    toStatus: "CONFIRMED" | "CANCELLED";
    changedByUserId: string;
    note?: string;
  }) {
    return prisma.order.update({
      where: {
        id: args.id,
      },
      data: {
        status: args.toStatus,
        statusHistory: {
          create: {
            fromStatus: args.fromStatus,
            toStatus: args.toStatus,
            source: "ADMIN",
            changedByUserId: args.changedByUserId,
            note: args.note ?? null,
          },
        },
      },
      include: {
        items: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        statusHistory: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        paymentStatusHistory: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        stockReservations: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            warehouse: {
              select: {
                code: true,
              },
            },
            inventoryMovements: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                type: true,
                quantity: true,
                note: true,
                reservationId: true,
                createdAt: true,
                warehouse: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateOrderPaymentStatus(args: {
    id: string;
    fromStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
    toStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
    changedByUserId: string;
    note?: string;
  }) {
    return prisma.order.update({
      where: {
        id: args.id,
      },
      data: {
        paymentStatus: args.toStatus,
        paymentStatusHistory: {
          create: {
            fromStatus: args.fromStatus,
            toStatus: args.toStatus,
            source: "ADMIN",
            changedByUserId: args.changedByUserId,
            note: args.note ?? null,
          },
        },
      },
      include: {
        items: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        statusHistory: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        paymentStatusHistory: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        stockReservations: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            warehouse: {
              select: {
                code: true,
              },
            },
            inventoryMovements: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                type: true,
                quantity: true,
                note: true,
                reservationId: true,
                createdAt: true,
                warehouse: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async restockOrderInventory(args: {
    id: string;
    movementType: "ORDER_CANCEL_RESTOCK" | "RETURN_RESTOCK";
    note: string;
  }) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: args.id,
          deleted: false,
        },
        select: {
          id: true,
          items: {
            where: {
              deleted: false,
            },
            select: {
              productId: true,
              quantity: true,
            },
          },
          stockReservations: {
            select: {
              id: true,
              inventoryItemId: true,
              warehouseId: true,
              quantity: true,
              status: true,
              inventoryMovements: {
                where: {
                  type: args.movementType,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error(`ORDER_NOT_FOUND:${args.id}`);
      }

      const reservationsToRestock = order.stockReservations.filter((reservation) => reservation.status === "COMMITTED" && reservation.inventoryMovements.length === 0);

      for (const reservation of reservationsToRestock) {
        await tx.inventoryLevel.update({
          where: {
            inventoryItemId_warehouseId: {
              inventoryItemId: reservation.inventoryItemId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: {
            onHand: {
              increment: reservation.quantity,
            },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: reservation.inventoryItemId,
            warehouseId: reservation.warehouseId,
            orderId: order.id,
            reservationId: reservation.id,
            type: args.movementType,
            quantity: reservation.quantity,
            note: args.note,
          },
        });

        await tx.stockReservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: args.movementType === "ORDER_CANCEL_RESTOCK" ? "CANCELLED" : "RELEASED",
          },
        });
      }

      const restockedProductIds = new Set(order.items.map((item) => item.productId).filter((productId): productId is string => productId != null));

      for (const productId of restockedProductIds) {
        const product = await tx.product.findFirst({
          where: {
            id: productId,
            deleted: false,
          },
          select: {
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
                  },
                },
              },
            },
          },
        });

        if (!product) {
          continue;
        }

        const inventoryLevels = product.inventoryItem?.inventoryLevels ?? [];
        const availableStock = inventoryLevels.length > 0
          ? inventoryLevels.reduce((sum, level) => sum + Math.max(0, level.onHand - level.reserved), 0)
          : product.stock;

        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            stock: availableStock,
          },
        });
      }
    });
  }

  async softDeleteOrder(id: string, deletedUserId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.orderItem.updateMany({
        where: {
          orderId: id,
          deleted: false,
        },
        data: {
          deleted: true,
          deletedDate: new Date(),
          deletedUserId,
        },
      });

      return tx.order.update({
        where: {
          id,
        },
        data: {
          deleted: true,
          deletedDate: new Date(),
          deletedUserId,
        },
      });
    });
  }
}
