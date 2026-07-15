"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { AdminPaymentsResult } from "@/modules/finance/contracts/payments.contract";

type AccountOption = {
  id: string;
  label: string;
};

type Labels = {
  title: string;
  description: string;
  totalPendingAmount: string;
  totalRecordedAmount: string;
  supplierCount: string;
  draftDocumentCount: string;
  financeStatus: string;
  financeStatusPending: string;
  financeStatusPartial: string;
  financeStatusCompleted: string;
  recordedCount: string;
  documentCount: string;
  lastIssueDate: string;
  amount: string;
  remainingAmount: string;
  recordedPaymentCount: string;
  openDetail: string;
  openSource: string;
  createRecord: string;
  creatingRecord: string;
  createRecordSuccess: string;
  createRecordFailed: string;
  account: string;
  accountRequired: string;
  noResults: string;
};

type Props = {
  result: AdminPaymentsResult;
  accountOptions: AccountOption[];
  labels: Labels;
};

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function getFinanceStatus(item: AdminPaymentsResult["items"][number], labels: Labels) {
  if (item.remainingAmount <= 0) {
    return {
      label: labels.financeStatusCompleted,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (item.recordedPaymentCount > 0) {
    return {
      label: labels.financeStatusPartial,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  return {
    label: labels.financeStatusPending,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  };
}

export function PaymentReadinessManager({ result, accountOptions, labels }: Props) {
  const router = useRouter();
  const [busySupplierKey, setBusySupplierKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function createPaymentRecord(supplierId: string, supplierKey: string, amount: number) {
    const financialAccountId = selectedAccountIds[supplierKey] ?? accountOptions[0]?.id ?? "";

    if (!financialAccountId) {
      setMessage(labels.accountRequired);
      return;
    }

    setBusySupplierKey(supplierKey);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/finance/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplierId,
            financialAccountId,
            amount,
            paidAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { message?: string } | null;
          throw new Error(payload?.message ?? labels.createRecordFailed);
        }

        setMessage(labels.createRecordSuccess);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : labels.createRecordFailed);
      } finally {
        setBusySupplierKey(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
          <p className="text-sm text-neutral-600">{labels.description}</p>
        </div>
      </section>

      {message ? (
        <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          {message}
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{labels.totalPendingAmount}</p>
          <p className="mt-3 text-2xl font-semibold text-amber-950">{formatMoney(result.summary.totalPendingAmount, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{labels.totalRecordedAmount}</p>
          <p className="mt-3 text-2xl font-semibold text-blue-950">{formatMoney(result.summary.totalRecordedAmount, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.supplierCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.supplierCount}</p>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.draftDocumentCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.draftDocumentCount}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.recordedCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.recordedCount}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {result.items.length === 0 ? (
          <article className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            {labels.noResults}
          </article>
        ) : result.items.map((item) => (
          <article key={item.supplierKey} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            {(() => {
              const financeStatus = getFinanceStatus(item, labels);

              return (
                <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-neutral-950">{item.supplierName}</h2>
                <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-4">
                  <p>{labels.amount}: {formatMoney(item.totalAmount, item.currency)}</p>
                  <p>{labels.documentCount}: {item.documentCount}</p>
                  <p>{labels.draftDocumentCount}: {item.draftCount}</p>
                  <p>
                    {labels.financeStatus}:{" "}
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${financeStatus.className}`}>
                      {financeStatus.label}
                    </span>
                  </p>
                  <p>{labels.lastIssueDate}: {item.lastIssueDate ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(item.lastIssueDate)) : "-"}</p>
                  <p>{labels.remainingAmount}: {formatMoney(item.remainingAmount, item.currency)}</p>
                  <p>{labels.recordedPaymentCount}: {item.recordedPaymentCount}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedAccountIds[item.supplierKey] ?? accountOptions[0]?.id ?? ""}
                  onChange={(event) => setSelectedAccountIds((current) => ({ ...current, [item.supplierKey]: event.target.value }))}
                  className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
                >
                  {accountOptions.length === 0 ? <option value="">{labels.account}</option> : null}
                  {accountOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!item.supplierId || item.remainingAmount <= 0 || busySupplierKey === item.supplierKey || isPending}
                  onClick={() => createPaymentRecord(item.supplierId, item.supplierKey, item.remainingAmount)}
                  className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busySupplierKey === item.supplierKey ? labels.creatingRecord : labels.createRecord}
                </button>
                <Link href={item.detailHref} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
                  {labels.openDetail}
                </Link>
                <Link href={item.sourceHref} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
                  {labels.openSource}
                </Link>
              </div>
            </div>
                </>
              );
            })()}
          </article>
        ))}
      </section>
    </div>
  );
}
