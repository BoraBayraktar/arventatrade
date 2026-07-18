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
        customerAccountId: {
          not: null,
        },
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
        customerAccountId: {
          not: null,
        },
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
      customerAccountId: {
        not: null,
      },
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
    financialAccountId?: string | null;
    amount: number;
    currency: string;
    collectedAt: Date;
    note?: string | null;
    recordedByUserId: string;
  }) {
    return prisma.collectionRecord.create({
      data: {
        orderId: args.orderId,
        financialAccountId: args.financialAccountId ?? null,
        amount: args.amount,
        currency: args.currency,
        collectedAt: args.collectedAt,
        note: args.note ?? null,
        recordedByUserId: args.recordedByUserId,
      } as any,
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
    financialAccountId?: string | null;
    amount: number;
    currency: string;
    paidAt: Date;
    note?: string | null;
    recordedByUserId: string;
  }) {
    return prisma.paymentRecord.create({
      data: {
        supplierId: args.supplierId,
        financialAccountId: args.financialAccountId ?? null,
        amount: args.amount,
        currency: args.currency,
        paidAt: args.paidAt,
        note: args.note ?? null,
        recordedByUserId: args.recordedByUserId,
      } as any,
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

  async listFinancialAccounts(args: { search?: string; type?: "CASH" | "BANK" }) {
    return ((prisma as any).financialAccount).findMany({
      where: {
        deleted: false,
        ...(args.type ? { type: args.type } : {}),
        ...(args.search
          ? {
              name: {
                contains: args.search,
                mode: "insensitive" as const,
              },
            }
          : {}),
      },
      include: {
        transactions: {
          where: {
            deleted: false,
            status: "RECORDED",
          },
          select: {
            id: true,
            direction: true,
            amount: true,
          },
        },
      },
      orderBy: [
        { isActive: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async findFinancialAccountById(id: string) {
    return ((prisma as any).financialAccount).findFirst({
      where: {
        id,
        deleted: false,
      },
    });
  }

  async createFinancialAccount(args: {
    name: string;
    type: "CASH" | "BANK";
    currency: string;
    openingBalance: number;
    note?: string | null;
  }) {
    return ((prisma as any).financialAccount).create({
      data: {
        name: args.name,
        type: args.type,
        currency: args.currency,
        openingBalance: args.openingBalance,
        note: args.note ?? null,
      },
    });
  }

  async listCashTransactions(args: { search?: string; direction?: "IN" | "OUT" | "TRANSFER"; accountId?: string; fromDate?: Date; toDate?: Date }) {
    return ((prisma as any).cashTransaction).findMany({
      where: {
        deleted: false,
        status: "RECORDED",
        ...(args.direction ? { direction: args.direction } : {}),
        ...(args.accountId ? { accountId: args.accountId } : {}),
        ...(args.fromDate || args.toDate
          ? {
              transactionAt: {
                ...(args.fromDate ? { gte: args.fromDate } : {}),
                ...(args.toDate ? { lte: args.toDate } : {}),
              },
            }
          : {}),
        ...(args.search
          ? {
              OR: [
                {
                  title: {
                    contains: args.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  counterpartyName: {
                    contains: args.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { transactionAt: "desc" },
        { createdAt: "desc" },
      ],
      take: 200,
    });
  }

  async listCashTransactionsBySourceReferenceId(sourceReferenceId: string) {
    return ((prisma as any).cashTransaction).findMany({
      where: {
        deleted: false,
        status: "RECORDED",
        sourceReferenceId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { transactionAt: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async createCashTransaction(args: {
    accountId: string;
    direction: "IN" | "OUT" | "TRANSFER";
    sourceType: "MANUAL" | "COLLECTION" | "PAYMENT" | "TRANSFER" | "ORDER" | "DOCUMENT" | "REFUND";
    category?: "GENERAL_INCOME" | "GENERAL_EXPENSE" | "MARKETPLACE_COMMISSION" | "SHIPPING_EXPENSE" | "SERVICE_FEE" | "REFUND" | "TRANSFER" | null;
    amount: number;
    currency: string;
    transactionAt: Date;
    title: string;
    note?: string | null;
    counterpartyName?: string | null;
    sourceReferenceId?: string | null;
    createdByUserId?: string | null;
  }) {
    return ((prisma as any).cashTransaction).create({
      data: {
        accountId: args.accountId,
        direction: args.direction,
        sourceType: args.sourceType,
        category: args.category ?? null,
        amount: args.amount,
        currency: args.currency,
        transactionAt: args.transactionAt,
        title: args.title,
        note: args.note ?? null,
        counterpartyName: args.counterpartyName ?? null,
        sourceReferenceId: args.sourceReferenceId ?? null,
        createdByUserId: args.createdByUserId ?? null,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

}

export const financeRepository = new FinanceRepository();
