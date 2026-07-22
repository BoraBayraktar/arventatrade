"use client";

import Link from "next/link";

import { Input } from "@/components/ui/input";
import type { AdminSupplierPayableSummary } from "@/modules/finance/contracts/payables.contract";

type Labels = {
  title: string;
  description: string;
  search: string;
  noResults: string;
  totalAmount: string;
  documentCount: string;
  draftCount: string;
  lastIssueDate: string;
  viewDetail: string;
  notSpecified: string;
};

type Props = {
  locale: string;
  items: AdminSupplierPayableSummary[];
  initialSearch: string;
  labels: Labels;
};

export function SupplierPayablesManager({ locale, items, initialSearch, labels }: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
          <p className="text-sm text-neutral-600">{labels.description}</p>
        </div>
        <form action={`/${locale}/admin/finance/payables`} className="mt-4">
          <Input
            type="search"
            name="search"
            defaultValue={initialSearch}
            placeholder={labels.search}
          />
        </form>
      </section>

      <section className="grid gap-3">
        {items.length === 0 ? (
          <article className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            {labels.noResults}
          </article>
        ) : items.map((item) => (
          <article key={item.supplierKey} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-neutral-950">{item.supplierName}</h2>
                <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-4">
                  <p>{labels.totalAmount}: {item.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}</p>
                  <p>{labels.documentCount}: {item.documentCount}</p>
                  <p>{labels.draftCount}: {item.draftCount}</p>
                  <p>{labels.lastIssueDate}: {item.lastIssueDate ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(item.lastIssueDate)) : labels.notSpecified}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${locale}/admin/finance/payables/${encodeURIComponent(item.supplierKey)}`}
                  className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700"
                >
                  {labels.viewDetail}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
