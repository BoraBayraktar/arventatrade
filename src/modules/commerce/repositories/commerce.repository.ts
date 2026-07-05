import { prisma } from "@/lib/prisma";
import type { AdminOrderListQuery, CommerceLineQuote } from "@/modules/commerce/contracts/commerce.contract";

type CheckoutLine = {
  productId: string;
  quantity: number;
};

export class CommerceRepository {
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

  async createOrderAndDecrementStock(args: {
    orderNumber: string;
    lines: CommerceLineQuote[];
    subtotal: number;
    discountTotal: number;
    total: number;
    promotionCode: string | null;
    currency: string;
  }) {
    return prisma.$transaction(async (tx) => {
      for (const line of args.lines) {
        const result = await tx.product.updateMany({
          where: {
            id: line.productId,
            deleted: false,
            stock: {
              gte: line.quantity,
            },
          },
          data: {
            stock: {
              decrement: line.quantity,
            },
          },
        });

        if (result.count !== 1) {
          throw new Error(`INSUFFICIENT_STOCK:${line.productId}`);
        }
      }

      return tx.order.create({
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
          orderNumber: true,
        },
      });
    });
  }

  async decrementStock(lines: CheckoutLine[]) {
    await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const result = await tx.product.updateMany({
          where: {
            id: line.productId,
            deleted: false,
            stock: {
              gte: line.quantity,
            },
          },
          data: {
            stock: {
              decrement: line.quantity,
            },
          },
        });

        if (result.count !== 1) {
          throw new Error(`INSUFFICIENT_STOCK:${line.productId}`);
        }
      }
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
      },
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
