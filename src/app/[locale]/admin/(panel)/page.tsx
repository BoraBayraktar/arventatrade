import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { commerceService } from "@/modules/commerce/services/commerce.service";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const [productSummary, categorySummary, orderSummary, topInteractions] = await Promise.all([
    catalogAdminService.listProducts({ page: 1, pageSize: 1 }),
    catalogAdminService.listCategories({ page: 1, pageSize: 1 }),
    commerceService.getOrderSummary(),
    catalogAdminService.listTopProductInteractions(6),
  ]);

  return (
    <>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardMenu}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{dictionary.admin.dashboardTitle}</h2>
        <p className="mt-1 text-sm text-neutral-500">{dictionary.admin.dashboardSubtitle}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <article className="rounded-xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardTotalProducts}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">{productSummary.total}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardTotalCategories}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">{categorySummary.total}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardTrackedProducts}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">{topInteractions.length}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardTotalOrders}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">{orderSummary.totalOrders}</p>
            <p className="mt-1 text-sm text-neutral-500">{new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", { style: "currency", currency: orderSummary.currency }).format(orderSummary.totalRevenue)}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardPaidOrders}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">{orderSummary.paidOrders}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardPendingPayments}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">{orderSummary.pendingPayments}</p>
            <p className="mt-1 text-sm text-neutral-500">{new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", { style: "currency", currency: orderSummary.currency }).format(orderSummary.totalDiscount)}</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{dictionary.admin.dashboardTopInteractions}</h3>
          <Link href={`/${locale}/admin/products`} className="text-sm font-medium text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline">
            {dictionary.admin.productManager}
          </Link>
        </div>

        {topInteractions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">{dictionary.admin.dashboardNoInteractions}</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topInteractions.map((item) => (
              <article key={item.productId} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="line-clamp-1 font-medium text-neutral-950">{item.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">/{item.slug}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.dashboardInteractionCount}</p>
                <p className="mt-1 text-xl font-semibold text-neutral-950">{item.viewCount}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
