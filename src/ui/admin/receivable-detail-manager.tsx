import Link from "next/link";

import type { AdminReceivableDetail } from "@/modules/finance/contracts/receivables.contract";

type Labels = {
  title: string;
  description: string;
  paymentStatus: string;
  totalAmount: string;
  itemCount: string;
  orderDate: string;
  latestDocument: string;
  backToList: string;
  openOrder: string;
  notSpecified: string;
};

type Props = {
  locale: string;
  item: AdminReceivableDetail;
  labels: Labels;
};

export function ReceivableDetailManager({ locale, item, labels }: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-neutral-950">{item.orderNumber}</h1>
            <p className="text-sm text-neutral-600">{labels.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${locale}/admin/finance/receivables`} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
              {labels.backToList}
            </Link>
            <Link href={`/${locale}/admin/orders/${item.orderId}`} className="inline-flex h-10 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700">
              {labels.openOrder}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{labels.totalAmount}</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-950">{item.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.paymentStatus}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{item.paymentStatus}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.itemCount}</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-950">{item.itemCount}</p>
        </article>
        <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.orderDate}</p>
          <p className="mt-3 text-sm font-semibold text-neutral-950">{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">{labels.title}</h2>
        <div className="mt-4 grid gap-2 text-sm text-neutral-700 md:grid-cols-2">
          <p>{labels.paymentStatus}: {item.paymentStatus}</p>
          <p>{labels.totalAmount}: {item.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}</p>
          <p>{labels.itemCount}: {item.itemCount}</p>
          <p>{labels.latestDocument}: {item.latestDocument?.documentNumber ?? labels.notSpecified}</p>
          <p>{labels.orderDate}: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p>
          <p>{labels.title}: {item.counterpartyName}</p>
        </div>
      </section>
    </div>
  );
}
