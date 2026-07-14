import { z } from "zod";

import type {
  AdminCollectionRecordItem,
  AdminCollectionsResult,
  AdminCreateCollectionRecordInput,
} from "@/modules/finance/contracts/collections.contract";
import { financeRepository } from "@/modules/finance/repositories/finance.repository";
import { receivablesService } from "@/modules/finance/services/receivables.service";

const createCollectionRecordSchema = z.object({
  orderId: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  collectedAt: z.string().datetime(),
  note: z.string().trim().max(500).optional().nullable(),
  recordedByUserId: z.string().trim().min(1),
});

function mapCollectionRecord(item: Awaited<ReturnType<typeof financeRepository.listCollectionRecords>>[number]): AdminCollectionRecordItem {
  return {
    id: item.id,
    orderId: item.orderId,
    amount: item.amount.toNumber(),
    currency: item.currency,
    status: item.status,
    collectedAt: item.collectedAt.toISOString(),
    note: item.note,
    recordedByUserId: item.recordedByUserId,
    createdAt: item.createdAt.toISOString(),
  };
}

export class CollectionsService {
  async listCollectionReadiness(locale: string): Promise<AdminCollectionsResult> {
    const result = await receivablesService.listOperationalReceivables({
      page: 1,
      pageSize: 100,
    });
    const orderIds = result.items.map((item) => item.orderId);
    const collectionRecords = await financeRepository.listCollectionRecords(orderIds);
    const recordsByOrderId = new Map<string, AdminCollectionRecordItem[]>();

    for (const record of collectionRecords.map(mapCollectionRecord)) {
      const current = recordsByOrderId.get(record.orderId) ?? [];
      current.push(record);
      recordsByOrderId.set(record.orderId, current);
    }

    const totalRecordedAmount = collectionRecords.reduce((sum, item) => sum + item.amount.toNumber(), 0);

    return {
      items: result.items.map((item) => {
        const recordedItems = recordsByOrderId.get(item.orderId) ?? [];
        const recordedAmount = recordedItems.reduce((sum, record) => sum + record.amount, 0);

        return {
          orderId: item.orderId,
          orderNumber: item.orderNumber,
          counterpartyName: item.counterpartyName,
          paymentStatus: item.paymentStatus,
          totalAmount: item.totalAmount,
          currency: item.currency,
          createdAt: item.createdAt,
          recordedCollectionCount: recordedItems.length,
          remainingAmount: Math.max(0, Number((item.totalAmount - recordedAmount).toFixed(2))),
          detailHref: `/${locale}/admin/finance/collections/${item.orderId}`,
          sourceHref: `/${locale}/admin/orders/${item.orderId}`,
        };
      }),
      summary: {
        totalPendingAmount: result.summary.totalOpenAmount,
        totalRecordedAmount,
        pendingCount: result.summary.pendingCount,
        authorizedCount: result.summary.authorizedCount,
        failedCount: result.summary.failedCount,
        recordedCount: collectionRecords.length,
        currency: result.summary.currency,
      },
    };
  }

  async getCollectionReadinessByOrderId(locale: string, orderId: string) {
    const result = await this.listCollectionReadiness(locale);
    return result.items.find((item) => item.orderId === orderId) ?? null;
  }

  async listCollectionRecords(orderId?: string) {
    const items = await financeRepository.listCollectionRecords(orderId ? [orderId] : undefined);
    return items.map(mapCollectionRecord);
  }

  async createCollectionRecord(input: AdminCreateCollectionRecordInput) {
    const parsed = createCollectionRecordSchema.parse(input);
    const receivable = await receivablesService.getReceivableByOrderId(parsed.orderId);

    if (!receivable) {
      throw new Error("Tahsilat kaydı oluşturulacak sipariş bulunamadı.");
    }

    const existingRecords = await this.listCollectionRecords(parsed.orderId);
    const collectedAmount = existingRecords.reduce((sum, item) => sum + item.amount, 0);
    const remainingAmount = Number((receivable.totalAmount - collectedAmount).toFixed(2));

    if (parsed.amount > remainingAmount) {
      throw new Error("Tahsilat tutarı kalan alacak tutarını aşamaz.");
    }

    const created = await financeRepository.createCollectionRecord({
      orderId: parsed.orderId,
      amount: parsed.amount,
      currency: receivable.currency,
      collectedAt: new Date(parsed.collectedAt),
      note: parsed.note ?? null,
      recordedByUserId: parsed.recordedByUserId,
    });

    return mapCollectionRecord(created);
  }
}

export const collectionsService = new CollectionsService();
