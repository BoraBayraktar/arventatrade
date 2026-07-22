import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { commerceService } from "@/modules/commerce/services/commerce.service";

type OrdersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; status?: string; paymentStatus?: string; page?: string }>;
};

function formatMoney(value: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRestockStatus(value: "NOT_RESTOCKED" | "RESTOCKED" | "PARTIALLY_RESTOCKED", dictionary: ReturnType<typeof getDictionary>) {
  switch (value) {
    case "RESTOCKED":
      return dictionary.admin.inventoryMovementRestockDone;
    case "PARTIALLY_RESTOCKED":
      return dictionary.admin.inventoryMovementRestockPartial;
    default:
      return dictionary.admin.inventoryMovementRestockNone;
  }
}

function formatLastRestockedAt(value: string | null, locale: Locale, dictionary: ReturnType<typeof getDictionary>) {
  if (!value) {
    return dictionary.common.notSpecified;
  }

  return formatDate(value, locale);
}

function formatPaymentStatus(value: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED") {
  if (value === "AUTHORIZED") {
    return "Provizyonlu";
  }

  if (value === "PAID") {
    return "Ödendi";
  }

  if (value === "FAILED") {
    return "Başarısız ödeme";
  }

  if (value === "REFUNDED") {
    return "İade edildi";
  }

  return "Bekleyen ödeme";
}

export default async function AdminOrdersPage({ params, searchParams }: OrdersPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const query = await searchParams;
  const result = await commerceService.listOrders({
    search: query.search,
    status: query.status === "CONFIRMED" || query.status === "CANCELLED" ? query.status : undefined,
    paymentStatus: query.paymentStatus === "PENDING" || query.paymentStatus === "AUTHORIZED" || query.paymentStatus === "PAID" || query.paymentStatus === "FAILED" || query.paymentStatus === "REFUNDED" ? query.paymentStatus : undefined,
    page: query.page ? Number(query.page) : 1,
    pageSize: 10,
  });

  const prevPage = result.page > 1 ? result.page - 1 : null;
  const nextPage = result.page < result.totalPages ? result.page + 1 : null;

  function getPageHref(page: number) {
    const params = new URLSearchParams();
    if (query.search) {
      params.set("search", query.search);
    }
    if (query.status) {
      params.set("status", query.status);
    }
    if (query.paymentStatus) {
      params.set("paymentStatus", query.paymentStatus);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `/${locale}/admin/orders?${qs}` : `/${locale}/admin/orders`;
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-neutral-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.orderManager}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">{dictionary.admin.orderList}</h2>
        <p className="text-sm text-neutral-500">{result.total} {dictionary.admin.orderCountLabel}</p>
      </div>

      <div className="rounded-b-2xl">
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.7fr)_minmax(0,0.75fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.4fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(0,0.55fr)] gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
          <span className="min-w-0 break-words">{dictionary.admin.orderNumber}</span>
          <span className="min-w-0 break-words">{dictionary.admin.customerAccountsTitle}</span>
          <span className="min-w-0 break-words">{dictionary.admin.orderStatus}</span>
          <span className="min-w-0 break-words">{dictionary.admin.paymentStatus}</span>
          <span className="min-w-0 break-words">{dictionary.admin.inventoryRestockStatus}</span>
          <span className="min-w-0 break-words">{dictionary.admin.inventoryLastRestockedAt}</span>
          <span className="min-w-0 break-words">{dictionary.admin.orderItems}</span>
          <span className="min-w-0 break-words">{dictionary.admin.orderSubtotal}</span>
          <span className="min-w-0 break-words">{dictionary.admin.orderTotal}</span>
          <span className="min-w-0 break-words">{dictionary.admin.orderDate}</span>
          <span className="min-w-0 break-words">Detay</span>
        </div>

        {result.items.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">{dictionary.admin.emptyOrders}</p>
        ) : (
          <div>
            <div className="divide-y divide-neutral-200">
              {result.items.map((item) => (
                <article key={item.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.7fr)_minmax(0,0.75fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.4fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(0,0.55fr)] lg:items-center lg:gap-3">
                  <p className="min-w-0 font-medium text-neutral-950">
                    <Link href={`/${locale}/admin/orders/${item.id}`} className="break-words underline-offset-4 hover:underline">
                      {item.orderNumber}
                    </Link>
                  </p>
                  <p className="min-w-0 break-words text-sm text-neutral-700">{item.customerAccountName ?? "Cari kart bağlanmadı"}</p>
                  <p className="min-w-0">
                    <span className={`inline-flex max-w-full whitespace-normal break-words rounded-full px-2 py-1 text-xs font-semibold ${item.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"}`}>
                      {item.status === "CONFIRMED" ? dictionary.admin.orderStatusConfirmed : dictionary.admin.orderStatusCancelled}
                    </span>
                  </p>
                  <p className="min-w-0">
                    <span className="inline-flex max-w-full whitespace-normal break-words rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {formatPaymentStatus(item.paymentStatus)}
                    </span>
                  </p>
                  <p className="min-w-0">
                    <span className={`inline-flex max-w-full whitespace-normal break-words rounded-full px-2 py-1 text-xs font-semibold ${item.restockStatus === "RESTOCKED" ? "bg-emerald-100 text-emerald-700" : item.restockStatus === "PARTIALLY_RESTOCKED" ? "bg-amber-100 text-amber-700" : "bg-neutral-200 text-neutral-700"}`}>
                      {formatRestockStatus(item.restockStatus, dictionary)}
                    </span>
                  </p>
                  <p className="min-w-0 break-words text-sm text-neutral-500">{formatLastRestockedAt(item.lastRestockedAt, locale as Locale, dictionary)}</p>
                  <p className="min-w-0 break-words text-sm text-neutral-700">{item.itemCount}</p>
                  <p className="min-w-0 break-words text-sm text-neutral-700">{formatMoney(item.subtotal, item.currency, locale as Locale)}</p>
                  <p className="min-w-0 break-words text-sm font-semibold text-neutral-950">{formatMoney(item.total, item.currency, locale as Locale)}</p>
                  <p className="min-w-0 break-words text-sm text-neutral-500">{formatDate(item.createdAt, locale as Locale)}</p>
                  <p className="min-w-0">
                    <Link
                      href={`/${locale}/admin/orders/${item.id}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Detay
                    </Link>
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4">
        {prevPage ? (
          <Link href={getPageHref(prevPage)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
            {dictionary.admin.prev}
          </Link>
        ) : <span />}
        <p className="text-sm text-neutral-500">{dictionary.admin.page} {result.page}/{result.totalPages}</p>
        {nextPage ? (
          <Link href={getPageHref(nextPage)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
            {dictionary.admin.next}
          </Link>
        ) : <span />}
      </div>
    </section>
  );
}
