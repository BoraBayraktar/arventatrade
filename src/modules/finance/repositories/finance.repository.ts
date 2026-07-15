import { prisma } from "@/lib/prisma";
import type { AdminReceivableStatus } from "@/modules/finance/contracts/receivables.contract";

type ListOperationalReceivablesArgs = {
  search?: string;
  paymentStatuses: AdminReceivableStatus[];
  page: number;
  pageSize: number;
};

export class FinanceRepository {
  async listOperationalReceivables(args: ListOperationalReceivablesArgs) {
    return (prisma.order as any).findMany({
      where: {
        deleted: false,
        status: "CONFIRMED",
        paymentStatus: {
          in: args.paymentStatuses,
        },
        ...(args.search
          ? {
              orderNumber: {
                contains: args.search,
                mode: "insensitive" as const,
              },
            }
          : {}),
      },
      include: {
        customerAccount: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          where: {
            deleted: false,
          },
          select: {
            quantity: true,
          },
        },
        businessDocuments: {
          where: {
            deleted: false,
          },
          orderBy: {
            issueDate: "desc",
          },
          select: {
            id: true,
            documentNumber: true,
            issueDate: true,
            totalAmount: true,
            currency: true,
            counterpartyName: true,
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

  async countOperationalReceivables(args: Pick<ListOperationalReceivablesArgs, "search" | "paymentStatuses">) {
    return prisma.order.count({
      where: {
        deleted: false,
        status: "CONFIRMED",
        paymentStatus: {
          in: args.paymentStatuses,
        },
        ...(args.search
          ? {
              orderNumber: {
                contains: args.search,
                mode: "insensitive" as const,
              },
            }
          : {}),
      },
    });
  }

  async summarizeOperationalReceivables() {
    const baseWhere = {
      deleted: false,
      status: "CONFIRMED" as const,
    };

    const [aggregate, pendingCount, authorizedCount, failedCount] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...baseWhere,
          paymentStatus: {
            in: ["PENDING", "AUTHORIZED", "FAILED"],
          },
        },
        _sum: {
          total: true,
        },
      }),
      prisma.order.count({
        where: {
          ...baseWhere,
          paymentStatus: "PENDING",
        },
      }),
      prisma.order.count({
        where: {
          ...baseWhere,
          paymentStatus: "AUTHORIZED",
        },
      }),
      prisma.order.count({
        where: {
          ...baseWhere,
          paymentStatus: "FAILED",
        },
      }),
    ]);

    return {
      totalOpenAmount: aggregate._sum.total?.toNumber() ?? 0,
      pendingCount,
      authorizedCount,
      failedCount,
      currency: "TRY",
    };
  }

  async listCollectionRecords(orderIds?: string[]) {
    return prisma.collectionRecord.findMany({
      where: {
        deleted: false,
        ...(orderIds && orderIds.length > 0 ? { orderId: { in: orderIds } } : {}),
      },
      orderBy: [
        { collectedAt: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async createCollectionRecord(args: {
    orderId: string;
    amount: number;
    currency: string;
    collectedAt: Date;
    note?: string | null;
    recordedByUserId: string;
  }) {
    return prisma.collectionRecord.create({
      data: {
        orderId: args.orderId,
        amount: args.amount,
        currency: args.currency,
        collectedAt: args.collectedAt,
        note: args.note ?? null,
        recordedByUserId: args.recordedByUserId,
      },
    });
  }

  async findCollectionRecordById(id: string) {
    return prisma.collectionRecord.findFirst({
      where: {
        id,
        deleted: false,
      },
    });
  }

  async listPaymentRecords(supplierIds?: string[]) {
    return prisma.paymentRecord.findMany({
      where: {
        deleted: false,
        ...(supplierIds && supplierIds.length > 0 ? { supplierId: { in: supplierIds } } : {}),
      },
      orderBy: [
        { paidAt: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async createPaymentRecord(args: {
    supplierId: string;
    amount: number;
    currency: string;
    paidAt: Date;
    note?: string | null;
    recordedByUserId: string;
  }) {
    return prisma.paymentRecord.create({
      data: {
        supplierId: args.supplierId,
        amount: args.amount,
        currency: args.currency,
        paidAt: args.paidAt,
        note: args.note ?? null,
        recordedByUserId: args.recordedByUserId,
      },
    });
  }

  async findSupplierById(id: string) {
    return prisma.supplier.findFirst({
      where: {
        id,
        deleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findSupplierByName(name: string) {
    return prisma.supplier.findFirst({
      where: {
        name,
        deleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async listSuppliers() {
    return prisma.supplier.findMany({
      where: {
        deleted: false,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

}

export const financeRepository = new FinanceRepository();
