"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  cancel: string;
  action: string;
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "CASH" as AdminFinancialAccountType,
    openingBalance: "0",
    note: "",
  });

  function openCreateDrawer() {
    setMessage(null);
    setForm({
      name: "",
      type: "CASH",
      openingBalance: "0",
      note: "",
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (isPending) {
      return;
    }

    setDrawerOpen(false);
  }

  function submitAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        setDrawerOpen(false);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : labels.createFailed);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{labels.title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{labels.description}</p>
        </div>
        <Button type="button" onClick={openCreateDrawer}>
          {labels.createTitle}
        </Button>
      </div>

      <div className="p-5">
        <form action={`/${locale}/admin/finance/bank-cash`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Input type="search" name="search" defaultValue={initialSearch} placeholder={labels.search} />
          <Button type="submit" variant="secondary">
            {labels.search}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={buildTypeHref(locale, "all", initialSearch)} className={`rounded-full px-3 py-2 text-sm font-medium no-underline transition-colors ${initialType === "all" ? "bg-neutral-950 !text-white hover:!text-white" : "bg-neutral-100 text-neutral-700 hover:text-neutral-950"}`}>{labels.allTypes}</Link>
          <Link href={buildTypeHref(locale, "CASH", initialSearch)} className={`rounded-full px-3 py-2 text-sm font-medium no-underline transition-colors ${initialType === "CASH" ? "bg-neutral-950 !text-white hover:!text-white" : "bg-neutral-100 text-neutral-700 hover:text-neutral-950"}`}>{labels.cash}</Link>
          <Link href={buildTypeHref(locale, "BANK", initialSearch)} className={`rounded-full px-3 py-2 text-sm font-medium no-underline transition-colors ${initialType === "BANK" ? "bg-neutral-950 !text-white hover:!text-white" : "bg-neutral-100 text-neutral-700 hover:text-neutral-950"}`}>{labels.bank}</Link>
        </div>

        {message ? <p className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">{message}</p> : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{labels.totalBalance}</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-950">{formatMoney(result.summary.totalBalance, result.summary.currency)}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.activeAccountCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.activeAccountCount}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.cashAccountCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.cashAccountCount}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.bankAccountCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{result.summary.bankAccountCount}</p>
        </article>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200">
        <div className="hidden grid-cols-[1.2fr_120px_170px_170px_150px_1fr_120px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
          <span>{labels.name}</span>
          <span>{labels.accountType}</span>
          <span>{labels.openingBalance}</span>
          <span>{labels.currentBalance}</span>
          <span>{labels.transactionCount}</span>
          <span>{labels.note}</span>
          <span className="text-right">{labels.action}</span>
        </div>
        {result.items.length === 0 ? (
          <div className="p-6">
            <p className="text-sm font-medium text-neutral-900">{labels.empty}</p>
            <p className="mt-2 text-sm text-neutral-500">{labels.emptyHint}</p>
          </div>
        ) : result.items.map((item) => (
          <article key={item.id} className="grid gap-4 border-b border-neutral-200 p-4 last:border-b-0 lg:grid-cols-[1.2fr_120px_170px_170px_150px_1fr_120px] lg:items-center">
            <div>
              <h3 className="font-medium text-neutral-950">{item.name}</h3>
              <p className="mt-1 text-sm text-neutral-500 lg:hidden">{item.type === "CASH" ? labels.cash : labels.bank}</p>
            </div>
            <p className="text-sm text-neutral-500">{item.type === "CASH" ? labels.cash : labels.bank}</p>
            <p className="text-sm text-neutral-500">{formatMoney(item.openingBalance, item.currency)}</p>
            <p className="text-sm font-medium text-neutral-950">{formatMoney(item.currentBalance, item.currency)}</p>
            <p className="text-sm text-neutral-500">{item.transactionCount}</p>
            <p className="text-sm text-neutral-500">{item.note ?? "-"}</p>
            <div className="flex justify-start lg:justify-end">
              <Link href={`/${locale}/admin/finance/bank-cash/${item.id}`} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
                {labels.openDetail}
              </Link>
            </div>
          </article>
        ))}
      </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{labels.createTitle}</h3>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={closeDrawer} disabled={isPending}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form className="grid gap-4 p-5" onSubmit={submitAccount}>
              <div className="grid gap-2">
                <Label>{labels.name}</Label>
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div className="grid gap-2">
                <Label>{labels.accountType}</Label>
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as AdminFinancialAccountType }))}
                  className="h-10 rounded-xl border border-neutral-300 px-3 text-sm text-neutral-700"
                >
                  <option value="CASH">{labels.cash}</option>
                  <option value="BANK">{labels.bank}</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>{labels.openingBalance}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.openingBalance}
                  onChange={(event) => setForm((current) => ({ ...current, openingBalance: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>{labels.note}</Label>
                <Input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={closeDrawer} disabled={isPending}>
                  {labels.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? labels.creatingAction : labels.createAction}
                </Button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
