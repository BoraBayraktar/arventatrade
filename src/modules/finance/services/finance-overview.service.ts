import type { AdminFinanceOverview } from "@/modules/finance/contracts/finance-overview.contract";
import { payablesService } from "@/modules/finance/services/payables.service";
import { receivablesService } from "@/modules/finance/services/receivables.service";

export class FinanceOverviewService {
  async getOverview(locale: string): Promise<AdminFinanceOverview> {
    const [payables, receivablesSummary] = await Promise.all([
      payablesService.listSupplierPayables(),
      receivablesService.getReceivablesSummary(),
    ]);

    const totalPayables = payables.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalDraftPayables = payables.reduce((sum, item) => sum + item.draftCount, 0);

    return {
      metrics: [
        {
          label: "Açık alacak",
          value: receivablesSummary.totalOpenAmount,
          currency: receivablesSummary.currency,
          tone: "success",
          href: `/${locale}/admin/finance/receivables`,
          hint: `${receivablesSummary.pendingCount + receivablesSummary.authorizedCount + receivablesSummary.failedCount} açık sipariş kaydı`,
        },
        {
          label: "Tedarikçi borcu",
          value: totalPayables,
          currency: payables[0]?.currency ?? "TRY",
          tone: "warning",
          href: `/${locale}/admin/finance/payables`,
          hint: `${payables.length} tedarikçi özeti`,
        },
        {
          label: "Bekleyen tahsilat",
          value: receivablesSummary.pendingCount,
          tone: "neutral",
          href: `/${locale}/admin/finance/receivables?paymentStatus=PENDING`,
          hint: "Ödeme bekleyen siparişler",
        },
        {
          label: "Taslak borç belgesi",
          value: totalDraftPayables,
          tone: "neutral",
          href: `/${locale}/admin/finance/payables`,
          hint: "Tedarikçi tarafında kontrol bekleyen belge",
        },
      ],
      sections: [
        {
          title: "Alacaklar",
          description: "Sipariş ve ödeme durumlarından üretilen açık alacak görünümünü ayrı bir rotada izleyin.",
          href: `/${locale}/admin/finance/receivables`,
        },
        {
          title: "Borçlar",
          description: "Satın alma ve belge akışından gelen tedarikçi borçlarını karışık ekranlar oluşturmadan yönetin.",
          href: `/${locale}/admin/finance/payables`,
        },
      ],
    };
  }
}

export const financeOverviewService = new FinanceOverviewService();
