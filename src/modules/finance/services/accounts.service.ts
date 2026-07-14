import { z } from "zod";

import type {
  AdminFinanceAccountEntry,
  AdminFinanceAccountsQuery,
  AdminFinanceAccountsResult,
} from "@/modules/finance/contracts/accounts.contract";
import { payablesService } from "@/modules/finance/services/payables.service";
import { receivablesService } from "@/modules/finance/services/receivables.service";

const querySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(["all", "RECEIVABLE", "PAYABLE"]).default("all"),
});

export class AccountsService {
  async listAccountEntries(locale: string, query: AdminFinanceAccountsQuery = {}): Promise<AdminFinanceAccountsResult> {
    const parsed = querySchema.parse(query);

    const [payables, receivables] = await Promise.all([
      payablesService.listSupplierPayables({ search: parsed.search }),
      receivablesService.listOperationalReceivables({ search: parsed.search, page: 1, pageSize: 100 }),
    ]);

    const payableEntries: AdminFinanceAccountEntry[] = payables.flatMap((group) =>
      group.documents.map((document) => ({
        id: `payable:${document.id}`,
        type: "PAYABLE",
        counterpartyName: group.supplierName,
        sourceNumber: document.documentNumber,
        sourceDate: document.issueDate,
        statusLabel: document.status,
        totalAmount: document.totalAmount ?? 0,
        currency: document.currency,
        detailHref: `/${locale}/admin/finance/payables/${encodeURIComponent(group.supplierKey)}`,
        sourceHref: `/${locale}/admin/documents`,
      })),
    );

    const receivableEntries: AdminFinanceAccountEntry[] = receivables.items.map((item) => ({
      id: `receivable:${item.orderId}`,
      type: "RECEIVABLE",
      counterpartyName: item.counterpartyName,
      sourceNumber: item.orderNumber,
      sourceDate: item.createdAt,
      statusLabel: item.paymentStatus,
      totalAmount: item.totalAmount,
      currency: item.currency,
      detailHref: `/${locale}/admin/finance/receivables/${item.orderId}`,
      sourceHref: `/${locale}/admin/orders/${item.orderId}`,
    }));

    const combined = [...receivableEntries, ...payableEntries]
      .filter((entry) => parsed.type === "all" || entry.type === parsed.type)
      .sort((left, right) => right.sourceDate.localeCompare(left.sourceDate));

    return {
      items: combined,
      summary: {
        receivableCount: receivableEntries.length,
        payableCount: payableEntries.length,
        totalReceivableAmount: receivableEntries.reduce((sum, item) => sum + item.totalAmount, 0),
        totalPayableAmount: payableEntries.reduce((sum, item) => sum + item.totalAmount, 0),
        currency: "TRY",
      },
    };
  }
}

export const accountsService = new AccountsService();
