"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Maximize2, Minimize2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Locale } from "@/lib/i18n";
import type {
  AdminInventoryAlertSummary,
  AdminExternalStockEventMonitoring,
  AdminInventoryExportHistoryItem,
  AdminInventoryListResult,
  AdminInventoryListPreferences,
  AdminInventoryOperationHistoryItem,
  AdminInventoryReportsResult,
  AdminStockCountItem,
  AdminInventoryTransactionListResult,
  AdminWarehouseItem,
  BulkOperationResult,
  InventoryListColumnPreference,
} from "@/modules/inventory/contracts/inventory.contract";

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
  reorderPoint: string;
  safetyStock: string;
  stockStatus: string;
  movementType: string;
  movementReference: string;
  movementCounterpartyWarehouse: string;
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
  stockIn: string;
  stockOut: string;
  targetOnHandStock: string;
  targetReorderPoint: string;
  targetSafetyStock: string;
  adjustmentNote: string;
  applyAdjustment: string;
  adjustmentSaved: string;
  adjustmentFailed: string;
  movementQuantity: string;
  stockInSaved: string;
  stockInFailed: string;
  stockOutSaved: string;
  stockOutFailed: string;
  transferStock: string;
  transferQuantity: string;
  transferTargetWarehouse: string;
  transferNote: string;
  applyTransfer: string;
  transferSaved: string;
  transferFailed: string;
  warehousesTitle: string;
  warehousesDescription: string;
  criticalStockTitle: string;
  criticalStockDescription: string;
  activeAlerts: string;
  reportsTitle: string;
  reportsDescription: string;
  sectionsTitle: string;
  sectionReports: string;
  sectionSync: string;
  sectionCritical: string;
  sectionCounts: string;
  sectionWarehouses: string;
  sectionTransactions: string;
  sectionInventoryList: string;
  integrationTitle: string;
  integrationDescription: string;
  syncPending: string;
  syncProcessing: string;
  syncFailed: string;
  syncDeadLetter: string;
  syncSuccess: string;
  syncRecentJobs: string;
  syncLastError: string;
  totalOnHandUnits: string;
  totalCostValue: string;
  totalSalesValue: string;
  totalPotentialProfit: string;
  averageCoverageDays: string;
  stockTurnoverRate: string;
  legacyStockFallbackCount: string;
  stockMismatchCount: string;
  consistencyTitle: string;
  consistencyDescription: string;
  legacyStockLabel: string;
  aggregateStockLabel: string;
  differenceLabel: string;
  noConsistencyIssues: string;
  warehouseCount: string;
  lowStockRows: string;
  outOfStockRows: string;
  warehousePerformance: string;
  lowStockReport: string;
  movementSummaryTitle: string;
  trendTitle: string;
  reportPeriod: string;
  reportComparePrevious: string;
  reportCostingMethod: string;
  reportPeriod7Days: string;
  reportPeriod30Days: string;
  reportPeriod90Days: string;
  reportCostAverage: string;
  reportCostLastPurchase: string;
  reportCurrentPeriod: string;
  reportPreviousPeriod: string;
  reportDifference: string;
  reportMovementCount: string;
  reportRange: string;
  velocityTitle: string;
  velocityDescription: string;
  slowMovingTitle: string;
  slowMovingDescription: string;
  abcTitle: string;
  abcDescription: string;
  costValue: string;
  salesValue: string;
  potentialProfit: string;
  movementCount: string;
  totalQuantityLabel: string;
  trendStockIn: string;
  trendStockOut: string;
  trendNet: string;
  last30DayOutboundUnits: string;
  coverageDays: string;
  inactivityDays: string;
  sharePercent: string;
  segment: string;
  viewInInventory: string;
  openInTransactions: string;
  startStockCount: string;
  reviewLowStock: string;
  reviewSlowMoving: string;
  focusWarehouse: string;
  stockCountTitle: string;
  stockCountDescription: string;
  createStockCount: string;
  stockCountWarehouseScope: string;
  stockCountDate: string;
  stockCountNote: string;
  stockCountSearch: string;
  stockCountCreateAction: string;
  stockCountSaved: string;
  stockCountSaveFailed: string;
  stockCountApply: string;
  stockCountApplied: string;
  stockCountApplyFailed: string;
  stockCountLineCount: string;
  stockCountVarianceCount: string;
  stockCountCountedOnHand: string;
  stockCountDifference: string;
  stockCountEditLine: string;
  stockCountLineSaved: string;
  stockCountLineSaveFailed: string;
  stockCountStatusDraft: string;
  stockCountStatusCounted: string;
  stockCountStatusApplied: string;
  alertTypeLowStock: string;
  alertTypeOutOfStock: string;
  alertMessage: string;
  alertCreatedAt: string;
  noAlerts: string;
  createWarehouse: string;
  editWarehouse: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseDescription: string;
  warehouseAddress: string;
  warehouseContactName: string;
  warehouseContactPhone: string;
  warehousePriority: string;
  warehouseStatus: string;
  active: string;
  passive: string;
  defaultLabel: string;
  levelCount: string;
  saveWarehouse: string;
  warehouseSaved: string;
  warehouseSaveFailed: string;
  inventoryMovementInitialLoad: string;
  inventoryMovementManualAdjustment: string;
  inventoryMovementPurchaseReceipt: string;
  inventoryMovementTransferOut: string;
  inventoryMovementTransferIn: string;
  inventoryMovementReservationHold: string;
  inventoryMovementReservationRelease: string;
  inventoryMovementOrderCommit: string;
  inventoryMovementOrderCancelRestock: string;
  inventoryMovementReturnRestock: string;
  inventoryMovementDamageWriteOff: string;
  transactionsTitle: string;
  transactionsDescription: string;
  transactionNumber: string;
  transactionType: string;
  transactionCreatedAt: string;
  transactionLines: string;
  transactionSearch: string;
  transactionFilterType: string;
  transactionFilterWarehouse: string;
  transactionFilterSku: string;
  transactionFilterStartDate: string;
  transactionFilterEndDate: string;
  notSpecified: string;
};

function formatDate(value: string | null, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
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

  if (movementType === "COUNT_ADJUSTMENT") {
    return labels.adjustStock;
  }

  if (movementType === "TRANSFER_OUT") {
    return labels.inventoryMovementTransferOut;
  }

  if (movementType === "TRANSFER_IN") {
    return labels.inventoryMovementTransferIn;
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

  if (movementType === "COUNT_ADJUSTMENT") {
    return "bg-indigo-100 text-indigo-700";
  }

  if (movementType === "TRANSFER_OUT") {
    return "bg-orange-100 text-orange-700";
  }

  if (movementType === "TRANSFER_IN") {
    return "bg-teal-100 text-teal-700";
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

function stockCountStatusLabel(status: AdminStockCountItem["status"], labels: Labels) {
  if (status === "APPLIED") {
    return labels.stockCountStatusApplied;
  }

  if (status === "COUNTED") {
    return labels.stockCountStatusCounted;
  }

  return labels.stockCountStatusDraft;
}

function stockCountStatusClass(status: AdminStockCountItem["status"]) {
  if (status === "APPLIED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "COUNTED") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-neutral-100 text-neutral-700";
}

function alertTypeLabel(type: "LOW_STOCK" | "OUT_OF_STOCK", labels: Labels) {
  return type === "OUT_OF_STOCK" ? labels.alertTypeOutOfStock : labels.alertTypeLowStock;
}

type DrawerMode = "view" | "edit" | "transfer" | "stock_in" | "stock_out";
type WarehouseDrawerMode = "create" | "edit";
type TransactionDrawerItem = AdminInventoryTransactionListResult["items"][number];
type StockCountDrawerMode = "create" | "edit";
type InventoryPageVariant = "overview" | "transactions" | "counts" | "warehouses" | "exports" | "external-events";
type InventoryListColumn = InventoryListColumnPreference;

const inventoryListPreferenceKey = "inventory-manager:list-preferences:v1";

function getDefaultVisibleColumns(): Record<InventoryListColumn, boolean> {
  return {
    warehouse: true,
    stock: true,
    movement: true,
    reservation: true,
    preference: false,
  };
}

function getDefaultInventoryListPreferences(): AdminInventoryListPreferences {
  return {
    compactInventoryList: false,
    visibleColumns: getDefaultVisibleColumns(),
  };
}

function normalizeInventoryListPreferences(
  preferences?: Partial<AdminInventoryListPreferences> | null,
): AdminInventoryListPreferences {
  const fallback = getDefaultInventoryListPreferences();

  if (!preferences) {
    return fallback;
  }

  return {
    compactInventoryList: Boolean(preferences.compactInventoryList),
    visibleColumns: {
      ...fallback.visibleColumns,
      ...preferences.visibleColumns,
    },
  };
}

function loadInventoryListPreferences(): AdminInventoryListPreferences {
  const fallback = getDefaultInventoryListPreferences();

  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(inventoryListPreferenceKey);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as {
      compactInventoryList?: boolean;
      visibleColumns?: Partial<Record<InventoryListColumn, boolean>>;
    };

    return {
      compactInventoryList: Boolean(parsed.compactInventoryList),
      visibleColumns: {
        ...fallback.visibleColumns,
        ...parsed.visibleColumns,
      },
    };
  } catch {
    window.localStorage.removeItem(inventoryListPreferenceKey);
    return fallback;
  }
}

type Props = {
  locale: Locale;
  result: AdminInventoryListResult;
  transactionResult: AdminInventoryTransactionListResult;
  warehouses: AdminWarehouseItem[];
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
  stockCounts: AdminStockCountItem[];
  reports: AdminInventoryReportsResult;
  integrationSummary: {
    pendingCount: number;
    processingCount: number;
    failedCount: number;
    deadLetterCount: number;
    successCount: number;
    recentJobs: Array<{
      id: string;
      channel: "TRENDYOL" | "N11";
      status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "DEAD_LETTER";
      entityId: string;
      createdAt: string;
      lastError: string | null;
    }>;
  };
  externalEventMonitoring: AdminExternalStockEventMonitoring;
  operationHistory: AdminInventoryOperationHistoryItem[];
  exportHistory: AdminInventoryExportHistoryItem[];
  inventoryPreferences: AdminInventoryListPreferences;
  query: {
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
    transactionPage: string;
    reportPeriodDays: string;
    reportComparePrevious: string;
    reportCostingMethod: string;
  };
  labels: Labels;
  overviewPath: string;
  inventoryListPath: string;
  transactionListPath: string;
  stockCountsPath: string;
  warehousesPath: string;
  exportsPath: string;
  externalEventsPath: string;
  pageVariant?: InventoryPageVariant;
  initialSectionGroup?: InventorySectionGroupId;
  initialSection?: InventorySectionId;
};

function formatCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDelta(value: number | null) {
  if (value === null) {
    return "Kıyas kapalı";
  }

  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

const inventorySectionAnchors = [
  { id: "inventory-reports", key: "sectionReports" as const },
  { id: "inventory-sync", key: "sectionSync" as const },
  { id: "inventory-critical", key: "sectionCritical" as const },
  { id: "inventory-counts", key: "sectionCounts" as const },
  { id: "inventory-warehouses", key: "sectionWarehouses" as const },
  { id: "inventory-transactions", key: "sectionTransactions" as const },
  { id: "inventory-exports", key: "sectionTransactions" as const },
  { id: "inventory-list", key: "sectionInventoryList" as const },
];

const inventorySectionGroups = [
  {
    id: "overview",
    label: "Genel Bakış",
    sections: ["inventory-reports", "inventory-critical"] as const,
  },
  {
    id: "operations",
    label: "Operasyonlar",
    sections: ["inventory-list", "inventory-counts", "inventory-sync"] as const,
  },
  {
    id: "definitions",
    label: "Tanımlar",
    sections: ["inventory-warehouses"] as const,
  },
  {
    id: "history",
    label: "Geçmiş",
    sections: ["inventory-transactions", "inventory-exports"] as const,
  },
] as const;

type InventorySectionId = (typeof inventorySectionAnchors)[number]["id"];
type InventorySectionGroupId = (typeof inventorySectionGroups)[number]["id"];

function getSectionPanelClass(activeSection: InventorySectionId, sectionId: InventorySectionId) {
  return activeSection === sectionId ? "border-b border-neutral-200 bg-white/90 p-5" : "hidden";
}

function EmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 p-5 text-sm">
      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-neutral-500">{description}</p>
    </div>
  );
}

function getInventoryPageMeta(pageVariant: InventoryPageVariant) {
  if (pageVariant === "transactions") {
    return {
      badge: "Stok Hareketleri",
      shortTitle: "Islemler",
      breadcrumbCurrent: "Stok Islemleri",
      accentClass: "from-sky-500/15 via-cyan-500/10 to-transparent",
    };
  }

  if (pageVariant === "counts") {
    return {
      badge: "Sayim Operasyonu",
      shortTitle: "Sayimlar",
      breadcrumbCurrent: "Stok Sayimlari",
      accentClass: "from-amber-500/15 via-orange-500/10 to-transparent",
    };
  }

  if (pageVariant === "warehouses") {
    return {
      badge: "Depo Tanimlari",
      shortTitle: "Depolar",
      breadcrumbCurrent: "Depo Yonetimi",
      accentClass: "from-emerald-500/15 via-teal-500/10 to-transparent",
    };
  }

  if (pageVariant === "exports") {
    return {
      badge: "Dışa Aktarım Geçmişi",
      shortTitle: "Dışa Aktarımlar",
      breadcrumbCurrent: "Dışa Aktarım Geçmişi",
      accentClass: "from-fuchsia-500/15 via-sky-500/10 to-transparent",
    };
  }

  if (pageVariant === "external-events") {
    return {
      badge: "Harici Eventler",
      shortTitle: "Harici Eventler",
      breadcrumbCurrent: "Harici Stok Eventleri",
      accentClass: "from-cyan-500/15 via-sky-500/10 to-transparent",
    };
  }

  return {
    badge: "Merkezi Gorunum",
    shortTitle: "Genel Bakis",
    breadcrumbCurrent: "Stok Genel Bakis",
    accentClass: "from-violet-500/15 via-sky-500/10 to-transparent",
  };
}

function formatFilterSummary(filters: AdminInventoryExportHistoryItem["filters"]) {
  const parts = [
    filters.search ? `Arama: ${filters.search}` : null,
    filters.stockStatusFilter && filters.stockStatusFilter !== "all" ? `Stok durumu: ${filters.stockStatusFilter}` : null,
    filters.reservationFilter && filters.reservationFilter !== "all" ? `Rezervasyon: ${filters.reservationFilter}` : null,
    filters.warehouseFilter && filters.warehouseFilter !== "all" ? `Depo: ${filters.warehouseFilter}` : null,
    filters.movementTypeFilter && filters.movementTypeFilter !== "all" ? `Hareket: ${filters.movementTypeFilter}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : "Filtre kullanılmadan dışa aktarılmış.";
}

function formatSourceDocument(source: {
  type: string | null;
  number: string | null;
}) {
  if (!source.type && !source.number) {
    return null;
  }

  const typeLabelMap: Record<string, string> = {
    INVENTORY_ADJUSTMENT: "Stok Duzeltme",
    WAREHOUSE_TRANSFER: "Depo Transferi",
    PURCHASE_RECEIPT: "Stok Girisi",
    STOCK_WRITE_OFF: "Stok Cikisi",
    STOCK_COUNT: "Stok Sayimi",
    ORDER: "Siparis",
    RETURN: "Iade",
    INVOICE: "Fatura",
    WAYBILL: "Irsaliye",
  };

  const typeLabel = source.type ? (typeLabelMap[source.type] ?? source.type) : "Belge";
  return source.number ? `${typeLabel} • ${source.number}` : typeLabel;
}

function formatSourceDocumentMeta(source: {
  date: string | null;
  externalReference: string | null;
  counterpartyName: string | null;
}, locale: Locale, fallback: string) {
  const parts = [
    source.counterpartyName,
    source.externalReference ? `Harici ref: ${source.externalReference}` : null,
    source.date ? formatDate(source.date, locale, fallback) : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : null;
}

function formatProductType(value: string) {
  const labelMap: Record<string, string> = {
    PHYSICAL: "Fiziksel Ürün",
    SERVICE: "Hizmet",
    RAW_MATERIAL: "Hammadde",
    SEMI_FINISHED: "Yarı Mamul",
  };

  return labelMap[value] ?? value;
}

function formatUnitType(value: string) {
  const labelMap: Record<string, string> = {
    PIECE: "Adet",
    UNIT: "Birim",
    BOX: "Kutu",
    PACK: "Paket",
    KILOGRAM: "Kilogram",
    GRAM: "Gram",
    LITER: "Litre",
    METER: "Metre",
  };

  return labelMap[value] ?? value;
}

function formatTransactionType(
  type: AdminInventoryTransactionListResult["items"][number]["type"],
  labels: Labels,
) {
  if (type === "STOCK_IN") {
    return labels.inventoryMovementPurchaseReceipt;
  }

  if (type === "STOCK_OUT") {
    return labels.inventoryMovementDamageWriteOff;
  }

  if (type === "TRANSFER") {
    return labels.transferStock;
  }

  if (type === "STOCK_COUNT") {
    return labels.stockCountTitle;
  }

  return labels.inventoryMovementManualAdjustment;
}

function getTransactionBadgeClass(
  type: AdminInventoryTransactionListResult["items"][number]["type"],
) {
  if (type === "STOCK_IN") {
    return movementTypeClass("PURCHASE_RECEIPT");
  }

  if (type === "STOCK_OUT") {
    return movementTypeClass("DAMAGE_WRITE_OFF");
  }

  if (type === "TRANSFER") {
    return movementTypeClass("TRANSFER_OUT");
  }

  if (type === "STOCK_COUNT") {
    return movementTypeClass("COUNT_ADJUSTMENT");
  }

  return movementTypeClass("MANUAL_ADJUSTMENT");
}

function summarizeStockCount(lines: AdminStockCountItem["lines"]) {
  let matched = 0;
  let positive = 0;
  let negative = 0;
  let pending = 0;
  let netDifference = 0;

  for (const line of lines) {
    const difference = line.difference ?? (
      line.countedOnHand === null ? null : line.countedOnHand - line.systemOnHand
    );

    if (difference === null) {
      pending += 1;
      continue;
    }

    netDifference += difference;

    if (difference === 0) {
      matched += 1;
    } else if (difference > 0) {
      positive += 1;
    } else {
      negative += 1;
    }
  }

  return {
    matched,
    positive,
    negative,
    pending,
    netDifference,
  };
}

export function InventoryManager({
  locale,
  result,
  transactionResult,
  warehouses,
  alertResult,
  stockCounts,
  reports,
  integrationSummary,
  externalEventMonitoring,
  operationHistory,
  exportHistory,
  inventoryPreferences,
  query,
  labels,
  overviewPath,
  inventoryListPath,
  transactionListPath,
  stockCountsPath,
  warehousesPath,
  exportsPath,
  externalEventsPath,
  pageVariant = "overview",
  initialSectionGroup = "overview",
  initialSection = "inventory-reports",
}: Props) {
  const router = useRouter();
  const pageMeta = getInventoryPageMeta(pageVariant);
  const [activeSectionGroup, setActiveSectionGroup] = useState<InventorySectionGroupId>(initialSectionGroup);
  const [activeSection, setActiveSection] = useState<InventorySectionId>(initialSection);
  const [pendingRowKey, setPendingRowKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [drawerItem, setDrawerItem] = useState<AdminInventoryListResult["items"][number] | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [drawerFullscreen, setDrawerFullscreen] = useState(false);
  const [drawerMovementFilter, setDrawerMovementFilter] = useState("all");
  const [drawerDateRange, setDrawerDateRange] = useState("all");
  const [drawerMovementPage, setDrawerMovementPage] = useState(1);
  const [drawerTargetOnHand, setDrawerTargetOnHand] = useState("");
  const [drawerReorderPoint, setDrawerReorderPoint] = useState("");
  const [drawerSafetyStock, setDrawerSafetyStock] = useState("");
  const [drawerNote, setDrawerNote] = useState("");
  const [drawerMovementQuantity, setDrawerMovementQuantity] = useState("1");
  const [drawerPurchaseDocumentNumber, setDrawerPurchaseDocumentNumber] = useState("");
  const [drawerPurchaseSupplierName, setDrawerPurchaseSupplierName] = useState("");
  const [drawerPurchaseDocumentDate, setDrawerPurchaseDocumentDate] = useState(new Date().toISOString().slice(0, 16));
  const [drawerPurchaseReference, setDrawerPurchaseReference] = useState("");
  const [drawerPurchaseUnitCost, setDrawerPurchaseUnitCost] = useState("");
  const [drawerTransferWarehouseCode, setDrawerTransferWarehouseCode] = useState("");
  const [drawerTransferQuantity, setDrawerTransferQuantity] = useState("1");
  const [drawerTransferNote, setDrawerTransferNote] = useState("");
  const [warehouseDrawerMode, setWarehouseDrawerMode] = useState<WarehouseDrawerMode | null>(null);
  const [warehouseDraft, setWarehouseDraft] = useState<AdminWarehouseItem | null>(null);
  const [warehouseCode, setWarehouseCode] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseDescription, setWarehouseDescription] = useState("");
  const [warehouseAddress, setWarehouseAddress] = useState("");
  const [warehouseContactName, setWarehouseContactName] = useState("");
  const [warehouseContactPhone, setWarehouseContactPhone] = useState("");
  const [warehousePriority, setWarehousePriority] = useState("100");
  const [warehouseIsActive, setWarehouseIsActive] = useState(true);
  const [warehouseIsDefault, setWarehouseIsDefault] = useState(false);
  const [pendingWarehouse, setPendingWarehouse] = useState(false);
  const [drawerRangeNow, setDrawerRangeNow] = useState<number | null>(null);
  const [transactionDrawerItem, setTransactionDrawerItem] = useState<TransactionDrawerItem | null>(null);
  const [stockCountDrawerMode, setStockCountDrawerMode] = useState<StockCountDrawerMode | null>(null);
  const [stockCountDrawerItem, setStockCountDrawerItem] = useState<AdminStockCountItem | null>(null);
  const [stockCountWarehouseCode, setStockCountWarehouseCode] = useState("all");
  const [stockCountDate, setStockCountDate] = useState(new Date().toISOString().slice(0, 16));
  const [stockCountNote, setStockCountNote] = useState("");
  const [stockCountSearch, setStockCountSearch] = useState("");
  const [pendingStockCount, setPendingStockCount] = useState(false);
  const [pendingStockCountLineId, setPendingStockCountLineId] = useState<string | null>(null);
  const [stockCountDrafts, setStockCountDrafts] = useState<Record<string, { countedOnHand: string; note: string }>>({});
  const [bulkAdjustCsv, setBulkAdjustCsv] = useState("");
  const [bulkWarehouseCsv, setBulkWarehouseCsv] = useState("");
  const [bulkStockCountCsv, setBulkStockCountCsv] = useState("");
  const [bulkOperationPending, setBulkOperationPending] = useState<null | "adjust" | "warehouse" | "stock-count">(null);
  const [bulkOperationResult, setBulkOperationResult] = useState<BulkOperationResult | null>(null);
  const [reportViewMode, setReportViewMode] = useState<"executive" | "analytics">("executive");
  const [bulkToolsExpanded, setBulkToolsExpanded] = useState(false);
  const [bulkOperationHistory, setBulkOperationHistory] = useState<Array<{
    id: string;
    type: "adjust" | "warehouse" | "stock-count";
    createdAt: string;
    total: number;
    successCount: number;
    failureCount: number;
  }>>([]);
  const [inventoryListPreferences, setInventoryListPreferences] = useState<AdminInventoryListPreferences>(() => {
    const serverPreferences = normalizeInventoryListPreferences(inventoryPreferences);

    if (typeof window === "undefined") {
      return serverPreferences;
    }

    const localPreferences = loadInventoryListPreferences();
    const hasLocalCustomization = JSON.stringify(localPreferences) !== JSON.stringify(getDefaultInventoryListPreferences());

    return hasLocalCustomization ? normalizeInventoryListPreferences(localPreferences) : serverPreferences;
  });
  const inventoryPreferencesInitializedRef = useRef(false);
  const compactInventoryList = inventoryListPreferences.compactInventoryList;
  const visibleColumns = inventoryListPreferences.visibleColumns;
  const bulkFailureSummary = useMemo(() => {
    if (!bulkOperationResult) {
      return [];
    }

    const grouped = new Map<string, { code: string; message: string; hint: string | null; count: number }>();

    for (const row of bulkOperationResult.rows) {
      if (row.success) {
        continue;
      }

      const key = row.code ?? row.message;
      const current = grouped.get(key);

      if (current) {
        current.count += 1;
        continue;
      }

      grouped.set(key, {
        code: row.code ?? "UNKNOWN_ERROR",
        message: row.message,
        hint: row.hint ?? null,
        count: 1,
      });
    }

    return Array.from(grouped.values()).sort((left, right) => right.count - left.count);
  }, [bulkOperationResult]);

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
      { value: "TRANSFER_OUT", label: labels.inventoryMovementTransferOut },
      { value: "TRANSFER_IN", label: labels.inventoryMovementTransferIn },
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
      labels.inventoryMovementTransferIn,
      labels.inventoryMovementTransferOut,
      labels.inventoryMovementReservationHold,
      labels.inventoryMovementReservationRelease,
      labels.inventoryMovementReturnRestock,
    ],
  );

  const drawerMovements = useMemo(() => {
    if (!drawerItem) {
      return [];
    }

    const rangeStart = drawerDateRange === "24h" && drawerRangeNow
      ? drawerRangeNow - (24 * 60 * 60 * 1000)
      : drawerDateRange === "7d" && drawerRangeNow
        ? drawerRangeNow - (7 * 24 * 60 * 60 * 1000)
        : drawerDateRange === "30d" && drawerRangeNow
          ? drawerRangeNow - (30 * 24 * 60 * 60 * 1000)
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
  }, [drawerDateRange, drawerItem, drawerMovementFilter, drawerRangeNow]);

  const drawerMovementPageSize = 5;
  const drawerMovementTotalPages = Math.max(1, Math.ceil(drawerMovements.length / drawerMovementPageSize));
  const drawerMovementItems = drawerMovements.slice(
    (drawerMovementPage - 1) * drawerMovementPageSize,
    drawerMovementPage * drawerMovementPageSize,
  );
  const drawerMarginEstimate = drawerItem && drawerItem.purchasePrice !== null
    ? (drawerItem.unitPrice - drawerItem.purchasePrice) * drawerItem.availableStock
    : null;
  const drawerStockCoverage = drawerItem
    ? drawerItem.availableStock <= 0
      ? "Stok tükenmiş"
      : drawerItem.availableStock <= drawerItem.safetyStock
        ? "Güvenlik stok sınırında"
        : drawerItem.availableStock <= drawerItem.reorderPoint
          ? "Yeniden sipariş eşiğinde"
          : "Sağlıklı stok seviyesinde"
    : null;
  const stockCountSummary = useMemo(
    () => summarizeStockCount(stockCountDrawerItem?.lines ?? []),
    [stockCountDrawerItem],
  );
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      inventoryListPreferenceKey,
      JSON.stringify({
        compactInventoryList,
        visibleColumns,
      }),
    );
  }, [compactInventoryList, visibleColumns]);

  useEffect(() => {
    if (!inventoryPreferencesInitializedRef.current) {
      inventoryPreferencesInitializedRef.current = true;
      return;
    }

    const controller = new AbortController();

    void fetch("/api/admin/inventory/preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compactInventoryList,
        visibleColumns,
      }),
      signal: controller.signal,
    }).catch(() => {
      // Tercih kaydi basarisiz olsa da ekran davranisi bozulmasin.
    });

    return () => {
      controller.abort();
    };
  }, [compactInventoryList, visibleColumns]);

  const pageConfig = useMemo(() => {
    if (pageVariant === "transactions") {
      return {
        title: labels.transactionsTitle,
        description: labels.transactionsDescription,
        groups: ["history"] as InventorySectionGroupId[],
        sections: ["inventory-transactions"] as InventorySectionId[],
        showSummaryCards: false,
      };
    }

    if (pageVariant === "counts") {
      return {
        title: labels.stockCountTitle,
        description: labels.stockCountDescription,
        groups: ["operations"] as InventorySectionGroupId[],
        sections: ["inventory-counts"] as InventorySectionId[],
        showSummaryCards: false,
      };
    }

    if (pageVariant === "warehouses") {
      return {
        title: labels.warehousesTitle,
        description: labels.warehousesDescription,
        groups: ["definitions"] as InventorySectionGroupId[],
        sections: ["inventory-warehouses"] as InventorySectionId[],
        showSummaryCards: false,
      };
    }

    if (pageVariant === "exports") {
      return {
        title: "Dışa Aktarım Geçmişi",
        description: "Stok ekranından alınan CSV çıktılarının kim tarafından ve hangi filtrelerle üretildiğini izle.",
        groups: ["history"] as InventorySectionGroupId[],
        sections: ["inventory-exports"] as InventorySectionId[],
        showSummaryCards: false,
      };
    }

    if (pageVariant === "external-events") {
      return {
        title: "Harici Stok Eventleri",
        description: "Entegrasyonlardan gelen stok eventlerinin uygulama ve hata akışını izle.",
        groups: ["operations"] as InventorySectionGroupId[],
        sections: ["inventory-sync"] as InventorySectionId[],
        showSummaryCards: false,
      };
    }

    return {
      title: labels.inventoryList,
      description: labels.inventorySummary,
      groups: ["overview", "operations"] as InventorySectionGroupId[],
      sections: ["inventory-reports", "inventory-critical", "inventory-list", "inventory-sync"] as InventorySectionId[],
      showSummaryCards: true,
    };
  }, [
    labels.inventoryList,
    labels.inventorySummary,
    labels.stockCountDescription,
    labels.stockCountTitle,
    labels.transactionsDescription,
    labels.transactionsTitle,
    labels.warehousesDescription,
    labels.warehousesTitle,
    pageVariant,
  ]);

  const availableSectionGroups = useMemo(
    () => inventorySectionGroups.filter((group) => pageConfig.groups.includes(group.id)),
    [pageConfig.groups],
  );

  const activeGroupSections = useMemo(
    () => availableSectionGroups.find((group) => group.id === activeSectionGroup)?.sections
      ?? availableSectionGroups[0]?.sections
      ?? [],
    [activeSectionGroup, availableSectionGroups],
  );

  const visibleSectionIds = useMemo(
    () => new Set(pageConfig.sections),
    [pageConfig.sections],
  );

  const topNavigationItems = useMemo(
    () => [
      { href: overviewPath, label: "Genel Bakis", isActive: pageVariant === "overview" },
      { href: transactionListPath, label: "Islemler", isActive: pageVariant === "transactions" },
      { href: stockCountsPath, label: "Sayimlar", isActive: pageVariant === "counts" },
      { href: warehousesPath, label: "Depolar", isActive: pageVariant === "warehouses" },
      { href: exportsPath, label: "Dışa Aktarımlar", isActive: pageVariant === "exports" },
      { href: externalEventsPath, label: "Harici Eventler", isActive: pageVariant === "external-events" },
    ],
    [exportsPath, externalEventsPath, overviewPath, pageVariant, stockCountsPath, transactionListPath, warehousesPath],
  );

  function createOverviewParams() {
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
    if (query.transactionSearch) {
      params.set("transactionSearch", query.transactionSearch);
    }
    if (query.transactionType && query.transactionType !== "all") {
      params.set("transactionType", query.transactionType);
    }
    if (query.transactionWarehouse && query.transactionWarehouse !== "all") {
      params.set("transactionWarehouse", query.transactionWarehouse);
    }
    if (query.transactionSku) {
      params.set("transactionSku", query.transactionSku);
    }
    if (query.transactionStartDate) {
      params.set("transactionStartDate", query.transactionStartDate);
    }
    if (query.transactionEndDate) {
      params.set("transactionEndDate", query.transactionEndDate);
    }
    if (query.transactionPage && query.transactionPage !== "1") {
      params.set("transactionPage", query.transactionPage);
    }

    return params;
  }

  function getOverviewHref(overrides?: {
    reportPeriodDays?: string;
    reportComparePrevious?: string;
    reportCostingMethod?: string;
  }) {
    const params = createOverviewParams();
    const periodDays = overrides?.reportPeriodDays ?? query.reportPeriodDays;
    const comparePrevious = overrides?.reportComparePrevious ?? query.reportComparePrevious;
    const costingMethod = overrides?.reportCostingMethod ?? query.reportCostingMethod;

    if (periodDays && periodDays !== "30") {
      params.set("reportPeriodDays", periodDays);
    }
    if (comparePrevious === "0") {
      params.set("reportComparePrevious", "0");
    }
    if (costingMethod && costingMethod !== "AVERAGE_COST") {
      params.set("reportCostingMethod", costingMethod);
    }

    const qs = params.toString();
    return qs ? `${overviewPath}?${qs}` : overviewPath;
  }

  function getPageHref(page: number) {
    const params = createOverviewParams();
    if (query.reportPeriodDays && query.reportPeriodDays !== "30") {
      params.set("reportPeriodDays", query.reportPeriodDays);
    }
    if (query.reportComparePrevious === "0") {
      params.set("reportComparePrevious", query.reportComparePrevious);
    }
    if (query.reportCostingMethod && query.reportCostingMethod !== "AVERAGE_COST") {
      params.set("reportCostingMethod", query.reportCostingMethod);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${inventoryListPath}?${qs}` : inventoryListPath;
  }

  function getTransactionPageHref(page: number) {
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
    if (query.transactionSearch) {
      params.set("transactionSearch", query.transactionSearch);
    }
    if (query.transactionType && query.transactionType !== "all") {
      params.set("transactionType", query.transactionType);
    }
    if (query.transactionWarehouse && query.transactionWarehouse !== "all") {
      params.set("transactionWarehouse", query.transactionWarehouse);
    }
    if (query.transactionSku) {
      params.set("transactionSku", query.transactionSku);
    }
    if (query.transactionStartDate) {
      params.set("transactionStartDate", query.transactionStartDate);
    }
    if (query.transactionEndDate) {
      params.set("transactionEndDate", query.transactionEndDate);
    }
    if (page > 1) {
      params.set("transactionPage", String(page));
    }
    const qs = params.toString();
    return qs ? `${transactionListPath}?${qs}` : transactionListPath;
  }

  function goToInventoryWithFilters(filters: {
    search?: string;
    stockStatusFilter?: "low_stock" | "out_of_stock";
    warehouseFilter?: string;
  }) {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set("search", filters.search);
    }

    if (filters.stockStatusFilter) {
      params.set("stockStatusFilter", filters.stockStatusFilter);
    }

    if (filters.warehouseFilter) {
      params.set("warehouseFilter", filters.warehouseFilter);
    }

    router.push(params.toString() ? `${inventoryListPath}?${params.toString()}` : inventoryListPath);
  }

  function goToTransactionsWithFilters(filters: {
    sku?: string;
    warehouseCode?: string;
  }) {
    const params = new URLSearchParams();

    if (filters.sku) {
      params.set("transactionSku", filters.sku);
    }

    if (filters.warehouseCode) {
      params.set("transactionWarehouse", filters.warehouseCode);
    }

    router.push(params.toString() ? `${transactionListPath}?${params.toString()}` : transactionListPath);
  }

  const prevPage = result.page > 1 ? result.page - 1 : null;
  const nextPage = result.page < result.totalPages ? result.page + 1 : null;

  function getRowKey(item: AdminInventoryListResult["items"][number]) {
    return `${item.productId}:${item.warehouseCode ?? "NONE"}`;
  }

  function openDrawer(item: AdminInventoryListResult["items"][number], mode: DrawerMode, openedAt: number) {
    setDrawerItem(item);
    setDrawerMode(mode);
    setDrawerFullscreen(false);
    setDrawerMovementFilter("all");
    setDrawerDateRange("all");
    setDrawerRangeNow(openedAt);
    setDrawerMovementPage(1);
    setDrawerTargetOnHand(String(item.onHandStock));
    setDrawerReorderPoint(String(item.reorderPoint));
    setDrawerSafetyStock(String(item.safetyStock));
    setDrawerNote("");
    setDrawerMovementQuantity("1");
    setDrawerPurchaseDocumentNumber("");
    setDrawerPurchaseSupplierName("");
    setDrawerPurchaseDocumentDate(new Date().toISOString().slice(0, 16));
    setDrawerPurchaseReference("");
    setDrawerPurchaseUnitCost(item.purchasePrice !== null ? String(item.purchasePrice) : "");
    setDrawerTransferWarehouseCode("");
    setDrawerTransferQuantity("1");
    setDrawerTransferNote("");
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
    setDrawerRangeNow(null);
    setDrawerMovementPage(1);
    setDrawerTargetOnHand("");
    setDrawerReorderPoint("");
    setDrawerSafetyStock("");
    setDrawerNote("");
    setDrawerMovementQuantity("1");
    setDrawerPurchaseDocumentNumber("");
    setDrawerPurchaseSupplierName("");
    setDrawerPurchaseDocumentDate(new Date().toISOString().slice(0, 16));
    setDrawerPurchaseReference("");
    setDrawerPurchaseUnitCost("");
    setDrawerTransferWarehouseCode("");
    setDrawerTransferQuantity("1");
    setDrawerTransferNote("");
  }

  function updateDrawerDateRange(value: string, timestamp: number) {
    setDrawerDateRange(value);
    setDrawerRangeNow(timestamp);
    setDrawerMovementPage(1);
  }

  function openWarehouseDrawer(mode: WarehouseDrawerMode, warehouse?: AdminWarehouseItem) {
    setWarehouseDrawerMode(mode);
    setWarehouseDraft(warehouse ?? null);
    setWarehouseCode(warehouse?.code ?? "");
    setWarehouseName(warehouse?.name ?? "");
    setWarehouseDescription(warehouse?.description ?? "");
    setWarehouseAddress(warehouse?.address ?? "");
    setWarehouseContactName(warehouse?.contactName ?? "");
    setWarehouseContactPhone(warehouse?.contactPhone ?? "");
    setWarehousePriority(String(warehouse?.priority ?? 100));
    setWarehouseIsActive(warehouse?.isActive ?? true);
    setWarehouseIsDefault(warehouse?.isDefault ?? false);
    setFeedback(null);
  }

  function closeWarehouseDrawer() {
    if (pendingWarehouse) {
      return;
    }

    setWarehouseDrawerMode(null);
    setWarehouseDraft(null);
    setWarehouseCode("");
    setWarehouseName("");
    setWarehouseDescription("");
    setWarehouseAddress("");
    setWarehouseContactName("");
    setWarehouseContactPhone("");
    setWarehousePriority("100");
    setWarehouseIsActive(true);
    setWarehouseIsDefault(false);
  }

  function openTransactionDrawer(item: TransactionDrawerItem) {
    setTransactionDrawerItem(item);
  }

  function closeTransactionDrawer() {
    setTransactionDrawerItem(null);
  }

  function openStockCountDrawer(mode: StockCountDrawerMode, item?: AdminStockCountItem) {
    setStockCountDrawerMode(mode);
    setStockCountDrawerItem(item ?? null);
    setStockCountWarehouseCode(item?.warehouseCode ?? "all");
    setStockCountDate((item?.countedAt ?? new Date().toISOString()).slice(0, 16));
    setStockCountNote(item?.note ?? "");
    setStockCountSearch("");
    setStockCountDrafts(
      item
        ? Object.fromEntries(item.lines.map((line) => [line.id, {
            countedOnHand: line.countedOnHand === null ? "" : String(line.countedOnHand),
            note: line.note ?? "",
          }]))
        : {},
    );
    setFeedback(null);
  }

  function closeStockCountDrawer() {
    if (pendingStockCount || pendingStockCountLineId) {
      return;
    }

    setStockCountDrawerMode(null);
    setStockCountDrawerItem(null);
    setStockCountWarehouseCode("all");
    setStockCountDate(new Date().toISOString().slice(0, 16));
    setStockCountNote("");
    setStockCountSearch("");
    setStockCountDrafts({});
    setBulkStockCountCsv("");
  }

  function setStockCountLineDraft(lineId: string, field: "countedOnHand" | "note", value: string) {
    setStockCountDrafts((current) => ({
      ...current,
      [lineId]: {
        countedOnHand: current[lineId]?.countedOnHand ?? "",
        note: current[lineId]?.note ?? "",
        [field]: value,
      },
    }));
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

    router.push(`${transactionListPath}?${params.toString()}`);
    closeDrawer();
  }

  async function exportVisibleRowsCsv() {
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
      "reorderPoint",
      "safetyStock",
      "preferredSalesWarehouseCode",
      "preferredPurchaseWarehouseCode",
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
        String(item.reorderPoint),
        String(item.safetyStock),
        item.preferredSalesWarehouseCode ?? "",
        item.preferredPurchaseWarehouseCode ?? "",
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

    try {
      await fetch("/api/admin/inventory/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          total: result.items.length,
          filters: {
            search: query.search || null,
            stockStatusFilter: query.stockStatusFilter || "all",
            reservationFilter: query.reservationFilter || "all",
            warehouseFilter: query.warehouseFilter || "all",
            movementTypeFilter: query.movementTypeFilter || "all",
          },
        }),
      });
    } catch {
      // Export kaydi basarisiz olsa da dosya indirme akisi devam eder.
    }

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
    const reorderPoint = Number(drawerReorderPoint);
    const safetyStock = Number(drawerSafetyStock);
    if (!Number.isInteger(targetOnHandStock) || targetOnHandStock < 0) {
      setFeedback({ type: "error", message: labels.adjustmentFailed });
      return;
    }
    if (!Number.isInteger(reorderPoint) || reorderPoint < 0 || !Number.isInteger(safetyStock) || safetyStock < 0) {
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
          reorderPoint,
          safetyStock,
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

  async function applyTransferFromDrawer() {
    if (!drawerItem || !drawerItem.warehouseCode) {
      return;
    }

    const quantity = Number(drawerTransferQuantity);
    if (!drawerTransferWarehouseCode.trim() || !Number.isInteger(quantity) || quantity <= 0) {
      setFeedback({ type: "error", message: labels.transferFailed });
      return;
    }

    const rowKey = getRowKey(drawerItem);
    setPendingRowKey(rowKey);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/inventory/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: drawerItem.productId,
          sku: drawerItem.sku,
          fromWarehouseCode: drawerItem.warehouseCode,
          toWarehouseCode: drawerTransferWarehouseCode,
          quantity,
          note: drawerTransferNote.trim() || "Inventory manager warehouse transfer",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setFeedback({ type: "error", message: payload?.message ?? labels.transferFailed });
        return;
      }

      setFeedback({ type: "success", message: labels.transferSaved });
      closeDrawer();
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: labels.transferFailed });
    } finally {
      setPendingRowKey(null);
    }
  }

  async function applyMovementFromDrawer(mode: "stock_in" | "stock_out") {
    if (!drawerItem || !drawerItem.warehouseCode) {
      return;
    }

    const quantity = Number(drawerMovementQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFeedback({ type: "error", message: mode === "stock_in" ? labels.stockInFailed : labels.stockOutFailed });
      return;
    }

    const rowKey = getRowKey(drawerItem);
    setPendingRowKey(rowKey);
    setFeedback(null);

    try {
      const endpoint = mode === "stock_in" ? "/api/admin/inventory/stock-in" : "/api/admin/inventory/stock-out";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: drawerItem.productId,
          sku: drawerItem.sku,
          warehouseCode: drawerItem.warehouseCode,
          quantity,
          note: drawerNote.trim() || (mode === "stock_in" ? "Inventory manager stock in" : "Inventory manager stock out"),
          ...(mode === "stock_in" && drawerPurchaseDocumentNumber.trim()
            ? {
                sourceDocumentNumber: drawerPurchaseDocumentNumber.trim(),
                sourceDocumentSupplier: drawerPurchaseSupplierName.trim() || undefined,
                sourceDocumentDate: drawerPurchaseDocumentDate ? new Date(drawerPurchaseDocumentDate).toISOString() : undefined,
                sourceDocumentReference: drawerPurchaseReference.trim() || undefined,
                unitCost: drawerPurchaseUnitCost.trim() ? Number(drawerPurchaseUnitCost) : null,
              }
            : {}),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setFeedback({ type: "error", message: payload?.message ?? (mode === "stock_in" ? labels.stockInFailed : labels.stockOutFailed) });
        return;
      }

      setFeedback({ type: "success", message: mode === "stock_in" ? labels.stockInSaved : labels.stockOutSaved });
      closeDrawer();
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: mode === "stock_in" ? labels.stockInFailed : labels.stockOutFailed });
    } finally {
      setPendingRowKey(null);
    }
  }

  async function saveWarehouse() {
    if (!warehouseCode.trim() || !warehouseName.trim()) {
      setFeedback({ type: "error", message: labels.warehouseSaveFailed });
      return;
    }

    setPendingWarehouse(true);
    setFeedback(null);

    try {
      const response = await fetch(
        warehouseDrawerMode === "edit" && warehouseDraft
          ? `/api/admin/warehouses/${warehouseDraft.id}`
          : "/api/admin/warehouses",
        {
          method: warehouseDrawerMode === "edit" ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: warehouseCode.trim().toUpperCase(),
            name: warehouseName.trim(),
            description: warehouseDescription.trim() || null,
            address: warehouseAddress.trim() || null,
            contactName: warehouseContactName.trim() || null,
            contactPhone: warehouseContactPhone.trim() || null,
            priority: Number(warehousePriority || "100"),
            isActive: warehouseIsActive,
            isDefault: warehouseIsDefault,
          }),
        },
      );

      if (!response.ok) {
        setFeedback({ type: "error", message: labels.warehouseSaveFailed });
        return;
      }

      setFeedback({ type: "success", message: labels.warehouseSaved });
      closeWarehouseDrawer();
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: labels.warehouseSaveFailed });
    } finally {
      setPendingWarehouse(false);
    }
  }

  async function createStockCount() {
    if (!stockCountDate) {
      setFeedback({ type: "error", message: labels.stockCountSaveFailed });
      return;
    }

    setPendingStockCount(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/inventory/stock-counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          warehouseCode: stockCountWarehouseCode === "all" ? null : stockCountWarehouseCode,
          countedAt: new Date(stockCountDate).toISOString(),
          note: stockCountNote.trim() || null,
          search: stockCountSearch.trim() || null,
        }),
      });

      if (!response.ok) {
        setFeedback({ type: "error", message: labels.stockCountSaveFailed });
        return;
      }

      setPendingStockCount(false);
      setFeedback({ type: "success", message: labels.stockCountSaved });
      closeStockCountDrawer();
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: labels.stockCountSaveFailed });
    } finally {
      setPendingStockCount(false);
    }
  }

  async function saveStockCountLine(lineId: string) {
    if (!stockCountDrawerItem) {
      return;
    }

    const draft = stockCountDrafts[lineId];
    const countedOnHand = Number(draft?.countedOnHand ?? "");
    if (!Number.isInteger(countedOnHand) || countedOnHand < 0) {
      setFeedback({ type: "error", message: labels.stockCountLineSaveFailed });
      return;
    }

    setPendingStockCountLineId(lineId);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/inventory/stock-counts/${stockCountDrawerItem.id}/lines/${lineId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countedOnHand,
          note: draft?.note?.trim() || null,
        }),
      });

      if (!response.ok) {
        setFeedback({ type: "error", message: labels.stockCountLineSaveFailed });
        return;
      }

      setFeedback({ type: "success", message: labels.stockCountLineSaved });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: labels.stockCountLineSaveFailed });
    } finally {
      setPendingStockCountLineId(null);
    }
  }

  async function applyStockCount() {
    if (!stockCountDrawerItem) {
      return;
    }

    setPendingStockCount(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/inventory/stock-counts/${stockCountDrawerItem.id}/apply`, {
        method: "POST",
      });

      if (!response.ok) {
        setFeedback({ type: "error", message: labels.stockCountApplyFailed });
        return;
      }

      setPendingStockCount(false);
      setFeedback({ type: "success", message: labels.stockCountApplied });
      closeStockCountDrawer();
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: labels.stockCountApplyFailed });
    } finally {
      setPendingStockCount(false);
    }
  }

  async function submitBulkOperation(type: "adjust" | "warehouse" | "stock-count") {
    const csv = type === "adjust" ? bulkAdjustCsv : type === "warehouse" ? bulkWarehouseCsv : bulkStockCountCsv;

    if (!csv.trim()) {
      setFeedback({ type: "error", message: "Toplu islem verisi bos olamaz." });
      return;
    }

    if (type === "stock-count" && !stockCountDrawerItem) {
      setFeedback({ type: "error", message: "Toplu sayim islemi icin bir sayim fisis acilmis olmali." });
      return;
    }

    setBulkOperationPending(type);
    setBulkOperationResult(null);
    setFeedback(null);

    try {
      const endpoint = type === "adjust"
        ? "/api/admin/inventory/bulk-adjust"
        : type === "warehouse"
          ? "/api/admin/inventory/bulk-assign-warehouse"
          : `/api/admin/inventory/stock-counts/${stockCountDrawerItem?.id}/bulk-lines`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csv }),
      });

      const payload = (await response.json().catch(() => null)) as (BulkOperationResult & { message?: string }) | null;
      if (!response.ok) {
        setFeedback({ type: "error", message: payload?.message ?? "Toplu islem basarisiz oldu." });
        return;
      }

      setBulkOperationResult(payload);
      setBulkOperationHistory((current) => [
        {
          id: `${type}-${Date.now()}`,
          type,
          createdAt: new Date().toISOString(),
          total: payload?.total ?? 0,
          successCount: payload?.successCount ?? 0,
          failureCount: payload?.failureCount ?? 0,
        },
        ...current,
      ].slice(0, 8));
      setFeedback({ type: "success", message: "Toplu islem tamamlandi." });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Toplu islem basarisiz oldu." });
    } finally {
      setBulkOperationPending(null);
    }
  }

  function downloadTextFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function downloadBulkTemplate(type: "adjust" | "warehouse" | "stock-count") {
    const content = type === "adjust"
      ? "SKU,DEPO_KODU,HEDEF_STOK,MIN_STOK,GUVENLIK_STOK,NOT\nSKU-001,MAIN,45,10,5,Sezon duzeltmesi"
      : type === "warehouse"
        ? "SKU,TERCIH_EDILEN_SATIS_DEPOSU\nSKU-001,MAIN"
        : "SKU,DEPO_KODU,SAYILAN_STOK,NOT\nSKU-001,MAIN,42,Raf sayimi";

    const filename = type === "adjust"
      ? "toplu-stok-guncelleme-sablonu.csv"
      : type === "warehouse"
        ? "tercihli-depo-sablonu.csv"
        : "stok-sayim-sablonu.csv";

    downloadTextFile(filename, content);
  }

  function toggleVisibleColumn(column: InventoryListColumn) {
    setInventoryListPreferences((current) => ({
      ...current,
      visibleColumns: {
        ...current.visibleColumns,
        [column]: !current.visibleColumns[column],
      },
    }));
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white shadow-sm">
      <div className={`border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.15),_transparent_55%),radial-gradient(circle_at_left,_rgba(245,158,11,0.10),_transparent_45%),linear-gradient(135deg,white,rgba(250,250,250,0.92))] p-6`}>
        <div className={`rounded-3xl border border-neutral-200 bg-gradient-to-r ${pageMeta.accentClass} p-5`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <Link href={overviewPath} className="font-medium text-neutral-600 transition hover:text-neutral-950">
                Stok Yonetimi
              </Link>
              <span>/</span>
              <span className="font-semibold text-neutral-900">{pageMeta.breadcrumbCurrent}</span>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
                  {pageMeta.badge}
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.title}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{pageConfig.title}</h2>
                <p className="mt-2 max-w-3xl text-sm text-neutral-600">{pageConfig.description}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Sayfa</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{pageMeta.shortTitle}</p>
                </article>
                <article className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.totalProducts}</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{result.summary.totalProducts}</p>
                </article>
                <article className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.lowStockCount}</p>
                  <p className="mt-1 text-sm font-semibold text-amber-700">{result.summary.lowStockCount}</p>
                </article>
                <article className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.outOfStockCount}</p>
                  <p className="mt-1 text-sm font-semibold text-rose-700">{result.summary.outOfStockCount}</p>
                </article>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {topNavigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.isActive ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    item.isActive
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {pageConfig.showSummaryCards ? (
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
      ) : null}

      {!pageConfig.showSummaryCards ? (
        <div className="border-b border-neutral-200 bg-neutral-50/70 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                {pageVariant === "transactions" ? "Toplam işlem" : pageVariant === "counts" ? "Açık sayım" : "Aktif depo"}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {pageVariant === "transactions"
                  ? transactionResult.total
                  : pageVariant === "counts"
                    ? stockCounts.filter((count) => count.status !== "APPLIED").length
                    : warehouses.filter((warehouse) => warehouse.isActive).length}
              </p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                {pageVariant === "transactions" ? "Belge bağlantılı işlem" : pageVariant === "counts" ? "Varyanslı fiş" : "Varsayılan depo"}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {pageVariant === "transactions"
                  ? transactionResult.items.filter((item) => item.sourceDocument.id || item.sourceDocument.number).length
                  : pageVariant === "counts"
                    ? stockCounts.filter((count) => count.varianceLineCount > 0).length
                    : warehouses.find((warehouse) => warehouse.isDefault)?.name ?? labels.notSpecified}
              </p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Odak</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {pageVariant === "transactions"
                  ? "Belge ve hareket geçmişini incele"
                  : pageVariant === "counts"
                    ? "Sayım farklarını uygulama öncesi doğrula"
                    : "Depo tanımlarını ve önceliklerini yönet"}
              </p>
            </article>
          </div>
        </div>
      ) : null}

      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 p-5 backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">{labels.sectionsTitle}</h3>
              <p className="text-sm text-neutral-600">
                {pageVariant === "overview"
                  ? "Genel bakış ekranında rapor, kritik stok, stok listesi ve entegrasyon alanları birlikte sunulur."
                  : "Bu sayfada yalnızca ilgili operasyon alanı gösterilir. Böylece kullanım daha sade ve odaklı kalır."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link href={overviewPath} className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 transition hover:bg-neutral-100">
                Genel Bakis
              </Link>
              <Link href={transactionListPath} className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 transition hover:bg-neutral-100">
                Islemler
              </Link>
              <Link href={stockCountsPath} className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 transition hover:bg-neutral-100">
                Sayimlar
              </Link>
              <Link href={warehousesPath} className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 transition hover:bg-neutral-100">
                Depolar
              </Link>
            </div>
          </div>
          {availableSectionGroups.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {availableSectionGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setActiveSectionGroup(group.id);
                    setActiveSection(group.sections[0]);
                  }}
                  className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${
                    activeSectionGroup === group.id
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          ) : null}
          {activeGroupSections.length > 1 ? (
            <div className="sticky top-0 z-20 -mx-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none]">
              <div className="flex min-w-max gap-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
                {inventorySectionAnchors
                  .filter((section) => visibleSectionIds.has(section.id) && (activeGroupSections as readonly string[]).includes(section.id))
                  .map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition ${
                        activeSection === section.id
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {labels[section.key]}
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div id="inventory-reports" className={getSectionPanelClass(activeSection, "inventory-reports")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-neutral-950">{labels.reportsTitle}</h3>
            <p className="text-sm text-neutral-600">{labels.reportsDescription}</p>
          </div>
          <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              onClick={() => setReportViewMode("executive")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                reportViewMode === "executive" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Yonetici Ozet
            </button>
            <button
              type="button"
              onClick={() => setReportViewMode("analytics")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                reportViewMode === "analytics" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Analiz
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-neutral-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{labels.reportRange}</p>
                <p className="mt-2 text-sm text-neutral-600">
                  {labels.reportCurrentPeriod}: {formatDate(reports.comparison.current.startDate, locale, labels.notSpecified)} - {formatDate(reports.comparison.current.endDate, locale, labels.notSpecified)}
                </p>
                <p className="mt-1 text-sm text-neutral-600">{labels.reportCostingMethod}: {reports.overview.costingMethodLabel}</p>
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
                    onClick={() => router.push(getOverviewHref({ reportPeriodDays: option.value }))}
                    className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                      query.reportPeriodDays === option.value
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3 text-sm">
                <span className="font-medium text-neutral-700">{labels.reportCostingMethod}</span>
                <select
                  value={query.reportCostingMethod}
                  onChange={(event) => {
                    router.push(getOverviewHref({ reportCostingMethod: event.target.value }));
                  }}
                  className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                >
                  <option value="AVERAGE_COST">{labels.reportCostAverage}</option>
                  <option value="LAST_PURCHASE_COST">{labels.reportCostLastPurchase}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3 text-sm">
                <span className="font-medium text-neutral-700">{labels.reportComparePrevious}</span>
                <button
                  type="button"
                  onClick={() => {
                    router.push(
                      getOverviewHref({
                        reportComparePrevious: query.reportComparePrevious === "0" ? "1" : "0",
                      }),
                    );
                  }}
                  className={`inline-flex h-11 items-center justify-between rounded-xl border px-4 text-sm font-medium transition ${
                    query.reportComparePrevious === "0"
                      ? "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <span>{query.reportComparePrevious === "0" ? "Kapalı" : "Açık"}</span>
                  <span>{query.reportComparePrevious === "0" ? labels.reportPreviousPeriod : labels.reportDifference}</span>
                </button>
              </label>

              <article className="rounded-2xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.reportPeriod}</p>
                <p className="mt-2 text-lg font-semibold text-neutral-950">{reports.periodDays} gün</p>
                <p className="mt-1 text-sm text-neutral-600">{labels.reportMovementCount}: {reports.comparison.current.movementCount}</p>
              </article>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.85),rgba(255,255,255,0.98))] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-neutral-950">{labels.reportDifference}</h4>
                <p className="text-sm text-neutral-600">{labels.reportPreviousPeriod}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">{reports.periodDays} gün</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-emerald-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.trendStockIn}</p>
                <p className="mt-2 text-lg font-semibold text-emerald-700">{reports.comparison.current.totalStockInQuantity}</p>
                <p className="mt-1 text-sm text-neutral-600">{formatDelta(reports.comparison.stockInDelta)}</p>
              </article>
              <article className="rounded-2xl border border-rose-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.trendStockOut}</p>
                <p className="mt-2 text-lg font-semibold text-rose-700">{reports.comparison.current.totalStockOutQuantity}</p>
                <p className="mt-1 text-sm text-neutral-600">{formatDelta(reports.comparison.stockOutDelta)}</p>
              </article>
              <article className="rounded-2xl border border-sky-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.trendNet}</p>
                <p className={`mt-2 text-lg font-semibold ${reports.comparison.current.netQuantity >= 0 ? "text-sky-700" : "text-rose-700"}`}>
                  {reports.comparison.current.netQuantity}
                </p>
                <p className="mt-1 text-sm text-neutral-600">{formatDelta(reports.comparison.netDelta)}</p>
              </article>
              <article className="rounded-2xl border border-amber-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.reportMovementCount}</p>
                <p className="mt-2 text-lg font-semibold text-amber-700">{reports.comparison.current.movementCount}</p>
                <p className="mt-1 text-sm text-neutral-600">{formatDelta(reports.comparison.movementCountDelta)}</p>
              </article>
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalOnHandUnits}</p>
            <p className="mt-2 text-lg font-semibold text-neutral-950">{reports.overview.totalOnHandUnits}</p>
          </article>
          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalCostValue}</p>
            <p className="mt-2 text-lg font-semibold text-cyan-700">{formatCurrency(reports.overview.totalCostValue, locale)}</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalSalesValue}</p>
            <p className="mt-2 text-lg font-semibold text-emerald-700">{formatCurrency(reports.overview.totalSalesValue, locale)}</p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.totalPotentialProfit}</p>
            <p className="mt-2 text-lg font-semibold text-amber-700">{formatCurrency(reports.overview.totalPotentialProfit, locale)}</p>
          </article>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.averageCoverageDays}</p>
            <p className="mt-2 text-lg font-semibold text-indigo-700">
              {reports.overview.averageCoverageDays === null ? labels.notSpecified : `${reports.overview.averageCoverageDays} gun`}
            </p>
          </article>
          <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.stockTurnoverRate}</p>
            <p className="mt-2 text-lg font-semibold text-sky-700">{reports.overview.stockTurnoverRate.toFixed(2)}x</p>
          </article>
          <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.legacyStockFallbackCount}</p>
            <p className="mt-2 text-lg font-semibold text-rose-700">{reports.overview.legacyStockFallbackCount}</p>
          </article>
          <article className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.stockMismatchCount}</p>
            <p className="mt-2 text-lg font-semibold text-orange-700">{reports.overview.stockMismatchCount}</p>
          </article>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => goToInventoryWithFilters({ stockStatusFilter: "low_stock" })}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
          >
            {labels.reviewLowStock}
          </button>
          <button
            type="button"
            onClick={() => goToInventoryWithFilters({ search: reports.slowMoving[0]?.sku })}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            {labels.reviewSlowMoving}
          </button>
          <button
            type="button"
            onClick={() => openStockCountDrawer("create")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            {labels.startStockCount}
          </button>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,rgba(254,243,199,0.9),rgba(255,255,255,0.95))] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Öncelik 1</p>
            <h4 className="mt-2 text-base font-semibold text-neutral-950">Kritik stok aksiyonu</h4>
            <p className="mt-2 text-sm text-neutral-600">
              {reports.overview.lowStockRowCount} satır düşük stokta. Önce kritik ürünleri filtreleyip giriş veya transfer planlayın.
            </p>
            <button
              type="button"
              onClick={() => goToInventoryWithFilters({ stockStatusFilter: "low_stock" })}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-50"
            >
              Düşük stok listesini aç
            </button>
          </article>

          <article className="rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.92),rgba(255,255,255,0.95))] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Öncelik 2</p>
            <h4 className="mt-2 text-base font-semibold text-neutral-950">Sayım farkı takibi</h4>
            <p className="mt-2 text-sm text-neutral-600">
              {stockCounts.filter((count) => count.status !== "APPLIED").length} açık sayım fişi var. Farklı sayımları tamamlayıp uygulayarak sistem stoklarını netleştirin.
            </p>
            <button
              type="button"
              onClick={() => setActiveSection("inventory-counts")}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-sky-300 bg-white px-4 text-sm font-medium text-sky-900 transition hover:bg-sky-50"
            >
              Sayım operasyonuna git
            </button>
          </article>

          <article className="rounded-2xl border border-rose-200 bg-[linear-gradient(135deg,rgba(255,228,230,0.92),rgba(255,255,255,0.95))] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Öncelik 3</p>
            <h4 className="mt-2 text-base font-semibold text-neutral-950">Tutarsız stok izlemesi</h4>
            <p className="mt-2 text-sm text-neutral-600">
              {reports.consistency.length} ürün için legacy stok ile aggregate stok arasında fark var. Bu liste audit ve düzeltme için ilk kontrol noktasıdır.
            </p>
            <button
              type="button"
              onClick={() => setReportViewMode("executive")}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-rose-300 bg-white px-4 text-sm font-medium text-rose-900 transition hover:bg-rose-50"
            >
              Tutarlılık özetini incele
            </button>
          </article>
        </div>

        {reportViewMode === "executive" ? (
          <>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-base font-semibold text-neutral-950">{labels.warehousePerformance}</h4>
              <span className="rounded-full bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white">{labels.warehouseCount}: {reports.overview.warehouseCount}</span>
            </div>
            <div className="mt-4 space-y-3">
              {reports.warehouses.map((warehouse) => (
                <article key={`warehouse-report-${warehouse.warehouseCode}`} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">{warehouse.warehouseName}</p>
                      <p className="mt-1 text-xs text-neutral-500">{warehouse.warehouseCode} • {labels.totalProducts}: {warehouse.skuCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-950">{formatCurrency(warehouse.salesValue, locale)}</p>
                      <p className="text-xs text-neutral-500">{labels.salesValue}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-4">
                    <p>{labels.totalOnHandUnits}: {warehouse.onHandUnits}</p>
                    <p>{labels.availableStock}: {warehouse.availableUnits}</p>
                    <p>{labels.costValue}: {formatCurrency(warehouse.costValue, locale)}</p>
                    <p>{labels.salesValue}: {formatCurrency(warehouse.salesValue, locale)}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => goToInventoryWithFilters({ warehouseFilter: warehouse.warehouseCode })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {labels.focusWarehouse}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-base font-semibold text-neutral-950">{labels.lowStockReport}</h4>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">{labels.lowStockRows}: {reports.overview.lowStockRowCount}</span>
            </div>
            <div className="mt-4 space-y-3">
              {reports.lowStock.length === 0 ? (
                <EmptyStateCard
                  title="Dusuk stok riski gorunmuyor"
                  description={labels.noAlerts}
                />
              ) : reports.lowStock.map((item) => (
                <article key={`low-stock-${item.productId}-${item.warehouseCode}`} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">{item.productName}</p>
                      <p className="mt-1 text-xs text-neutral-500">{labels.sku}: {item.sku} • {item.warehouseCode}</p>
                      <p className="mt-2 text-xs text-neutral-600">
                        {item.availableUnits <= 0 ? "Stok çıkışı durmuş görünüyor." : "Yeniden sipariş veya transfer planı gerekli."}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${item.availableUnits <= 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.availableUnits <= 0 ? labels.alertTypeOutOfStock : labels.alertTypeLowStock}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.availableStock}</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-950">{item.availableUnits}</p>
                    </article>
                    <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.reorderPoint}</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-950">{item.reorderPoint}</p>
                    </article>
                    <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{labels.safetyStock}</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-950">{item.safetyStock}</p>
                    </article>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => goToInventoryWithFilters({ search: item.sku, warehouseFilter: item.warehouseCode, stockStatusFilter: item.availableUnits <= 0 ? "out_of_stock" : "low_stock" })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {labels.viewInInventory}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTransactionsWithFilters({ sku: item.sku, warehouseCode: item.warehouseCode })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-800"
                    >
                      {labels.openInTransactions}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
            </div>

            <section className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-neutral-950">{labels.consistencyTitle}</h4>
                  <p className="text-sm text-neutral-600">{labels.consistencyDescription}</p>
                </div>
                <span className="rounded-full bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white">{reports.consistency.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {reports.consistency.length === 0 ? (
                  <EmptyStateCard
                    title="Tutarsizlik bulunmadi"
                    description={labels.noConsistencyIssues}
                  />
                ) : reports.consistency.map((item) => (
                  <article key={`consistency-${item.productId}`} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">{item.productName}</p>
                        <p className="mt-1 text-xs text-neutral-500">{labels.sku}: {item.sku}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${item.hasInventoryLevels ? "bg-orange-100 text-orange-700" : "bg-rose-100 text-rose-700"}`}>
                        {item.hasInventoryLevels ? labels.stockMismatchCount : labels.legacyStockFallbackCount}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
                      <p>{labels.legacyStockLabel}: {item.legacyStock}</p>
                      <p>{labels.aggregateStockLabel}: {item.aggregateAvailableStock}</p>
                      <p>{labels.differenceLabel}: {item.difference}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.1fr]">
              <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-neutral-950">{labels.movementSummaryTitle}</h4>
                  <span className="rounded-full bg-neutral-200 px-2 py-1 text-[11px] font-semibold text-neutral-700">{labels.totalQuantityLabel}</span>
                </div>
                <div className="mt-4 space-y-3">
                  {reports.movementSummary.map((item) => (
                    <article key={`movement-summary-${item.movementType}`} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${movementTypeClass(item.movementType)}`}>
                          {movementTypeLabel(item.movementType, labels)}
                        </span>
                        <p className="text-sm font-semibold text-neutral-950">{item.totalQuantity}</p>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                        <p>{labels.movementCount}: {item.movementCount}</p>
                        <p>{labels.lastMovementAt}: {formatDate(item.lastMovementAt, locale, labels.notSpecified)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-neutral-950">{labels.trendTitle}</h4>
                  <span className="rounded-full bg-neutral-200 px-2 py-1 text-[11px] font-semibold text-neutral-700">{reports.periodDays}g</span>
                </div>
                <div className="mt-4 grid gap-2">
                  {reports.trend.slice(-10).map((point) => (
                    <article key={`trend-${point.date}`} className="grid gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 sm:grid-cols-[120px_1fr_1fr_1fr] sm:items-center">
                      <p className="font-medium text-neutral-900">{point.date}</p>
                      <p>{labels.trendStockIn}: {point.stockInQuantity}</p>
                      <p>{labels.trendStockOut}: {point.stockOutQuantity}</p>
                      <p className={point.netQuantity >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                        {labels.trendNet}: {point.netQuantity}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm xl:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-neutral-950">{labels.abcTitle}</h4>
                <p className="text-sm text-neutral-600">{labels.abcDescription}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {reports.abcSegments.map((segment) => (
                <article key={`abc-${segment.segment}`} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-neutral-900 px-2 py-1 text-xs font-semibold text-white">
                      {labels.segment} {segment.segment}
                    </span>
                    <p className="text-sm font-semibold text-neutral-950">{segment.productCount} urun</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                    <p>{labels.sharePercent}: %{segment.sharePercent}</p>
                    <p>{labels.salesValue}: {formatCurrency(segment.estimatedSalesValue, locale)}</p>
                  </div>
                </article>
              ))}
            </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm xl:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-neutral-950">{labels.velocityTitle}</h4>
                <p className="text-sm text-neutral-600">{labels.velocityDescription}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {reports.velocity.length === 0 ? (
                <EmptyStateCard
                  title="Devir verisi bulunmuyor"
                  description={labels.noAlerts}
                />
              ) : reports.velocity.map((item) => (
                <article key={`velocity-${item.productId}`} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">{item.productName}</p>
                      <p className="mt-1 text-xs text-neutral-500">{labels.sku}: {item.sku}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {item.turnoverRate.toFixed(2)}x
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                    <p>{labels.reportPeriod} çıkışı: {item.last30DayOutboundUnits}</p>
                    <p>{labels.availableStock}: {item.availableUnits}</p>
                    <p>{labels.coverageDays}: {item.coverageDays === null ? labels.notSpecified : `${item.coverageDays} gun`}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => goToInventoryWithFilters({ search: item.sku })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {labels.viewInInventory}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTransactionsWithFilters({ sku: item.sku })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-800"
                    >
                      {labels.openInTransactions}
                    </button>
                  </div>
                </article>
              ))}
            </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm xl:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-neutral-950">{labels.slowMovingTitle}</h4>
                <p className="text-sm text-neutral-600">{labels.slowMovingDescription}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {reports.slowMoving.length === 0 ? (
                <EmptyStateCard
                  title="Yavas hareket eden stok bulunmuyor"
                  description={labels.noAlerts}
                />
              ) : reports.slowMoving.map((item) => (
                <article key={`slow-moving-${item.productId}`} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">{item.productName}</p>
                      <p className="mt-1 text-xs text-neutral-500">{labels.sku}: {item.sku}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      {item.inactivityDays === null ? "30+ gun" : `${item.inactivityDays} gun`}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                    <p>{labels.availableStock}: {item.availableUnits}</p>
                    <p>{labels.salesValue}: {formatCurrency(item.salesValue, locale)}</p>
                    <p>{labels.inactivityDays}: {item.inactivityDays === null ? labels.notSpecified : item.inactivityDays}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => goToInventoryWithFilters({ search: item.sku })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {labels.viewInInventory}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTransactionsWithFilters({ sku: item.sku })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-800"
                    >
                      {labels.openInTransactions}
                    </button>
                  </div>
                </article>
              ))}
            </div>
              </section>
            </div>
          </>
        )}
      </div>

      <div id="inventory-sync" className={getSectionPanelClass(activeSection, "inventory-sync")}>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-neutral-950">{labels.integrationTitle}</h3>
          <p className="text-sm text-neutral-600">{labels.integrationDescription}</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncPending}</p>
            <p className="mt-2 text-lg font-semibold text-neutral-950">{integrationSummary.pendingCount}</p>
            <p className="mt-2 text-xs text-neutral-500">Sırada bekleyen eşitleme işleri.</p>
          </article>
          <article className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncProcessing}</p>
            <p className="mt-2 text-lg font-semibold text-sky-700">{integrationSummary.processingCount}</p>
            <p className="mt-2 text-xs text-neutral-500">Şu anda çalışan entegrasyon akışları.</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncSuccess}</p>
            <p className="mt-2 text-lg font-semibold text-emerald-700">{integrationSummary.successCount}</p>
            <p className="mt-2 text-xs text-neutral-500">Sorunsuz tamamlanan işler.</p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncFailed}</p>
            <p className="mt-2 text-lg font-semibold text-amber-700">{integrationSummary.failedCount}</p>
            <p className="mt-2 text-xs text-neutral-500">Tekrar denenmesi gereken hatalı işler.</p>
          </article>
          <article className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncDeadLetter}</p>
            <p className="mt-2 text-lg font-semibold text-rose-700">{integrationSummary.deadLetterCount}</p>
            <p className="mt-2 text-xs text-neutral-500">Manuel müdahale gerektiren kayıtlar.</p>
          </article>
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="text-base font-semibold text-neutral-950">{labels.syncRecentJobs}</h4>
          {integrationSummary.recentJobs.length === 0 ? (
            <EmptyStateCard
              title="Bekleyen entegrasyon isi yok"
              description={labels.empty}
            />
          ) : integrationSummary.recentJobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">{job.channel} • {job.entityId}</p>
                  <p className="mt-1 text-xs text-neutral-500">{formatDate(job.createdAt, locale, labels.notSpecified)}</p>
                  <p className="mt-2 text-xs text-neutral-600">
                    {job.status === "SUCCESS"
                      ? "Eşitleme tamamlandı."
                      : job.status === "PROCESSING"
                        ? "İşleniyor, kısa süre içinde sonuçlanır."
                        : job.status === "FAILED"
                          ? "İş yeniden denemeye aday."
                          : job.status === "DEAD_LETTER"
                            ? "Kayıt manuel inceleme bekliyor."
                            : "İş kuyruğa alındı."}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                  job.status === "SUCCESS"
                    ? "bg-emerald-100 text-emerald-700"
                    : job.status === "DEAD_LETTER"
                      ? "bg-rose-100 text-rose-700"
                      : job.status === "FAILED"
                        ? "bg-amber-100 text-amber-700"
                        : job.status === "PROCESSING"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-neutral-100 text-neutral-700"
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Kanal</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{job.channel}</p>
                </article>
                <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Kayıt</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{job.entityId}</p>
                </article>
              </div>
              {job.lastError ? (
                <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{labels.syncLastError}: {job.lastError}</p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-semibold text-neutral-950">Harici stok event akışı</h4>
            <p className="text-sm text-neutral-600">Inbound eventlerin eşleme, uygulama ve hata durumlarını son kayıtlar üzerinden izle.</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Alındı</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">{externalEventMonitoring.receivedCount}</p>
            </article>
            <article className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Uygulandı</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700">{externalEventMonitoring.appliedCount}</p>
            </article>
            <article className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Başarısız</p>
              <p className="mt-2 text-lg font-semibold text-amber-700">{externalEventMonitoring.failedCount}</p>
            </article>
            <article className="rounded-2xl border border-fuchsia-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Tekrarlı</p>
              <p className="mt-2 text-lg font-semibold text-fuchsia-700">{externalEventMonitoring.duplicateCount}</p>
            </article>
          </div>

          {externalEventMonitoring.latestFailedMessage ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Son hata: {externalEventMonitoring.latestFailedMessage}
            </p>
          ) : null}

          <div className="mt-4 grid gap-3">
            {externalEventMonitoring.items.length === 0 ? (
              <EmptyStateCard
                title="Harici stok event kaydı bulunmuyor"
                description="Entegrasyonlardan event geldikçe bu alanda son durum ve hata akışı görünür."
              />
            ) : externalEventMonitoring.items.slice(0, 6).map((item) => (
              <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">{item.channel} • {item.productSku ?? item.externalSku ?? "Eşleşmemiş kayıt"}</p>
                    <p className="mt-1 text-xs text-neutral-500">{formatDate(item.createdAt, locale, labels.notSpecified)}</p>
                    <p className="mt-2 text-xs text-neutral-600">
                      Depo: {item.warehouseCode ?? item.externalWarehouseCode ?? labels.notSpecified} • Miktar: {item.quantity}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                    item.status === "APPLIED"
                      ? "bg-emerald-100 text-emerald-700"
                      : item.status === "FAILED"
                        ? "bg-amber-100 text-amber-700"
                        : item.status === "DUPLICATE"
                          ? "bg-fuchsia-100 text-fuchsia-700"
                          : "bg-neutral-100 text-neutral-700"
                  }`}>
                    {item.status}
                  </span>
                </div>
                {item.errorMessage ? (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{item.errorMessage}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>

      <div id="inventory-critical" className={getSectionPanelClass(activeSection, "inventory-critical")}>
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
            <EmptyStateCard
              title="Aktif kritik stok uyarisi yok"
              description={labels.noAlerts}
            />
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
              <p className="mt-3 text-xs text-neutral-500">{labels.alertCreatedAt}: {formatDate(alert.createdAt, locale, labels.notSpecified)}</p>
            </article>
          ))}
        </div>
      </div>

      <div id="inventory-counts" className={getSectionPanelClass(activeSection, "inventory-counts")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-950">{labels.stockCountTitle}</h3>
            <p className="mt-1 text-sm text-neutral-600">{labels.stockCountDescription}</p>
          </div>
          <button
            type="button"
            onClick={() => openStockCountDrawer("create")}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            {labels.createStockCount}
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {stockCounts.length === 0 ? (
            <EmptyStateCard
              title="Olusturulmus sayim bulunmuyor"
              description="Yeni bir stok sayimi baslatarak varyans takibini buradan yonetebilirsin."
            />
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
                  {stockCountStatusLabel(count.status, labels)}
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
              <button
                type="button"
                onClick={() => openStockCountDrawer("edit", count)}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                {labels.viewDetails}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div id="inventory-warehouses" className={getSectionPanelClass(activeSection, "inventory-warehouses")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-950">{labels.warehousesTitle}</h3>
            <p className="mt-1 text-sm text-neutral-600">{labels.warehousesDescription}</p>
          </div>
          <button
            type="button"
            onClick={() => openWarehouseDrawer("create")}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            {labels.createWarehouse}
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {warehouses.length === 0 ? (
            <EmptyStateCard
              title="Tanimli depo bulunmuyor"
              description="Ilk depoyu ekledikten sonra stok hareketleri depo bazli izlenir."
            />
          ) : warehouses.map((warehouse) => (
            <article key={warehouse.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{warehouse.code}</p>
                  <h4 className="mt-1 text-base font-semibold text-neutral-950">{warehouse.name}</h4>
                  <p className="mt-2 text-xs text-neutral-600">
                    {warehouse.isActive
                      ? "Stok hareketlerine açık depo."
                      : "Pasif durumda, yeni işlem almıyor."}
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
                  onClick={() => goToInventoryWithFilters({ warehouseFilter: warehouse.code })}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  {labels.focusWarehouse}
                </button>
                <button
                  type="button"
                  onClick={() => openWarehouseDrawer("edit", warehouse)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  {labels.editWarehouse}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div id="inventory-transactions" className={getSectionPanelClass(activeSection, "inventory-transactions")}>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-neutral-950">{labels.transactionsTitle}</h3>
          <p className="text-sm text-neutral-600">{labels.transactionsDescription}</p>
        </div>

        <form className="mt-4 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 md:grid-cols-2 xl:grid-cols-[1.2fr_220px_220px_180px_180px_auto]" aria-label="Stok işlemleri filtre formu">
          <input
            type="hidden"
            name="search"
            value={query.search}
            readOnly
          />
          <input
            type="hidden"
            name="stockStatusFilter"
            value={query.stockStatusFilter}
            readOnly
          />
          <input
            type="hidden"
            name="reservationFilter"
            value={query.reservationFilter}
            readOnly
          />
          <input
            type="hidden"
            name="warehouseFilter"
            value={query.warehouseFilter}
            readOnly
          />
          <input
            type="hidden"
            name="movementTypeFilter"
            value={query.movementTypeFilter}
            readOnly
          />
          <input
            type="search"
            name="transactionSearch"
            defaultValue={query.transactionSearch}
            placeholder={labels.transactionSearch}
            aria-label={labels.transactionSearch}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          />
          <select
            name="transactionType"
            defaultValue={query.transactionType}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          >
            <option value="all">{labels.transactionFilterType}: {labels.all}</option>
            <option value="MANUAL_ADJUSTMENT">{labels.transactionFilterType}: {labels.inventoryMovementManualAdjustment}</option>
            <option value="STOCK_IN">{labels.transactionFilterType}: {labels.inventoryMovementPurchaseReceipt}</option>
            <option value="STOCK_OUT">{labels.transactionFilterType}: {labels.inventoryMovementDamageWriteOff}</option>
            <option value="TRANSFER">{labels.transactionFilterType}: {labels.transferStock}</option>
            <option value="STOCK_COUNT">{labels.transactionFilterType}: {labels.stockCountTitle}</option>
          </select>
          <select
            name="transactionWarehouse"
            defaultValue={query.transactionWarehouse}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          >
            <option value="all">{labels.transactionFilterWarehouse}: {labels.allWarehouses}</option>
            {warehouses.map((warehouse) => (
              <option key={`transaction-warehouse-${warehouse.id}`} value={warehouse.code}>
                {labels.transactionFilterWarehouse}: {warehouse.code}
              </option>
            ))}
          </select>
          <input
            type="search"
            name="transactionSku"
            defaultValue={query.transactionSku}
            placeholder={labels.transactionFilterSku}
            aria-label={labels.transactionFilterSku}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          />
          <input
            type="date"
            name="transactionStartDate"
            defaultValue={query.transactionStartDate}
            aria-label={labels.transactionFilterStartDate}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          />
          <input
            type="date"
            name="transactionEndDate"
            defaultValue={query.transactionEndDate}
            aria-label={labels.transactionFilterEndDate}
            className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
          />
          <button type="submit" className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800">
            {labels.search}
          </button>
        </form>

        <div className="mt-4 grid gap-3">
          {transactionResult.items.length === 0 ? (
            <EmptyStateCard
              title="Listelenecek stok işlemi bulunmadı"
              description="Arama veya filtreleri değiştirerek daha geniş bir hareket listesi görebilirsin."
            />
          ) : transactionResult.items.map((transaction) => (
            <article key={transaction.id} className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getTransactionBadgeClass(transaction.type)}`}>
                      {formatTransactionType(transaction.type, labels)}
                    </span>
                    <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                      {transaction.lines.length} satır
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-neutral-950">{transaction.transactionNumber}</h4>
                  <p className="mt-1 text-xs text-neutral-500">{formatDate(transaction.createdAt, locale, labels.notSpecified)}</p>
                  <p className="mt-3 text-sm text-neutral-600">{transaction.note ?? transaction.reference ?? labels.notSpecified}</p>
                  {formatSourceDocument({
                    type: transaction.sourceDocument.type,
                    number: transaction.sourceDocument.number,
                  }) ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-neutral-500">
                        Kaynak belge: {formatSourceDocument({
                          type: transaction.sourceDocument.type,
                          number: transaction.sourceDocument.number,
                        })}
                      </p>
                      {formatSourceDocumentMeta(transaction.sourceDocument, locale, labels.notSpecified) ? (
                        <p className="text-xs text-neutral-500">{formatSourceDocumentMeta(transaction.sourceDocument, locale, labels.notSpecified)}</p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {transaction.lines.slice(0, 3).map((line) => (
                      <span
                        key={line.id}
                        className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700"
                      >
                        {line.inventoryItemName} • {line.quantity}
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
                    onClick={() => openTransactionDrawer(transaction)}
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
          <Link
            href={getTransactionPageHref(Math.max(1, transactionResult.page - 1))}
            className={`rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${transactionResult.page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            {labels.prev}
          </Link>
          <p className="text-sm text-neutral-500">{labels.page} {transactionResult.page}/{transactionResult.totalPages}</p>
          <Link
            href={getTransactionPageHref(Math.min(transactionResult.totalPages, transactionResult.page + 1))}
            className={`rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${transactionResult.page >= transactionResult.totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            {labels.next}
          </Link>
        </div>
      </div>

      <div id="inventory-exports" className={getSectionPanelClass(activeSection, "inventory-exports")}>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-neutral-950">Dışa Aktarım Geçmişi</h3>
          <p className="text-sm text-neutral-600">Stok ekranından alınan CSV çıktılarının kim tarafından ve hangi filtrelerle üretildiğini izle.</p>
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
                      CSV Dışa Aktarımı
                    </span>
                    <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                      {item.total} satır
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
      </div>

      <form id="inventory-list" className={getSectionPanelClass(activeSection, "inventory-list")} aria-label="Stok listesi filtre formu">
        <div className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Toplu Islem Alani</p>
              <p className="mt-1 text-sm text-neutral-600">Toplu stok guncelleme ve tercih edilen depo atamalarini ihtiyac oldugunda ac.</p>
            </div>
            <button
              type="button"
              onClick={() => setBulkToolsExpanded((current) => !current)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              {bulkToolsExpanded ? "Toplu islemleri gizle" : "Toplu islemleri ac"}
            </button>
          </div>

          {bulkToolsExpanded ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Toplu Stok Guncelleme</p>
                    <p className="mt-1 text-sm text-neutral-600">Format: `SKU,DEPO_KODU,HEDEF_STOK,MIN_STOK,GUVENLIK_STOK,NOT`</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void submitBulkOperation("adjust")}
                    disabled={bulkOperationPending !== null}
                    className="h-10 rounded-xl border border-neutral-300 bg-neutral-900 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Toplu Guncelle
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadBulkTemplate("adjust")}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Şablon indir
                  </button>
                </div>
                <textarea
                  value={bulkAdjustCsv}
                  onChange={(event) => setBulkAdjustCsv(event.target.value)}
                  rows={7}
                  placeholder="SKU-001,MAIN,45,10,5,Sezon duzeltmesi"
                  className="mt-4 w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm outline-none transition focus:border-neutral-500"
                />
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Toplu Tercihli Depo Atama</p>
                    <p className="mt-1 text-sm text-neutral-600">Format: `SKU,TERCIH_EDILEN_SATIS_DEPOSU`</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void submitBulkOperation("warehouse")}
                    disabled={bulkOperationPending !== null}
                    className="h-10 rounded-xl border border-neutral-300 bg-neutral-900 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Toplu Ata
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadBulkTemplate("warehouse")}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Şablon indir
                  </button>
                </div>
                <textarea
                  value={bulkWarehouseCsv}
                  onChange={(event) => setBulkWarehouseCsv(event.target.value)}
                  rows={7}
                  placeholder="SKU-001,MAIN"
                  className="mt-4 w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm outline-none transition focus:border-neutral-500"
                />
              </section>
            </div>
          ) : null}

          {bulkOperationHistory.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Toplu İşlem Geçmişi</p>
                  <p className="mt-1 text-sm text-neutral-600">Bu oturumda çalıştırılan son toplu işlemler.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {bulkOperationHistory.map((historyItem) => (
                  <article key={historyItem.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-950">
                        {historyItem.type === "adjust"
                          ? "Toplu stok güncelleme"
                          : historyItem.type === "warehouse"
                            ? "Toplu depo atama"
                            : "Toplu sayım güncelleme"}
                      </p>
                      <span className="text-xs text-neutral-500">{formatDate(historyItem.createdAt, locale, labels.notSpecified)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">Başarılı: {historyItem.successCount}</span>
                      <span className="rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-700">Hatalı: {historyItem.failureCount}</span>
                      <span className="rounded-full bg-neutral-200 px-2 py-1 font-semibold text-neutral-700">Toplam: {historyItem.total}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {operationHistory.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Kalıcı Operasyon Geçmişi</p>
                  <p className="mt-1 text-sm text-neutral-600">Inventory için özel geçmiş projeksiyonundan beslenen son stok ve depo operasyonları.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {operationHistory.map((historyItem) => (
                  <article key={historyItem.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">{historyItem.title}</p>
                        <p className="mt-1 text-xs text-neutral-600">{historyItem.summary}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                        historyItem.entityType === "WAREHOUSE"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-neutral-200 text-neutral-700"
                      }`}>
                        {historyItem.entityType === "WAREHOUSE" ? "Depo" : "Stok"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
                      <span>{formatDate(historyItem.createdAt, locale, labels.notSpecified)}</span>
                      {historyItem.actorLabel ? <span>• {historyItem.actorLabel}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto]">
          <input
            type="search"
            name="search"
            defaultValue={query.search}
            placeholder={labels.search}
            aria-label={labels.search}
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
            onClick={() => void exportVisibleRowsCsv()}
            aria-label={labels.exportCsv}
            title={labels.exportCsv}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Liste Tercihleri</p>
              <p className="mt-1 text-sm text-neutral-600">Kompakt görünüm ve görünür alan tercihleri burada kalıcı olarak saklanır.</p>
            </div>
            <button
              type="button"
              onClick={() => setInventoryListPreferences((current) => ({
                ...current,
                compactInventoryList: !current.compactInventoryList,
              }))}
              className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                compactInventoryList
                  ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {compactInventoryList ? "Kompakt görünüm açık" : "Kompakt görünümü aç"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "warehouse" as const, label: "Depo alanı" },
              { key: "stock" as const, label: "Stok özeti" },
              { key: "movement" as const, label: "Hareket alanı" },
              { key: "reservation" as const, label: "Rezervasyon bilgisi" },
              { key: "preference" as const, label: "Tercihli depo bilgisi" },
            ].map((column) => (
              <button
                key={column.key}
                type="button"
                onClick={() => toggleVisibleColumn(column.key)}
                className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs font-medium transition ${
                  visibleColumns[column.key]
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {column.label}
              </button>
            ))}
          </div>
        </div>
      </form>

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
                  {item.hint ? (
                    <p className="mt-2 text-xs text-rose-800">{item.hint}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
          <div className="mt-4 grid gap-2">
            {bulkOperationResult.rows.slice(0, 16).map((row: BulkOperationResult["rows"][number]) => (
              <article key={`${row.rowNumber}-${row.sku}-${row.message}`} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">
                      Satır {row.rowNumber} • {row.sku || "SKU yok"}
                      {row.warehouseCode ? ` • ${row.warehouseCode}` : ""}
                    </p>
                    {row.inputSummary ? (
                      <p className="mt-1 text-xs text-neutral-500">{row.inputSummary}</p>
                    ) : null}
                  </div>
                  <span className={row.success ? "text-emerald-700" : "text-rose-700"}>{row.message}</span>
                </div>
                {!row.success && row.hint ? (
                  <p className="mt-2 text-xs text-rose-700">Öneri: {row.hint}</p>
                ) : null}
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
            <EmptyStateCard
              title="Filtrelere uygun stok kaydi bulunmadi"
              description="Arama terimini sadeleştir veya filtreleri temizleyerek tum stok kayitlarini tekrar listele."
            />
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
                <article key={rowKey} className={`grid gap-3 p-4 transition hover:bg-neutral-50 ${
                  compactInventoryList ? "lg:grid-cols-[1.5fr_150px_150px_120px]" : "lg:grid-cols-[1.5fr_180px_180px_150px_140px]"
                } lg:items-center`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-neutral-950">{item.name}</p>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(item.stockStatus)}`}>
                        {statusLabel(item.stockStatus, labels)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-neutral-500">/{item.slug} · {labels.sku}: {item.sku}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700">
                        {formatProductType(item.productType)}
                      </span>
                      <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700">
                        {formatUnitType(item.unitType)}
                      </span>
                      {visibleColumns.reservation && item.hasReservations ? (
                        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-800">
                          Rezervasyon var
                        </span>
                      ) : null}
                      {visibleColumns.preference && item.preferredSalesWarehouseCode ? (
                        <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700">
                          Satış deposu: {item.preferredSalesWarehouseCode}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3 text-sm lg:hidden">
                    {visibleColumns.warehouse ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-neutral-500">{labels.warehouse}</span>
                        <span className="text-sm text-neutral-700">{item.warehouseName ?? item.warehouseCode ?? labels.notSpecified}</span>
                      </div>
                    ) : null}
                    <div className="grid gap-2 text-xs text-neutral-600">
                      {visibleColumns.stock ? (
                        <>
                          <p>{labels.availableStock}: <span className="font-semibold text-neutral-900">{item.availableStock}</span> • {labels.onHandStock}: <span className="font-semibold text-neutral-900">{item.onHandStock}</span></p>
                          <p>{labels.reservedStock}: <span className="font-semibold text-neutral-900">{item.reservedStock}</span> • Min: <span className="font-semibold text-neutral-900">{item.reorderPoint}</span></p>
                        </>
                      ) : null}
                      <p>{stockSignal}</p>
                      {visibleColumns.movement ? (
                        <p>{labels.lastMovementAt}: <span className="font-semibold text-neutral-900">{formatDate(item.lastMovementAt, locale, labels.notSpecified)}</span></p>
                      ) : null}
                    </div>
                    {visibleColumns.movement ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${movementTypeClass(item.lastMovementType)}`}>
                          {movementTypeLabel(item.lastMovementType, labels)}
                        </span>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={(event) => openDrawer(item, "view", event.timeStamp)}
                      className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {labels.viewDetails}
                    </button>
                  </div>
                  {visibleColumns.warehouse ? (
                    <p className="hidden text-sm text-neutral-700 lg:block">
                      {item.warehouseName ?? item.warehouseCode ?? labels.notSpecified}
                      {item.isDefaultWarehouse ? (
                        <span className="ml-2 inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">{labels.defaultWarehouse}</span>
                      ) : null}
                    </p>
                  ) : null}
                  {visibleColumns.stock ? (
                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold text-neutral-950">{item.availableStock} kullanılabilir</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Mevcut {item.onHandStock} • Rezerve {item.reservedStock} • Min {item.reorderPoint}
                      </p>
                    </div>
                  ) : null}
                  {visibleColumns.movement ? (
                    <div className="hidden lg:block">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${movementTypeClass(item.lastMovementType)}`}>
                        {movementTypeLabel(item.lastMovementType, labels)}
                      </span>
                      <p className="mt-2 text-xs text-neutral-500">{stockSignal}</p>
                      <p className="mt-1 text-xs text-neutral-500">{formatDate(item.lastMovementAt, locale, labels.notSpecified)}</p>
                    </div>
                  ) : (
                    <div className="hidden lg:block">
                      <p className="text-xs text-neutral-500">{stockSignal}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(event) => openDrawer(item, "view", event.timeStamp)}
                    className="hidden h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 lg:block"
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
          <aside className={`absolute right-0 top-0 flex h-full w-full flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl ${drawerFullscreen ? "max-w-none" : "max-w-[1040px]"}`}>
            <div className="flex items-start justify-between border-b border-neutral-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">Stok Karti</h3>
                <p className="mt-1 text-sm text-neutral-500">{labels.drawerInfo}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDrawerFullscreen((prev) => !prev)}
                  disabled={Boolean(pendingRowKey)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
                  aria-label={drawerFullscreen ? "Daralt" : "Tam ekran"}
                  title={drawerFullscreen ? "Daralt" : "Tam ekran"}
                >
                  {drawerFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={Boolean(pendingRowKey)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
                  aria-label="Kapat"
                  title="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-5">
                <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,47,73,0.94),rgba(21,128,61,0.88))] p-5 text-white shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Ürün Kartı</p>
                      <h4 className="mt-2 text-2xl font-semibold">{drawerItem.name}</h4>
                      <p className="mt-2 text-sm text-white/70">/{drawerItem.slug} • {labels.sku}: {drawerItem.sku}</p>
                      <p className="mt-1 text-xs text-white/60">
                        Barkod: {drawerItem.barcode ?? labels.notSpecified} • Birim: {formatUnitType(drawerItem.unitType)} • Tip: {formatProductType(drawerItem.productType)}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(drawerItem.stockStatus)}`}>
                      {statusLabel(drawerItem.stockStatus, labels)}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                      <p className="text-xs text-white/65">Operasyon deposu</p>
                      <p className="mt-1 text-base font-semibold">
                        {drawerItem.warehouseName ?? drawerItem.warehouseCode ?? labels.notSpecified}
                      </p>
                    </article>
                    <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                      <p className="text-xs text-white/65">{labels.onHandStock}</p>
                      <p className="mt-1 text-base font-semibold">{drawerItem.onHandStock}</p>
                    </article>
                    <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                      <p className="text-xs text-white/65">{labels.availableStock}</p>
                      <p className="mt-1 text-base font-semibold">{drawerItem.availableStock}</p>
                    </article>
                  </div>
                  <div className="mt-5 grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-white/65">Stok sinyali</p>
                      <p className="mt-1 text-sm font-semibold text-white">{drawerStockCoverage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/65">Tercihli satış deposu</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {drawerItem.preferredSalesWarehouseCode ?? labels.notSpecified}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/65">Tercihli tedarik deposu</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {drawerItem.preferredPurchaseWarehouseCode ?? labels.notSpecified}
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
                      <p className="mt-1 text-lg font-semibold text-neutral-900">{drawerItem.onHandStock}</p>
                    </article>
                    <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-3">
                      <p className="text-xs text-cyan-700">{labels.reservedStock}</p>
                      <p className="mt-1 text-lg font-semibold text-cyan-800">{drawerItem.reservedStock}</p>
                    </article>
                    <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
                      <p className="text-xs text-emerald-700">{labels.availableStock}</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-800">{drawerItem.availableStock}</p>
                    </article>
                    <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
                      <p className="text-xs text-amber-700">{labels.reorderPoint}</p>
                      <p className="mt-1 text-lg font-semibold text-amber-800">{drawerItem.reorderPoint}</p>
                    </article>
                    <article className="rounded-2xl border border-orange-200 bg-orange-50/70 p-3 sm:col-span-2 lg:col-span-2">
                      <p className="text-xs text-orange-700">{labels.safetyStock}</p>
                      <p className="mt-1 text-lg font-semibold text-orange-800">{drawerItem.safetyStock}</p>
                    </article>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    <article className="rounded-2xl border border-neutral-200 bg-white p-3">
                      <p className="text-xs text-neutral-500">Ürün tipi</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-950">{formatProductType(drawerItem.productType)}</p>
                    </article>
                    <article className="rounded-2xl border border-neutral-200 bg-white p-3">
                      <p className="text-xs text-neutral-500">Birim tipi</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-950">{formatUnitType(drawerItem.unitType)}</p>
                    </article>
                    <article className="rounded-2xl border border-neutral-200 bg-white p-3">
                      <p className="text-xs text-neutral-500">Rezervasyon</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-950">
                        {drawerItem.hasReservations ? "Aktif rezervasyon var" : "Rezervasyon bulunmuyor"}
                      </p>
                    </article>
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                  <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Ticari Kart</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Satış fiyatı</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-950">{formatCurrency(drawerItem.unitPrice, locale)}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Alış fiyatı</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-950">
                          {drawerItem.purchasePrice === null ? labels.notSpecified : formatCurrency(drawerItem.purchasePrice, locale)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Liste fiyatı</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-950">
                          {drawerItem.compareAtPrice === null ? labels.notSpecified : formatCurrency(drawerItem.compareAtPrice, locale)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Tahmini stok marjı</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-950">
                          {drawerMarginEstimate === null ? labels.notSpecified : formatCurrency(drawerMarginEstimate, locale)}
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Operasyon Profili</p>
                    <div className="mt-4 space-y-3 text-sm text-neutral-700">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Tercihli satış deposu</p>
                        <p className="mt-1 font-semibold text-neutral-950">{drawerItem.preferredSalesWarehouseCode ?? labels.notSpecified}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Tercihli tedarik deposu</p>
                        <p className="mt-1 font-semibold text-neutral-950">{drawerItem.preferredPurchaseWarehouseCode ?? labels.notSpecified}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Stok kararı</p>
                        <p className="mt-1 font-semibold text-neutral-950">{drawerStockCoverage}</p>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Depo Dağılımı</p>
                      <h4 className="mt-1 text-base font-semibold text-neutral-950">Tüm depolarda stok görünümü</h4>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700">
                      {drawerItem.warehouseDistribution.length} depo
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {drawerItem.warehouseDistribution.length === 0 ? (
                      <EmptyStateCard
                        title="Dağılım kaydı bulunmuyor"
                        description="Bu ürün için depo bazlı stok seviyesi oluştukça burada listelenecek."
                      />
                    ) : drawerItem.warehouseDistribution.map((distribution) => (
                      <article key={`${drawerItem.productId}-${distribution.warehouseCode}`} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
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
                            <p>Kullanilabilir: <span className="font-semibold text-neutral-950">{distribution.availableStock}</span></p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

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
                        onChange={(event) => updateDrawerDateRange(event.target.value, event.timeStamp)}
                        className="h-9 rounded-xl border border-neutral-300 px-2 text-xs text-neutral-700"
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
                        <li key={`${movement.createdAt}:${index}`} className="grid gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs text-neutral-700 sm:grid-cols-[auto_auto_1fr] sm:items-start">
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${movementTypeClass(movement.type)}`}>
                            {movementTypeLabel(movement.type, labels)}
                          </span>
                          <span className={movement.quantity >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                            {movement.quantity >= 0 ? `+${movement.quantity}` : movement.quantity}
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="text-neutral-500">{formatDate(movement.createdAt, locale, labels.notSpecified)}</span>
                            <span>{movement.note ?? labels.notSpecified}</span>
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
              </div>

              <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">İşlem Merkezi</p>
                    <h4 className="mt-1 text-sm font-semibold text-neutral-900">Stok Operasyonu</h4>
                  </div>
                  {drawerMode !== "view" ? (
                    <button
                      type="button"
                      onClick={() => setDrawerMode("view")}
                      className="h-9 rounded-xl border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Ozet Gorunumu
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { id: "stock_in", label: labels.stockIn, accent: "border-emerald-200 bg-emerald-50 text-emerald-800", disabled: !drawerItem.warehouseCode },
                    { id: "stock_out", label: labels.stockOut, accent: "border-rose-200 bg-rose-50 text-rose-800", disabled: !drawerItem.warehouseCode },
                    { id: "edit", label: labels.adjustStock, accent: "border-sky-200 bg-sky-50 text-sky-800", disabled: false },
                    { id: "transfer", label: labels.transferStock, accent: "border-amber-200 bg-amber-50 text-amber-800", disabled: !drawerItem.warehouseCode },
                  ].map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => setDrawerMode(action.id as DrawerMode)}
                      disabled={action.disabled}
                      className={`rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        drawerMode === action.id ? `${action.accent} shadow-sm` : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <span className="block text-xs font-semibold uppercase tracking-wide">İşlem</span>
                      <span className="mt-1 block text-sm font-semibold">{action.label}</span>
                    </button>
                  ))}
                </div>

                {drawerMode === "edit" ? (
                  <form
                    className="mt-4 grid gap-3"
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
                        className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                        required
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-1">
                        <label className="text-xs font-medium text-neutral-600">{labels.targetReorderPoint}</label>
                        <input
                          type="number"
                          min={0}
                          value={drawerReorderPoint}
                          onChange={(event) => setDrawerReorderPoint(event.target.value)}
                          className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                          required
                        />
                      </div>
                      <div className="grid gap-1">
                        <label className="text-xs font-medium text-neutral-600">{labels.targetSafetyStock}</label>
                        <input
                          type="number"
                          min={0}
                          value={drawerSafetyStock}
                          onChange={(event) => setDrawerSafetyStock(event.target.value)}
                          className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.adjustmentNote}</label>
                      <textarea
                        value={drawerNote}
                        onChange={(event) => setDrawerNote(event.target.value)}
                        placeholder={labels.adjustmentNote}
                        rows={3}
                        className="rounded-xl border border-neutral-300 px-3 py-3 text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={Boolean(pendingRowKey)}
                        className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingRowKey ? "..." : labels.applyAdjustment}
                      </button>
                    </div>
                  </form>
                ) : drawerMode === "stock_in" || drawerMode === "stock_out" ? (
                  <form
                    className="mt-4 grid gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void applyMovementFromDrawer(drawerMode);
                    }}
                  >
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.movementQuantity}</label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={drawerMovementQuantity}
                        onChange={(event) => setDrawerMovementQuantity(event.target.value)}
                        className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                        required
                      />
                    </div>
                    {drawerMode === "stock_in" ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-emerald-950">Satın alma belgesi</p>
                          <p className="mt-1 text-xs text-emerald-800">Belge alanlarını doldurursan stok girişi satın alma kaydı olarak izlenir.</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="grid gap-1">
                            <label className="text-xs font-medium text-neutral-600">Belge numarası</label>
                            <input
                              value={drawerPurchaseDocumentNumber}
                              onChange={(event) => setDrawerPurchaseDocumentNumber(event.target.value)}
                              placeholder="ALIŞ-2026-001"
                              className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                            />
                          </div>
                          <div className="grid gap-1">
                            <label className="text-xs font-medium text-neutral-600">Tedarikçi</label>
                            <input
                              value={drawerPurchaseSupplierName}
                              onChange={(event) => setDrawerPurchaseSupplierName(event.target.value)}
                              placeholder="Tedarikçi adı"
                              className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                            />
                          </div>
                          <div className="grid gap-1">
                            <label className="text-xs font-medium text-neutral-600">Belge tarihi</label>
                            <input
                              type="datetime-local"
                              value={drawerPurchaseDocumentDate}
                              onChange={(event) => setDrawerPurchaseDocumentDate(event.target.value)}
                              className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                            />
                          </div>
                          <div className="grid gap-1">
                            <label className="text-xs font-medium text-neutral-600">Harici referans</label>
                            <input
                              value={drawerPurchaseReference}
                              onChange={(event) => setDrawerPurchaseReference(event.target.value)}
                              placeholder="İrsaliye / e-fatura no"
                              className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                            />
                          </div>
                          <div className="grid gap-1 md:col-span-2">
                            <label className="text-xs font-medium text-neutral-600">Birim maliyet</label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={drawerPurchaseUnitCost}
                              onChange={(event) => setDrawerPurchaseUnitCost(event.target.value)}
                              placeholder="0.00"
                              className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.adjustmentNote}</label>
                      <textarea
                        value={drawerNote}
                        onChange={(event) => setDrawerNote(event.target.value)}
                        placeholder={labels.adjustmentNote}
                        rows={3}
                        className="rounded-xl border border-neutral-300 px-3 py-3 text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={Boolean(pendingRowKey)}
                        className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingRowKey ? "..." : drawerMode === "stock_in" ? labels.stockIn : labels.stockOut}
                      </button>
                    </div>
                  </form>
                ) : drawerMode === "transfer" ? (
                  <form
                    className="mt-4 grid gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void applyTransferFromDrawer();
                    }}
                  >
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.transferTargetWarehouse}</label>
                      <select
                        value={drawerTransferWarehouseCode}
                        onChange={(event) => setDrawerTransferWarehouseCode(event.target.value)}
                        className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                        required
                      >
                        <option value="">{labels.notSpecified}</option>
                        {warehouses
                          .filter((warehouse) => warehouse.isActive && warehouse.code !== drawerItem.warehouseCode)
                          .map((warehouse) => (
                            <option key={`transfer-${warehouse.id}`} value={warehouse.code}>
                              {warehouse.code} - {warehouse.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.transferQuantity}</label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={drawerTransferQuantity}
                        onChange={(event) => setDrawerTransferQuantity(event.target.value)}
                        className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                        required
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.transferNote}</label>
                      <textarea
                        value={drawerTransferNote}
                        onChange={(event) => setDrawerTransferNote(event.target.value)}
                        placeholder={labels.transferNote}
                        rows={3}
                        className="rounded-xl border border-neutral-300 px-3 py-3 text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={Boolean(pendingRowKey)}
                        className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingRowKey ? "..." : labels.applyTransfer}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                    Bu karttan stok girişi, stok çıkışı, manuel düzeltme ve depo transferi işlemlerini yönetebilirsin.
                  </div>
                )}
              </section>
            </div>
          </aside>
        </div>
      ) : null}

      {warehouseDrawerMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/35">
          <div className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.warehousesTitle}</p>
                <h3 className="mt-1 text-xl font-semibold text-neutral-950">
                  {warehouseDrawerMode === "create" ? labels.createWarehouse : labels.editWarehouse}
                </h3>
              </div>
              <button type="button" onClick={closeWarehouseDrawer} className="rounded-full border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.warehouseCode}</label>
                <input
                  value={warehouseCode}
                  onChange={(event) => setWarehouseCode(event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.warehouseName}</label>
                <input
                  value={warehouseName}
                  onChange={(event) => setWarehouseName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.warehouseDescription}</label>
                <textarea
                  value={warehouseDescription}
                  onChange={(event) => setWarehouseDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-3 text-sm outline-none transition focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.warehouseAddress}</label>
                <textarea
                  value={warehouseAddress}
                  onChange={(event) => setWarehouseAddress(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-3 text-sm outline-none transition focus:border-neutral-500"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.warehouseContactName}</label>
                  <input
                    value={warehouseContactName}
                    onChange={(event) => setWarehouseContactName(event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.warehouseContactPhone}</label>
                  <input
                    value={warehouseContactPhone}
                    onChange={(event) => setWarehouseContactPhone(event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.warehousePriority}</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={warehousePriority}
                  onChange={(event) => setWarehousePriority(event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                <input type="checkbox" checked={warehouseIsActive} onChange={(event) => setWarehouseIsActive(event.target.checked)} />
                {labels.active}
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                <input type="checkbox" checked={warehouseIsDefault} onChange={(event) => setWarehouseIsDefault(event.target.checked)} />
                {labels.defaultLabel}
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-5 py-4">
              <button type="button" onClick={closeWarehouseDrawer} className="h-11 rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100">
                {labels.prev}
              </button>
              <button
                type="button"
                disabled={pendingWarehouse}
                onClick={saveWarehouse}
                className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {labels.saveWarehouse}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {stockCountDrawerMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/35">
          <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.stockCountTitle}</p>
                <h3 className="mt-1 text-xl font-semibold text-neutral-950">
                  {stockCountDrawerMode === "create" ? labels.createStockCount : stockCountDrawerItem?.countNumber}
                </h3>
              </div>
              <button type="button" onClick={closeStockCountDrawer} className="rounded-full border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {stockCountDrawerMode === "create" ? (
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.stockCountWarehouseScope}</label>
                    <select
                      value={stockCountWarehouseCode}
                      onChange={(event) => setStockCountWarehouseCode(event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                    >
                      <option value="all">{labels.allWarehouses}</option>
                      {warehouses.filter((warehouse) => warehouse.isActive).map((warehouse) => (
                        <option key={`count-create-${warehouse.id}`} value={warehouse.code}>
                          {warehouse.code} - {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.stockCountDate}</label>
                    <input
                      type="datetime-local"
                      value={stockCountDate}
                      onChange={(event) => setStockCountDate(event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.stockCountSearch}</label>
                  <input
                    value={stockCountSearch}
                    onChange={(event) => setStockCountSearch(event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">{labels.stockCountNote}</label>
                  <textarea
                    value={stockCountNote}
                    onChange={(event) => setStockCountNote(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-3 text-sm outline-none transition focus:border-neutral-500"
                  />
                </div>
              </div>
            ) : stockCountDrawerItem ? (
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{labels.stockCountWarehouseScope}</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{stockCountDrawerItem.warehouseCode ?? labels.allWarehouses}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500">{labels.stockCountDate}</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-950">{formatDate(stockCountDrawerItem.countedAt, locale, labels.notSpecified)}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500">{labels.stockCountLineCount}</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-950">{stockCountDrawerItem.lineCount}</p>
                  </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{labels.stockCountVarianceCount}</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{stockCountDrawerItem.varianceLineCount}</p>
                </div>
              </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Eşleşen satır</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-900">{stockCountSummary.matched}</p>
                  </article>
                  <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Fazla sayım</p>
                    <p className="mt-1 text-lg font-semibold text-sky-900">{stockCountSummary.positive}</p>
                  </article>
                  <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Eksik sayım</p>
                    <p className="mt-1 text-lg font-semibold text-rose-900">{stockCountSummary.negative}</p>
                  </article>
                  <article className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Bekleyen satır</p>
                    <p className="mt-1 text-lg font-semibold text-neutral-950">{stockCountSummary.pending}</p>
                  </article>
                  <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Net fark</p>
                    <p className={`mt-1 text-lg font-semibold ${stockCountSummary.netDifference >= 0 ? "text-emerald-900" : "text-rose-900"}`}>
                      {stockCountSummary.netDifference >= 0 ? `+${stockCountSummary.netDifference}` : stockCountSummary.netDifference}
                    </p>
                  </article>
                </div>

                <div className="rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-neutral-500">{labels.stockCountNote}</p>
                      <p className="mt-1 text-sm text-neutral-900">{stockCountDrawerItem.note ?? labels.notSpecified}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${stockCountStatusClass(stockCountDrawerItem.status)}`}>
                      {stockCountStatusLabel(stockCountDrawerItem.status, labels)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {stockCountDrawerItem.status !== "APPLIED" ? (
                    <section className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Toplu Sayım Satırı Güncelleme</p>
                        <p className="mt-1 text-sm text-neutral-600">Format: `SKU,DEPO_KODU,SAYILAN_STOK,NOT`</p>
                      </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => downloadBulkTemplate("stock-count")}
                            className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                          >
                            Şablon indir
                          </button>
                          <button
                            type="button"
                            onClick={() => void submitBulkOperation("stock-count")}
                            disabled={bulkOperationPending !== null}
                            className="h-10 rounded-xl border border-neutral-300 bg-neutral-900 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Toplu Uygula
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={bulkStockCountCsv}
                        onChange={(event) => setBulkStockCountCsv(event.target.value)}
                        rows={5}
                        placeholder="SKU-001,MAIN,42,Raf sayimi"
                        className="mt-4 w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm outline-none transition focus:border-neutral-500"
                      />
                    </section>
                  ) : null}

                  {stockCountDrawerItem.status !== "APPLIED" ? (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Uygulama Özeti</p>
                          <p className="mt-1 text-sm text-neutral-700">
                            Sayım uygulandığında farklı satırlar için stok hareketi oluşturulur ve sistem stokları sayılan değerle hizalanır.
                          </p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-neutral-700">
                          <p>Farklı satır: <span className="font-semibold text-neutral-950">{stockCountSummary.positive + stockCountSummary.negative}</span></p>
                          <p>Bekleyen satır: <span className="font-semibold text-neutral-950">{stockCountSummary.pending}</span></p>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {stockCountDrawerItem.lines.map((line) => {
                    const draft = stockCountDrafts[line.id] ?? {
                      countedOnHand: line.countedOnHand === null ? "" : String(line.countedOnHand),
                      note: line.note ?? "",
                    };

                    return (
                      <article key={line.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))_120px]">
                          <div>
                            <p className="text-sm font-semibold text-neutral-950">{line.productName}</p>
                            <p className="mt-1 text-xs text-neutral-500">{labels.sku}: {line.sku} • {line.warehouseCode}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">{labels.onHandStock}</p>
                            <p className="mt-1 text-sm font-semibold text-neutral-950">{line.systemOnHand}</p>
                          </div>
                          <div>
                            <label className="text-xs text-neutral-500">{labels.stockCountCountedOnHand}</label>
                            <input
                              type="number"
                              min={0}
                              value={draft.countedOnHand}
                              onChange={(event) => setStockCountLineDraft(line.id, "countedOnHand", event.target.value)}
                              disabled={stockCountDrawerItem.status === "APPLIED"}
                              className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-2 text-sm"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">{labels.stockCountDifference}</p>
                            <p className={`mt-1 text-sm font-semibold ${(Number(draft.countedOnHand || line.countedOnHand || 0) - line.systemOnHand) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                              {draft.countedOnHand === "" && line.countedOnHand === null
                                ? labels.notSpecified
                                : Number(draft.countedOnHand || line.countedOnHand || 0) - line.systemOnHand}
                            </p>
                          </div>
                          <div className="lg:col-span-2">
                            <label className="text-xs text-neutral-500">{labels.stockCountNote}</label>
                            <textarea
                              value={draft.note}
                              onChange={(event) => setStockCountLineDraft(line.id, "note", event.target.value)}
                              disabled={stockCountDrawerItem.status === "APPLIED"}
                              rows={2}
                              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-2 text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => void saveStockCountLine(line.id)}
                              disabled={pendingStockCountLineId === line.id || stockCountDrawerItem.status === "APPLIED"}
                              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {labels.stockCountEditLine}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-5 py-4">
              <button type="button" onClick={closeStockCountDrawer} className="h-11 rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100">
                {labels.prev}
              </button>
              {stockCountDrawerMode === "create" ? (
                <button
                  type="button"
                  disabled={pendingStockCount}
                  onClick={() => void createStockCount()}
                  className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {labels.stockCountCreateAction}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pendingStockCount || !stockCountDrawerItem || stockCountDrawerItem.status === "APPLIED"}
                  onClick={() => void applyStockCount()}
                  className="h-11 rounded-xl border border-neutral-300 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {labels.stockCountApply}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {transactionDrawerItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/35">
          <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.transactionsTitle}</p>
                <h3 className="mt-1 text-xl font-semibold text-neutral-950">{transactionDrawerItem.transactionNumber}</h3>
              </div>
              <button type="button" onClick={closeTransactionDrawer} className="rounded-full border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{labels.transactionType}</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{formatTransactionType(transactionDrawerItem.type, labels)}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{labels.transactionCreatedAt}</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{formatDate(transactionDrawerItem.createdAt, locale, labels.notSpecified)}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs text-neutral-500">Satır sayısı</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{transactionDrawerItem.lines.length}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs text-neutral-500">Toplam miktar</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {transactionDrawerItem.lines.reduce((sum, line) => sum + line.quantity, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs text-neutral-500">Belge ilişkisi</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {formatSourceDocument({
                      type: transactionDrawerItem.sourceDocument.type,
                      number: transactionDrawerItem.sourceDocument.number,
                    }) ?? labels.notSpecified}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs text-neutral-500">{labels.movementReference}</p>
                <p className="mt-1 text-sm text-neutral-900">{transactionDrawerItem.reference ?? labels.notSpecified}</p>
              </div>

              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs text-neutral-500">Kaynak Belge</p>
                {formatSourceDocument({
                  type: transactionDrawerItem.sourceDocument.type,
                  number: transactionDrawerItem.sourceDocument.number,
                }) ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900">
                      {formatSourceDocument({
                        type: transactionDrawerItem.sourceDocument.type,
                        number: transactionDrawerItem.sourceDocument.number,
                      })}
                    </p>
                    {formatSourceDocumentMeta(transactionDrawerItem.sourceDocument, locale, labels.notSpecified) ? (
                      <p className="text-xs text-neutral-500">
                        {formatSourceDocumentMeta(transactionDrawerItem.sourceDocument, locale, labels.notSpecified)}
                      </p>
                    ) : null}
                    {transactionDrawerItem.sourceDocument.url ? (
                      <Link href={`/${locale}${transactionDrawerItem.sourceDocument.url}`} className="text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4">
                        Kaynak belgeye git
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-neutral-900">{labels.notSpecified}</p>
                )}
              </div>

              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs text-neutral-500">{labels.adjustmentNote}</p>
                <p className="mt-1 text-sm text-neutral-900">{transactionDrawerItem.note ?? labels.notSpecified}</p>
              </div>

              <div className="rounded-xl border border-neutral-200 p-4">
                <h4 className="text-sm font-semibold text-neutral-900">{labels.transactionLines}</h4>
                <div className="mt-3 space-y-3">
                  {transactionDrawerItem.lines.map((line) => (
                    <article key={line.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-neutral-950">{line.inventoryItemName}</p>
                          <p className="text-xs text-neutral-500">{labels.sku}: {line.inventoryItemSku}</p>
                        </div>
                        <p className="text-sm font-semibold text-neutral-950">{line.quantity}</p>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-neutral-600">
                        <p>{labels.warehouse}: {line.fromWarehouseCode ?? labels.notSpecified} {line.toWarehouseCode ? `→ ${line.toWarehouseCode}` : ""}</p>
                        <p>{labels.adjustmentNote}: {line.note ?? labels.notSpecified}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
