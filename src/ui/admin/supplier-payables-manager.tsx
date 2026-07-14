"use client";

import { useState } from "react";

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
  close: string;
  notSpecified: string;
  documentNumber: string;
  documentType: string;
  documentStatus: string;
  orderNumber: string;
  inventoryTransactionNumber: string;
};

type Props = {
  locale: string;
  items: AdminSupplierPayableSummary[];
  initialSearch: string;
  labels: Labels;
};

export function SupplierPayablesManager({ locale, items, initialSearch, labels }: Props) {
  const [detail, setDetail] = useState<AdminSupplierPayableSummary | null>(null);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
          <p className="text-sm text-neutral-600">{labels.description}</p>
        </div>
        <form action={`/${locale}/admin/finance/payables`} className="mt-4">
          <input
            type="search"
            name="search"
            defaultValue={initialSearch}
            placeholder={labels.search}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm"
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
                <button
                  type="button"
                  onClick={() => setDetail(item)}
                  className="h-10 rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700"
                >
                  {labels.viewDetail}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/35">
          <div className="flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.totalAmount}</p>
                <h3 className="mt-1 text-xl font-semibold text-neutral-950">{detail.supplierName}</h3>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="rounded-full border border-neutral-200 px-3 py-2 text-sm">
                {labels.close}
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
                <p>{labels.totalAmount}</p>
                <p className="mt-2 text-lg font-semibold text-neutral-950">
                  {detail.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {detail.currency}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
                <p>{labels.documentCount}</p>
                <p className="mt-2 text-lg font-semibold text-neutral-950">{detail.documentCount}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
                <p>{labels.draftCount}</p>
                <p className="mt-2 text-lg font-semibold text-neutral-950">{detail.draftCount}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {detail.documents.map((document) => (
                <article key={document.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">{document.documentType}</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{document.status}</span>
                  </div>
                  <h4 className="mt-3 font-semibold text-neutral-950">{document.documentNumber}</h4>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <p>{labels.documentStatus}: {document.status}</p>
                    <p>{labels.documentType}: {document.documentType}</p>
                    <p>{labels.orderNumber}: {document.orderNumber ?? labels.notSpecified}</p>
                    <p>{labels.inventoryTransactionNumber}: {document.inventoryTransactionNumber ?? labels.notSpecified}</p>
                    <p>{labels.lastIssueDate}: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(document.issueDate))}</p>
                    <p>{labels.totalAmount}: {(document.totalAmount ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {document.currency}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
