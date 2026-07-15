"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import type { AdminFinancialAccountsResult, AdminFinancialAccountType } from "@/modules/finance/contracts/financial-accounts.contract";

type Labels = {
  title: string;
  description: string;
  search: string;
  allTypes: string;
  cash: string;
  bank: string;
  totalBalance: string;
  activeAccountCount: string;
  cashAccountCount: string;
  bankAccountCount: string;
  openingBalance: string;
  currentBalance: string;
  transactionCount: string;
  accountType: string;
  openDetail: string;
  createTitle: string;
  name: string;
  note: string;
  createAction: string;
  creatingAction: string;
  createSuccess: string;
  createFailed: string;
  empty: string;
  emptyHint: string;
};

type Props = {
  locale: string;
  result: AdminFinancialAccountsResult;
  initialSearch: string;
  initialType: "all" | AdminFinancialAccountType;
  labels: Labels;
};

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildTypeHref(locale: string, type: "all" | AdminFinancialAccountType, search: string) {
  const params = new URLSearchParams();
  if (type !== "all") {
    params.set("type", type);
  }
  if (search.trim()) {
    params.set("search", search.trim());
  }
  const query = params.toString();
  return query ? `/${locale}/admin/finance/bank-cash?${query}` : `/${locale}/admin/finance/bank-cash`;
}

export function FinancialAccountsManager({ locale, result, initialSearch, initialType, labels }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "CASH" as AdminFinancialAccountType,
    openingBalance: "0",
    note: "",
  });

  function submitAccount() {
    startTransition(async () => {
      setMessage(null);

      try {
        const response = await fetch("/api/admin/finance/financial-accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            openingBalance: Number(form.openingBalance || "0"),
            note: form.note.trim() || null,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { message?: string } | null;
          throw new Error(payload?.message ?? labels.createFailed);
        }

        setForm({
          name: "",
          type: "CASH",
          openingBalance: "0",
          note: "",
        });
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
        <form action={`/${locale}/admin/finance/bank-cash`} className="mt-4">
          <Input type="search" name="search" defaultValue={initialSearch} placeholder={labels.search} />
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={buildTypeHref(locale, "all", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialType === "all" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.allTypes}</Link>
          <Link href={buildTypeHref(locale, "CASH", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialType === "CASH" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.cash}</Link>
          <Link href={buildTypeHref(locale, "BANK", initialSearch)} className={`rounded-full px-3 py-2 text-sm ${initialType === "BANK" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700"}`}>{labels.bank}</Link>
        </div>
      </section>

      {message ? <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">{message}</section> : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{labels.totalBalance}</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-950">{formatMoney(result.summary.totalBalance, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.activeAccountCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.activeAccountCount}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.cashAccountCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.cashAccountCount}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.bankAccountCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.bankAccountCount}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-950">{labels.createTitle}</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={labels.name} />
          <select
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as AdminFinancialAccountType }))}
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
          >
            <option value="CASH">{labels.cash}</option>
            <option value="BANK">{labels.bank}</option>
          </select>
          <Input
            type="number"
            step="0.01"
            value={form.openingBalance}
            onChange={(event) => setForm((current) => ({ ...current, openingBalance: event.target.value }))}
            placeholder={labels.openingBalance}
          />
          <Input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder={labels.note} />
        </div>
        <button
          type="button"
          onClick={submitAccount}
          disabled={isPending}
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? labels.creatingAction : labels.createAction}
        </button>
      </section>

      <section className="grid gap-3">
        {result.items.length === 0 ? (
          <article className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-900">{labels.empty}</p>
            <p className="mt-2 text-sm text-neutral-500">{labels.emptyHint}</p>
          </article>
        ) : result.items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-neutral-950">{item.name}</h2>
                <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-5">
                  <p>{labels.accountType}: {item.type === "CASH" ? labels.cash : labels.bank}</p>
                  <p>{labels.openingBalance}: {formatMoney(item.openingBalance, item.currency)}</p>
                  <p>{labels.currentBalance}: {formatMoney(item.currentBalance, item.currency)}</p>
                  <p>{labels.transactionCount}: {item.transactionCount}</p>
                  <p>{labels.note}: {item.note ?? "-"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/${locale}/admin/finance/bank-cash/${item.id}`} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
                  {labels.openDetail}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
