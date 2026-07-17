import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import type {
  AdminFinanceReportDetail,
  AdminFinanceReportDetailRow,
  AdminFinanceReportsOverview,
} from "@/modules/finance/contracts/reports.contract";
import { accountsService } from "@/modules/finance/services/accounts.service";
import { cashTransactionsService } from "@/modules/finance/services/cash-transactions.service";
import { collectionsService } from "@/modules/finance/services/collections.service";
import { financialAccountsService } from "@/modules/finance/services/financial-accounts.service";
import { payablesService } from "@/modules/finance/services/payables.service";
import { paymentsService } from "@/modules/finance/services/payments.service";
import { receivablesService } from "@/modules/finance/services/receivables.service";

type AgingBucket = {
  id: string;
  label: string;
  minDays: number;
  maxDays: number | null;
};

const agingBuckets: AgingBucket[] = [
  { id: "0-7", label: "0-7 gün", minDays: 0, maxDays: 7 },
  { id: "8-30", label: "8-30 gün", minDays: 8, maxDays: 30 },
  { id: "31-60", label: "31-60 gün", minDays: 31, maxDays: 60 },
  { id: "61-plus", label: "61+ gün", minDays: 61, maxDays: null },
];

function diffInDays(value: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(diff / msPerDay));
}

function resolveBucketLabel(days: number) {
  const bucket = agingBuckets.find((item) => days >= item.minDays && (item.maxDays == null || days <= item.maxDays));
  return bucket?.label ?? agingBuckets[agingBuckets.length - 1].label;
}

function resolveTone(value: number): "neutral" | "success" | "warning" {
  if (value > 0) {
    return "success";
  }

  if (value < 0) {
    return "warning";
  }

  return "neutral";
}

function formatMoney(value: number | null, currency = "TRY") {
  if (value === null) {
    return "Belirtilmedi";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Belirtilmedi";
  }

  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value));
}

export class ReportsService {
  async getOverview(locale: string): Promise<AdminFinanceReportsOverview> {
    const [accounts, payables, receivables, financialAccounts, transactions] = await Promise.all([
      accountsService.listAccountEntries(locale),
      payablesService.listSupplierPayables(),
      receivablesService.getReceivablesSummary(),
      financialAccountsService.listAccounts(),
      cashTransactionsService.listTransactions(),
    ]);

    const totalPayables = payables.reduce((sum, item) => sum + item.totalAmount, 0);
    const netOperationalBalance = receivables.totalOpenAmount - totalPayables;
    const cashPositionGap = financialAccounts.summary.totalBalance - transactions.summary.netAmount;

    return {
      metrics: [
        {
          label: "Net operasyon bakiyesi",
          value: netOperationalBalance,
          currency: "TRY",
          tone: netOperationalBalance >= 0 ? "success" : "warning",
          href: `/${locale}/admin/finance/accounts`,
          hint: "Açık alacak ve borç farkı",
        },
        {
          label: "Kasa ve banka bakiyesi",
          value: financialAccounts.summary.totalBalance,
          currency: financialAccounts.summary.currency,
          tone: "success",
          href: `/${locale}/admin/finance/bank-cash`,
          hint: `${financialAccounts.summary.activeAccountCount} aktif hesap`,
        },
        {
          label: "Kayıtlı net nakit",
          value: transactions.summary.netAmount,
          currency: transactions.summary.currency,
          tone: resolveTone(transactions.summary.netAmount),
          href: `/${locale}/admin/finance/transactions`,
          hint: `${transactions.summary.transactionCount} finans hareketi`,
        },
        {
          label: "Nakit pozisyon farkı",
          value: cashPositionGap,
          currency: financialAccounts.summary.currency,
          tone: resolveTone(cashPositionGap),
          href: `/${locale}/admin/finance/reports/cashflow`,
          hint: "Hesap bakiyesi eksi kayıtlı net nakit",
        },
      ],
      cards: [
        {
          title: "Yaşlandırma raporu",
          description: "Açık alacak ve borçları gün aralıklarında görüp operasyon yükünü erken fark edin.",
          href: `/${locale}/admin/finance/reports/aging`,
          ctaLabel: "Raporu aç",
        },
        {
          title: "Nakit akış özeti",
          description: "Beklenen giriş ve çıkışları, kaydedilmiş tahsilat ve ödemelerle aynı yüzeyde kıyaslayın.",
          href: `/${locale}/admin/finance/reports/cashflow`,
          ctaLabel: "Raporu aç",
        },
        {
          title: "Stok değer raporu",
          description: "Ürün stok değerini finans bakışıyla sıralı görün; detay ürün yönetimi yine ayrı modülde kalsın.",
          href: `/${locale}/admin/finance/reports/stock-value`,
          ctaLabel: "Raporu aç",
        },
      ],
    };
  }

  async getAgingReport(locale: string): Promise<AdminFinanceReportDetail> {
    const [payableSummaries, receivables] = await Promise.all([
      payablesService.listSupplierPayables(),
      receivablesService.listOperationalReceivables({ page: 1, pageSize: 100 }),
    ]);
    const payables = (await Promise.all(
      payableSummaries.map((item) => payablesService.getSupplierPayableByKey(item.supplierKey)),
    )).filter((item): item is NonNullable<typeof item> => Boolean(item));

    const rows: AdminFinanceReportDetailRow[] = agingBuckets.map((bucket) => {
      const receivableAmount = receivables.items
        .filter((item) => {
          const days = diffInDays(item.createdAt);
          return days >= bucket.minDays && (bucket.maxDays == null || days <= bucket.maxDays);
        })
        .reduce((sum, item) => sum + item.totalAmount, 0);

      const payableAmount = payables
        .flatMap((item) => item.documents)
        .filter((item) => {
          const days = diffInDays(item.issueDate);
          return days >= bucket.minDays && (bucket.maxDays == null || days <= bucket.maxDays);
        })
        .reduce((sum, item) => sum + (item.totalAmount ?? 0), 0);

      return {
        id: bucket.id,
        label: bucket.label,
        supportingText: (() => {
          const bucketPayables = payables
            .flatMap((item) => item.documents.map((document) => ({ document, supplier: item })))
            .filter((entry) => {
              const days = diffInDays(entry.document.issueDate);
              return days >= bucket.minDays && (bucket.maxDays == null || days <= bucket.maxDays);
            });
          const variantSummary = bucketPayables
            .map((entry) => entry.supplier.topVariantSummary)
            .filter((value): value is string => Boolean(value))
            .slice(0, 2)
            .join(" + ");

          return variantSummary
            ? `Açık operasyon bakiyesi yaş aralığı • ${variantSummary}`
            : "Açık operasyon bakiyesi yaş aralığı";
        })(),
        primaryValue: receivableAmount,
        primaryCurrency: "TRY",
        secondaryValue: payableAmount,
        secondaryCurrency: "TRY",
        tone: resolveTone(receivableAmount - payableAmount),
      };
    });

    const totalReceivable = rows.reduce((sum, item) => sum + item.primaryValue, 0);
    const totalPayable = rows.reduce((sum, item) => sum + (item.secondaryValue ?? 0), 0);
    const payableTableRows = payables
      .flatMap((supplier) => supplier.documents.map((document) => ({ supplier, document })))
      .flatMap(({ supplier, document }) => document.lines.map((line) => ({
        id: line.id,
        href: `/${locale}/admin/finance/payables/${encodeURIComponent(supplier.supplierKey)}`,
        cells: {
          agingBucket: resolveBucketLabel(diffInDays(document.issueDate)),
          supplier: supplier.supplierName,
          document: document.documentNumber,
          issueDate: formatDate(document.issueDate),
          product: line.productName,
          variant: line.productVariantTitle ?? "-",
          sku: line.productVariantSku ?? line.productSku,
          quantity: line.quantity.toLocaleString("tr-TR"),
          unitPrice: formatMoney(line.unitPrice, line.currency),
          lineTotal: formatMoney(line.lineTotal, line.currency),
        },
      })))
      .sort((left, right) => right.cells.lineTotal.localeCompare(left.cells.lineTotal));

    return {
      title: "Yaşlandırma raporu",
      description: "Açık alacak ve borçları gün aralıklarına göre izleyin. Operasyon detayı için ilgili alacak veya borç rotasına ilerleyin.",
      metrics: [
        {
          label: "Toplam açık alacak",
          value: totalReceivable,
          currency: "TRY",
          tone: "success",
          hint: `${receivables.total} açık sipariş`,
        },
        {
          label: "Toplam açık borç",
          value: totalPayable,
          currency: "TRY",
          tone: "warning",
          hint: `${payables.length} tedarikçi özeti`,
        },
        {
          label: "Net açık pozisyon",
          value: totalReceivable - totalPayable,
          currency: "TRY",
          tone: resolveTone(totalReceivable - totalPayable),
          hint: "Alacak eksi borç",
        },
      ],
      rows,
      table: {
        title: "Borç Yaşlandırma Detay Listesi",
        description: "Açık borç belgelerinin ürün ve varyant satırlarını yaş aralığıyla birlikte tablo halinde inceleyin.",
        columns: [
          { key: "agingBucket", label: "Yaş Aralığı" },
          { key: "supplier", label: "Tedarikçi" },
          { key: "document", label: "Belge" },
          { key: "issueDate", label: "Belge Tarihi" },
          { key: "product", label: "Ürün" },
          { key: "variant", label: "Varyant" },
          { key: "sku", label: "SKU" },
          { key: "quantity", label: "Miktar", align: "right" },
          { key: "unitPrice", label: "Birim Maliyet", align: "right" },
          { key: "lineTotal", label: "Satır Toplamı", align: "right" },
        ],
        rows: payableTableRows,
      },
    };
  }

  async getCashflowReport(locale: string): Promise<AdminFinanceReportDetail> {
    const [collections, payments, financialAccounts, transactions, payableSummaries] = await Promise.all([
      collectionsService.listCollectionReadiness(locale),
      paymentsService.listPaymentReadiness(locale),
      financialAccountsService.listAccounts(),
      cashTransactionsService.listTransactions(),
      payablesService.listSupplierPayables(),
    ]);
    const payableDetails = (await Promise.all(
      payableSummaries.map((item) => payablesService.getSupplierPayableByKey(item.supplierKey)),
    )).filter((item): item is NonNullable<typeof item> => Boolean(item));

    const netExpected = collections.summary.totalPendingAmount - payments.summary.totalPendingAmount;
    const netRecorded = collections.summary.totalRecordedAmount - payments.summary.totalRecordedAmount;
    const actualCashBalance = financialAccounts.summary.totalBalance;
    const cashCoverageGap = actualCashBalance - netRecorded;

    const accountRows: AdminFinanceReportDetailRow[] = financialAccounts.items.map((account) => {
      const accountTransactions = transactions.items.filter((item) => item.accountId === account.id);
      const incoming = accountTransactions
        .filter((item) => item.direction === "IN" || item.direction === "TRANSFER")
        .reduce((sum, item) => sum + item.amount, 0);
      const outgoing = accountTransactions
        .filter((item) => item.direction === "OUT")
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        id: account.id,
        label: account.name,
        supportingText: `${account.type === "CASH" ? "Kasa" : "Banka"} · ${account.transactionCount} hareket`,
        primaryValue: account.currentBalance,
        primaryCurrency: account.currency,
        secondaryValue: Number((incoming - outgoing).toFixed(2)),
        secondaryCurrency: account.currency,
        tone: resolveTone(account.currentBalance),
        href: `/${locale}/admin/finance/bank-cash`,
      };
    });

    return {
      title: "Nakit akış özeti",
      description: "Beklenen tahsilat ve ödemeleri, kaydedilmiş hareketlerle yan yana izleyin. Operasyon kaydı ayrı finance route’larında kalır.",
      metrics: [
        {
          label: "Beklenen net nakit",
          value: netExpected,
          currency: collections.summary.currency,
          tone: resolveTone(netExpected),
          hint: "Bekleyen alacak eksi bekleyen borç",
        },
        {
          label: "Kayıtlı net nakit",
          value: netRecorded,
          currency: collections.summary.currency,
          tone: resolveTone(netRecorded),
          hint: "Tahsilat eksi ödeme kaydı",
        },
        {
          label: "Gerçek hesap bakiyesi",
          value: actualCashBalance,
          currency: financialAccounts.summary.currency,
          tone: resolveTone(actualCashBalance),
          hint: `${financialAccounts.summary.activeAccountCount} aktif finans hesabı`,
        },
        {
          label: "Kasa uyum farkı",
          value: cashCoverageGap,
          currency: financialAccounts.summary.currency,
          tone: resolveTone(cashCoverageGap),
          hint: "Gerçek bakiye ile kayıtlı net nakit farkı",
        },
      ],
      rows: [
        {
          id: "collections-expected",
          label: "Beklenen tahsilat",
          supportingText: "Açık alacak toplamı",
          primaryValue: collections.summary.totalPendingAmount,
          primaryCurrency: collections.summary.currency,
          href: `/${locale}/admin/finance/collections`,
          tone: "success",
        },
        {
          id: "payments-expected",
          label: "Beklenen ödeme",
          supportingText: (() => {
            const topSummaries = payments.items
              .map((item) => item.topVariantSummary)
              .filter((value): value is string => Boolean(value))
              .slice(0, 2)
              .join(" + ");
            return topSummaries ? `Açık borç toplamı • ${topSummaries}` : "Açık borç toplamı";
          })(),
          primaryValue: payments.summary.totalPendingAmount,
          primaryCurrency: payments.summary.currency,
          href: `/${locale}/admin/finance/payments`,
          tone: "warning",
        },
        {
          id: "collections-recorded",
          label: "Kayıtlı tahsilat",
          supportingText: `${collections.summary.recordedCount} tahsilat kaydı`,
          primaryValue: collections.summary.totalRecordedAmount,
          primaryCurrency: collections.summary.currency,
          href: `/${locale}/admin/finance/collections`,
          tone: "success",
        },
        {
          id: "payments-recorded",
          label: "Kayıtlı ödeme",
          supportingText: `${payments.summary.recordedCount} ödeme kaydı`,
          primaryValue: payments.summary.totalRecordedAmount,
          primaryCurrency: payments.summary.currency,
          href: `/${locale}/admin/finance/payments`,
          tone: "warning",
        },
        ...accountRows,
      ],
      table: {
        title: "Beklenen Ödeme Ürün Detay Listesi",
        description: "Açık tedarikçi borçlarının ürün ve varyant satırlarını ödeme planı gözüyle tablo halinde izleyin.",
        columns: [
          { key: "supplier", label: "Tedarikçi" },
          { key: "document", label: "Belge" },
          { key: "issueDate", label: "Belge Tarihi" },
          { key: "product", label: "Ürün" },
          { key: "variant", label: "Varyant" },
          { key: "sku", label: "SKU" },
          { key: "quantity", label: "Miktar", align: "right" },
          { key: "unitPrice", label: "Birim Maliyet", align: "right" },
          { key: "lineTotal", label: "Ödeme Tutarı", align: "right" },
        ],
        rows: payableDetails
          .flatMap((supplier) => supplier.documents.map((document) => ({ supplier, document })))
          .flatMap(({ supplier, document }) => document.lines.map((line) => ({
            id: line.id,
            href: `/${locale}/admin/finance/payments/${encodeURIComponent(supplier.supplierKey)}`,
            cells: {
              supplier: supplier.supplierName,
              document: document.documentNumber,
              issueDate: formatDate(document.issueDate),
              product: line.productName,
              variant: line.productVariantTitle ?? "-",
              sku: line.productVariantSku ?? line.productSku,
              quantity: line.quantity.toLocaleString("tr-TR"),
              unitPrice: formatMoney(line.unitPrice, line.currency),
              lineTotal: formatMoney(line.lineTotal, line.currency),
            },
          })))
          .sort((left, right) => right.cells.lineTotal.localeCompare(left.cells.lineTotal)),
      },
    };
  }

  async getStockValueReport(locale: string): Promise<AdminFinanceReportDetail> {
    const products = await catalogAdminService.listProducts({
      page: 1,
      pageSize: 50,
    });

    const totalStockValue = products.items.reduce((sum, item) => sum + item.stockValue, 0);
    const totalStockUnits = products.items.reduce((sum, item) => sum + item.stock, 0);
    const inStockCount = products.items.filter((item) => item.stock > 0).length;

    return {
      title: "Stok değer raporu",
      description: "Finans bakışıyla en yüksek stok değerine sahip ürünleri görün. Ürün düzenleme ve stok operasyonu kendi modüllerinde kalır.",
      metrics: [
        {
          label: "Toplam stok değeri",
          value: totalStockValue,
          currency: "TRY",
          tone: "neutral",
          hint: `${products.items.length} ürün görünümü`,
        },
        {
          label: "Toplam birim stok",
          value: totalStockUnits,
          tone: "neutral",
          hint: "Listelenen ürünlerin toplam stoku",
        },
        {
          label: "Stoklu ürün adedi",
          value: inStockCount,
          tone: "success",
          hint: "Stokta kalan aktif ürünler",
        },
      ],
      rows: products.items
        .sort((left, right) => right.stockValue - left.stockValue)
        .slice(0, 12)
        .map((item) => ({
          id: item.id,
          label: item.name,
          supportingText: `${item.sku} · ${resolveBucketLabel(diffInDays(item.lastOrderedAt ?? new Date().toISOString()))} içinde hareket görmüş`,
          primaryValue: item.stockValue,
          primaryCurrency: item.currency,
          secondaryValue: item.stock,
          tone: item.stockValue > 0 ? "neutral" : "warning",
          href: `/${locale}/admin/products`,
        })),
      table: {
        title: "Ürün Bazlı Detay Liste",
        description: "Stok değerini ürün bilgileriyle tablo halinde inceleyin. Bu alan özet kartlardan farklı olarak operasyonel rapor okuması içindir.",
        columns: [
          { key: "name", label: "Ürün" },
          { key: "sku", label: "SKU" },
          { key: "supplier", label: "Tedarikçi" },
          { key: "stock", label: "Stok", align: "right" },
          { key: "purchasePrice", label: "Alış Fiyatı", align: "right" },
          { key: "averageUnitCost", label: "Ort. Maliyet", align: "right" },
          { key: "stockValue", label: "Stok Değeri", align: "right" },
          { key: "lastOrderedAt", label: "Son Sipariş" },
        ],
        rows: products.items
          .sort((left, right) => right.stockValue - left.stockValue)
          .map((item) => ({
            id: item.id,
            href: `/${locale}/admin/products`,
            cells: {
              name: item.name,
              sku: item.sku,
              supplier: item.primarySupplierName ?? "Belirtilmedi",
              stock: item.stock.toLocaleString("tr-TR"),
              purchasePrice: item.purchasePrice === null
                ? "Belirtilmedi"
                : new Intl.NumberFormat("tr-TR", { style: "currency", currency: item.currency, maximumFractionDigits: 2 }).format(item.purchasePrice),
              averageUnitCost: item.averageUnitCost === null
                ? "Belirtilmedi"
                : new Intl.NumberFormat("tr-TR", { style: "currency", currency: item.currency, maximumFractionDigits: 2 }).format(item.averageUnitCost),
              stockValue: new Intl.NumberFormat("tr-TR", { style: "currency", currency: item.currency, maximumFractionDigits: 2 }).format(item.stockValue),
              lastOrderedAt: item.lastOrderedAt
                ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(item.lastOrderedAt))
                : "Belirtilmedi",
            },
          })),
      },
    };
  }
}

export const reportsService = new ReportsService();
