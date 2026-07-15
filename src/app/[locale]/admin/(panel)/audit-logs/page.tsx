import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

type AuditLogsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; entityType?: string; action?: string; startDate?: string; endDate?: string; page?: string }>;
};

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getEntityBadgeClass(entityType: string) {
  switch (entityType) {
    case "PRODUCT":
      return "bg-emerald-100 text-emerald-700";
    case "USER":
      return "bg-sky-100 text-sky-700";
    case "CATEGORY":
      return "bg-violet-100 text-violet-700";
    case "CUSTOMER_ACCOUNT":
      return "bg-teal-100 text-teal-700";
    case "ORDER":
      return "bg-amber-100 text-amber-700";
    case "WAREHOUSE":
      return "bg-cyan-100 text-cyan-700";
    case "STOREFRONT_ITEM":
      return "bg-fuchsia-100 text-fuchsia-700";
    default:
      return "bg-neutral-200 text-neutral-700";
  }
}

function getEntityTypeLabel(entityType: string) {
  switch (entityType) {
    case "PRODUCT":
      return "Ürün";
    case "USER":
      return "Kullanıcı";
    case "CATEGORY":
      return "Kategori";
    case "CUSTOMER_ACCOUNT":
      return "Cari Müşteri Kartı";
    case "ORDER":
      return "Sipariş";
    case "WAREHOUSE":
      return "Depo";
    case "STOREFRONT_ITEM":
      return "Mağaza İçeriği";
    case "AUTH":
      return "Oturum";
    default:
      return entityType;
  }
}

function getActionBadgeClass(action: string) {
  switch (action) {
    case "CREATE":
      return "bg-emerald-100 text-emerald-700";
    case "UPDATE":
      return "bg-sky-100 text-sky-700";
    case "DELETE":
      return "bg-rose-100 text-rose-700";
    case "STATUS_UPDATE":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-neutral-200 text-neutral-700";
  }
}

function getActionLabel(action: string) {
  switch (action) {
    case "CREATE":
      return "Oluşturma";
    case "UPDATE":
      return "Güncelleme";
    case "DELETE":
      return "Silme";
    case "STATUS_UPDATE":
      return "Durum Güncelleme";
    case "LOGIN":
      return "Giriş";
    case "LOGOUT":
      return "Çıkış";
    default:
      return action;
  }
}

function formatAuditSummary(summary: string | null, fallback: string) {
  if (!summary) {
    return fallback;
  }

  const replacements: Array<[RegExp, string]> = [
    [/^Product created:\s*/i, "Ürün oluşturuldu: "],
    [/^Product updated:\s*/i, "Ürün güncellendi: "],
    [/^Product image uploaded:\s*/i, "Ürün görseli yüklendi: "],
    [/^Product soft-deleted$/i, "Ürün silindi"],
    [/^User created:\s*/i, "Kullanıcı oluşturuldu: "],
    [/^User updated:\s*/i, "Kullanıcı güncellendi: "],
    [/^User soft-deleted$/i, "Kullanıcı silindi"],
    [/^Category created:\s*/i, "Kategori oluşturuldu: "],
    [/^Category updated:\s*/i, "Kategori güncellendi: "],
    [/^Category soft-deleted$/i, "Kategori silindi"],
    [/^Warehouse created:\s*/i, "Depo oluşturuldu: "],
    [/^Warehouse updated:\s*/i, "Depo güncellendi: "],
    [/^Order status updated:\s*/i, "Sipariş durumu güncellendi: "],
    [/^Order soft-deleted$/i, "Sipariş silindi"],
    [/^Storefront item created:\s*/i, "Mağaza içeriği oluşturuldu: "],
    [/^Storefront item updated:\s*/i, "Mağaza içeriği güncellendi: "],
    [/^Storefront item soft-deleted$/i, "Mağaza içeriği silindi"],
    [/^Product question answered:\s*/i, "Ürün sorusu yanıtlandı: "],
    [/^Product question moderated and removed$/i, "Ürün sorusu moderasyon ile kaldırıldı"],
    [/^Stock count created:\s*/i, "Stok sayımı oluşturuldu: "],
    [/^Stock count applied:\s*/i, "Stok sayımı uygulandı: "],
    [/^Stock count line updated$/i, "Stok sayım satırı güncellendi"],
    [/^Stock in applied for\s*/i, "Stok girişi uygulandı: "],
    [/^Stock out applied for\s*/i, "Stok çıkışı uygulandı: "],
    [/^Inventory transfer applied for\s*/i, "Stok transferi uygulandı: "],
    [/^Manual stock adjustment applied for\s*/i, "Manuel stok düzeltmesi uygulandı: "],
    [/^Bulk inventory adjustment processed:\s*/i, "Toplu stok düzeltmesi işlendi: "],
    [/^Bulk preferred warehouse assignment processed:\s*/i, "Toplu tercih edilen depo ataması işlendi: "],
    [/^Bulk stock count line update processed:\s*/i, "Toplu stok sayım satırı güncellemesi işlendi: "],
    [/^Bulk answer for product questions:\s*/i, "Ürün sorularına toplu yanıt verildi: "],
    [/^Bulk remove product questions:\s*/i, "Ürün soruları toplu kaldırıldı: "],
  ];

  let localized = summary;
  for (const [pattern, replacement] of replacements) {
    localized = localized.replace(pattern, replacement);
  }

  return localized;
}

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined) {
    return "Belirtilmedi";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
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
      query.entityType === "CUSTOMER_ACCOUNT" ||
      query.entityType === "CATEGORY" ||
      query.entityType === "ORDER" ||
      query.entityType === "WAREHOUSE" ||
      query.entityType === "STOREFRONT_ITEM" ||
      query.entityType === "AUTH"
        ? query.entityType
        : undefined,
    action:
      query.action === "CREATE" ||
      query.action === "UPDATE" ||
      query.action === "DELETE" ||
      query.action === "STATUS_UPDATE" ||
      query.action === "LOGIN" ||
      query.action === "LOGOUT"
        ? query.action
        : undefined,
    startDate: query.startDate,
    endDate: query.endDate,
    page: query.page ? Number(query.page) : 1,
    pageSize: 20,
  });

  const prevPage = result.page > 1 ? result.page - 1 : null;
  const nextPage = result.page < result.totalPages ? result.page + 1 : null;
  const createCount = result.items.filter((item) => item.action === "CREATE").length;
  const updateCount = result.items.filter((item) => item.action === "UPDATE").length;
  const deleteCount = result.items.filter((item) => item.action === "DELETE").length;

  function getPageHref(page: number) {
    const params = new URLSearchParams();
    if (query.search) {
      params.set("search", query.search);
    }

    if (query.entityType) {
      params.set("entityType", query.entityType);
    }

    if (query.action) {
      params.set("action", query.action);
    }

    if (query.startDate) {
      params.set("startDate", query.startDate);
    }

    if (query.endDate) {
      params.set("endDate", query.endDate);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const qs = params.toString();
    return qs ? `/${locale}/admin/audit-logs?${qs}` : `/${locale}/admin/audit-logs`;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white shadow-sm">
      <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.12),_transparent_55%),radial-gradient(circle_at_left,_rgba(245,158,11,0.12),_transparent_45%),linear-gradient(135deg,white,rgba(250,250,250,0.96))] p-6">
        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{dictionary.admin.auditLogMenu}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{dictionary.admin.auditLogTitle}</h2>
          <p className="mt-2 text-sm text-neutral-600">{result.total} {dictionary.admin.auditLogCount}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Toplam</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">{result.total}</p>
            </article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Oluşturma</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700">{createCount}</p>
            </article>
            <article className="rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Güncelleme</p>
              <p className="mt-2 text-lg font-semibold text-sky-700">{updateCount}</p>
            </article>
            <article className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Silme</p>
              <p className="mt-2 text-lg font-semibold text-rose-700">{deleteCount}</p>
            </article>
          </div>
        </div>
      </div>

      <div className="border-b border-neutral-200 bg-white/95 p-5">
        <form className="grid gap-3 lg:grid-cols-[1.4fr_220px_220px_180px_180px_auto]">
          <Input
            type="search"
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="Kayıt, ürün, kullanıcı veya özet ara"
          />
          <Select name="entityType" defaultValue={query.entityType ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm varlıklar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm varlıklar</SelectItem>
              <SelectItem value="PRODUCT">Ürün</SelectItem>
              <SelectItem value="USER">Kullanıcı</SelectItem>
              <SelectItem value="CUSTOMER_ACCOUNT">Cari Müşteri Kartı</SelectItem>
              <SelectItem value="CATEGORY">Kategori</SelectItem>
              <SelectItem value="ORDER">Sipariş</SelectItem>
              <SelectItem value="WAREHOUSE">Depo</SelectItem>
              <SelectItem value="STOREFRONT_ITEM">Mağaza İçeriği</SelectItem>
              <SelectItem value="AUTH">Oturum</SelectItem>
            </SelectContent>
          </Select>
          <Select name="action" defaultValue={query.action ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm aksiyonlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm aksiyonlar</SelectItem>
              <SelectItem value="CREATE">Oluşturma</SelectItem>
              <SelectItem value="UPDATE">Güncelleme</SelectItem>
              <SelectItem value="DELETE">Silme</SelectItem>
              <SelectItem value="STATUS_UPDATE">Durum Güncelleme</SelectItem>
              <SelectItem value="LOGIN">Giriş</SelectItem>
              <SelectItem value="LOGOUT">Çıkış</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            name="startDate"
            defaultValue={query.startDate ?? ""}
          />
          <Input
            type="date"
            name="endDate"
            defaultValue={query.endDate ?? ""}
          />
          <Button type="submit">
            Filtrele
          </Button>
        </form>
      </div>

      <div className="p-5">
        {result.items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            {dictionary.admin.auditEmpty}
          </div>
        ) : (
          <div className="space-y-3">
            {result.items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50/60">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getEntityBadgeClass(item.entityType)}>
                        {getEntityTypeLabel(item.entityType)}
                      </Badge>
                      <Badge className={getActionBadgeClass(item.action)}>
                        {getActionLabel(item.action)}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-neutral-950">{item.entityLabel}</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {formatAuditSummary(item.summary, dictionary.common.notSpecified)}
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 lg:min-w-[280px]">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.auditActor}</p>
                      <p className="mt-1 font-medium text-neutral-900">{item.actorLabel ?? dictionary.common.notSpecified}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{dictionary.admin.auditDate}</p>
                      <p className="mt-1 font-medium text-neutral-900">{formatDate(item.createdAt, locale as Locale)}</p>
                    </div>
                  </div>
                </div>

                <details className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-3">
                  <summary className="cursor-pointer list-none text-sm font-medium text-neutral-700 marker:hidden">
                    Detayı göster
                  </summary>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Varlık tipi</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">{getEntityTypeLabel(item.entityType)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Aksiyon tipi</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">{getActionLabel(item.action)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Varlık</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">{item.entityLabel}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">İşlemi yapan</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">{item.actorLabel ?? dictionary.common.notSpecified}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Ek veri</p>
                      {item.metadata && Object.keys(item.metadata).length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {Object.entries(item.metadata).map(([key, value]) => (
                            <div key={key} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{key}</p>
                              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-xs text-neutral-700">
                                {formatMetadataValue(value)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-neutral-500">Bu kayıt için ek veri bulunmuyor.</p>
                      )}
                    </div>
                  </div>

                  <details className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-3">
                    <summary className="cursor-pointer list-none text-sm font-medium text-neutral-600 marker:hidden">
                      Geliştirici detayı
                    </summary>
                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Varlık kimliği</p>
                        <p className="mt-1 break-all text-xs text-neutral-700">{item.entityId ?? dictionary.common.notSpecified}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Kayıt kimliği</p>
                        <p className="mt-1 break-all text-xs text-neutral-700">{item.id}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Kullanıcı kimliği</p>
                        <p className="mt-1 break-all text-xs text-neutral-700">{item.actorUserId ?? dictionary.common.notSpecified}</p>
                      </div>
                    </div>
                  </details>
                </details>
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
