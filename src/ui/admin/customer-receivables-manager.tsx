import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminReceivablesResult } from "@/modules/finance/contracts/receivables.contract";

type Labels = {
  title: string;
  description: string;
  search: string;
  allStatuses: string;
  pending: string;
  authorized: string;
  failed: string;
  totalOpenAmount: string;
  pendingCount: string;
  authorizedCount: string;
  failedCount: string;
  noResults: string;
  orderNumber: string;
  counterparty: string;
  paymentStatus: string;
  totalAmount: string;
  itemCount: string;
  orderDate: string;
  latestDocument: string;
  openOrder: string;
  notSpecified: string;
};

type Props = {
  locale: string;
  result: AdminReceivablesResult;
  initialSearch: string;
  initialPaymentStatus: "all" | "PENDING" | "AUTHORIZED" | "FAILED";
  labels: Labels;
};

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildStatusHref(locale: string, status: "all" | "PENDING" | "AUTHORIZED" | "FAILED", search: string) {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("paymentStatus", status);
  }
  if (search.trim()) {
    params.set("search", search.trim());
  }
  const query = params.toString();
  return query ? `/${locale}/admin/finance/receivables?${query}` : `/${locale}/admin/finance/receivables`;
}

function resolveStatusBadge(status: "PENDING" | "AUTHORIZED" | "FAILED") {
  if (status === "AUTHORIZED") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "FAILED") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function CustomerReceivablesManager({
  locale,
  result,
  initialSearch,
  initialPaymentStatus,
  labels,
}: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
          <p className="text-sm text-neutral-600">{labels.description}</p>
        </div>
        <form action={`/${locale}/admin/finance/receivables`} className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            type="search"
            name="search"
            defaultValue={initialSearch}
            placeholder={labels.search}
          />
          <input type="hidden" name="paymentStatus" value={initialPaymentStatus === "all" ? "" : initialPaymentStatus} />
          <Button type="submit" variant="secondary">
            {labels.search}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={buildStatusHref(locale, "all", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialPaymentStatus === "all" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.allStatuses}</Link>
          <Link href={buildStatusHref(locale, "PENDING", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialPaymentStatus === "PENDING" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.pending}</Link>
          <Link href={buildStatusHref(locale, "AUTHORIZED", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialPaymentStatus === "AUTHORIZED" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.authorized}</Link>
          <Link href={buildStatusHref(locale, "FAILED", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialPaymentStatus === "FAILED" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.failed}</Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{labels.totalOpenAmount}</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-950">{formatMoney(result.summary.totalOpenAmount, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{labels.pendingCount}</p>
          <p className="mt-3 text-2xl font-semibold text-amber-950">{result.summary.pendingCount}</p>
        </article>
        <article className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{labels.authorizedCount}</p>
          <p className="mt-3 text-2xl font-semibold text-blue-950">{result.summary.authorizedCount}</p>
        </article>
        <article className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">{labels.failedCount}</p>
          <p className="mt-3 text-2xl font-semibold text-rose-950">{result.summary.failedCount}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {result.items.length === 0 ? (
          <article className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            {labels.noResults}
          </article>
        ) : result.items.map((item) => (
          <article key={item.orderId} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral-950">{item.orderNumber}</h2>
                  <Badge className={resolveStatusBadge(item.paymentStatus)}>
                    {item.paymentStatus}
                  </Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-3">
                  <p>{labels.counterparty}: {item.counterpartyName}</p>
                  <p>{labels.totalAmount}: {formatMoney(item.totalAmount, item.currency)}</p>
                  <p>{labels.itemCount}: {item.itemCount}</p>
                  <p>{labels.orderDate}: {formatDate(item.createdAt)}</p>
                  <p>{labels.paymentStatus}: {item.paymentStatus}</p>
                  <p>{labels.latestDocument}: {item.latestDocument?.documentNumber ?? labels.notSpecified}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/${locale}/admin/finance/receivables/${item.orderId}`} className="h-10 rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 inline-flex items-center">
                  {labels.latestDocument}
                </Link>
                <Link href={`/${locale}/admin/orders/${item.orderId}`} className="h-10 rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 inline-flex items-center">
                  {labels.openOrder}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
