import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

type AuditLogsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; entityType?: string; page?: string }>;
};

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminAuditLogsPage({ params, searchParams }: AuditLogsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const user = await getCurrentUserFromContext();
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  if (user.role !== "ADMIN") {
    redirect(`/${locale}/admin`);
  }

  const query = await searchParams;
  const result = await auditLogService.list({
    search: query.search,
    entityType:
      query.entityType === "USER" ||
      query.entityType === "PRODUCT" ||
      query.entityType === "CATEGORY" ||
      query.entityType === "ORDER" ||
      query.entityType === "STOREFRONT_ITEM" ||
      query.entityType === "AUTH"
        ? query.entityType
        : undefined,
    page: query.page ? Number(query.page) : 1,
    pageSize: 20,
  });

  const prevPage = result.page > 1 ? result.page - 1 : null;
  const nextPage = result.page < result.totalPages ? result.page + 1 : null;

  function getPageHref(page: number) {
    const params = new URLSearchParams();
    if (query.search) {
      params.set("search", query.search);
    }

    if (query.entityType) {
      params.set("entityType", query.entityType);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const qs = params.toString();
    return qs ? `/${locale}/admin/audit-logs?${qs}` : `/${locale}/admin/audit-logs`;
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-neutral-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.auditLogMenu}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">{dictionary.admin.auditLogTitle}</h2>
        <p className="text-sm text-neutral-500">{result.total} {dictionary.admin.auditLogCount}</p>
      </div>

      <div className="overflow-hidden rounded-b-2xl">
        <div className="hidden grid-cols-[180px_120px_160px_1fr_200px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
          <span>{dictionary.admin.auditEntity}</span>
          <span>{dictionary.admin.auditAction}</span>
          <span>{dictionary.admin.auditActor}</span>
          <span>{dictionary.admin.auditSummary}</span>
          <span>{dictionary.admin.auditDate}</span>
        </div>

        {result.items.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">{dictionary.admin.auditEmpty}</p>
        ) : (
          <div className="divide-y divide-neutral-200">
            {result.items.map((item) => (
              <article key={item.id} className="grid gap-3 p-4 lg:grid-cols-[180px_120px_160px_1fr_200px] lg:items-center">
                <p className="text-sm font-semibold text-neutral-900">{item.entityType}{item.entityId ? ` / ${item.entityId}` : ""}</p>
                <p className="text-xs font-semibold uppercase text-neutral-700">{item.action}</p>
                <p className="text-sm text-neutral-700">{item.actorUserId ?? dictionary.common.notSpecified}</p>
                <p className="text-sm text-neutral-600">{item.summary ?? dictionary.common.notSpecified}</p>
                <p className="text-sm text-neutral-500">{formatDate(item.createdAt, locale as Locale)}</p>
              </article>
            ))}
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
