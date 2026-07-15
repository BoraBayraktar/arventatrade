"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { AdminFinanceAccountsResult, AdminFinanceAccountEntryType } from "@/modules/finance/contracts/accounts.contract";

type Labels = {
  title: string;
  description: string;
  search: string;
  allTypes: string;
  receivable: string;
  payable: string;
  receivableCount: string;
  payableCount: string;
  totalReceivableAmount: string;
  totalPayableAmount: string;
  counterparty: string;
  sourceNumber: string;
  sourceDate: string;
  status: string;
  amount: string;
  openFinanceRoute: string;
  openSource: string;
  noResults: string;
};

type Props = {
  locale: string;
  result: AdminFinanceAccountsResult;
  initialSearch: string;
  initialType: "all" | AdminFinanceAccountEntryType;
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

function buildTypeHref(locale: string, type: "all" | AdminFinanceAccountEntryType, search: string) {
  const params = new URLSearchParams();
  if (type !== "all") {
    params.set("type", type);
  }
  if (search.trim()) {
    params.set("search", search.trim());
  }
  const query = params.toString();
  return query ? `/${locale}/admin/finance/accounts?${query}` : `/${locale}/admin/finance/accounts`;
}

export function FinanceAccountsManager({ locale, result, initialSearch, initialType, labels }: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
          <p className="text-sm text-neutral-600">{labels.description}</p>
        </div>
        <form action={`/${locale}/admin/finance/accounts`} className="mt-4">
          <Input
            type="search"
            name="search"
            defaultValue={initialSearch}
            placeholder={labels.search}
          />
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={buildTypeHref(locale, "all", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialType === "all" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.allTypes}</Link>
          <Link href={buildTypeHref(locale, "RECEIVABLE", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialType === "RECEIVABLE" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.receivable}</Link>
          <Link href={buildTypeHref(locale, "PAYABLE", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialType === "PAYABLE" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.payable}</Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{labels.totalReceivableAmount}</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-950">{formatMoney(result.summary.totalReceivableAmount, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{labels.totalPayableAmount}</p>
          <p className="mt-3 text-2xl font-semibold text-amber-950">{formatMoney(result.summary.totalPayableAmount, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.receivableCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.receivableCount}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.payableCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.payableCount}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {result.items.length === 0 ? (
          <article className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            {labels.noResults}
          </article>
        ) : result.items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={item.type === "RECEIVABLE" ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-amber-200 bg-amber-100 text-amber-700"}>
                    {item.type === "RECEIVABLE" ? labels.receivable : labels.payable}
                  </Badge>
                  <h2 className="text-lg font-semibold text-neutral-950">{item.counterpartyName}</h2>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-5">
                  <p>{labels.sourceNumber}: {item.sourceNumber}</p>
                  <p>{labels.sourceDate}: {formatDate(item.sourceDate)}</p>
                  <p>{labels.status}: {item.statusLabel}</p>
                  <p>{labels.amount}: {formatMoney(item.totalAmount, item.currency)}</p>
                  <p>{labels.counterparty}: {item.counterpartyName}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={item.detailHref} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
                  {labels.openFinanceRoute}
                </Link>
                <Link href={item.sourceHref} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
                  {labels.openSource}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
