import { z } from "zod";

import type {
  AdminCreateFinancialAccountInput,
  AdminFinancialAccountDetail,
  AdminFinancialAccountDetailQuery,
  AdminFinancialAccountDetailTransactionItem,
  AdminFinancialAccountItem,
  AdminFinancialAccountsQuery,
  AdminFinancialAccountsResult,
} from "@/modules/finance/contracts/financial-accounts.contract";
import { financeRepository } from "@/modules/finance/repositories/finance.repository";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(["all", "CASH", "BANK"]).default("all"),
});

const createFinancialAccountSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(["CASH", "BANK"]),
  currency: z.string().trim().min(3).max(3).default("TRY"),
  openingBalance: z.coerce.number().default(0),
  note: z.string().trim().max(500).optional().nullable(),
});

const detailQuerySchema = z.object({
  direction: z.enum(["all", "IN", "OUT", "TRANSFER"]).default("all"),
  fromDate: z.string().trim().optional(),
  toDate: z.string().trim().optional(),
});

function toSignedAmount(direction: "IN" | "OUT" | "TRANSFER", amount: number) {
  if (direction === "OUT") {
    return -amount;
  }

  return amount;
}

function mapAccount(item: Awaited<ReturnType<typeof financeRepository.listFinancialAccounts>>[number]): AdminFinancialAccountItem {
  const openingBalance = item.openingBalance.toNumber();
  const currentBalance = item.transactions.reduce((sum: number, transaction: { direction: "IN" | "OUT" | "TRANSFER"; amount: { toNumber(): number } }) => {
    return sum + toSignedAmount(transaction.direction, transaction.amount.toNumber());
  }, openingBalance);

  return {
    id: item.id,
    name: item.name,
    type: item.type,
    currency: item.currency,
    openingBalance,
    currentBalance: Number(currentBalance.toFixed(2)),
    transactionCount: item.transactions.length,
    isActive: item.isActive,
    note: item.note,
    createdAt: item.createdAt.toISOString(),
  };
}

function mapTransaction(item: Awaited<ReturnType<typeof financeRepository.listCashTransactions>>[number]): AdminFinancialAccountDetailTransactionItem {
  return {
    id: item.id,
    direction: item.direction,
    sourceType: item.sourceType,
    category: item.category,
    amount: item.amount.toNumber(),
    currency: item.currency,
    title: item.title,
    note: item.note,
    counterpartyName: item.counterpartyName,
    sourceReferenceId: item.sourceReferenceId,
    transactionAt: item.transactionAt.toISOString(),
  };
}

export class FinancialAccountsService {
  async listAccounts(query: AdminFinancialAccountsQuery = {}): Promise<AdminFinancialAccountsResult> {
    const parsed = listQuerySchema.parse(query);
    const items = await financeRepository.listFinancialAccounts({
      search: parsed.search,
      type: parsed.type === "all" ? undefined : parsed.type,
    });
    const mapped = items.map(mapAccount);

    return {
      items: mapped,
      summary: {
        totalBalance: Number(mapped.reduce((sum: number, item: AdminFinancialAccountItem) => sum + item.currentBalance, 0).toFixed(2)),
        activeAccountCount: mapped.filter((item: AdminFinancialAccountItem) => item.isActive).length,
        cashAccountCount: mapped.filter((item: AdminFinancialAccountItem) => item.type === "CASH").length,
        bankAccountCount: mapped.filter((item: AdminFinancialAccountItem) => item.type === "BANK").length,
        currency: mapped[0]?.currency ?? "TRY",
      },
    };
  }

  async listAccountOptions() {
    const result = await this.listAccounts();
    return result.items
      .filter((item: AdminFinancialAccountItem) => item.isActive)
      .map((item: AdminFinancialAccountItem) => ({
        id: item.id,
        label: `${item.name} • ${item.type === "CASH" ? "Kasa" : "Banka"}`,
      }));
  }

  async getAccountDetail(id: string, query: AdminFinancialAccountDetailQuery = {}): Promise<AdminFinancialAccountDetail | null> {
    const parsedQuery = detailQuerySchema.parse(query);
    const baseAccount = await financeRepository.findFinancialAccountById(id);

    if (!baseAccount) {
      return null;
    }

    const fromDate = parsedQuery.fromDate ? new Date(`${parsedQuery.fromDate}T00:00:00.000Z`) : undefined;
    const toDate = parsedQuery.toDate ? new Date(`${parsedQuery.toDate}T23:59:59.999Z`) : undefined;

    const [accountList, transactionResult] = await Promise.all([
      financeRepository.listFinancialAccounts({ search: baseAccount.name, type: baseAccount.type }),
      financeRepository.listCashTransactions({
        accountId: id,
        direction: parsedQuery.direction === "all" ? undefined : parsedQuery.direction,
        fromDate,
        toDate,
      }),
    ]);

    const matchedAccount = accountList.find((item: Awaited<ReturnType<typeof financeRepository.listFinancialAccounts>>[number]) => item.id === id);

    if (!matchedAccount) {
      return null;
    }

    const account = mapAccount(matchedAccount);
    const transactions = transactionResult.map(mapTransaction);
    const totalIncoming = transactions
      .filter((item: AdminFinancialAccountDetailTransactionItem) => item.direction === "IN")
      .reduce((sum: number, item: AdminFinancialAccountDetailTransactionItem) => sum + item.amount, 0);
    const totalOutgoing = transactions
      .filter((item: AdminFinancialAccountDetailTransactionItem) => item.direction === "OUT")
      .reduce((sum: number, item: AdminFinancialAccountDetailTransactionItem) => sum + item.amount, 0);

    return {
      account,
      summary: {
        totalIncoming: Number(totalIncoming.toFixed(2)),
        totalOutgoing: Number(totalOutgoing.toFixed(2)),
        netCashFlow: Number((totalIncoming - totalOutgoing).toFixed(2)),
        availableBalance: account.currentBalance,
        currency: account.currency,
      },
      transactions,
    };
  }

  async createAccount(input: AdminCreateFinancialAccountInput) {
    const parsed = createFinancialAccountSchema.parse(input);
    const created = await financeRepository.createFinancialAccount({
      name: parsed.name,
      type: parsed.type,
      currency: parsed.currency.toUpperCase(),
      openingBalance: parsed.openingBalance,
      note: parsed.note ?? null,
    });

    const account = await financeRepository.listFinancialAccounts({ search: created.name });
    const exactMatch = account.find((item: Awaited<ReturnType<typeof financeRepository.listFinancialAccounts>>[number]) => item.id === created.id);

    if (!exactMatch) {
      throw new Error("Finans hesabı oluşturuldu ancak tekrar yüklenemedi.");
    }

    return mapAccount(exactMatch);
  }
}

export const financialAccountsService = new FinancialAccountsService();
