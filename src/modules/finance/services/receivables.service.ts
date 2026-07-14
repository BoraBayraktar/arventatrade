import { z } from "zod";

import type {
  AdminReceivableDetail,
  AdminReceivableListItem,
  AdminReceivablesQuery,
  AdminReceivablesResult,
  AdminReceivablesSummary,
  AdminReceivableStatus,
} from "@/modules/finance/contracts/receivables.contract";
import { financeRepository } from "@/modules/finance/repositories/finance.repository";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  paymentStatus: z.enum(["all", "PENDING", "AUTHORIZED", "FAILED"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(12),
});

function resolveStatuses(status: "all" | AdminReceivableStatus): AdminReceivableStatus[] {
  if (status === "all") {
    return ["PENDING", "AUTHORIZED", "FAILED"];
  }

  return [status];
}

function mapReceivable(item: Awaited<ReturnType<typeof financeRepository.listOperationalReceivables>>[number]): AdminReceivableListItem {
  const latestDocument = item.businessDocuments[0] ?? null;

  return {
    orderId: item.id,
    orderNumber: item.orderNumber,
    counterpartyName: latestDocument?.counterpartyName?.trim() || "Müşteri bilgisi henüz bağlanmadı",
    paymentStatus: item.paymentStatus as AdminReceivableStatus,
    totalAmount: item.total.toNumber(),
    currency: item.currency,
    itemCount: item.items.reduce((sum, line) => sum + line.quantity, 0),
    createdAt: item.createdAt.toISOString(),
    latestDocument: latestDocument
      ? {
          id: latestDocument.id,
          documentNumber: latestDocument.documentNumber,
          issueDate: latestDocument.issueDate.toISOString(),
          totalAmount: latestDocument.totalAmount?.toNumber() ?? null,
          currency: latestDocument.currency,
        }
      : null,
  };
}

export class ReceivablesService {
  async listOperationalReceivables(query: AdminReceivablesQuery = {}): Promise<AdminReceivablesResult> {
    const parsed = listQuerySchema.parse(query);
    const paymentStatuses = resolveStatuses(parsed.paymentStatus);

    const [items, total, summary] = await Promise.all([
      financeRepository.listOperationalReceivables({
        search: parsed.search,
        paymentStatuses,
        page: parsed.page,
        pageSize: parsed.pageSize,
      }),
      financeRepository.countOperationalReceivables({
        search: parsed.search,
        paymentStatuses,
      }),
      this.getReceivablesSummary(),
    ]);

    return {
      items: items.map(mapReceivable),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
      summary,
    };
  }

  async getReceivablesSummary(): Promise<AdminReceivablesSummary> {
    return financeRepository.summarizeOperationalReceivables();
  }

  async getReceivableByOrderId(orderId: string): Promise<AdminReceivableDetail | null> {
    const result = await this.listOperationalReceivables({
      page: 1,
      pageSize: 100,
    });

    return result.items.find((item) => item.orderId === orderId) ?? null;
  }
}

export const receivablesService = new ReceivablesService();
