"use client";

import { useState, type RefObject } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminSupplierItem } from "@/modules/catalog/contracts/catalog-admin.contract";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n";
import type {
  AdminExternalStockEventMonitoring,
  AdminInventoryAlertSummary,
  AdminInventoryExportHistoryItem,
  AdminInventoryItem,
  AdminInventoryListResult,
  AdminInventoryQuickLookupResult,
  AdminInventoryReportsResult,
  AdminStockCountItem,
  AdminInventoryTransactionListResult,
  AdminWarehouseItem,
  BulkOperationResult,
} from "@/modules/inventory/contracts/inventory.contract";
import {
  EmptyStateCard,
  formatCurrency,
  formatDelta,
  formatFilterSummary,
  formatQuickActionMatchLabel,
} from "@/ui/admin/inventory-manager.shared";
import type { DrawerMode, Labels } from "@/ui/admin/inventory-manager.shared";

type QuickActionLabels = Pick<
  Labels,
  | "adjustStock"
  | "allWarehouses"
  | "availableStock"
  | "notSpecified"
  | "quickActionApplyNow"
  | "quickActionAutoOpenHint"
  | "quickActionDescription"
  | "quickActionFastModeDescription"
  | "quickActionFastModeTitle"
  | "quickActionInputLabel"
  | "quickActionInputPlaceholder"
  | "quickActionLookup"
  | "quickActionMatchBarcode"
  | "quickActionMatchName"
  | "quickActionMatchSku"
  | "quickActionNoMatch"
  | "quickActionOpen"
  | "quickActionQuantityLabel"
  | "quickActionRememberedMode"
  | "quickActionScannerHint"
  | "quickActionSearching"
  | "quickActionSerialMode"
  | "quickActionSerialModeHint"
  | "quickActionStartCamera"
  | "quickActionStopCamera"
  | "quickActionTargetWarehouseLabel"
  | "quickActionTitle"
  | "stockIn"
  | "stockOut"
  | "transferStock"
  | "warehouse"
>;
type ReportsLabels = Pick<
  Labels,
  | "notSpecified"
  | "reportComparisonCostingMode"
  | "reportCurrentPeriod"
  | "reportDifference"
  | "reportOfficialCostingMethod"
  | "reportPeriod30Days"
  | "reportPeriod7Days"
  | "reportPeriod90Days"
  | "reportsTitle"
  | "reviewLowStock"
  | "reviewSlowMoving"
  | "startStockCount"
  | "stockMismatchCount"
  | "stockTurnoverRate"
  | "totalCostValue"
  | "totalSalesValue"
  | "trendNet"
  | "trendStockIn"
  | "trendStockOut"
>;
type ExportsLabels = Pick<Labels, "notSpecified">;
type SyncLabels = Pick<
  Labels,
  | "empty"
  | "integrationDescription"
  | "integrationTitle"
  | "notSpecified"
  | "syncDeadLetter"
  | "syncFailed"
  | "syncLastError"
  | "syncPending"
  | "syncProcessing"
  | "syncRecentJobs"
  | "syncSuccess"
>;
type CriticalLabels = Pick<
  Labels,
  | "activeAlerts"
  | "alertCreatedAt"
  | "alertTypeLowStock"
  | "alertTypeOutOfStock"
  | "availableStock"
  | "criticalStockDescription"
  | "criticalStockTitle"
  | "noAlerts"
  | "notSpecified"
  | "reorderPoint"
  | "safetyStock"
>;
type TransactionsLabels = {
  all: string;
  allWarehouses: string;
  inventoryMovementDamageWriteOff: string;
  inventoryMovementManualAdjustment: string;
  inventoryMovementPurchaseReceipt: string;
  notSpecified: string;
  page: string;
  prev: string;
  next: string;
  search: string;
  stockCountTitle: string;
  transactionFilterEndDate: string;
  transactionFilterSku: string;
  transactionFilterStartDate: string;
  transactionFilterType: string;
  transactionFilterWarehouse: string;
  transactionSearch: string;
  transactionsDescription: string;
  transactionsTitle: string;
  transferStock: string;
  viewDetails: string;
};
type CountsLabels = Pick<
  Labels,
  | "allWarehouses"
  | "createStockCount"
  | "notSpecified"
  | "stockCountDate"
  | "stockCountDescription"
  | "stockCountLineCount"
  | "stockCountTitle"
  | "stockCountVarianceCount"
  | "viewDetails"
>;
type WarehousesLabels = Pick<
  Labels,
  | "active"
  | "createWarehouse"
  | "defaultLabel"
  | "editWarehouse"
  | "focusWarehouse"
  | "levelCount"
  | "passive"
  | "warehouseStatus"
  | "warehousesDescription"
  | "warehousesTitle"
>;
type InventoryListLabels = Pick<
  Labels,
  | "availableStock"
  | "defaultWarehouse"
  | "detail"
  | "exportCsv"
  | "inStock"
  | "lastMovementAt"
  | "lowStock"
  | "movementCounterpartyWarehouse"
  | "movementReference"
  | "movementTypeFilter"
  | "next"
  | "notSpecified"
  | "onHandStock"
  | "outOfStock"
  | "page"
  | "prev"
  | "product"
  | "reorderPoint"
  | "reservedStock"
  | "reservationFilter"
  | "safetyStock"
  | "search"
  | "sku"
  | "stockFilter"
  | "title"
  | "viewDetails"
  | "warehouse"
  | "warehouseFilter"
  | "all"
  | "allWarehouses"
  | "withReservations"
  | "withoutReservations"
>;
type InventoryDrawerLabels = Pick<
  Labels,
  | "adjustStock"
  | "adjustmentNote"
  | "applyAdjustment"
  | "applyTransfer"
  | "availableStock"
  | "drawerInfo"
  | "movementAllTime"
  | "movementCounterpartyWarehouse"
  | "movementDateRange"
  | "movementLast24Hours"
  | "movementLast30Days"
  | "movementLast7Days"
  | "movementQuantity"
  | "movementReference"
  | "next"
  | "noRecentMovements"
  | "notSpecified"
  | "onHandStock"
  | "page"
  | "prev"
  | "recentMovements"
  | "reorderPoint"
  | "reservedStock"
  | "safetyStock"
  | "sku"
  | "stockIn"
  | "stockOut"
  | "targetOnHandStock"
  | "targetReorderPoint"
  | "targetSafetyStock"
  | "title"
  | "transferNote"
  | "transferQuantity"
  | "transferStock"
  | "transferTargetWarehouse"
  | "viewAllHistory"
>;

type InventoryQuickActionsPanelProps = {
  labels: QuickActionLabels;
  quickActionMode: DrawerMode;
  onQuickActionModeChange: (mode: DrawerMode) => void;
  quickActionInputRef: RefObject<HTMLInputElement | null>;
  quickActionQuery: string;
  onQuickActionQueryChange: (value: string) => void;
  pendingQuickAction: boolean;
  onQuickActionLookup: () => Promise<void>;
  quickActionCameraSupported: boolean;
  quickActionCameraActive: boolean;
  onQuickActionCameraToggle: () => void | Promise<void>;
  quickActionVideoRef: RefObject<HTMLVideoElement | null>;
  quickActionCameraMessage: string | null;
  quickActionSerialModeEnabled: boolean;
  onQuickActionSerialModeChange: (value: boolean) => void;
  quickActionResult: AdminInventoryQuickLookupResult | null;
};

export function InventoryQuickActionsPanel({
  labels,
  quickActionMode,
  onQuickActionModeChange,
  quickActionInputRef,
  quickActionQuery,
  onQuickActionQueryChange,
  pendingQuickAction,
  onQuickActionLookup,
  quickActionCameraSupported,
  quickActionCameraActive,
  onQuickActionCameraToggle,
  quickActionVideoRef,
  quickActionCameraMessage,
  quickActionSerialModeEnabled,
  onQuickActionSerialModeChange,
  quickActionResult,
}: InventoryQuickActionsPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-neutral-200 bg-[linear-gradient(135deg,rgba(240,253,250,0.95),rgba(255,255,255,0.98))] p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Barkod Operasyonu</p>
          <p className="text-sm text-neutral-600">{labels.quickActionDescription}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { id: "view", label: labels.quickActionOpen },
            { id: "stock_in", label: labels.stockIn },
            { id: "stock_out", label: labels.stockOut },
            { id: "transfer", label: labels.transferStock },
            { id: "edit", label: labels.adjustStock },
          ].map((action) => (
            <button
              key={`quick-action-${action.id}`}
              type="button"
              onClick={() => onQuickActionModeChange(action.id as DrawerMode)}
              className={`inline-flex h-12 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${
                quickActionMode === action.id
                  ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>

        <form
          className="mt-4 rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void onQuickActionLookup();
          }}
        >
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-neutral-700">{labels.quickActionInputLabel}</span>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                ref={quickActionInputRef}
                value={quickActionQuery}
                onChange={(event) => onQuickActionQueryChange(event.target.value)}
                placeholder={labels.quickActionInputPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="search"
                enterKeyHint="search"
                className="h-12 flex-1 rounded-2xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 outline-none transition focus:border-neutral-500"
              />
              <button
                type="submit"
                disabled={pendingQuickAction}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingQuickAction ? labels.quickActionSearching : labels.quickActionLookup}
              </button>
              {quickActionCameraSupported ? (
                <button
                  type="button"
                  onClick={() => {
                    void onQuickActionCameraToggle();
                  }}
                  className={`inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition ${
                    quickActionCameraActive
                      ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {quickActionCameraActive ? labels.quickActionStopCamera : labels.quickActionStartCamera}
                </button>
              ) : null}
            </div>
          </label>
          {quickActionCameraActive ? (
            <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950">
              <video
                ref={quickActionVideoRef}
                muted
                playsInline
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ) : null}
          {quickActionCameraMessage ? (
            <p className="mt-3 text-xs text-neutral-600">{quickActionCameraMessage}</p>
          ) : null}
          <label className="mt-3 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={quickActionSerialModeEnabled}
              onChange={(event) => onQuickActionSerialModeChange(event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <span className="font-medium text-neutral-800">{labels.quickActionSerialMode}</span>
          </label>
          <p className="mt-3 text-xs text-neutral-500">{labels.quickActionScannerHint}</p>
          <p className="mt-1 text-xs text-neutral-500">{labels.quickActionRememberedMode}</p>
          <p className="mt-1 text-xs text-neutral-500">{labels.quickActionAutoOpenHint}</p>
          <p className="mt-1 text-xs text-neutral-500">{labels.quickActionSerialModeHint}</p>
        </form>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Eşleşme</p>
            <h4 className="mt-2 text-base font-semibold text-neutral-950">
              {formatQuickActionMatchLabel(quickActionResult?.matchType ?? "NONE", labels)}
            </h4>
          </div>
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-600">
            {quickActionMode === "view"
              ? labels.quickActionOpen
              : quickActionMode === "stock_in"
                ? labels.stockIn
                : quickActionMode === "stock_out"
                  ? labels.stockOut
                  : quickActionMode === "transfer"
                    ? labels.transferStock
                    : labels.adjustStock}
          </span>
        </div>

        {quickActionResult?.item ? (
          <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50/80 p-4">
            <p className="text-sm font-semibold text-neutral-950">{quickActionResult.item.name}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {quickActionResult.item.sku} • Barkod: {quickActionResult.item.barcode ?? labels.notSpecified}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.availableStock}</p>
                <p className="mt-1 text-lg font-semibold text-neutral-950">{quickActionResult.item.availableStock}</p>
              </article>
              <article className="rounded-2xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.warehouse}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">
                  {quickActionResult.item.warehouseCode ?? labels.notSpecified}
                </p>
              </article>
            </div>
          </div>
        ) : (
          <EmptyStateCard title={labels.quickActionTitle} description={labels.quickActionNoMatch} />
        )}
      </section>
    </div>
  );
}

type InventoryReportsPanelProps = {
  labels: ReportsLabels;
  locale: Locale;
  reports: AdminInventoryReportsResult;
  stockCounts: AdminStockCountItem[];
  activePeriodDays: string;
  onPeriodChange: (value: string) => void;
  onReviewLowStock: () => void;
  onReviewSlowMoving: (sku?: string) => void;
  onStartStockCount: () => void;
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
};

export function InventoryReportsPanel({
  labels,
  locale,
  reports,
  stockCounts,
  activePeriodDays,
  onPeriodChange,
  onReviewLowStock,
  onReviewSlowMoving,
  onStartStockCount,
  formatDate,
}: InventoryReportsPanelProps) {
  const [activeLayer, setActiveLayer] = useState<"summary" | "detail">("summary");
  const openCount = stockCounts.filter((count) => count.status !== "APPLIED").length;
  const topSlowMoving = reports.slowMoving[0] ?? null;
  const topVelocity = reports.velocity[0] ?? null;
  const topAbcSegments = reports.abcSegments.slice(0, 3);

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-neutral-950">{labels.reportsTitle}</h3>
          <p className="text-sm text-neutral-600">Stok değerini, hareket hızını ve aksiyon gerektiren başlıkları karar ekranı mantığıyla özetler.</p>
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "summary" as const, label: "Özet" },
              { id: "detail" as const, label: "Detay Analiz" },
            ].map((layer) => (
              <button
                key={`report-layer-${layer.id}`}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                  activeLayer === layer.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "7", label: labels.reportPeriod7Days },
              { value: "30", label: labels.reportPeriod30Days },
              { value: "90", label: labels.reportPeriod90Days },
            ].map((option) => (
              <button
                key={`report-period-${option.value}`}
                type="button"
                onClick={() => onPeriodChange(option.value)}
                className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                  activePeriodDays === option.value
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeLayer === "summary" ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-neutral-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] p-4 shadow-sm">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Öncelik</p>
                <p className="mt-2 text-sm font-semibold text-neutral-950">{reports.overview.lowStockRowCount} düşük stok satırı gözden geçirilmeli</p>
              </article>
              <article className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Sayım</p>
                <p className="mt-2 text-sm font-semibold text-neutral-950">{openCount} açık sayım işlem bekliyor</p>
              </article>
              <article className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Tutarlılık</p>
                <p className="mt-2 text-sm font-semibold text-neutral-950">{reports.consistency.length} kayıt kontrol istiyor</p>
              </article>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalCostValue}</p>
                <p className="mt-2 text-lg font-semibold text-neutral-950">{formatCurrency(reports.overview.totalCostValue, locale)}</p>
              </article>
              <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalSalesValue}</p>
                <p className="mt-2 text-lg font-semibold text-emerald-700">{formatCurrency(reports.overview.totalSalesValue, locale)}</p>
              </article>
              <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.stockTurnoverRate}</p>
                <p className="mt-2 text-lg font-semibold text-sky-700">{reports.overview.stockTurnoverRate.toFixed(2)}x</p>
              </article>
              <article className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.stockMismatchCount}</p>
                <p className="mt-2 text-lg font-semibold text-orange-700">{reports.overview.stockMismatchCount}</p>
              </article>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.reportDifference}</p>
                <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                  <p>{labels.trendStockIn}: {reports.comparison.current.totalStockInQuantity} ({formatDelta(reports.comparison.stockInDelta)})</p>
                  <p>{labels.trendStockOut}: {reports.comparison.current.totalStockOutQuantity} ({formatDelta(reports.comparison.stockOutDelta)})</p>
                  <p>{labels.trendNet}: {reports.comparison.current.netQuantity} ({formatDelta(reports.comparison.netDelta)})</p>
                </div>
              </article>
              <article className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Maliyet Çerçevesi</p>
                <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                  <p>{labels.reportCurrentPeriod}: {formatDate(reports.comparison.current.startDate, locale, labels.notSpecified)} - {formatDate(reports.comparison.current.endDate, locale, labels.notSpecified)}</p>
                  <p>{labels.reportOfficialCostingMethod}: {reports.overview.officialCostingMethodLabel}</p>
                  <p>{labels.reportComparisonCostingMode}: {reports.overview.displayCostingMethodLabel}</p>
                  <p>Resmî değerleme kararları ortalama maliyet üstünden okunmalıdır.</p>
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h4 className="text-base font-semibold text-neutral-950">Karar ve Aksiyonlar</h4>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={onReviewLowStock}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                {labels.reviewLowStock}
              </button>
              <button
                type="button"
                onClick={() => onReviewSlowMoving(reports.slowMoving[0]?.sku)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                {labels.reviewSlowMoving}
              </button>
              <button
                type="button"
                onClick={onStartStockCount}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-medium text-sky-800 transition hover:bg-sky-100"
              >
                {labels.startStockCount}
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                <p className="font-semibold text-neutral-900">Öncelik Özeti</p>
                <p className="mt-2">{reports.overview.lowStockRowCount} düşük stok satırı, {openCount} açık sayım ve {reports.consistency.length} tutarlılık kontrolü bekliyor.</p>
              </article>
              <article className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                <p className="font-semibold text-neutral-900">En Yavaş Hareket Eden</p>
                <p className="mt-2">{topSlowMoving ? `${topSlowMoving.productName} • ${topSlowMoving.sku}` : labels.notSpecified}</p>
              </article>
              <article className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                <p className="font-semibold text-neutral-900">En Hızlı Dönen</p>
                <p className="mt-2">{topVelocity ? `${topVelocity.productName} • ${topVelocity.sku}` : labels.notSpecified}</p>
              </article>
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Dönem Farkı</p>
                <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                  <p>{labels.trendStockIn}: {reports.comparison.current.totalStockInQuantity} ({formatDelta(reports.comparison.stockInDelta)})</p>
                  <p>{labels.trendStockOut}: {reports.comparison.current.totalStockOutQuantity} ({formatDelta(reports.comparison.stockOutDelta)})</p>
                  <p>{labels.trendNet}: {reports.comparison.current.netQuantity} ({formatDelta(reports.comparison.netDelta)})</p>
                </div>
              </article>
              <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">En Hızlı Dönen Ürün</p>
                <p className="mt-2 text-sm font-semibold text-neutral-950">{topVelocity ? `${topVelocity.productName} • ${topVelocity.sku}` : labels.notSpecified}</p>
                <p className="mt-2 text-xs text-neutral-600">{topVelocity ? `${topVelocity.last30DayOutboundUnits} çıkış • devir ${topVelocity.turnoverRate.toFixed(2)}x` : "Bu dönem için hız verisi oluşmadı."}</p>
              </article>
              <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">En Yavaş Hareket Eden Ürün</p>
                <p className="mt-2 text-sm font-semibold text-neutral-950">{topSlowMoving ? `${topSlowMoving.productName} • ${topSlowMoving.sku}` : labels.notSpecified}</p>
                <p className="mt-2 text-xs text-neutral-600">{topSlowMoving ? `${topSlowMoving.inactivityDays ?? 0} gündür sınırlı hareket var.` : "Atıl ürün verisi oluşmadı."}</p>
              </article>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h4 className="text-base font-semibold text-neutral-950">Hız ve Atıllık Analizi</h4>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                {reports.velocity.slice(0, 4).map((item) => (
                  <article key={`velocity-${item.sku}`} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <p className="text-sm font-semibold text-neutral-950">{item.productName}</p>
                    <p className="mt-1 text-xs text-neutral-600">{item.sku}</p>
                    <p className="mt-2 text-sm text-neutral-700">{item.last30DayOutboundUnits} çıkış • devir {item.turnoverRate.toFixed(2)}x</p>
                  </article>
                ))}
              </div>
              <div className="space-y-3">
                {reports.slowMoving.slice(0, 4).map((item) => (
                  <article key={`slow-${item.sku}`} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                    <p className="text-sm font-semibold text-neutral-950">{item.productName}</p>
                    <p className="mt-1 text-xs text-neutral-600">{item.sku}</p>
                    <p className="mt-2 text-sm text-neutral-700">{item.inactivityDays ?? 0} gün hareketsiz • {item.availableUnits} kullanılabilir stok</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h4 className="text-base font-semibold text-neutral-950">Segment ve Değerleme Çerçevesi</h4>
            <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Maliyet Çerçevesi</p>
                <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                  <p>{labels.reportCurrentPeriod}: {formatDate(reports.comparison.current.startDate, locale, labels.notSpecified)} - {formatDate(reports.comparison.current.endDate, locale, labels.notSpecified)}</p>
                  <p>{labels.reportOfficialCostingMethod}: {reports.overview.officialCostingMethodLabel}</p>
                  <p>{labels.reportComparisonCostingMode}: {reports.overview.displayCostingMethodLabel}</p>
                  <p>Resmî değerleme ve maliyet yorumları ortalama maliyet yaklaşımıyla okunmalıdır.</p>
                </div>
              </article>
              <div className="grid gap-3 sm:grid-cols-3">
                {topAbcSegments.map((segment) => (
                  <article key={`abc-${segment.segment}`} className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Segment {segment.segment}</p>
                    <p className="mt-2 text-sm font-semibold text-neutral-950">{segment.productCount} ürün</p>
                    <p className="mt-1 text-xs text-neutral-600">Pay: %{segment.sharePercent.toFixed(1)}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

type InventoryExportsPanelProps = {
  labels: ExportsLabels;
  locale: Locale;
  exportHistory: AdminInventoryExportHistoryItem[];
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
};

export function InventoryExportsPanel({
  labels,
  locale,
  exportHistory,
  formatDate,
}: InventoryExportsPanelProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-neutral-950">Dışa Aktarım Geçmişi</h3>
        <p className="text-sm text-neutral-600">Stok ekranından alınan CSV çıktılarının kim tarafından ve hangi filtrelerle üretildiğini izle.</p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Dışa Aktarım Özeti</p>
            <h4 className="text-base font-semibold text-neutral-950">Kullanım ve kapsam görünümü</h4>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Toplam kayıt</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">{exportHistory.length}</p>
            </article>
            <article className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Filtreli dışa aktarım</p>
              <p className="mt-2 text-lg font-semibold text-fuchsia-700">{exportHistory.filter((item) => item.hasFilters).length}</p>
            </article>
            <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Toplam satır</p>
              <p className="mt-2 text-lg font-semibold text-sky-700">{exportHistory.reduce((sum, item) => sum + item.total, 0)}</p>
            </article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Son işlem</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700">{exportHistory[0] ? formatDate(exportHistory[0].createdAt, locale, labels.notSpecified) : labels.notSpecified}</p>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Ne Anlama Geliyor?</p>
            <h4 className="text-base font-semibold text-neutral-950">Takip edilmesi gereken başlıklar</h4>
          </div>
          <div className="mt-4 grid gap-3">
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
              <p className="text-sm font-semibold text-neutral-950">Filtre disiplini</p>
              <p className="mt-1 text-sm text-neutral-600">Filtresiz dışa aktarımlar yükselirse ekip ham veri ile çalışıyor olabilir.</p>
            </article>
            <article className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
              <p className="text-sm font-semibold text-neutral-950">Kapsam yoğunluğu</p>
              <p className="mt-1 text-sm text-neutral-600">Çok büyük satır sayıları, rapor ihtiyacının daha özel bir ekrana taşınması gerektiğini gösterebilir.</p>
            </article>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-3">
        {exportHistory.length === 0 ? (
          <EmptyStateCard
            title="Henüz kayıtlı dışa aktarım bulunmuyor"
            description="Stok listesinden CSV dışa aktarımı yapıldığında bu ekranda kalıcı geçmiş olarak görünecek."
          />
        ) : exportHistory.map((item) => (
          <article key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-fuchsia-100 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-700">
                    {item.scopeLabel}
                  </span>
                  <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                    {item.total} satır
                  </span>
                  <span className="inline-flex rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                    {item.hasFilters ? `${item.filterCount} filtre ile` : "Filtresiz"}
                  </span>
                </div>
                <p className="mt-3 text-base font-semibold text-neutral-950">{item.summary}</p>
                <p className="mt-2 text-sm text-neutral-600">{formatFilterSummary(item.filters)}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px] xl:grid-cols-1">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Kullanıcı</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{item.actorLabel ?? labels.notSpecified}</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Tarih</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{formatDate(item.createdAt, locale, labels.notSpecified)}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

type InventorySyncPanelProps = {
  labels: SyncLabels;
  locale: Locale;
  integrationSummary: {
    pendingCount: number;
    processingCount: number;
    failedCount: number;
    deadLetterCount: number;
    successCount: number;
    recentJobs: Array<{
      id: string;
      channel: "TRENDYOL" | "N11" | "EDOCS_MOCK";
      status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "DEAD_LETTER";
      entityId: string;
      createdAt: string;
      lastError: string | null;
    }>;
  };
  externalEventMonitoring: AdminExternalStockEventMonitoring;
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
};

export function InventorySyncPanel({
  labels,
  locale,
  integrationSummary,
  externalEventMonitoring,
  formatDate,
}: InventorySyncPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | AdminExternalStockEventMonitoring["items"][number]["status"]>("all");
  const [mappingFilter, setMappingFilter] = useState<"all" | AdminExternalStockEventMonitoring["items"][number]["mappingMode"]>("all");
  const [warehouseResolutionFilter, setWarehouseResolutionFilter] = useState<"all" | AdminExternalStockEventMonitoring["items"][number]["warehouseResolution"]>("all");
  const [projectionFilter, setProjectionFilter] = useState<"all" | AdminExternalStockEventMonitoring["items"][number]["projectionStatus"]>("all");

  const filteredEvents = externalEventMonitoring.items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (mappingFilter !== "all" && item.mappingMode !== mappingFilter) {
      return false;
    }
    if (warehouseResolutionFilter !== "all" && item.warehouseResolution !== warehouseResolutionFilter) {
      return false;
    }
    if (projectionFilter !== "all" && item.projectionStatus !== projectionFilter) {
      return false;
    }
    return true;
  });

  const triageCount = filteredEvents.filter((item) => item.status === "FAILED" || item.status === "DUPLICATE" || item.mappingMode === "UNRESOLVED" || item.warehouseResolution === "UNRESOLVED").length;

  const formatStatusLabel = (value: AdminExternalStockEventMonitoring["items"][number]["status"]) => {
    switch (value) {
      case "RECEIVED":
        return "Alındı";
      case "APPLIED":
        return "Uygulandı";
      case "FAILED":
        return "Başarısız";
      case "DUPLICATE":
        return "Tekrarlı";
      default:
        return value;
    }
  };

  const formatMappingLabel = (value: AdminExternalStockEventMonitoring["items"][number]["mappingMode"]) => {
    switch (value) {
      case "EXTERNAL_PRODUCT_ID":
        return "Harici ürün kimliği";
      case "EXTERNAL_SKU":
        return "Harici SKU";
      case "UNRESOLVED":
        return "Çözümlenmedi";
      default:
        return value;
    }
  };

  const formatWarehouseResolutionLabel = (value: AdminExternalStockEventMonitoring["items"][number]["warehouseResolution"]) => {
    switch (value) {
      case "MAPPING_WAREHOUSE":
        return "Eşleme deposu";
      case "DEFAULT_WAREHOUSE":
        return "Varsayılan depo";
      case "UNRESOLVED":
        return "Depo çözümlenmedi";
      default:
        return value;
    }
  };

  const formatProjectionLabel = (value: AdminExternalStockEventMonitoring["items"][number]["projectionStatus"]) => {
    switch (value) {
      case "PENDING":
        return "Bekliyor";
      case "APPLIED":
        return "Uygulandı";
      case "FAILED":
        return "Başarısız";
      case "DUPLICATE":
        return "Tekrarlı";
      default:
        return value;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-neutral-950">{labels.integrationTitle}</h3>
        <p className="text-sm text-neutral-600">{labels.integrationDescription}</p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Operasyon Özeti</p>
            <h4 className="text-base font-semibold text-neutral-950">Stok senkron sağlığı</h4>
            <p className="text-sm text-neutral-600">Kuyruk yoğunluğu, hata tipi ve harici event durumunu tek bakışta izle.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncPending}</p><p className="mt-2 text-lg font-semibold text-neutral-950">{integrationSummary.pendingCount}</p><p className="mt-1 text-xs text-neutral-500">Sırada bekleyen işler</p></article>
            <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncProcessing}</p><p className="mt-2 text-lg font-semibold text-sky-700">{integrationSummary.processingCount}</p><p className="mt-1 text-xs text-neutral-500">Aktif işlenen akış</p></article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncSuccess}</p><p className="mt-2 text-lg font-semibold text-emerald-700">{integrationSummary.successCount}</p><p className="mt-1 text-xs text-neutral-500">Sorunsuz tamamlanan</p></article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncFailed}</p><p className="mt-2 text-lg font-semibold text-amber-700">{integrationSummary.failedCount}</p><p className="mt-1 text-xs text-neutral-500">Yeniden denenecek</p></article>
            <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncDeadLetter}</p><p className="mt-2 text-lg font-semibold text-rose-700">{integrationSummary.deadLetterCount}</p><p className="mt-1 text-xs text-neutral-500">Manuel müdahale gerek</p></article>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Aksiyon Rehberi</p>
            <h4 className="text-base font-semibold text-neutral-950">Önce neye bakılmalı?</h4>
          </div>
          <div className="mt-4 grid gap-3">
            <article className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4"><p className="text-sm font-semibold text-neutral-950">Çözülmemiş eşleme sorunları</p><p className="mt-1 text-sm text-neutral-600">{externalEventMonitoring.unresolvedCount} kayıt eşleme bekliyor.</p></article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4"><p className="text-sm font-semibold text-neutral-950">Tekrar denenecek senkron işleri</p><p className="mt-1 text-sm text-neutral-600">{integrationSummary.failedCount} iş hata almış durumda.</p></article>
            <article className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/80 p-4"><p className="text-sm font-semibold text-neutral-950">Tekrarlı event kontrolü</p><p className="mt-1 text-sm text-neutral-600">{externalEventMonitoring.duplicateCount} tekrar kayıt algılandı.</p></article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><p className="text-sm font-semibold text-neutral-950">Yazıma kapalı eşleme</p><p className="mt-1 text-sm text-neutral-600">{externalEventMonitoring.readOnlyCount} event yalnızca izleme modunda kaldı.</p></article>
          </div>
          {externalEventMonitoring.latestFailedMessage ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Son hata: {externalEventMonitoring.latestFailedMessage}</p>
          ) : null}
        </section>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Eşleme bulunamadı</p><p className="mt-2 text-lg font-semibold text-rose-700">{externalEventMonitoring.unresolvedCount}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Yazıma kapalı eşleme</p><p className="mt-2 text-lg font-semibold text-slate-700">{externalEventMonitoring.readOnlyCount}</p></article>
        <article className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Hedef seviye eksik</p><p className="mt-2 text-lg font-semibold text-orange-700">{externalEventMonitoring.targetLevelMissingCount}</p></article>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h4 className="text-base font-semibold text-neutral-950">{labels.syncRecentJobs}</h4>
          <div className="mt-4 space-y-3">
            {integrationSummary.recentJobs.length === 0 ? (
              <EmptyStateCard title="Bekleyen entegrasyon işi yok" description={labels.empty} />
            ) : integrationSummary.recentJobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">{job.channel} • {job.entityId}</p>
                    <p className="mt-1 text-xs text-neutral-500">{formatDate(job.createdAt, locale, labels.notSpecified)}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${job.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : job.status === "DEAD_LETTER" ? "bg-rose-100 text-rose-700" : job.status === "FAILED" ? "bg-amber-100 text-amber-700" : job.status === "PROCESSING" ? "bg-sky-100 text-sky-700" : "bg-neutral-100 text-neutral-700"}`}>{job.status}</span>
                </div>
                {job.lastError ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{labels.syncLastError}: {job.lastError}</p> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-semibold text-neutral-950">Harici stok event akışı</h4>
            <p className="text-sm text-neutral-600">Son kayıtlar üzerinden eşleme, projection ve hata kök nedenini incele.</p>
          </div>
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-950">Operasyon filtreleri</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setMappingFilter("all");
                    setWarehouseResolutionFilter("all");
                    setProjectionFilter("all");
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  Filtreleri temizle
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-neutral-500">
                  <option value="all">Durum: Tümü</option>
                  <option value="RECEIVED">Durum: Alındı</option>
                  <option value="APPLIED">Durum: Uygulandı</option>
                  <option value="FAILED">Durum: Başarısız</option>
                  <option value="DUPLICATE">Durum: Tekrarlı</option>
                </select>
                <select value={mappingFilter} onChange={(event) => setMappingFilter(event.target.value as typeof mappingFilter)} className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-neutral-500">
                  <option value="all">Eşleme tipi: Tümü</option>
                  <option value="EXTERNAL_PRODUCT_ID">Eşleme tipi: Harici ürün kimliği</option>
                  <option value="EXTERNAL_SKU">Eşleme tipi: Harici SKU</option>
                  <option value="UNRESOLVED">Eşleme tipi: Çözümlenmedi</option>
                </select>
                <select value={warehouseResolutionFilter} onChange={(event) => setWarehouseResolutionFilter(event.target.value as typeof warehouseResolutionFilter)} className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-neutral-500">
                  <option value="all">Depo çözümü: Tümü</option>
                  <option value="MAPPING_WAREHOUSE">Depo çözümü: Eşleme deposu</option>
                  <option value="DEFAULT_WAREHOUSE">Depo çözümü: Varsayılan depo</option>
                  <option value="UNRESOLVED">Depo çözümü: Çözümlenmedi</option>
                </select>
                <select value={projectionFilter} onChange={(event) => setProjectionFilter(event.target.value as typeof projectionFilter)} className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-neutral-500">
                  <option value="all">Projection sonucu: Tümü</option>
                  <option value="PENDING">Projection sonucu: Bekliyor</option>
                  <option value="APPLIED">Projection sonucu: Uygulandı</option>
                  <option value="FAILED">Projection sonucu: Başarısız</option>
                  <option value="DUPLICATE">Projection sonucu: Tekrarlı</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-neutral-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Filtrelenmiş kayıt</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{filteredEvents.length}</p>
                </article>
                <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Triage önceliği</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{triageCount}</p>
                </article>
                <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Sonuç</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">Hata ayıklama ve eşleme incelemesi hızlandı</p>
                </article>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Alındı</p><p className="mt-2 text-lg font-semibold text-neutral-950">{externalEventMonitoring.receivedCount}</p></article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Uygulandı</p><p className="mt-2 text-lg font-semibold text-emerald-700">{externalEventMonitoring.appliedCount}</p></article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Başarısız</p><p className="mt-2 text-lg font-semibold text-amber-700">{externalEventMonitoring.failedCount}</p></article>
            <article className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/70 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Tekrarlı</p><p className="mt-2 text-lg font-semibold text-fuchsia-700">{externalEventMonitoring.duplicateCount}</p></article>
          </div>
          <div className="mt-4 grid gap-3">
            {filteredEvents.length === 0 ? (
              <EmptyStateCard title="Harici stok event kaydı bulunmuyor" description="Entegrasyonlardan event geldikçe bu alanda son durum ve hata akışı görünür." />
            ) : filteredEvents.slice(0, 12).map((item) => (
              <article key={item.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">{item.channel} • {item.productSku ?? item.externalSku ?? "Eşleşmemiş kayıt"}</p>
                    <p className="mt-1 text-xs text-neutral-500">{formatDate(item.createdAt, locale, labels.notSpecified)}</p>
                    <p className="mt-2 text-xs text-neutral-600">Depo: {item.warehouseCode ?? item.externalWarehouseCode ?? labels.notSpecified} • Miktar: {item.quantity}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${item.status === "APPLIED" ? "bg-emerald-100 text-emerald-700" : item.status === "FAILED" ? "bg-amber-100 text-amber-700" : item.status === "DUPLICATE" ? "bg-fuchsia-100 text-fuchsia-700" : "bg-neutral-100 text-neutral-700"}`}>{formatStatusLabel(item.status)}</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-neutral-600 sm:grid-cols-3">
                  <p className="rounded-xl border border-neutral-200 bg-white px-3 py-2">Eşleme: <span className="font-semibold text-neutral-900">{formatMappingLabel(item.mappingMode)}</span></p>
                  <p className="rounded-xl border border-neutral-200 bg-white px-3 py-2">Depo çözümü: <span className="font-semibold text-neutral-900">{formatWarehouseResolutionLabel(item.warehouseResolution)}</span></p>
                  <p className="rounded-xl border border-neutral-200 bg-white px-3 py-2">Projection: <span className="font-semibold text-neutral-900">{formatProjectionLabel(item.projectionStatus)}</span></p>
                </div>
                {item.errorMessage ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{item.errorMessage}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

type InventoryCriticalPanelProps = {
  labels: CriticalLabels;
  locale: Locale;
  alertResult: {
    items: Array<{
      id: string;
      productId: string;
      sku: string;
      productName: string;
      warehouseCode: string;
      warehouseName: string;
      availableStock: number;
      reorderPoint: number;
      safetyStock: number;
      type: "LOW_STOCK" | "OUT_OF_STOCK";
      status: "ACTIVE" | "RESOLVED";
      message: string;
      createdAt: string;
      updatedAt: string;
    }>;
    summary: AdminInventoryAlertSummary;
  };
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
  alertTypeLabel: (type: "LOW_STOCK" | "OUT_OF_STOCK", labels: CriticalLabels) => string;
};

export function InventoryCriticalPanel({
  labels,
  locale,
  alertResult,
  formatDate,
  alertTypeLabel,
}: InventoryCriticalPanelProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-neutral-950">{labels.criticalStockTitle}</h3>
        <p className="text-sm text-neutral-600">{labels.criticalStockDescription}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.activeAlerts}</p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">{alertResult.summary.activeCount}</p>
        </article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.alertTypeOutOfStock}</p>
          <p className="mt-2 text-lg font-semibold text-rose-700">{alertResult.summary.outOfStockCount}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.alertTypeLowStock}</p>
          <p className="mt-2 text-lg font-semibold text-amber-700">{alertResult.summary.lowStockCount}</p>
        </article>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {alertResult.items.length === 0 ? (
          <EmptyStateCard title="Aktif kritik stok uyarisi yok" description={labels.noAlerts} />
        ) : alertResult.items.map((alert) => (
          <article key={alert.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{alert.warehouseCode}</p>
                <h4 className="mt-1 text-base font-semibold text-neutral-950">{alert.productName}</h4>
                <p className="mt-2 text-sm text-neutral-600">{alert.message}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${alert.type === "OUT_OF_STOCK" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                {alertTypeLabel(alert.type, labels)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.availableStock}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{alert.availableStock}</p>
              </article>
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.reorderPoint}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{alert.reorderPoint}</p>
              </article>
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.safetyStock}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{alert.safetyStock}</p>
              </article>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
              <p>{labels.alertCreatedAt}: {formatDate(alert.createdAt, locale, labels.notSpecified)}</p>
              <p>{alert.type === "OUT_OF_STOCK" ? "Öneri: hemen stok girişi veya transfer planla." : "Öneri: yeniden sipariş veya iç transfer adımını başlat."}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

type TransactionsQuery = {
  search: string;
  stockStatusFilter: string;
  reservationFilter: string;
  warehouseFilter: string;
  movementTypeFilter: string;
  transactionSearch: string;
  transactionType: string;
  transactionWarehouse: string;
  transactionSku: string;
  transactionStartDate: string;
  transactionEndDate: string;
};

type InventoryTransactionsPanelProps = {
  labels: TransactionsLabels;
  locale: Locale;
  query: TransactionsQuery;
  warehouses: AdminWarehouseItem[];
  transactionResult: AdminInventoryTransactionListResult;
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
  formatInventoryNote: (note: string | null | undefined) => string | null | undefined;
  formatSourceDocument: (source: { type: string | null; number: string | null }) => string | null;
  formatSourceDocumentMeta: (
    source: { date: string | null; externalReference: string | null; externalSystemStatus: string | null; counterpartyName: string | null },
    locale: Locale,
    fallback: string,
  ) => string | null;
  formatTransactionType: (type: AdminInventoryTransactionListResult["items"][number]["type"]) => string;
  getTransactionBadgeClass: (type: AdminInventoryTransactionListResult["items"][number]["type"]) => string;
  onOpenTransactionDrawer: (item: AdminInventoryTransactionListResult["items"][number]) => void;
  getTransactionPageHref: (page: number) => string;
};

export function InventoryTransactionsPanel({
  labels,
  locale,
  query,
  warehouses,
  transactionResult,
  formatDate,
  formatInventoryNote,
  formatSourceDocument,
  formatSourceDocumentMeta,
  formatTransactionType,
  getTransactionBadgeClass,
  onOpenTransactionDrawer,
  getTransactionPageHref,
}: InventoryTransactionsPanelProps) {
  return (
    <>
      <section className="mt-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Liste Filtreleri</p>
            <h4 className="text-base font-semibold text-neutral-950">İşlem listesini daralt</h4>
          </div>
          <form className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_220px_220px_180px_180px_auto]" aria-label="Stok işlemleri filtre formu">
        <input type="hidden" name="search" value={query.search} readOnly />
        <input type="hidden" name="stockStatusFilter" value={query.stockStatusFilter} readOnly />
        <input type="hidden" name="reservationFilter" value={query.reservationFilter} readOnly />
        <input type="hidden" name="warehouseFilter" value={query.warehouseFilter} readOnly />
        <input type="hidden" name="movementTypeFilter" value={query.movementTypeFilter} readOnly />
        <Input type="search" name="transactionSearch" defaultValue={query.transactionSearch} placeholder={labels.transactionSearch} aria-label={labels.transactionSearch} />
        <Select name="transactionType" defaultValue={query.transactionType}>
          <SelectTrigger>
            <SelectValue placeholder={`${labels.transactionFilterType}: ${labels.all}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.transactionFilterType}: {labels.all}</SelectItem>
            <SelectItem value="MANUAL_ADJUSTMENT">{labels.transactionFilterType}: {labels.inventoryMovementManualAdjustment}</SelectItem>
            <SelectItem value="STOCK_IN">{labels.transactionFilterType}: {labels.inventoryMovementPurchaseReceipt}</SelectItem>
            <SelectItem value="STOCK_OUT">{labels.transactionFilterType}: {labels.inventoryMovementDamageWriteOff}</SelectItem>
            <SelectItem value="TRANSFER">{labels.transactionFilterType}: {labels.transferStock}</SelectItem>
            <SelectItem value="STOCK_COUNT">{labels.transactionFilterType}: {labels.stockCountTitle}</SelectItem>
          </SelectContent>
        </Select>
        <Select name="transactionWarehouse" defaultValue={query.transactionWarehouse}>
          <SelectTrigger>
            <SelectValue placeholder={`${labels.transactionFilterWarehouse}: ${labels.allWarehouses}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.transactionFilterWarehouse}: {labels.allWarehouses}</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={`transaction-warehouse-${warehouse.id}`} value={warehouse.code}>
                {labels.transactionFilterWarehouse}: {warehouse.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="search" name="transactionSku" defaultValue={query.transactionSku} placeholder={labels.transactionFilterSku} aria-label={labels.transactionFilterSku} />
        <Input type="date" name="transactionStartDate" defaultValue={query.transactionStartDate} aria-label={labels.transactionFilterStartDate} />
        <Input type="date" name="transactionEndDate" defaultValue={query.transactionEndDate} aria-label={labels.transactionFilterEndDate} />
        <Button type="submit">{labels.search}</Button>
          </form>
      </section>

      <div className="mt-4 grid gap-3">
        {transactionResult.items.length === 0 ? (
          <EmptyStateCard title="Listelenecek stok işlemi bulunmadı" description="Arama veya filtreleri değiştirerek daha geniş bir hareket listesi görebilirsin." />
        ) : transactionResult.items.map((transaction) => (
          <article key={transaction.id} className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getTransactionBadgeClass(transaction.type)}>
                    {formatTransactionType(transaction.type)}
                  </Badge>
                  <Badge variant="secondary">
                    {transaction.lines.length} satır
                  </Badge>
                </div>
                <h4 className="mt-3 text-base font-semibold text-neutral-950">{transaction.transactionNumber}</h4>
                <p className="mt-1 text-xs text-neutral-500">{formatDate(transaction.createdAt, locale, labels.notSpecified)}</p>
                <p className="mt-3 text-sm text-neutral-600">{formatInventoryNote(transaction.note) ?? transaction.reference ?? labels.notSpecified}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Belge Tipi</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-950">
                      {formatSourceDocument({
                        type: transaction.sourceDocument.type,
                        number: null,
                      }) ?? labels.notSpecified}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Belge Numarası</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-950">{transaction.sourceDocument.number ?? labels.notSpecified}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {transaction.lines.slice(0, 3).map((line) => (
                    <span key={line.id} className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                      {line.inventoryItemName} • {line.inventoryItemSku} • {line.quantity}
                    </span>
                  ))}
                  {transaction.lines.length > 3 ? (
                    <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
                      +{transaction.lines.length - 3} satır daha
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[340px] xl:grid-cols-1">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Referans</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{transaction.reference ?? labels.notSpecified}</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Belge</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {formatSourceDocument({
                      type: transaction.sourceDocument.type,
                      number: transaction.sourceDocument.number,
                    }) ?? labels.notSpecified}
                  </p>
                  {formatSourceDocumentMeta(transaction.sourceDocument, locale, labels.notSpecified) ? (
                    <p className="mt-1 text-xs text-neutral-500">{formatSourceDocumentMeta(transaction.sourceDocument, locale, labels.notSpecified)}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenTransactionDrawer(transaction)}
                  className="h-12 rounded-2xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  {labels.viewDetails}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <a
          href={getTransactionPageHref(Math.max(1, transactionResult.page - 1))}
          className={`rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${transactionResult.page <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          {labels.prev}
        </a>
        <p className="text-sm text-neutral-500">{labels.page} {transactionResult.page}/{transactionResult.totalPages}</p>
        <a
          href={getTransactionPageHref(Math.min(transactionResult.totalPages, transactionResult.page + 1))}
          className={`rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${transactionResult.page >= transactionResult.totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          {labels.next}
        </a>
      </div>
    </>
  );
}

type InventoryCountsPanelProps = {
  labels: CountsLabels;
  locale: Locale;
  stockCounts: AdminStockCountItem[];
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
  stockCountStatusClass: (status: AdminStockCountItem["status"]) => string;
  stockCountStatusLabel: (status: AdminStockCountItem["status"]) => string;
  onOpenStockCountDrawer: (mode: "create" | "edit", item?: AdminStockCountItem) => void;
};

export function InventoryCountsPanel({
  labels,
  locale,
  stockCounts,
  formatDate,
  stockCountStatusClass,
  stockCountStatusLabel,
  onOpenStockCountDrawer,
}: InventoryCountsPanelProps) {
  const openCounts = stockCounts.filter((count) => count.status !== "APPLIED");
  const varianceCounts = stockCounts.filter((count) => count.varianceLineCount > 0);
  const appliedCounts = stockCounts.filter((count) => count.status === "APPLIED");
  const highestVarianceCount = [...stockCounts].sort((left, right) => right.varianceLineCount - left.varianceLineCount)[0] ?? null;

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-950">{labels.stockCountTitle}</h3>
          <p className="mt-1 text-sm text-neutral-600">{labels.stockCountDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenStockCountDrawer("create")}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {labels.createStockCount}
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-3xl border border-neutral-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Sayım Özeti</p>
            <h4 className="text-base font-semibold text-neutral-950">Önce hangi sayım ele alınmalı?</h4>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Açık sayım</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">{openCounts.length}</p>
            </article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Farklı sayım</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">{varianceCounts.length}</p>
            </article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Tamamlanan</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">{appliedCounts.length}</p>
            </article>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-sm font-semibold text-neutral-950">Operasyon notu</p>
              <p className="mt-2 text-sm text-neutral-600">Uygulamadan önce varyanslı satırları ve rezervasyon etkisini doğrula.</p>
            </article>
            <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
              <p className="text-sm font-semibold text-neutral-950">En yüksek fark baskısı</p>
              <p className="mt-2 text-sm text-neutral-600">
                {highestVarianceCount
                  ? `${highestVarianceCount.countNumber} • ${highestVarianceCount.varianceLineCount} satır fark içeriyor.`
                  : "Henüz fark baskısı oluşmuş bir sayım yok."}
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Kullanım Mantığı</p>
            <h4 className="text-base font-semibold text-neutral-950">Basit akış</h4>
          </div>
          <div className="mt-4 grid gap-3">
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-950">1. Sayımı seç</p>
              <p className="mt-1 text-sm text-neutral-600">Açık veya varyanslı sayımı listeden aç.</p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-950">2. Fark önizlemesini oku</p>
              <p className="mt-1 text-sm text-neutral-600">Drawer içindeki üç adımlı yapı ile hazırlık ve fark satırlarını doğrula.</p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-950">3. Uygulama sonucunu kapat</p>
              <p className="mt-1 text-sm text-neutral-600">İşlem sonrası sonucu aynı drawer içinde gör ve bir sonraki sayımına geç.</p>
            </article>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {stockCounts.length === 0 ? (
          <EmptyStateCard title="Oluşturulmuş sayım bulunmuyor" description="Yeni bir stok sayımı başlatarak varyans takibini buradan yönetebilirsin." />
        ) : stockCounts.map((count) => (
          <article key={count.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{count.countNumber}</p>
                <h4 className="mt-1 text-base font-semibold text-neutral-950">{count.warehouseCode ?? labels.allWarehouses}</h4>
                <p className="mt-2 text-xs text-neutral-600">
                  {count.status === "APPLIED"
                    ? "Sayım sisteme işlendi."
                    : count.varianceLineCount > 0
                      ? "Farklı satırlar kontrol bekliyor."
                      : "Sayım satırları gözden geçirilmeye hazır."}
                </p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${stockCountStatusClass(count.status)}`}>
                {stockCountStatusLabel(count.status)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.stockCountLineCount}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{count.lineCount}</p>
              </article>
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.stockCountVarianceCount}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{count.varianceLineCount}</p>
              </article>
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.stockCountDate}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{formatDate(count.countedAt, locale, labels.notSpecified)}</p>
              </article>
            </div>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Uygulama Önizlemesi</p>
              <p className="mt-1 text-sm text-neutral-700">
                {count.varianceLineCount > 0
                  ? `${count.varianceLineCount} satırda fark var. Uygulama öncesi satırları tek tek doğrulaman önerilir.`
                  : "Sayım satırları sistemle uyumlu görünüyor. Uygulama öncesi son kontrol yeterli olacaktır."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenStockCountDrawer("edit", count)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {labels.viewDetails}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

type InventoryWarehousesPanelProps = {
  labels: WarehousesLabels;
  warehouses: AdminWarehouseItem[];
  onFocusWarehouse: (warehouseCode: string) => void;
  onOpenWarehouseDrawer: (mode: "create" | "edit", warehouse?: AdminWarehouseItem) => void;
};

export function InventoryWarehousesPanel({
  labels,
  warehouses,
  onFocusWarehouse,
  onOpenWarehouseDrawer,
}: InventoryWarehousesPanelProps) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-950">{labels.warehousesTitle}</h3>
          <p className="mt-1 text-sm text-neutral-600">{labels.warehousesDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenWarehouseDrawer("create")}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {labels.createWarehouse}
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {warehouses.length === 0 ? (
          <EmptyStateCard title="Tanimli depo bulunmuyor" description="Ilk depoyu ekledikten sonra stok hareketleri depo bazli izlenir." />
        ) : warehouses.map((warehouse) => (
          <article key={warehouse.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{warehouse.code}</p>
                <h4 className="mt-1 text-base font-semibold text-neutral-950">{warehouse.name}</h4>
                <p className="mt-2 text-xs text-neutral-600">
                  {warehouse.isActive ? "Stok hareketlerine açık depo." : "Pasif durumda, yeni işlem almıyor."}
                </p>
              </div>
              {warehouse.isDefault ? (
                <span className="inline-flex rounded-full bg-neutral-900 px-2 py-1 text-[10px] font-semibold text-white">{labels.defaultLabel}</span>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.warehouseStatus}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{warehouse.isActive ? labels.active : labels.passive}</p>
              </article>
              <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.levelCount}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{warehouse.levelCount}</p>
              </article>
            </div>
            {(warehouse.contactName || warehouse.contactPhone || warehouse.address) ? (
              <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
                <p className="font-semibold text-neutral-800">İletişim</p>
                <p className="mt-1">{warehouse.contactName ?? "Yetkili tanımlı değil"}</p>
                <p>{warehouse.contactPhone ?? "Telefon tanımlı değil"}</p>
                <p className="mt-1">{warehouse.address ?? "Adres tanımlı değil"}</p>
              </div>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => onFocusWarehouse(warehouse.code)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                {labels.focusWarehouse}
              </button>
              <button
                type="button"
                onClick={() => onOpenWarehouseDrawer("edit", warehouse)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                {labels.editWarehouse}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

type InventoryListResultsPanelProps = {
  labels: InventoryListLabels;
  locale: Locale;
  result: AdminInventoryListResult;
  compactInventoryList: boolean;
  visibleColumns: {
    warehouse: boolean;
    stock: boolean;
    movement: boolean;
    reservation: boolean;
    preference: boolean;
  };
  bulkOperationResult: BulkOperationResult | null;
  bulkFailureSummary: Array<{ code: string; message: string; count: number; hint: string | null }>;
  feedback: { type: "success" | "error"; message: string } | null;
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
  formatProductType: (value: string) => string;
  formatUnitType: (value: string) => string;
  statusClass: (status: AdminInventoryListResult["items"][number]["stockStatus"]) => string;
  statusLabel: (
    status: AdminInventoryListResult["items"][number]["stockStatus"],
    labels: InventoryListLabels,
  ) => string;
  movementTypeClass: (movementType: string | null) => string;
  movementTypeLabel: (movementType: string | null, labels: InventoryListLabels) => string;
  getRowKey: (item: AdminInventoryListResult["items"][number]) => string;
  getPageHref: (page: number) => string;
  prevPage: number | null;
  nextPage: number | null;
  onOpenDrawer: (item: AdminInventoryListResult["items"][number], timestamp: number) => void;
};

export function InventoryListResultsPanel({
  labels,
  locale,
  result,
  compactInventoryList,
  visibleColumns,
  bulkOperationResult,
  bulkFailureSummary,
  feedback,
  formatDate,
  formatProductType,
  formatUnitType,
  statusClass,
  statusLabel,
  movementTypeClass,
  movementTypeLabel,
  getRowKey,
  getPageHref,
  prevPage,
  nextPage,
  onOpenDrawer,
}: InventoryListResultsPanelProps) {
  return (
    <>
      {feedback ? (
        <p className={`mx-5 mt-4 rounded-lg border px-3 py-2 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {feedback.message}
        </p>
      ) : null}

      {bulkOperationResult ? (
        <div className="mx-5 mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-neutral-950">Toplu işlem özeti</span>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Başarılı: {bulkOperationResult.successCount}</span>
            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Hatalı: {bulkOperationResult.failureCount}</span>
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">Toplam: {bulkOperationResult.total}</span>
          </div>
          {bulkFailureSummary.length > 0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {bulkFailureSummary.map((item) => (
                <article key={item.code} className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-rose-900">{item.message}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-rose-700">{item.count} satır</span>
                  </div>
                  {item.hint ? <p className="mt-2 text-xs text-rose-800">{item.hint}</p> : null}
                </article>
              ))}
            </div>
          ) : null}
          <div className="mt-4 grid gap-2">
            {bulkOperationResult.rows.slice(0, 16).map((row) => (
              <article key={`${row.rowNumber}-${row.sku}-${row.message}`} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">
                      Satır {row.rowNumber} • {row.sku || "SKU yok"}
                      {row.warehouseCode ? ` • ${row.warehouseCode}` : ""}
                    </p>
                    {row.inputSummary ? <p className="mt-1 text-xs text-neutral-500">{row.inputSummary}</p> : null}
                  </div>
                  <span className={row.success ? "text-emerald-700" : "text-rose-700"}>{row.message}</span>
                </div>
                {!row.success && row.hint ? <p className="mt-2 text-xs text-rose-700">Öneri: {row.hint}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-b-3xl">
        <div className="hidden grid-cols-[1.5fr_180px_180px_150px_140px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
          <span>{labels.product}</span>
          <span>{labels.warehouse}</span>
          <span>Stok Özeti</span>
          <span>Operasyon Sinyali</span>
          <span>{labels.detail}</span>
        </div>

        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyStateCard title="Filtrelere uygun stok kaydi bulunmadi" description="Arama terimini sadeleştir veya filtreleri temizleyerek tum stok kayitlarini tekrar listele." />
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {result.items.map((item) => {
              const rowKey = getRowKey(item);
              const stockSignal = item.availableStock <= 0
                ? "Stok tükendi"
                : item.availableStock <= item.safetyStock
                  ? "Güvenlik stok sınırında"
                  : item.availableStock <= item.reorderPoint
                    ? "Yeniden sipariş gerekli"
                    : "Stok seviyesi sağlıklı";

              return (
                <article key={rowKey} className={`grid gap-3 p-4 transition hover:bg-neutral-50 ${compactInventoryList ? "lg:grid-cols-[1.5fr_150px_150px_120px]" : "lg:grid-cols-[1.5fr_180px_180px_150px_140px]"} lg:items-center`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-neutral-950">{item.name}</p>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(item.stockStatus)}`}>
                        {statusLabel(item.stockStatus, labels)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-neutral-500">/{item.slug} · {labels.sku}: {item.sku}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700">{formatProductType(item.productType)}</span>
                      <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700">{formatUnitType(item.unitType)}</span>
                      {visibleColumns.reservation && item.hasReservations ? <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-800">Rezervasyon var</span> : null}
                      {visibleColumns.preference && item.preferredSalesWarehouseCode ? <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700">Satış deposu: {item.preferredSalesWarehouseCode}</span> : null}
                    </div>
                  </div>
                  <div className="grid gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3 text-sm lg:hidden">
                    {visibleColumns.warehouse ? <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-neutral-500">{labels.warehouse}</span><span className="text-sm text-neutral-700">{item.warehouseName ?? item.warehouseCode ?? labels.notSpecified}</span></div> : null}
                    <div className="grid gap-2 text-xs text-neutral-600">
                      {visibleColumns.stock ? <><p>{labels.availableStock}: <span className="font-semibold text-neutral-900">{item.availableStock}</span> • {labels.onHandStock}: <span className="font-semibold text-neutral-900">{item.onHandStock}</span></p><p>{labels.reservedStock}: <span className="font-semibold text-neutral-900">{item.reservedStock}</span> • Min: <span className="font-semibold text-neutral-900">{item.reorderPoint}</span></p></> : null}
                      <p>{stockSignal}</p>
                      {visibleColumns.movement ? <p>{labels.lastMovementAt}: <span className="font-semibold text-neutral-900">{formatDate(item.lastMovementAt, locale, labels.notSpecified)}</span></p> : null}
                    </div>
                    {visibleColumns.movement ? <div className="flex flex-wrap items-center gap-2"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${movementTypeClass(item.lastMovementType)}`}>{movementTypeLabel(item.lastMovementType, labels)}</span></div> : null}
                    <button type="button" onClick={(event) => onOpenDrawer(item, event.timeStamp)} className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100">{labels.viewDetails}</button>
                  </div>
                  {visibleColumns.warehouse ? <p className="hidden text-sm text-neutral-700 lg:block">{item.warehouseName ?? item.warehouseCode ?? labels.notSpecified}{item.isDefaultWarehouse ? <span className="ml-2 inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">{labels.defaultWarehouse}</span> : null}</p> : null}
                  {visibleColumns.stock ? <div className="hidden lg:block"><p className="text-sm font-semibold text-neutral-950">{item.availableStock} kullanılabilir</p><p className="mt-1 text-xs text-neutral-500">Mevcut {item.onHandStock} • Rezerve {item.reservedStock} • Min {item.reorderPoint}</p></div> : null}
                  {visibleColumns.movement ? <div className="hidden lg:block"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${movementTypeClass(item.lastMovementType)}`}>{movementTypeLabel(item.lastMovementType, labels)}</span><p className="mt-2 text-xs text-neutral-500">{stockSignal}</p><p className="mt-1 text-xs text-neutral-500">{formatDate(item.lastMovementAt, locale, labels.notSpecified)}</p></div> : <div className="hidden lg:block"><p className="text-xs text-neutral-500">{stockSignal}</p></div>}
                  <button type="button" onClick={(event) => onOpenDrawer(item, event.timeStamp)} className="hidden h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 lg:block">{labels.viewDetails}</button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4">
        {prevPage ? <a href={getPageHref(prevPage)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">{labels.prev}</a> : <span />}
        <p className="text-sm text-neutral-500">{labels.page} {result.page}/{result.totalPages}</p>
        {nextPage ? <a href={getPageHref(nextPage)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">{labels.next}</a> : <span />}
      </div>
    </>
  );
}

type InventoryDrawerOverviewPanelProps = {
  item: AdminInventoryItem;
  labels: InventoryDrawerLabels;
  locale: Locale;
  drawerStockCoverage: string | null;
  drawerMarginEstimate: number | null;
  formatCurrency: (value: number, locale: Locale, currency?: string) => string;
  formatProductType: (value: string) => string;
  formatUnitType: (value: string) => string;
  statusClass: (status: AdminInventoryItem["stockStatus"]) => string;
  statusLabel: (status: AdminInventoryItem["stockStatus"], labels: InventoryDrawerLabels) => string;
};

export function InventoryDrawerOverviewPanel({
  item,
  labels,
  locale,
  drawerStockCoverage,
  drawerMarginEstimate,
  formatCurrency: formatCurrencyValue,
  formatProductType,
  formatUnitType,
  statusClass,
  statusLabel,
}: InventoryDrawerOverviewPanelProps) {
  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,47,73,0.94),rgba(21,128,61,0.88))] p-5 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Ürün Kartı</p>
            <h4 className="mt-2 text-2xl font-semibold">{item.name}</h4>
            <p className="mt-2 text-sm text-white/70">/{item.slug} • {labels.sku}: {item.sku}</p>
            <p className="mt-1 text-xs text-white/60">
              Barkod: {item.barcode ?? labels.notSpecified} • Birim: {formatUnitType(item.unitType)} • Tip: {formatProductType(item.productType)}
            </p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.stockStatus)}`}>
            {statusLabel(item.stockStatus, labels)}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-white/65">Operasyon deposu</p>
            <p className="mt-1 text-base font-semibold">
              {item.warehouseName ?? item.warehouseCode ?? labels.notSpecified}
            </p>
          </article>
          <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-white/65">{labels.onHandStock}</p>
            <p className="mt-1 text-base font-semibold">{item.onHandStock}</p>
          </article>
          <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-white/65">{labels.availableStock}</p>
            <p className="mt-1 text-base font-semibold">{item.availableStock}</p>
          </article>
        </div>
        <div className="mt-5 grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/65">Stok sinyali</p>
            <p className="mt-1 text-sm font-semibold text-white">{drawerStockCoverage ?? labels.notSpecified}</p>
          </div>
          <div>
            <p className="text-xs text-white/65">Tercihli satış deposu</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {item.preferredSalesWarehouseCode ?? labels.notSpecified}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/65">Tercihli tedarik deposu</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {item.preferredPurchaseWarehouseCode ?? labels.notSpecified}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Stok Kartı</p>
            <h4 className="mt-1 text-base font-semibold text-neutral-950">Anlık stok durumu</h4>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="text-xs text-neutral-500">{labels.onHandStock}</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900">{item.onHandStock}</p>
          </article>
          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-3">
            <p className="text-xs text-cyan-700">{labels.reservedStock}</p>
            <p className="mt-1 text-lg font-semibold text-cyan-800">{item.reservedStock}</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
            <p className="text-xs text-emerald-700">{labels.availableStock}</p>
            <p className="mt-1 text-lg font-semibold text-emerald-800">{item.availableStock}</p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
            <p className="text-xs text-amber-700">{labels.reorderPoint}</p>
            <p className="mt-1 text-lg font-semibold text-amber-800">{item.reorderPoint}</p>
          </article>
          <article className="rounded-2xl border border-orange-200 bg-orange-50/70 p-3 sm:col-span-2 lg:col-span-2">
            <p className="text-xs text-orange-700">{labels.safetyStock}</p>
            <p className="mt-1 text-lg font-semibold text-orange-800">{item.safetyStock}</p>
          </article>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="text-xs text-neutral-500">Ürün tipi</p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">{formatProductType(item.productType)}</p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="text-xs text-neutral-500">Birim tipi</p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">{formatUnitType(item.unitType)}</p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="text-xs text-neutral-500">Rezervasyon</p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">
              {item.hasReservations ? "Aktif rezervasyon var" : "Rezervasyon bulunmuyor"}
            </p>
          </article>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Rezervasyon Durumu</p>
            <p className="mt-2 text-sm font-semibold text-neutral-950">
              {item.hasReservations
                ? `${item.reservedStock} birim rezerve. Operasyon öncesi kullanılabilir stok ile çalış.`
                : "Aktif rezervasyon baskısı yok. Stok kararları doğrudan kullanılabilir stok üzerinden okunabilir."}
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Belge ve Hareket Özeti</p>
            <p className="mt-2 text-sm text-neutral-700">
              Son hareket tipi: <span className="font-semibold text-neutral-950">{item.lastMovementType ?? labels.notSpecified}</span>
            </p>
            <p className="mt-1 text-sm text-neutral-700">
              Son hareket zamanı: <span className="font-semibold text-neutral-950">{item.lastMovementAt ? new Date(item.lastMovementAt).toLocaleString(locale === "tr" ? "tr-TR" : "en-US") : labels.notSpecified}</span>
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Maliyet ve Ticari Kart</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Satış fiyatı</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">{formatCurrencyValue(item.unitPrice, locale)}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Alış fiyatı</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {item.purchasePrice === null ? labels.notSpecified : formatCurrencyValue(item.purchasePrice, locale)}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Liste fiyatı</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {item.compareAtPrice === null ? labels.notSpecified : formatCurrencyValue(item.compareAtPrice, locale)}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Tahmini stok marjı</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {drawerMarginEstimate === null ? labels.notSpecified : formatCurrencyValue(drawerMarginEstimate, locale)}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Maliyet Notu</p>
            <p className="mt-2 text-sm text-neutral-700">
              Bu kart operasyonel karşılaştırma sağlar. Resmî stok değerleme kararları rapor ekranındaki ortalama maliyet yaklaşımıyla okunmalıdır.
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Operasyon Profili</p>
          <div className="mt-4 space-y-3 text-sm text-neutral-700">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Tercihli satış deposu</p>
              <p className="mt-1 font-semibold text-neutral-950">{item.preferredSalesWarehouseCode ?? labels.notSpecified}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Tercihli tedarik deposu</p>
              <p className="mt-1 font-semibold text-neutral-950">{item.preferredPurchaseWarehouseCode ?? labels.notSpecified}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Stok kararı</p>
              <p className="mt-1 font-semibold text-neutral-950">{drawerStockCoverage ?? labels.notSpecified}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Operasyon yönü</p>
              <p className="mt-1 font-semibold text-neutral-950">
                {item.availableStock <= 0
                  ? "Öncelik stok girişi veya transfer"
                  : item.availableStock <= item.reorderPoint
                    ? "Öncelik tedarik ve yeniden sipariş planı"
                    : "Rutin izleme yeterli"}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

type InventoryDrawerDistributionPanelProps = {
  item: AdminInventoryItem;
};

export function InventoryDrawerDistributionPanel({
  item,
}: InventoryDrawerDistributionPanelProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Depo Dağılımı</p>
          <h4 className="mt-1 text-base font-semibold text-neutral-950">Tüm depolarda stok görünümü</h4>
        </div>
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700">
          {item.warehouseDistribution.length} depo
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {item.warehouseDistribution.length === 0 ? (
          <EmptyStateCard
            title="Dağılım kaydı bulunmuyor"
            description="Bu ürün için depo bazlı stok seviyesi oluştukça burada listelenecek."
          />
        ) : item.warehouseDistribution.map((distribution) => (
          <article key={`${item.productId}-${distribution.warehouseCode}`} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-950">{distribution.warehouseName}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {distribution.warehouseCode}
                  {distribution.isDefaultWarehouse ? " • Varsayılan depo" : ""}
                </p>
              </div>
              <div className="grid gap-1 text-right text-xs text-neutral-600">
                <p>Mevcut: <span className="font-semibold text-neutral-950">{distribution.onHandStock}</span></p>
                <p>Rezerve: <span className="font-semibold text-neutral-950">{distribution.reservedStock}</span></p>
                <p>Kullanılabilir: <span className="font-semibold text-neutral-950">{distribution.availableStock}</span></p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type InventoryDrawerMovementsPanelProps = {
  item: AdminInventoryItem;
  labels: InventoryDrawerLabels;
  locale: Locale;
  drawerDateRange: string;
  drawerMovementFilter: string;
  drawerMovementPage: number;
  drawerMovementTotalPages: number;
  movementTypeOptions: Array<{ value: string; label: string }>;
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
  formatInventoryNote: (note: string | null | undefined) => string | null | undefined;
  formatSourceDocument: (source: {
    type: string | null;
    number: string | null;
  }) => string | null;
  movementTypeClass: (movementType: string | null) => string;
  movementTypeLabel: (movementType: string | null, labels: InventoryDrawerLabels) => string;
  onDateRangeChange: (value: string, timeStamp: number) => void;
  onMovementFilterChange: (value: string) => void;
  onMovementPageChange: (page: number) => void;
  onViewAllHistory: () => void;
};

export function InventoryDrawerMovementsPanel({
  item,
  labels,
  locale,
  drawerDateRange,
  drawerMovementFilter,
  drawerMovementPage,
  drawerMovementTotalPages,
  movementTypeOptions,
  formatDate,
  formatInventoryNote,
  formatSourceDocument,
  movementTypeClass,
  movementTypeLabel,
  onDateRangeChange,
  onMovementFilterChange,
  onMovementPageChange,
  onViewAllHistory,
}: InventoryDrawerMovementsPanelProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Hareket Akışı</p>
          <h4 className="mt-1 text-sm font-semibold text-neutral-900">{labels.recentMovements}</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-neutral-600">{labels.movementDateRange}</label>
          <select
            value={drawerDateRange}
            onChange={(event) => onDateRangeChange(event.target.value, event.timeStamp)}
            className="h-9 rounded-xl border border-neutral-300 px-2 text-xs text-neutral-700"
          >
            <option value="all">{labels.movementAllTime}</option>
            <option value="24h">{labels.movementLast24Hours}</option>
            <option value="7d">{labels.movementLast7Days}</option>
            <option value="30d">{labels.movementLast30Days}</option>
          </select>
          <select
            value={drawerMovementFilter}
            onChange={(event) => onMovementFilterChange(event.target.value)}
            className="h-9 rounded-xl border border-neutral-300 px-2 text-xs text-neutral-700"
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
          onClick={onViewAllHistory}
          className="text-xs font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900"
        >
          {labels.viewAllHistory}
        </button>
        <p className="text-xs text-neutral-500">{labels.page} {drawerMovementPage}/{drawerMovementTotalPages}</p>
      </div>

      {item.recentMovements.length === 0 ? (
        <p className="text-xs text-neutral-500">{labels.noRecentMovements}</p>
      ) : (
        <ul className="space-y-2">
          {item.recentMovements.map((movement, index) => (
            <li key={`${movement.createdAt}:${index}`} className="grid gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs text-neutral-700 sm:grid-cols-[auto_auto_1fr] sm:items-start">
              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${movementTypeClass(movement.type)}`}>
                {movementTypeLabel(movement.type, labels)}
              </span>
              <span className={movement.quantity >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                {movement.quantity >= 0 ? `+${movement.quantity}` : movement.quantity}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-neutral-500">{formatDate(movement.createdAt, locale, labels.notSpecified)}</span>
                <span>{formatInventoryNote(movement.note) ?? labels.notSpecified}</span>
                {formatSourceDocument({
                  type: movement.sourceDocumentType,
                  number: movement.sourceDocumentNumber,
                }) ? (
                  <span className="text-[11px] font-medium text-neutral-600">
                    Kaynak: {formatSourceDocument({
                      type: movement.sourceDocumentType,
                      number: movement.sourceDocumentNumber,
                    })}
                  </span>
                ) : null}
                {movement.counterpartyWarehouseCode ? (
                  <span className="text-[11px] text-neutral-500">
                    {labels.movementCounterpartyWarehouse}: {movement.counterpartyWarehouseCode}
                  </span>
                ) : null}
                {movement.reference ? (
                  <span className="truncate text-[11px] text-neutral-400">
                    {labels.movementReference}: {movement.reference}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {drawerMovementTotalPages > 1 ? (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onMovementPageChange(Math.max(1, drawerMovementPage - 1))}
            disabled={drawerMovementPage <= 1}
            className="h-8 rounded-md border border-neutral-300 px-2 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {labels.prev}
          </button>
          <button
            type="button"
            onClick={() => onMovementPageChange(Math.min(drawerMovementTotalPages, drawerMovementPage + 1))}
            disabled={drawerMovementPage >= drawerMovementTotalPages}
            className="h-8 rounded-md border border-neutral-300 px-2 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {labels.next}
          </button>
        </div>
      ) : null}
    </section>
  );
}

type InventoryDrawerOperationPanelProps = {
  item: AdminInventoryItem;
  labels: InventoryDrawerLabels;
  locale: Locale;
  warehouses: AdminWarehouseItem[];
  suppliers: AdminSupplierItem[];
  drawerMode: DrawerMode;
  pendingRowKey: string | null;
  drawerTargetOnHand: string;
  drawerReorderPoint: string;
  drawerSafetyStock: string;
  drawerNote: string;
  drawerMovementQuantity: string;
  drawerTransferWarehouseCode: string;
  drawerTransferQuantity: string;
  drawerTransferNote: string;
  drawerPurchaseDocumentNumber: string;
  drawerPurchaseSupplierId: string;
  drawerPurchaseDocumentDate: string;
  drawerPurchaseDocumentType: "PURCHASE_DOCUMENT" | "DELIVERY_NOTE" | "E_INVOICE" | "E_DISPATCH";
  drawerPurchaseReference: string;
  drawerPurchaseExternalStatus: "NOT_SENT" | "QUEUED" | "SENT" | "FAILED";
  drawerPurchaseUnitCost: string;
  setDrawerMode: (mode: DrawerMode) => void;
  setDrawerTargetOnHand: (value: string) => void;
  setDrawerReorderPoint: (value: string) => void;
  setDrawerSafetyStock: (value: string) => void;
  setDrawerNote: (value: string) => void;
  setDrawerMovementQuantity: (value: string) => void;
  setDrawerTransferWarehouseCode: (value: string) => void;
  setDrawerTransferQuantity: (value: string) => void;
  setDrawerTransferNote: (value: string) => void;
  setDrawerPurchaseDocumentNumber: (value: string) => void;
  setDrawerPurchaseSupplierId: (value: string) => void;
  setDrawerPurchaseDocumentDate: (value: string) => void;
  setDrawerPurchaseDocumentType: (value: "PURCHASE_DOCUMENT" | "DELIVERY_NOTE" | "E_INVOICE" | "E_DISPATCH") => void;
  setDrawerPurchaseReference: (value: string) => void;
  setDrawerPurchaseExternalStatus: (value: "NOT_SENT" | "QUEUED" | "SENT" | "FAILED") => void;
  setDrawerPurchaseUnitCost: (value: string) => void;
  formatDate: (value: string | null, locale: Locale, fallback: string) => string;
  formatInventoryNote: (note: string | null | undefined) => string | null | undefined;
  formatSourceDocument: (source: {
    type: string | null;
    number: string | null;
  }) => string | null;
  movementTypeClass: (movementType: string | null) => string;
  movementTypeLabel: (movementType: string | null, labels: InventoryDrawerLabels) => string;
  onHistoryShortcut: (value: string) => void;
  onViewAllHistory: () => void;
  onApplyAdjustment: () => Promise<void>;
  onApplyMovement: (mode: "stock_in" | "stock_out") => Promise<void>;
  onApplyTransfer: () => Promise<void>;
};

export function InventoryDrawerOperationPanel({
  item,
  labels,
  locale,
  warehouses,
  suppliers,
  drawerMode,
  pendingRowKey,
  drawerTargetOnHand,
  drawerReorderPoint,
  drawerSafetyStock,
  drawerNote,
  drawerMovementQuantity,
  drawerTransferWarehouseCode,
  drawerTransferQuantity,
  drawerTransferNote,
  drawerPurchaseDocumentNumber,
  drawerPurchaseSupplierId,
  drawerPurchaseDocumentDate,
  drawerPurchaseDocumentType,
  drawerPurchaseReference,
  drawerPurchaseExternalStatus,
  drawerPurchaseUnitCost,
  setDrawerMode,
  setDrawerTargetOnHand,
  setDrawerReorderPoint,
  setDrawerSafetyStock,
  setDrawerNote,
  setDrawerMovementQuantity,
  setDrawerTransferWarehouseCode,
  setDrawerTransferQuantity,
  setDrawerTransferNote,
  setDrawerPurchaseDocumentNumber,
  setDrawerPurchaseSupplierId,
  setDrawerPurchaseDocumentDate,
  setDrawerPurchaseDocumentType,
  setDrawerPurchaseReference,
  setDrawerPurchaseExternalStatus,
  setDrawerPurchaseUnitCost,
  formatDate,
  formatInventoryNote,
  formatSourceDocument,
  movementTypeClass,
  movementTypeLabel,
  onHistoryShortcut,
  onViewAllHistory,
  onApplyAdjustment,
  onApplyMovement,
  onApplyTransfer,
}: InventoryDrawerOperationPanelProps) {
  const [activeCenterTab, setActiveCenterTab] = useState<"summary" | "operation" | "history">(drawerMode === "view" ? "summary" : "operation");
  const operationCards = [
    {
      id: "stock_in" as const,
      title: labels.stockIn,
      subtitle: "Satın alma, tedarik ve giriş kayıtlarını işle.",
      accent: "border-emerald-200 bg-emerald-50 text-emerald-900",
      disabled: !item.warehouseCode,
    },
    {
      id: "stock_out" as const,
      title: labels.stockOut,
      subtitle: "Hasar, fire veya manuel çıkış işlemi başlat.",
      accent: "border-rose-200 bg-rose-50 text-rose-900",
      disabled: !item.warehouseCode,
    },
    {
      id: "edit" as const,
      title: labels.adjustStock,
      subtitle: "Hedef stok, yeniden sipariş ve güvenlik stokunu düzelt.",
      accent: "border-sky-200 bg-sky-50 text-sky-900",
      disabled: false,
    },
    {
      id: "transfer" as const,
      title: labels.transferStock,
      subtitle: "Depolar arası yönlendirme ve iç transfer oluştur.",
      accent: "border-amber-200 bg-amber-50 text-amber-900",
      disabled: !item.warehouseCode,
    },
  ];

  const activeOperation = operationCards.find((card) => card.id === drawerMode) ?? null;
  const flowSteps = [
    {
      id: "select",
      label: "İşlem Seç",
      description: "Operasyon tipini belirle",
      state: activeOperation ? "done" : "active",
    },
    {
      id: "fill",
      label: "Formu Doldur",
      description: "Alanları tamamla",
      state: activeOperation ? "active" : "idle",
    },
    {
      id: "apply",
      label: "Uygula",
      description: "Kaydı stoklara işle",
      state: activeOperation ? "active" : "idle",
    },
  ] as const;

  return (
    <section className="rounded-3xl border border-neutral-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.92))] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">İşlem Merkezi</p>
          <h4 className="mt-1 text-base font-semibold text-neutral-950">Stok Operasyonu</h4>
          <p className="mt-1 text-sm text-neutral-600">
            Bu alandan tek ürün için stok girişi, çıkışı, transfer ve düzeltme işlemlerini güvenli biçimde yönetebilirsin.
          </p>
        </div>
        {drawerMode !== "view" ? (
          <button
            type="button"
            onClick={() => {
              setDrawerMode("view");
              setActiveCenterTab("summary");
            }}
            className="h-9 rounded-xl border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            Özet Görünümü
          </button>
        ) : null}
      </div>

      <div className="mb-4 grid gap-3 rounded-3xl border border-neutral-200 bg-neutral-50/80 p-4 lg:grid-cols-3">
        {flowSteps.map((step, index) => (
          <article
            key={step.id}
            className={`rounded-2xl border px-4 py-3 ${
              step.state === "done"
                ? "border-emerald-200 bg-emerald-50"
                : step.state === "active"
                  ? "border-neutral-900 bg-white"
                  : "border-neutral-200 bg-white/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  step.state === "done"
                    ? "bg-emerald-600 text-white"
                    : step.state === "active"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-950">{step.label}</p>
                <p className="text-xs text-neutral-500">{step.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "summary" as const, label: "Özet" },
            { id: "operation" as const, label: "İşlem" },
            { id: "history" as const, label: "Geçmiş" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCenterTab(tab.id)}
              className={`inline-flex h-10 items-center justify-center rounded-2xl border px-4 text-sm font-medium transition ${
                activeCenterTab === tab.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeCenterTab === "summary" ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            {activeOperation ? (
              <div className={`rounded-2xl border px-4 py-4 ${activeOperation.accent}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">Seçili Akış</p>
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-base font-semibold">{activeOperation.title}</p>
                  <p className="text-sm opacity-80">{activeOperation.subtitle}</p>
                  <div className="grid gap-2 text-xs opacity-80 sm:grid-cols-2">
                    <p>Operasyon deposu: {item.warehouseCode ?? labels.notSpecified}</p>
                    <p>Kullanılabilir stok: {item.availableStock}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                Önce işlem sekmesine geçip uygun operasyon kartını seçebilirsin.
              </div>
            )}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Uygulama Özeti</p>
              <div className="mt-3 space-y-2 text-sm text-neutral-700">
                <p>Ürün: <span className="font-semibold text-neutral-950">{item.name}</span></p>
                <p>SKU: <span className="font-semibold text-neutral-950">{item.sku}</span></p>
                <p>Mevcut stok: <span className="font-semibold text-neutral-950">{item.onHandStock}</span></p>
                <p>Kullanılabilir stok: <span className="font-semibold text-neutral-950">{item.availableStock}</span></p>
                <p>Rezerve stok: <span className="font-semibold text-neutral-950">{item.reservedStock}</span></p>
              </div>
            </div>
          </div>
        ) : null}

        {activeCenterTab === "history" ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Tümü" },
                  { value: "PURCHASE_RECEIPT", label: "Giriş" },
                  { value: "TRANSFER_OUT", label: "Transfer" },
                  { value: "MANUAL_ADJUSTMENT", label: "Düzeltme" },
                ].map((shortcut) => (
                  <button
                    key={shortcut.value}
                    type="button"
                    onClick={() => onHistoryShortcut(shortcut.value)}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onViewAllHistory}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-900 bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-800"
              >
                Tümünü Gör
              </button>
            </div>
            {item.recentMovements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                Bu ürün için yakın tarihli işlem geçmişi bulunmuyor.
              </div>
            ) : (
              item.recentMovements.slice(0, 6).map((movement, index) => (
                <article key={`${movement.createdAt}-${index}`} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${movementTypeClass(movement.type)}`}>
                          {movementTypeLabel(movement.type, labels)}
                        </span>
                        {movement.counterpartyWarehouseCode ? (
                          <span className="inline-flex rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600">
                            {labels.movementCounterpartyWarehouse}: {movement.counterpartyWarehouseCode}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-neutral-700">{formatInventoryNote(movement.note) ?? labels.notSpecified}</p>
                      <div className="mt-2 space-y-1 text-xs text-neutral-500">
                        <p>{formatDate(movement.createdAt, locale, labels.notSpecified)}</p>
                        {formatSourceDocument({
                          type: movement.sourceDocumentType,
                          number: movement.sourceDocumentNumber,
                        }) ? (
                          <p>
                            Kaynak: {formatSourceDocument({
                              type: movement.sourceDocumentType,
                              number: movement.sourceDocumentNumber,
                            })}
                          </p>
                        ) : null}
                        {movement.reference ? <p>{labels.movementReference}: {movement.reference}</p> : null}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-right">
                      <p className={`text-sm font-semibold ${movement.quantity >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {movement.quantity >= 0 ? `+${movement.quantity}` : movement.quantity}
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-500">Miktar</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}

        {activeCenterTab === "operation" ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {operationCards.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    setDrawerMode(action.id as DrawerMode);
                    setActiveCenterTab("operation");
                  }}
                  disabled={action.disabled}
                  className={`rounded-3xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    drawerMode === action.id ? `${action.accent} shadow-sm ring-1 ring-inset ring-current/10` : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">İşlem</span>
                  <span className="mt-2 block text-sm font-semibold">{action.title}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-80">{action.subtitle}</span>
                  {!action.disabled ? null : (
                    <span className="mt-3 inline-flex rounded-full border border-current/15 bg-white/60 px-2 py-1 text-[11px] font-medium">
                      Depo seçimi gerekli
                    </span>
                  )}
                </button>
              ))}
            </div>

        {drawerMode === "edit" ? (
          <form
            className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onApplyAdjustment();
          }}
        >
          <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
            <p className="text-sm font-semibold text-sky-950">Hedef Stok Ayarı</p>
            <p className="mt-1 text-xs text-sky-900/80">Sistem stok seviyesini, yeniden sipariş noktasını ve güvenlik stokunu birlikte günceller.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-neutral-600">{labels.targetOnHandStock}</label>
              <Input type="number" min={0} value={drawerTargetOnHand} onChange={(event) => setDrawerTargetOnHand(event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-neutral-600">{labels.targetReorderPoint}</label>
              <Input type="number" min={0} value={drawerReorderPoint} onChange={(event) => setDrawerReorderPoint(event.target.value)} required />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <label className="text-xs font-medium text-neutral-600">{labels.targetSafetyStock}</label>
              <Input type="number" min={0} value={drawerSafetyStock} onChange={(event) => setDrawerSafetyStock(event.target.value)} required />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-neutral-600">{labels.adjustmentNote}</label>
            <Textarea value={drawerNote} onChange={(event) => setDrawerNote(event.target.value)} placeholder={labels.adjustmentNote} rows={4} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={Boolean(pendingRowKey)}>
              {pendingRowKey ? "..." : labels.applyAdjustment}
            </Button>
          </div>
        </form>
      ) : drawerMode === "stock_in" || drawerMode === "stock_out" ? (
        <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onApplyMovement(drawerMode);
          }}
        >
          <div className={`rounded-2xl border p-4 ${drawerMode === "stock_in" ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"}`}>
            <p className={`text-sm font-semibold ${drawerMode === "stock_in" ? "text-emerald-950" : "text-rose-950"}`}>
              {drawerMode === "stock_in" ? "Stok Giriş Akışı" : "Stok Çıkış Akışı"}
            </p>
            <p className={`mt-1 text-xs ${drawerMode === "stock_in" ? "text-emerald-900/80" : "text-rose-900/80"}`}>
              {drawerMode === "stock_in"
                ? "Miktarı ve belge bilgisini girerek giriş kaydını satın alma referansıyla işleyebilirsin."
                : "Miktarı ve açıklamayı girerek kontrollü stok çıkışı oluşturabilirsin."}
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-neutral-600">{labels.movementQuantity}</label>
            <Input type="number" min={1} step={1} value={drawerMovementQuantity} onChange={(event) => setDrawerMovementQuantity(event.target.value)} required />
          </div>
          {drawerMode === "stock_in" ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-emerald-950">Satın alma belgesi</p>
                <p className="mt-1 text-xs text-emerald-800">Belge alanlarını doldurursan stok girişi satın alma kaydı olarak izlenir.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-neutral-600">Belge tipi</label>
                  <Select value={drawerPurchaseDocumentType} onValueChange={(value) => setDrawerPurchaseDocumentType(value as "PURCHASE_DOCUMENT" | "DELIVERY_NOTE" | "E_INVOICE" | "E_DISPATCH")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Belge tipi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE_DOCUMENT">Satın alma belgesi</SelectItem>
                      <SelectItem value="DELIVERY_NOTE">İrsaliye</SelectItem>
                      <SelectItem value="E_INVOICE">E-fatura</SelectItem>
                      <SelectItem value="E_DISPATCH">E-irsaliye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-neutral-600">Belge numarası</label>
                  <Input value={drawerPurchaseDocumentNumber} onChange={(event) => setDrawerPurchaseDocumentNumber(event.target.value)} placeholder="ALIS-2026-001" />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-neutral-600">Tedarikçi</label>
                  <SearchableSelect
                    value={drawerPurchaseSupplierId}
                    onValueChange={setDrawerPurchaseSupplierId}
                    options={suppliers
                      .filter((supplier) => supplier.isActive)
                      .map((supplier) => ({
                        value: supplier.id,
                        label: supplier.name,
                        description: supplier.taxNumber || supplier.email || supplier.phone || undefined,
                      }))}
                    placeholder="Tedarikçi seç"
                    searchPlaceholder="Tedarikçi ara"
                    emptyLabel="Eşleşen tedarikçi bulunamadı."
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-neutral-600">Belge tarihi</label>
                  <Input type="datetime-local" value={drawerPurchaseDocumentDate} onChange={(event) => setDrawerPurchaseDocumentDate(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-neutral-600">Harici referans</label>
                  <Input value={drawerPurchaseReference} onChange={(event) => setDrawerPurchaseReference(event.target.value)} placeholder="Irsaliye / e-fatura no" />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-neutral-600">Dış sistem durumu</label>
                  <Select value={drawerPurchaseExternalStatus} onValueChange={(value) => setDrawerPurchaseExternalStatus(value as "NOT_SENT" | "QUEUED" | "SENT" | "FAILED")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Dis sistem durumu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_SENT">Gonderilmedi</SelectItem>
                      <SelectItem value="QUEUED">Kuyrukta</SelectItem>
                      <SelectItem value="SENT">Gonderildi</SelectItem>
                      <SelectItem value="FAILED">Hata aldi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-xs font-medium text-neutral-600">Birim maliyet</label>
                  <Input type="number" min={0} step="0.01" value={drawerPurchaseUnitCost} onChange={(event) => setDrawerPurchaseUnitCost(event.target.value)} placeholder="0.00" />
                </div>
              </div>
            </div>
          ) : null}
          <div className="grid gap-2">
            <label className="text-xs font-medium text-neutral-600">{labels.adjustmentNote}</label>
            <Textarea value={drawerNote} onChange={(event) => setDrawerNote(event.target.value)} placeholder={labels.adjustmentNote} rows={4} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={Boolean(pendingRowKey)}>
              {pendingRowKey ? "..." : drawerMode === "stock_in" ? labels.stockIn : labels.stockOut}
            </Button>
          </div>
        </form>
      ) : drawerMode === "transfer" ? (
        <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onApplyTransfer();
          }}
        >
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="text-sm font-semibold text-amber-950">Depo Transfer Akışı</p>
            <p className="mt-1 text-xs text-amber-900/80">Kaynak depodan hedef depoya miktar taşıyarak kurum içi stok hareketi oluşturursun.</p>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-neutral-600">{labels.transferTargetWarehouse}</label>
            <Select
              value={drawerTransferWarehouseCode || "__empty__"}
              onValueChange={(value) => setDrawerTransferWarehouseCode(value === "__empty__" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={labels.notSpecified} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__empty__">{labels.notSpecified}</SelectItem>
                {warehouses
                  .filter((warehouse) => warehouse.isActive && warehouse.code !== item.warehouseCode)
                  .map((warehouse) => (
                    <SelectItem key={`transfer-${warehouse.id}`} value={warehouse.code}>
                      {warehouse.code} - {warehouse.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-neutral-600">{labels.transferQuantity}</label>
            <Input type="number" min={1} step={1} value={drawerTransferQuantity} onChange={(event) => setDrawerTransferQuantity(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-neutral-600">{labels.transferNote}</label>
            <Textarea value={drawerTransferNote} onChange={(event) => setDrawerTransferNote(event.target.value)} placeholder={labels.transferNote} rows={4} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={Boolean(pendingRowKey)}>
              {pendingRowKey ? "..." : labels.applyTransfer}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Ne Yapılabilir</p>
            <p className="mt-2 text-sm text-neutral-700">Stok girişi, stok çıkışı, manuel düzeltme ve depo transferi işlemlerini bu drawer içinden yönetebilirsin.</p>
          </article>
          <article className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Önerilen Başlangıç</p>
            <p className="mt-2 text-sm text-neutral-700">Önce üstteki işlem kartından akışı seç, sonra ilgili form alanlarını doldurup kaydı uygula.</p>
          </article>
        </div>
      )}
          </>
        ) : null}
      </div>
    </section>
  );
}
