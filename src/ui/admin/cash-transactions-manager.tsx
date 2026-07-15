"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import type {
  AdminCashTransactionCategory,
  AdminCashTransactionDirection,
  AdminCashTransactionSourceType,
  AdminCashTransactionsResult,
} from "@/modules/finance/contracts/cash-transactions.contract";

type AccountOption = {
  id: string;
  label: string;
};

type Labels = {
  title: string;
  description: string;
  search: string;
  allDirections: string;
  incoming: string;
  outgoing: string;
  transfer: string;
  refund: string;
  totalIncoming: string;
  totalOutgoing: string;
  netAmount: string;
  transactionCount: string;
  account: string;
  targetAccount: string;
  amount: string;
  transactionDate: string;
  titleField: string;
  sourceType: string;
  category: string;
  note: string;
  counterparty: string;
  createTitle: string;
  createAction: string;
  creatingAction: string;
  createSuccess: string;
  createFailed: string;
  empty: string;
};

type Props = {
  locale: string;
  result: AdminCashTransactionsResult;
  accountOptions: AccountOption[];
  initialSearch: string;
  initialDirection: "all" | AdminCashTransactionDirection;
  initialAccountId: string;
  labels: Labels;
};

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildFilterHref(locale: string, direction: "all" | AdminCashTransactionDirection, search: string, accountId: string) {
  const params = new URLSearchParams();
  if (direction !== "all") {
    params.set("direction", direction);
  }
  if (search.trim()) {
    params.set("search", search.trim());
  }
  if (accountId) {
    params.set("accountId", accountId);
  }
  const query = params.toString();
  return query ? `/${locale}/admin/finance/transactions?${query}` : `/${locale}/admin/finance/transactions`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CashTransactionsManager({
  locale,
  result,
  accountOptions,
  initialSearch,
  initialDirection,
  initialAccountId,
  labels,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    accountId: initialAccountId || accountOptions[0]?.id || "",
    targetAccountId: "",
    direction: "IN" as AdminCashTransactionDirection,
    sourceType: "MANUAL" as AdminCashTransactionSourceType,
    category: "GENERAL_INCOME" as AdminCashTransactionCategory,
    amount: "",
    title: "",
    note: "",
    counterpartyName: "",
  });

  function submitTransaction() {
    startTransition(async () => {
      setMessage(null);

      try {
        const response = await fetch("/api/admin/finance/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: form.accountId,
            targetAccountId: form.targetAccountId || undefined,
            direction: form.direction,
            sourceType: form.sourceType,
            category: form.category,
            amount: Number(form.amount || "0"),
            title: form.title,
            note: form.note.trim() || null,
            counterpartyName: form.counterpartyName.trim() || null,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { message?: string } | null;
          throw new Error(payload?.message ?? labels.createFailed);
        }

        setForm((current) => ({
          ...current,
          targetAccountId: "",
          direction: "IN",
          sourceType: "MANUAL",
          category: "GENERAL_INCOME",
          amount: "",
          title: "",
          note: "",
          counterpartyName: "",
        }));
        setMessage(labels.createSuccess);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : labels.createFailed);
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
        <form action={`/${locale}/admin/finance/transactions`} className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Input type="search" name="search" defaultValue={initialSearch} placeholder={labels.search} />
          <select name="accountId" defaultValue={initialAccountId} className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700">
            <option value="">{labels.account}</option>
            {accountOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={buildFilterHref(locale, "all", initialSearch, initialAccountId)} className={`rounded-full px-3 py-2 text-sm ${initialDirection === "all" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.allDirections}</Link>
          <Link href={buildFilterHref(locale, "IN", initialSearch, initialAccountId)} className={`rounded-full px-3 py-2 text-sm ${initialDirection === "IN" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.incoming}</Link>
          <Link href={buildFilterHref(locale, "OUT", initialSearch, initialAccountId)} className={`rounded-full px-3 py-2 text-sm ${initialDirection === "OUT" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.outgoing}</Link>
          <Link href={buildFilterHref(locale, "TRANSFER", initialSearch, initialAccountId)} className={`rounded-full px-3 py-2 text-sm ${initialDirection === "TRANSFER" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.transfer}</Link>
        </div>
      </section>

      {message ? <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">{message}</section> : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{labels.totalIncoming}</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-950">{formatMoney(result.summary.totalIncoming, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">{labels.totalOutgoing}</p>
          <p className="mt-3 text-2xl font-semibold text-rose-950">{formatMoney(result.summary.totalOutgoing, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{labels.netAmount}</p>
          <p className="mt-3 text-2xl font-semibold text-blue-950">{formatMoney(result.summary.netAmount, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.transactionCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.transactionCount}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-950">{labels.createTitle}</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            value={form.accountId}
            onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value }))}
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
          >
            <option value="">{labels.account}</option>
            {accountOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          <select
            value={form.direction}
            onChange={(event) => {
              const nextDirection = event.target.value as AdminCashTransactionDirection;
              setForm((current) => ({
                ...current,
                direction: nextDirection,
                sourceType: nextDirection === "TRANSFER" ? "TRANSFER" : nextDirection === "OUT" ? current.sourceType : "MANUAL",
                category:
                  nextDirection === "TRANSFER"
                    ? "TRANSFER"
                    : nextDirection === "IN"
                      ? "GENERAL_INCOME"
                      : current.sourceType === "REFUND"
                        ? "REFUND"
                        : "GENERAL_EXPENSE",
              }));
            }}
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
          >
            <option value="IN">{labels.incoming}</option>
            <option value="OUT">{labels.outgoing}</option>
            <option value="TRANSFER">{labels.transfer}</option>
          </select>
          <select
            value={form.sourceType}
            onChange={(event) => {
              const nextSourceType = event.target.value as AdminCashTransactionSourceType;
              setForm((current) => ({
                ...current,
                sourceType: nextSourceType,
                category:
                  nextSourceType === "REFUND"
                    ? "REFUND"
                    : nextSourceType === "TRANSFER"
                      ? "TRANSFER"
                      : current.direction === "IN"
                        ? "GENERAL_INCOME"
                        : current.category === "REFUND"
                          ? "GENERAL_EXPENSE"
                          : current.category,
              }));
            }}
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
          >
            <option value="MANUAL">{labels.sourceType}</option>
            <option value="REFUND">{labels.refund}</option>
            <option value="TRANSFER">{labels.transfer}</option>
          </select>
          {form.direction === "OUT" ? (
            <select
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as AdminCashTransactionCategory }))}
              className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
            >
              <option value="GENERAL_EXPENSE">{labels.category}</option>
              <option value="MARKETPLACE_COMMISSION">Pazaryeri komisyonu</option>
              <option value="SHIPPING_EXPENSE">Kargo gideri</option>
              <option value="SERVICE_FEE">Hizmet bedeli</option>
              <option value="REFUND">{labels.refund}</option>
            </select>
          ) : null}
          {form.direction === "TRANSFER" ? (
            <select
              value={form.targetAccountId}
              onChange={(event) => setForm((current) => ({ ...current, targetAccountId: event.target.value }))}
              className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
            >
              <option value="">{labels.targetAccount}</option>
              {accountOptions
                .filter((option) => option.id !== form.accountId)
                .map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
            </select>
          ) : null}
          <Input type="number" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder={labels.amount} />
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={labels.titleField} />
          <Input value={form.counterpartyName} onChange={(event) => setForm((current) => ({ ...current, counterpartyName: event.target.value }))} placeholder={labels.counterparty} />
          <Input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder={labels.note} />
        </div>
        <button
          type="button"
          onClick={submitTransaction}
          disabled={isPending}
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? labels.creatingAction : labels.createAction}
        </button>
      </section>

      <section className="grid gap-3">
        {result.items.length === 0 ? (
          <article className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            {labels.empty}
          </article>
        ) : result.items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-neutral-950">{item.title}</h2>
                <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-6">
                  <p>{labels.account}: {item.accountName}</p>
                  <p>{labels.amount}: {formatMoney(item.amount, item.currency)}</p>
                  <p>{labels.transactionDate}: {formatDate(item.transactionAt)}</p>
                  <p>{labels.sourceType}: {item.sourceType === "REFUND" ? labels.refund : item.sourceType === "TRANSFER" ? labels.transfer : labels.sourceType}</p>
                  <p>{labels.counterparty}: {item.counterpartyName ?? "-"}</p>
                  <p>{labels.note}: {item.note ?? "-"}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
