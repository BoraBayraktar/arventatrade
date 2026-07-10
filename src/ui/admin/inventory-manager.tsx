"use client";

import { useMemo, useState } from "react";
import { Download, Maximize2, Minimize2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Locale } from "@/lib/i18n";
import type { AdminInventoryListResult } from "@/modules/inventory/contracts/inventory.contract";

type Labels = {
  title: string;
  inventoryList: string;
  inventorySummary: string;
  totalProducts: string;
  lowStockCount: string;
  outOfStockCount: string;
  totalAvailableStock: string;
  totalReservedStock: string;
  rowsWithReservations: string;
  search: string;
  product: string;
  sku: string;
  warehouse: string;
  onHandStock: string;
  reservedStock: string;
  availableStock: string;
  stockStatus: string;
  movementType: string;
  lastMovementAt: string;
  detail: string;
  viewDetails: string;
  drawerInfo: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  page: string;
  prev: string;
  next: string;
  empty: string;
  stockFilter: string;
  reservationFilter: string;
  warehouseFilter: string;
  movementTypeFilter: string;
  all: string;
  allWarehouses: string;
  defaultWarehouse: string;
  withReservations: string;
  withoutReservations: string;
  recentMovements: string;
  noRecentMovements: string;
  viewAllHistory: string;
  movementDateRange: string;
  movementAllTime: string;
  movementLast24Hours: string;
  movementLast7Days: string;
  movementLast30Days: string;
  exportCsv: string;
  movementHistoryFilter: string;
  adjustStock: string;
  targetOnHandStock: string;
  adjustmentNote: string;
  applyAdjustment: string;
  adjustmentSaved: string;
  adjustmentFailed: string;
  inventoryMovementInitialLoad: string;
  inventoryMovementManualAdjustment: string;
  inventoryMovementPurchaseReceipt: string;
  inventoryMovementReservationHold: string;
  inventoryMovementReservationRelease: string;
  inventoryMovementOrderCommit: string;
  inventoryMovementOrderCancelRestock: string;
  inventoryMovementReturnRestock: string;
  inventoryMovementDamageWriteOff: string;
  notSpecified: string;
};

function formatDate(value: string | null, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: AdminInventoryListResult["items"][number]["stockStatus"], labels: Labels) {
  if (status === "OUT_OF_STOCK") {
    return labels.outOfStock;
  }

  if (status === "LOW_STOCK") {
    return labels.lowStock;
  }

  return labels.inStock;
}

function statusClass(status: AdminInventoryListResult["items"][number]["stockStatus"]) {
  if (status === "OUT_OF_STOCK") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "LOW_STOCK") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

function movementTypeLabel(movementType: string | null, labels: Labels) {
  if (!movementType) {
    return labels.notSpecified;
  }

  if (movementType === "INITIAL_LOAD") {
    return labels.inventoryMovementInitialLoad;
  }

  if (movementType === "MANUAL_ADJUSTMENT") {
    return labels.inventoryMovementManualAdjustment;
  }

  if (movementType === "PURCHASE_RECEIPT") {
    return labels.inventoryMovementPurchaseReceipt;
  }

  if (movementType === "RESERVATION_HOLD") {
    return labels.inventoryMovementReservationHold;
  }

  if (movementType === "RESERVATION_RELEASE") {
    return labels.inventoryMovementReservationRelease;
  }

  if (movementType === "ORDER_COMMIT") {
    return labels.inventoryMovementOrderCommit;
  }

  if (movementType === "ORDER_CANCEL_RESTOCK") {
    return labels.inventoryMovementOrderCancelRestock;
  }

  if (movementType === "RETURN_RESTOCK") {
    return labels.inventoryMovementReturnRestock;
  }

  if (movementType === "DAMAGE_WRITE_OFF") {
    return labels.inventoryMovementDamageWriteOff;
  }

  return labels.notSpecified;
}

function movementTypeClass(movementType: string | null) {
  if (movementType === "MANUAL_ADJUSTMENT") {
    return "bg-sky-100 text-sky-700";
  }

  if (movementType === "ORDER_COMMIT" || movementType === "DAMAGE_WRITE_OFF") {
    return "bg-rose-100 text-rose-700";
  }

  if (movementType === "ORDER_CANCEL_RESTOCK" || movementType === "RETURN_RESTOCK" || movementType === "PURCHASE_RECEIPT") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (movementType === "RESERVATION_HOLD" || movementType === "RESERVATION_RELEASE") {
    return "bg-amber-100 text-amber-700";
  }

  if (movementType === "INITIAL_LOAD") {
    return "bg-violet-100 text-violet-700";
  }

  return "bg-neutral-100 text-neutral-600";
}

type DrawerMode = "view" | "edit";

type Props = {
  locale: Locale;
  result: AdminInventoryListResult;
  query: {
    search: string;
    stockStatusFilter: string;
    reservationFilter: string;
    warehouseFilter: string;
    movementTypeFilter: string;
  };
  labels: Labels;
};

export function InventoryManager({ locale, result, query, labels }: Props) {
  const router = useRouter();
  const [pendingRowKey, setPendingRowKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [drawerItem, setDrawerItem] = useState<AdminInventoryListResult["items"][number] | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [drawerFullscreen, setDrawerFullscreen] = useState(false);
  const [drawerMovementFilter, setDrawerMovementFilter] = useState("all");
  const [drawerDateRange, setDrawerDateRange] = useState("all");
  const [drawerMovementPage, setDrawerMovementPage] = useState(1);
  const [drawerTargetOnHand, setDrawerTargetOnHand] = useState("");
  const [drawerNote, setDrawerNote] = useState("");

  const warehouseOptions = useMemo(() => {
    const codes = new Set<string>();

    for (const item of result.items) {
      if (item.warehouseCode) {
        codes.add(item.warehouseCode);
      }
    }

    if (query.warehouseFilter && query.warehouseFilter !== "all") {
      codes.add(query.warehouseFilter);
    }

    return ["all", ...Array.from(codes).sort((left, right) => left.localeCompare(right))];
  }, [query.warehouseFilter, result.items]);

  const movementTypeOptions = useMemo(
    () => [
      { value: "all", label: labels.all },
      { value: "INITIAL_LOAD", label: labels.inventoryMovementInitialLoad },
      { value: "MANUAL_ADJUSTMENT", label: labels.inventoryMovementManualAdjustment },
      { value: "PURCHASE_RECEIPT", label: labels.inventoryMovementPurchaseReceipt },
      { value: "RESERVATION_HOLD", label: labels.inventoryMovementReservationHold },
      { value: "RESERVATION_RELEASE", label: labels.inventoryMovementReservationRelease },
      { value: "ORDER_COMMIT", label: labels.inventoryMovementOrderCommit },
      { value: "ORDER_CANCEL_RESTOCK", label: labels.inventoryMovementOrderCancelRestock },
      { value: "RETURN_RESTOCK", label: labels.inventoryMovementReturnRestock },
      { value: "DAMAGE_WRITE_OFF", label: labels.inventoryMovementDamageWriteOff },
    ],
    [
      labels.all,
      labels.inventoryMovementDamageWriteOff,
      labels.inventoryMovementInitialLoad,
      labels.inventoryMovementManualAdjustment,
      labels.inventoryMovementOrderCancelRestock,
      labels.inventoryMovementOrderCommit,
      labels.inventoryMovementPurchaseReceipt,
      labels.inventoryMovementReservationHold,
      labels.inventoryMovementReservationRelease,
      labels.inventoryMovementReturnRestock,
    ],
  );

  const drawerMovements = useMemo(() => {
    if (!drawerItem) {
      return [];
    }

    const now = Date.now();
    const rangeStart = drawerDateRange === "24h"
      ? now - (24 * 60 * 60 * 1000)
      : drawerDateRange === "7d"
        ? now - (7 * 24 * 60 * 60 * 1000)
        : drawerDateRange === "30d"
          ? now - (30 * 24 * 60 * 60 * 1000)
          : null;

    return drawerItem.recentMovements.filter((movement) => {
      if (rangeStart && new Date(movement.createdAt).getTime() < rangeStart) {
        return false;
      }

      if (drawerMovementFilter === "all") {
        return true;
      }

      return movement.type === drawerMovementFilter;
    });
  }, [drawerDateRange, drawerItem, drawerMovementFilter]);

  const drawerMovementPageSize = 5;
  const drawerMovementTotalPages = Math.max(1, Math.ceil(drawerMovements.length / drawerMovementPageSize));
  const drawerMovementItems = drawerMovements.slice(
    (drawerMovementPage - 1) * drawerMovementPageSize,
    drawerMovementPage * drawerMovementPageSize,
  );

  function getPageHref(page: number) {
    const params = new URLSearchParams();
    if (query.search) {
      params.set("search", query.search);
    }
    if (query.stockStatusFilter && query.stockStatusFilter !== "all") {
      params.set("stockStatusFilter", query.stockStatusFilter);
    }
    if (query.reservationFilter && query.reservationFilter !== "all") {
      params.set("reservationFilter", query.reservationFilter);
    }
    if (query.warehouseFilter && query.warehouseFilter !== "all") {
      params.set("warehouseFilter", query.warehouseFilter);
    }
    if (query.movementTypeFilter && query.movementTypeFilter !== "all") {
      params.set("movementTypeFilter", query.movementTypeFilter);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `/${locale}/admin/inventory?${qs}` : `/${locale}/admin/inventory`;
  }

  const prevPage = result.page > 1 ? result.page - 1 : null;
  const nextPage = result.page < result.totalPages ? result.page + 1 : null;

  function getRowKey(item: AdminInventoryListResult["items"][number]) {
    return `${item.productId}:${item.warehouseCode ?? "NONE"}`;
  }

  function openDrawer(item: AdminInventoryListResult["items"][number], mode: DrawerMode) {
    setDrawerItem(item);
    setDrawerMode(mode);
    setDrawerFullscreen(false);
    setDrawerMovementFilter("all");
    setDrawerDateRange("all");
    setDrawerMovementPage(1);
    setDrawerTargetOnHand(String(item.onHandStock));
    setDrawerNote("");
    setFeedback(null);
  }

  function closeDrawer() {
    if (pendingRowKey) {
      return;
    }

    setDrawerItem(null);
    setDrawerMode("view");
    setDrawerFullscreen(false);
    setDrawerMovementFilter("all");
    setDrawerDateRange("all");
    setDrawerMovementPage(1);
    setDrawerTargetOnHand("");
    setDrawerNote("");
  }

  function viewAllHistoryInList() {
    if (!drawerItem) {
      return;
    }

    const params = new URLSearchParams();
    params.set("search", drawerItem.sku);

    if (drawerItem.warehouseCode) {
      params.set("warehouseFilter", drawerItem.warehouseCode);
    }

    if (drawerMovementFilter !== "all") {
      params.set("movementTypeFilter", drawerMovementFilter);
    }

    router.push(`/${locale}/admin/inventory?${params.toString()}`);
    closeDrawer();
  }

  function exportVisibleRowsCsv() {
    const exportedAt = new Date().toISOString();
    const header = [
      "productName",
      "slug",
      "sku",
      "warehouseCode",
      "onHandStock",
      "reservedStock",
      "availableStock",
      "stockStatus",
      "lastMovementType",
      "lastMovementAt",
      "recentMovements",
    ];

    const rows = result.items.map((item) => {
      const movementSummary = item.recentMovements
        .map((movement) => `${movement.type}:${movement.quantity}:${movement.note ?? ""}:${movement.createdAt}`)
        .join(" | ");

      return [
        item.name,
        item.slug,
        item.sku,
        item.warehouseCode ?? "",
        String(item.onHandStock),
        String(item.reservedStock),
        String(item.availableStock),
        item.stockStatus,
        item.lastMovementType ?? "",
        item.lastMovementAt ?? "",
        movementSummary,
      ];
    });

    const metadataRows: string[][] = [
      ["meta", "exportedAt", exportedAt],
      ["meta", "search", query.search || "all"],
      ["meta", "stockStatusFilter", query.stockStatusFilter || "all"],
      ["meta", "reservationFilter", query.reservationFilter || "all"],
      ["meta", "warehouseFilter", query.warehouseFilter || "all"],
      ["meta", "movementTypeFilter", query.movementTypeFilter || "all"],
      ["meta", "page", String(result.page)],
      ["meta", "pageSize", String(result.pageSize)],
      ["meta", "visibleRows", String(result.items.length)],
      ["meta", "totalFilteredRows", String(result.total)],
    ];

    const serializeRows = (tableRows: Array<Array<string>>) => tableRows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const allRows = [
      serializeRows(metadataRows),
      "",
      serializeRows([header, ...rows]),
    ].join("\n");

    const blob = new Blob([allRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `inventory-${exportedAt.slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function applyAdjustmentFromDrawer() {
    if (!drawerItem) {
      return;
    }

    const targetOnHandStock = Number(drawerTargetOnHand);
    if (!Number.isInteger(targetOnHandStock) || targetOnHandStock < 0) {
      setFeedback({ type: "error", message: labels.adjustmentFailed });
      return;
    }

    const rowKey = getRowKey(drawerItem);
    setPendingRowKey(rowKey);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: drawerItem.productId,
          sku: drawerItem.sku,
          warehouseCode: drawerItem.warehouseCode ?? undefined,
          targetOnHandStock,
          note: drawerNote.trim() || "Inventory manager manual adjustment",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setFeedback({ type: "error", message: payload?.message ?? labels.adjustmentFailed });
        return;
      }

      setFeedback({ type: "success", message: labels.adjustmentSaved });
      closeDrawer();
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: labels.adjustmentFailed });
    } finally {
      setPendingRowKey(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white shadow-sm">
      <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.15),_transparent_55%),radial-gradient(circle_at_left,_rgba(245,158,11,0.10),_transparent_45%)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.title}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{labels.inventoryList}</h2>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">{labels.inventorySummary}</p>
      </div>

      <div className="grid gap-4 border-b border-neutral-200 p-5 md:grid-cols-2 xl:grid-cols-6">
        <article className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalProducts}</p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">{result.summary.totalProducts}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.lowStockCount}</p>
          <p className="mt-2 text-lg font-semibold text-amber-700">{result.summary.lowStockCount}</p>
        </article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.outOfStockCount}</p>
          <p className="mt-2 text-lg font-semibold text-rose-700">{result.summary.outOfStockCount}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalAvailableStock}</p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">{result.summary.totalAvailableStock}</p>
        </article>
        <article className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalReservedStock}</p>
          <p className="mt-2 text-lg font-semibold text-cyan-700">{result.summary.totalReservedStock}</p>
        </article>
        <article className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.rowsWithReservations}</p>
          <p className="mt-2 text-lg font-semibold text-orange-700">{result.summary.rowsWithReservations}</p>
        </article>
      </div>

      <form className="border-b border-neutral-200 bg-white/90 p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto]">
          <input
            type="search"
            name="search"
            defaultValue={query.search}
            placeholder={labels.search}
            className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          />
          <select
            name="stockStatusFilter"
            defaultValue={query.stockStatusFilter}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          >
            <option value="all">{labels.stockFilter}: {labels.all}</option>
            <option value="in_stock">{labels.stockFilter}: {labels.inStock}</option>
            <option value="low_stock">{labels.stockFilter}: {labels.lowStock}</option>
            <option value="out_of_stock">{labels.stockFilter}: {labels.outOfStock}</option>
          </select>
          <select
            name="reservationFilter"
            defaultValue={query.reservationFilter}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          >
            <option value="all">{labels.reservationFilter}: {labels.all}</option>
            <option value="with_reserved">{labels.reservationFilter}: {labels.withReservations}</option>
            <option value="without_reserved">{labels.reservationFilter}: {labels.withoutReservations}</option>
          </select>
          <select
            name="warehouseFilter"
            defaultValue={query.warehouseFilter}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          >
            {warehouseOptions.map((warehouseCode) => (
              <option key={warehouseCode} value={warehouseCode}>
                {labels.warehouseFilter}: {warehouseCode === "all" ? labels.allWarehouses : warehouseCode}
              </option>
            ))}
          </select>
          <select
            name="movementTypeFilter"
            defaultValue={query.movementTypeFilter}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          >
            {movementTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{labels.movementTypeFilter}: {option.label}</option>
            ))}
          </select>
          <button type="submit" className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 sm:col-span-2 xl:col-span-1">
            {labels.search}
          </button>
          <button
            type="button"
            onClick={exportVisibleRowsCsv}
            aria-label={labels.exportCsv}
            title={labels.exportCsv}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </form>

      {feedback ? (
        <p className={`mx-5 mt-4 rounded-lg border px-3 py-2 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {feedback.message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-b-3xl">
        <div className="hidden grid-cols-[1.2fr_130px_90px_90px_90px_120px_160px_140px_120px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
          <span>{labels.product}</span>
          <span>{labels.warehouse}</span>
          <span>{labels.onHandStock}</span>
          <span>{labels.reservedStock}</span>
          <span>{labels.availableStock}</span>
          <span>{labels.stockStatus}</span>
          <span>{labels.movementType}</span>
          <span>{labels.lastMovementAt}</span>
          <span>{labels.detail}</span>
        </div>

        {result.items.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">{labels.empty}</p>
        ) : (
          <div className="divide-y divide-neutral-200">
            {result.items.map((item) => {
              const rowKey = getRowKey(item);

              return (
                <article key={rowKey} className="grid gap-3 p-4 transition hover:bg-neutral-50 lg:grid-cols-[1.2fr_130px_90px_90px_90px_120px_160px_140px_120px] lg:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-950">{item.name}</p>
                    <p className="mt-1 truncate text-xs text-neutral-500">/{item.slug} · {labels.sku}: {item.sku}</p>
                  </div>
                  <p className="text-sm text-neutral-700">
                    {item.warehouseCode ?? labels.notSpecified}
                    {item.isDefaultWarehouse ? (
                      <span className="ml-2 inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">{labels.defaultWarehouse}</span>
                    ) : null}
                  </p>
                  <p className="text-sm text-neutral-700">{item.onHandStock}</p>
                  <p className="text-sm text-neutral-700">{item.reservedStock}</p>
                  <p className="text-sm font-semibold text-neutral-950">{item.availableStock}</p>
                  <p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(item.stockStatus)}`}>
                      {statusLabel(item.stockStatus, labels)}
                    </span>
                  </p>
                  <p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${movementTypeClass(item.lastMovementType)}`}>
                      {movementTypeLabel(item.lastMovementType, labels)}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-500">{formatDate(item.lastMovementAt, locale, labels.notSpecified)}</p>
                  <button
                    type="button"
                    onClick={() => openDrawer(item, "view")}
                    className="h-9 rounded-md border border-neutral-300 px-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    {labels.viewDetails}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4">
        {prevPage ? (
          <Link href={getPageHref(prevPage)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
            {labels.prev}
          </Link>
        ) : <span />}
        <p className="text-sm text-neutral-500">{labels.page} {result.page}/{result.totalPages}</p>
        {nextPage ? (
          <Link href={getPageHref(nextPage)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
            {labels.next}
          </Link>
        ) : <span />}
      </div>

      {drawerItem ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label={labels.adjustStock} className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <aside className={`absolute right-0 top-0 flex h-full w-full flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl ${drawerFullscreen ? "max-w-none" : "max-w-2xl"}`}>
            <div className="flex items-start justify-between border-b border-neutral-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{labels.detail}</h3>
                <p className="mt-1 text-sm text-neutral-500">{labels.drawerInfo}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDrawerFullscreen((prev) => !prev)}
                  disabled={Boolean(pendingRowKey)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
                  aria-label={locale === "tr" ? (drawerFullscreen ? "Daralt" : "Tam ekran") : (drawerFullscreen ? "Collapse" : "Fullscreen")}
                  title={locale === "tr" ? (drawerFullscreen ? "Daralt" : "Tam ekran") : (drawerFullscreen ? "Collapse" : "Fullscreen")}
                >
                  {drawerFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={Boolean(pendingRowKey)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
                  aria-label={locale === "tr" ? "Kapat" : "Close"}
                  title={locale === "tr" ? "Kapat" : "Close"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5">
              <section className="rounded-xl border border-neutral-200 p-4">
                <h4 className="text-base font-semibold text-neutral-950">{drawerItem.name}</h4>
                <p className="mt-1 text-sm text-neutral-500">/{drawerItem.slug} • {labels.sku}: {drawerItem.sku}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {labels.warehouse}: {drawerItem.warehouseCode ?? labels.notSpecified}
                </p>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-xl border border-neutral-200 p-3">
                  <p className="text-xs text-neutral-500">{labels.onHandStock}</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">{drawerItem.onHandStock}</p>
                </article>
                <article className="rounded-xl border border-neutral-200 p-3">
                  <p className="text-xs text-neutral-500">{labels.reservedStock}</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-700">{drawerItem.reservedStock}</p>
                </article>
                <article className="rounded-xl border border-neutral-200 p-3">
                  <p className="text-xs text-neutral-500">{labels.availableStock}</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">{drawerItem.availableStock}</p>
                </article>
                <article className="rounded-xl border border-neutral-200 p-3">
                  <p className="text-xs text-neutral-500">{labels.stockStatus}</p>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(drawerItem.stockStatus)}`}>
                      {statusLabel(drawerItem.stockStatus, labels)}
                    </span>
                  </p>
                </article>
              </section>

              <section className="rounded-xl border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-neutral-900">{labels.recentMovements}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs font-medium text-neutral-600">{labels.movementDateRange}</label>
                    <select
                      value={drawerDateRange}
                      onChange={(event) => {
                        setDrawerDateRange(event.target.value);
                        setDrawerMovementPage(1);
                      }}
                      className="h-9 rounded-md border border-neutral-300 px-2 text-xs text-neutral-700"
                    >
                      <option value="all">{labels.movementAllTime}</option>
                      <option value="24h">{labels.movementLast24Hours}</option>
                      <option value="7d">{labels.movementLast7Days}</option>
                      <option value="30d">{labels.movementLast30Days}</option>
                    </select>
                    <select
                      value={drawerMovementFilter}
                      onChange={(event) => {
                        setDrawerMovementFilter(event.target.value);
                        setDrawerMovementPage(1);
                      }}
                      className="h-9 rounded-md border border-neutral-300 px-2 text-xs text-neutral-700"
                    >
                      {movementTypeOptions.map((option) => (
                        <option key={`drawer-${option.value}`} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={viewAllHistoryInList}
                    className="text-xs font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900"
                  >
                    {labels.viewAllHistory}
                  </button>
                  <p className="text-xs text-neutral-500">{labels.page} {drawerMovementPage}/{drawerMovementTotalPages}</p>
                </div>

                {drawerMovementItems.length === 0 ? (
                  <p className="text-xs text-neutral-500">{labels.noRecentMovements}</p>
                ) : (
                  <ul className="space-y-2">
                    {drawerMovementItems.map((movement, index) => (
                      <li key={`${movement.createdAt}:${index}`} className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${movementTypeClass(movement.type)}`}>
                            {movementTypeLabel(movement.type, labels)}
                          </span>
                          <span className={movement.quantity >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                            {movement.quantity >= 0 ? `+${movement.quantity}` : movement.quantity}
                          </span>
                        </div>
                        <span className="text-neutral-500">{formatDate(movement.createdAt, locale, labels.notSpecified)}</span>
                        <span className="text-neutral-600">{movement.note ?? labels.notSpecified}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {drawerMovementTotalPages > 1 ? (
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerMovementPage((prev) => Math.max(1, prev - 1))}
                      disabled={drawerMovementPage <= 1}
                      className="h-8 rounded-md border border-neutral-300 px-2 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {labels.prev}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerMovementPage((prev) => Math.min(drawerMovementTotalPages, prev + 1))}
                      disabled={drawerMovementPage >= drawerMovementTotalPages}
                      className="h-8 rounded-md border border-neutral-300 px-2 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {labels.next}
                    </button>
                  </div>
                ) : null}
              </section>

              <section className="rounded-xl border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-neutral-900">{labels.adjustStock}</h4>
                  {drawerMode === "view" ? (
                    <button
                      type="button"
                      onClick={() => setDrawerMode("edit")}
                      className="h-9 rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {labels.adjustStock}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDrawerMode("view")}
                      className="h-9 rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {locale === "tr" ? "Görüntüle" : "View"}
                    </button>
                  )}
                </div>

                {drawerMode === "edit" ? (
                  <form
                    className="grid gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void applyAdjustmentFromDrawer();
                    }}
                  >
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.targetOnHandStock}</label>
                      <input
                        type="number"
                        min={0}
                        value={drawerTargetOnHand}
                        onChange={(event) => setDrawerTargetOnHand(event.target.value)}
                        className="h-10 rounded-md border border-neutral-300 px-2 text-sm"
                        required
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.adjustmentNote}</label>
                      <textarea
                        value={drawerNote}
                        onChange={(event) => setDrawerNote(event.target.value)}
                        placeholder={labels.adjustmentNote}
                        rows={3}
                        className="rounded-md border border-neutral-300 px-2 py-2 text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={Boolean(pendingRowKey)}
                        className="h-10 rounded-md border border-neutral-300 bg-neutral-900 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingRowKey ? "..." : labels.applyAdjustment}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-neutral-500">{labels.drawerInfo}</p>
                )}
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
