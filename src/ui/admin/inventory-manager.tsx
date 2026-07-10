"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, Maximize2, Minimize2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Locale } from "@/lib/i18n";
import type {
  AdminInventoryAlertSummary,
  AdminInventoryListResult,
  AdminInventoryReportsResult,
  AdminStockCountItem,
  AdminInventoryTransactionListResult,
  AdminWarehouseItem,
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
  warehouseCount: string;
  lowStockRows: string;
  outOfStockRows: string;
  warehousePerformance: string;
  lowStockReport: string;
  movementSummaryTitle: string;
  trendTitle: string;
  costValue: string;
  salesValue: string;
  potentialProfit: string;
  movementCount: string;
  totalQuantityLabel: string;
  trendStockIn: string;
  trendStockOut: string;
  trendNet: string;
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
  };
  labels: Labels;
};

function formatCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

const inventorySectionAnchors = [
  { id: "inventory-reports", key: "sectionReports" as const },
  { id: "inventory-sync", key: "sectionSync" as const },
  { id: "inventory-critical", key: "sectionCritical" as const },
  { id: "inventory-counts", key: "sectionCounts" as const },
  { id: "inventory-warehouses", key: "sectionWarehouses" as const },
  { id: "inventory-transactions", key: "sectionTransactions" as const },
  { id: "inventory-list", key: "sectionInventoryList" as const },
];

export function InventoryManager({ locale, result, transactionResult, warehouses, alertResult, stockCounts, reports, integrationSummary, query, labels }: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<(typeof inventorySectionAnchors)[number]["id"]>("inventory-reports");
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

  useEffect(() => {
    const sections = inventorySectionAnchors
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

      const nextSectionId = visibleEntries[0]?.target.id as (typeof inventorySectionAnchors)[number]["id"] | undefined;
      if (nextSectionId) {
        setActiveSection(nextSectionId);
      }
    }, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.2, 0.35, 0.5, 0.75],
    });

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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
    return qs ? `/${locale}/admin/inventory?${qs}` : `/${locale}/admin/inventory`;
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

      <div className="border-b border-neutral-200 bg-white/90 p-5">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-950">{labels.sectionsTitle}</h3>
          <div className="sticky top-0 z-20 -mx-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none]">
            <div className="flex min-w-max gap-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
            {inventorySectionAnchors.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition ${
                  activeSection === section.id
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {labels[section.key]}
              </a>
            ))}
            </div>
          </div>
        </div>
      </div>

      <div id="inventory-reports" className="border-b border-neutral-200 bg-white/90 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-neutral-950">{labels.reportsTitle}</h3>
          <p className="text-sm text-neutral-600">{labels.reportsDescription}</p>
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
                <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">{labels.noAlerts}</p>
              ) : reports.lowStock.map((item) => (
                <article key={`low-stock-${item.productId}-${item.warehouseCode}`} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">{item.productName}</p>
                      <p className="mt-1 text-xs text-neutral-500">{labels.sku}: {item.sku} • {item.warehouseCode}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${item.availableUnits <= 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.availableUnits <= 0 ? labels.alertTypeOutOfStock : labels.alertTypeLowStock}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
                    <p>{labels.availableStock}: {item.availableUnits}</p>
                    <p>{labels.reorderPoint}: {item.reorderPoint}</p>
                    <p>{labels.safetyStock}: {item.safetyStock}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

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
              <span className="rounded-full bg-neutral-200 px-2 py-1 text-[11px] font-semibold text-neutral-700">30d</span>
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
      </div>

      <div id="inventory-sync" className="border-b border-neutral-200 bg-white/90 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-neutral-950">{labels.integrationTitle}</h3>
          <p className="text-sm text-neutral-600">{labels.integrationDescription}</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncPending}</p>
            <p className="mt-2 text-lg font-semibold text-neutral-950">{integrationSummary.pendingCount}</p>
          </article>
          <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncProcessing}</p>
            <p className="mt-2 text-lg font-semibold text-sky-700">{integrationSummary.processingCount}</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncSuccess}</p>
            <p className="mt-2 text-lg font-semibold text-emerald-700">{integrationSummary.successCount}</p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncFailed}</p>
            <p className="mt-2 text-lg font-semibold text-amber-700">{integrationSummary.failedCount}</p>
          </article>
          <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.syncDeadLetter}</p>
            <p className="mt-2 text-lg font-semibold text-rose-700">{integrationSummary.deadLetterCount}</p>
          </article>
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="text-base font-semibold text-neutral-950">{labels.syncRecentJobs}</h4>
          {integrationSummary.recentJobs.length === 0 ? (
            <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">{labels.empty}</p>
          ) : integrationSummary.recentJobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">{job.channel} • {job.entityId}</p>
                  <p className="mt-1 text-xs text-neutral-500">{formatDate(job.createdAt, locale, labels.notSpecified)}</p>
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
              {job.lastError ? (
                <p className="mt-3 text-sm text-rose-700">{labels.syncLastError}: {job.lastError}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div id="inventory-critical" className="border-b border-neutral-200 bg-white/90 p-5">
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
            <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">{labels.noAlerts}</p>
          ) : alertResult.items.map((alert) => (
            <article key={alert.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
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
              <div className="mt-4 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
                <p>{labels.availableStock}: {alert.availableStock}</p>
                <p>{labels.reorderPoint}: {alert.reorderPoint}</p>
                <p>{labels.safetyStock}: {alert.safetyStock}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">{labels.alertCreatedAt}: {formatDate(alert.createdAt, locale, labels.notSpecified)}</p>
            </article>
          ))}
        </div>
      </div>

      <div id="inventory-counts" className="border-b border-neutral-200 bg-white/90 p-5">
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
            <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">{labels.empty}</p>
          ) : stockCounts.map((count) => (
            <article key={count.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{count.countNumber}</p>
                  <h4 className="mt-1 text-base font-semibold text-neutral-950">{count.warehouseCode ?? labels.allWarehouses}</h4>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${stockCountStatusClass(count.status)}`}>
                  {stockCountStatusLabel(count.status, labels)}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-neutral-600">
                <p>{labels.stockCountLineCount}: {count.lineCount}</p>
                <p>{labels.stockCountVarianceCount}: {count.varianceLineCount}</p>
                <p>{labels.stockCountDate}: {formatDate(count.countedAt, locale, labels.notSpecified)}</p>
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

      <div id="inventory-warehouses" className="border-b border-neutral-200 bg-white/90 p-5">
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
          {warehouses.map((warehouse) => (
            <article key={warehouse.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{warehouse.code}</p>
                  <h4 className="mt-1 text-base font-semibold text-neutral-950">{warehouse.name}</h4>
                </div>
                {warehouse.isDefault ? (
                  <span className="inline-flex rounded-full bg-neutral-900 px-2 py-1 text-[10px] font-semibold text-white">{labels.defaultLabel}</span>
                ) : null}
              </div>
              <div className="mt-4 space-y-1 text-sm text-neutral-600">
                <p>{labels.warehouseStatus}: {warehouse.isActive ? labels.active : labels.passive}</p>
                <p>{labels.levelCount}: {warehouse.levelCount}</p>
              </div>
              <button
                type="button"
                onClick={() => openWarehouseDrawer("edit", warehouse)}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                {labels.editWarehouse}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div id="inventory-transactions" className="border-b border-neutral-200 bg-white/90 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-neutral-950">{labels.transactionsTitle}</h3>
          <p className="text-sm text-neutral-600">{labels.transactionsDescription}</p>
        </div>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
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
            <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">{labels.empty}</p>
          ) : transactionResult.items.map((transaction) => (
            <article key={transaction.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-neutral-950">{transaction.transactionNumber}</h4>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${movementTypeClass(transaction.type === "STOCK_IN" ? "PURCHASE_RECEIPT" : transaction.type === "STOCK_OUT" ? "DAMAGE_WRITE_OFF" : transaction.type === "TRANSFER" ? "TRANSFER_OUT" : "MANUAL_ADJUSTMENT")}`}>
                      {transaction.type === "STOCK_IN"
                        ? labels.inventoryMovementPurchaseReceipt
                        : transaction.type === "STOCK_OUT"
                          ? labels.inventoryMovementDamageWriteOff
                          : transaction.type === "TRANSFER"
                            ? labels.transferStock
                            : transaction.type === "STOCK_COUNT"
                              ? labels.stockCountTitle
                            : labels.inventoryMovementManualAdjustment}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{formatDate(transaction.createdAt, locale, labels.notSpecified)}</p>
                  <p className="mt-2 text-sm text-neutral-600">{transaction.note ?? transaction.reference ?? labels.notSpecified}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openTransactionDrawer(transaction)}
                  className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  {labels.viewDetails}
                </button>
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

      <form id="inventory-list" className="border-b border-neutral-200 bg-white/90 p-5">
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
                    onClick={(event) => openDrawer(item, "view", event.timeStamp)}
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
                  <p className="text-xs text-neutral-500">{labels.reorderPoint}</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">{drawerItem.reorderPoint}</p>
                </article>
                <article className="rounded-xl border border-neutral-200 p-3">
                  <p className="text-xs text-neutral-500">{labels.safetyStock}</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">{drawerItem.safetyStock}</p>
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
                      onChange={(event) => updateDrawerDateRange(event.target.value, event.timeStamp)}
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
                        <div className="flex flex-col gap-1 text-neutral-600">
                          <span>{movement.note ?? labels.notSpecified}</span>
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

              <section className="rounded-xl border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-neutral-900">{labels.adjustStock}</h4>
                  {drawerMode === "view" ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDrawerMode("stock_in")}
                        disabled={!drawerItem.warehouseCode}
                        className="h-9 rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {labels.stockIn}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerMode("stock_out")}
                        disabled={!drawerItem.warehouseCode}
                        className="h-9 rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {labels.stockOut}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerMode("edit")}
                        className="h-9 rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                      >
                        {labels.adjustStock}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerMode("transfer")}
                        disabled={!drawerItem.warehouseCode}
                        className="h-9 rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {labels.transferStock}
                      </button>
                    </div>
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
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-1">
                        <label className="text-xs font-medium text-neutral-600">{labels.targetReorderPoint}</label>
                        <input
                          type="number"
                          min={0}
                          value={drawerReorderPoint}
                          onChange={(event) => setDrawerReorderPoint(event.target.value)}
                          className="h-10 rounded-md border border-neutral-300 px-2 text-sm"
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
                          className="h-10 rounded-md border border-neutral-300 px-2 text-sm"
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
                ) : drawerMode === "stock_in" || drawerMode === "stock_out" ? (
                  <form
                    className="grid gap-3"
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
                        {pendingRowKey ? "..." : drawerMode === "stock_in" ? labels.stockIn : labels.stockOut}
                      </button>
                    </div>
                  </form>
                ) : drawerMode === "transfer" ? (
                  <form
                    className="grid gap-3"
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
                        className="h-10 rounded-md border border-neutral-300 px-2 text-sm"
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
                        className="h-10 rounded-md border border-neutral-300 px-2 text-sm"
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
                        className="rounded-md border border-neutral-300 px-2 py-2 text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={Boolean(pendingRowKey)}
                        className="h-10 rounded-md border border-neutral-300 bg-neutral-900 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingRowKey ? "..." : labels.applyTransfer}
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
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{transactionDrawerItem.type}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{labels.transactionCreatedAt}</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">{formatDate(transactionDrawerItem.createdAt, locale, labels.notSpecified)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs text-neutral-500">{labels.movementReference}</p>
                <p className="mt-1 text-sm text-neutral-900">{transactionDrawerItem.reference ?? labels.notSpecified}</p>
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
