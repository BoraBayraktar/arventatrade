import type { AdminFinanceOverview } from "@/modules/finance/contracts/finance-overview.contract";
import { financialAccountsService } from "@/modules/finance/services/financial-accounts.service";
import { payablesService } from "@/modules/finance/services/payables.service";
import { receivablesService } from "@/modules/finance/services/receivables.service";

export class FinanceOverviewService {
  async getOverview(locale: string): Promise<AdminFinanceOverview> {
    const [payables, receivablesSummary, accountSummary] = await Promise.all([
      payablesService.listSupplierPayables(),
      receivablesService.getReceivablesSummary(),
      financialAccountsService.listAccounts(),
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
        {
          label: "Kasa ve banka bakiyesi",
          value: accountSummary.summary.totalBalance,
          currency: accountSummary.summary.currency,
          tone: "success",
          href: `/${locale}/admin/finance/bank-cash`,
          hint: `${accountSummary.summary.activeAccountCount} aktif finans hesabı`,
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
        {
          title: "Kasa ve Banka",
          description: "Gerçek finans hesaplarını ayrı bir yüzeyde yönetin; bakiye ve hareketler burada sade biçimde görünür.",
          href: `/${locale}/admin/finance/bank-cash`,
        },
        {
          title: "Nakit Hareketleri",
          description: "Manuel gelir ve gider hareketlerini ayrı listeleyin. Tahsilat ve ödeme entegrasyonu sonraki fazda genişletilebilir.",
          href: `/${locale}/admin/finance/transactions`,
        },
      ],
    };
  }
}

export const financeOverviewService = new FinanceOverviewService();
