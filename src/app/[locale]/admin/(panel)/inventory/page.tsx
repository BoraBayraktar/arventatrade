import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { inventoryService } from "@/modules/inventory/services/inventory.service";
import { InventoryManager } from "@/ui/admin/inventory-manager";

export default async function AdminInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    stockStatusFilter?: string;
    reservationFilter?: string;
    warehouseFilter?: string;
    movementTypeFilter?: string;
    transactionSearch?: string;
    transactionType?: string;
    transactionWarehouse?: string;
    transactionSku?: string;
    transactionStartDate?: string;
    transactionEndDate?: string;
    transactionPage?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const user = await getCurrentUserFromContext();

  if (!user) {
    notFound();
  }

  const query = await searchParams;
  const [result, transactionResult, warehouses, alertResult, stockCounts, reports, integrationSummary] = await Promise.all([
    inventoryService.listInventoryOverview({
      search: query.search,
      stockStatusFilter:
        query.stockStatusFilter === "all"
        || query.stockStatusFilter === "in_stock"
        || query.stockStatusFilter === "low_stock"
        || query.stockStatusFilter === "out_of_stock"
          ? query.stockStatusFilter
          : undefined,
      reservationFilter:
        query.reservationFilter === "all"
        || query.reservationFilter === "with_reserved"
        || query.reservationFilter === "without_reserved"
          ? query.reservationFilter
          : undefined,
      warehouseFilter: query.warehouseFilter?.trim() || undefined,
      movementTypeFilter:
        query.movementTypeFilter === "all"
        || query.movementTypeFilter === "INITIAL_LOAD"
        || query.movementTypeFilter === "MANUAL_ADJUSTMENT"
        || query.movementTypeFilter === "PURCHASE_RECEIPT"
        || query.movementTypeFilter === "RESERVATION_HOLD"
        || query.movementTypeFilter === "RESERVATION_RELEASE"
        || query.movementTypeFilter === "ORDER_COMMIT"
        || query.movementTypeFilter === "ORDER_CANCEL_RESTOCK"
        || query.movementTypeFilter === "RETURN_RESTOCK"
        || query.movementTypeFilter === "DAMAGE_WRITE_OFF"
          ? query.movementTypeFilter
          : undefined,
      page: query.page ? Number(query.page) : 1,
      pageSize: 12,
    }),
    inventoryService.listInventoryTransactions({
      search: query.transactionSearch,
      type:
        query.transactionType === "all"
        || query.transactionType === "MANUAL_ADJUSTMENT"
        || query.transactionType === "STOCK_IN"
        || query.transactionType === "STOCK_OUT"
        || query.transactionType === "TRANSFER"
        || query.transactionType === "STOCK_COUNT"
          ? query.transactionType
          : undefined,
      warehouseCode: query.transactionWarehouse?.trim() || undefined,
      sku: query.transactionSku?.trim() || undefined,
      startDate: query.transactionStartDate?.trim() || undefined,
      endDate: query.transactionEndDate?.trim() || undefined,
      page: query.transactionPage ? Number(query.transactionPage) : 1,
      pageSize: 8,
    }),
    inventoryService.listWarehouses(),
    inventoryService.listInventoryAlerts(),
    inventoryService.listStockCounts(),
    inventoryService.getInventoryReports(),
    inventoryService.getInventoryIntegrationSummary(),
  ]);

  return (
    <InventoryManager
      locale={locale as Locale}
      result={result}
      transactionResult={transactionResult}
      warehouses={warehouses}
      alertResult={alertResult}
      stockCounts={stockCounts}
      reports={reports}
      integrationSummary={integrationSummary}
      query={{
        search: query.search ?? "",
        stockStatusFilter: query.stockStatusFilter ?? "all",
        reservationFilter: query.reservationFilter ?? "all",
        warehouseFilter: query.warehouseFilter ?? "all",
        movementTypeFilter: query.movementTypeFilter ?? "all",
        transactionSearch: query.transactionSearch ?? "",
        transactionType: query.transactionType ?? "all",
        transactionWarehouse: query.transactionWarehouse ?? "all",
        transactionSku: query.transactionSku ?? "",
        transactionStartDate: query.transactionStartDate ?? "",
        transactionEndDate: query.transactionEndDate ?? "",
        transactionPage: query.transactionPage ?? "1",
      }}
      labels={{
        title: dictionary.admin.inventoryManager,
        inventoryList: dictionary.admin.inventoryList,
        inventorySummary: dictionary.admin.inventorySummaryDescription,
        totalProducts: dictionary.admin.inventoryTotalProducts,
        lowStockCount: dictionary.admin.inventoryLowStockCount,
        outOfStockCount: dictionary.admin.inventoryOutOfStockCount,
        totalAvailableStock: dictionary.admin.inventoryTotalAvailableStock,
        totalReservedStock: dictionary.admin.inventoryTotalReservedStock,
        rowsWithReservations: dictionary.admin.inventoryRowsWithReservations,
        search: dictionary.admin.searchInventory,
        product: dictionary.catalog.title,
        sku: dictionary.admin.sku,
        warehouse: dictionary.admin.inventoryMovementWarehouse,
        onHandStock: dictionary.admin.inventoryOnHandStock,
        reservedStock: dictionary.admin.inventoryReservedStock,
        availableStock: dictionary.admin.inventoryAvailableStock,
        reorderPoint: dictionary.admin.inventoryReorderPoint,
        safetyStock: dictionary.admin.inventorySafetyStock,
        stockStatus: dictionary.admin.stockStatus,
        movementType: dictionary.admin.inventoryMovementType,
        movementReference: dictionary.admin.inventoryMovementReference,
        movementCounterpartyWarehouse: dictionary.admin.inventoryMovementCounterpartyWarehouse,
        lastMovementAt: dictionary.admin.inventoryLastMovementAt,
        inStock: dictionary.admin.inStock,
        lowStock: dictionary.admin.lowStockOnly,
        outOfStock: dictionary.admin.outOfStock,
        page: dictionary.admin.page,
        prev: dictionary.admin.prev,
        next: dictionary.admin.next,
        empty: dictionary.admin.emptyInventory,
        stockFilter: dictionary.admin.inventoryStockFilter,
        reservationFilter: dictionary.admin.inventoryReservationFilter,
        warehouseFilter: dictionary.admin.inventoryWarehouseFilter,
        movementTypeFilter: dictionary.admin.inventoryMovementFilter,
        all: dictionary.admin.statusAll,
        allWarehouses: dictionary.admin.inventoryAllWarehouses,
        defaultWarehouse: dictionary.admin.inventoryDefaultWarehouse,
        withReservations: dictionary.admin.inventoryWithReservations,
        withoutReservations: dictionary.admin.inventoryWithoutReservations,
        recentMovements: dictionary.admin.inventoryRecentMovements,
        noRecentMovements: dictionary.admin.inventoryNoRecentMovements,
        viewAllHistory: dictionary.admin.inventoryViewAllHistory,
        movementDateRange: dictionary.admin.inventoryMovementDateRange,
        movementAllTime: dictionary.admin.inventoryMovementAllTime,
        movementLast24Hours: dictionary.admin.inventoryMovementLast24Hours,
        movementLast7Days: dictionary.admin.inventoryMovementLast7Days,
        movementLast30Days: dictionary.admin.inventoryMovementLast30Days,
        detail: dictionary.admin.inventoryDetail,
        viewDetails: dictionary.admin.inventoryViewDetails,
        drawerInfo: dictionary.admin.inventoryDrawerInfo,
        exportCsv: dictionary.admin.inventoryExportCsv,
        movementHistoryFilter: dictionary.admin.inventoryMovementHistoryFilter,
        adjustStock: dictionary.admin.inventoryAdjustStock,
        stockIn: dictionary.admin.inventoryStockIn,
        stockOut: dictionary.admin.inventoryStockOut,
        targetOnHandStock: dictionary.admin.inventoryTargetOnHandStock,
        targetReorderPoint: dictionary.admin.inventoryTargetReorderPoint,
        targetSafetyStock: dictionary.admin.inventoryTargetSafetyStock,
        adjustmentNote: dictionary.admin.inventoryAdjustmentNote,
        applyAdjustment: dictionary.admin.inventoryApplyAdjustment,
        adjustmentSaved: dictionary.admin.inventoryAdjustmentSaved,
        adjustmentFailed: dictionary.admin.inventoryAdjustmentFailed,
        movementQuantity: dictionary.admin.inventoryMovementQuantityLabel,
        stockInSaved: dictionary.admin.inventoryStockInSaved,
        stockInFailed: dictionary.admin.inventoryStockInFailed,
        stockOutSaved: dictionary.admin.inventoryStockOutSaved,
        stockOutFailed: dictionary.admin.inventoryStockOutFailed,
        transferStock: dictionary.admin.inventoryTransferStock,
        transferQuantity: dictionary.admin.inventoryTransferQuantity,
        transferTargetWarehouse: dictionary.admin.inventoryTransferTargetWarehouse,
        transferNote: dictionary.admin.inventoryTransferNote,
        applyTransfer: dictionary.admin.inventoryApplyTransfer,
        transferSaved: dictionary.admin.inventoryTransferSaved,
        transferFailed: dictionary.admin.inventoryTransferFailed,
        warehousesTitle: dictionary.admin.inventoryWarehousesTitle,
        warehousesDescription: dictionary.admin.inventoryWarehousesDescription,
        createWarehouse: dictionary.admin.inventoryCreateWarehouse,
        editWarehouse: dictionary.admin.inventoryEditWarehouse,
        warehouseCode: dictionary.admin.inventoryWarehouseCode,
        warehouseName: dictionary.admin.inventoryWarehouseName,
        warehouseDescription: dictionary.admin.inventoryWarehouseDescription,
        warehouseAddress: dictionary.admin.inventoryWarehouseAddress,
        warehouseContactName: dictionary.admin.inventoryWarehouseContactName,
        warehouseContactPhone: dictionary.admin.inventoryWarehouseContactPhone,
        warehousePriority: dictionary.admin.inventoryWarehousePriority,
        warehouseStatus: dictionary.admin.inventoryWarehouseStatus,
        active: dictionary.admin.active,
        passive: dictionary.admin.passive,
        defaultLabel: dictionary.admin.inventoryDefaultWarehouse,
        levelCount: dictionary.admin.inventoryWarehouseLevelCount,
        saveWarehouse: dictionary.admin.inventorySaveWarehouse,
        warehouseSaved: dictionary.admin.inventoryWarehouseSaved,
        warehouseSaveFailed: dictionary.admin.inventoryWarehouseSaveFailed,
        inventoryMovementInitialLoad: dictionary.admin.inventoryMovementInitialLoad,
        inventoryMovementManualAdjustment: dictionary.admin.inventoryMovementManualAdjustment,
        inventoryMovementPurchaseReceipt: dictionary.admin.inventoryMovementPurchaseReceipt,
        inventoryMovementTransferOut: dictionary.admin.inventoryMovementTransferOut,
        inventoryMovementTransferIn: dictionary.admin.inventoryMovementTransferIn,
        inventoryMovementReservationHold: dictionary.admin.inventoryMovementReservationHold,
        inventoryMovementReservationRelease: dictionary.admin.inventoryMovementReservationRelease,
        inventoryMovementOrderCommit: dictionary.admin.inventoryMovementOrderCommit,
        inventoryMovementOrderCancelRestock: dictionary.admin.inventoryMovementOrderCancelRestock,
        inventoryMovementReturnRestock: dictionary.admin.inventoryMovementReturnRestock,
        inventoryMovementDamageWriteOff: dictionary.admin.inventoryMovementDamageWriteOff,
        transactionsTitle: dictionary.admin.inventoryTransactionsTitle,
        transactionsDescription: dictionary.admin.inventoryTransactionsDescription,
        criticalStockTitle: dictionary.admin.inventoryCriticalStockTitle,
        criticalStockDescription: dictionary.admin.inventoryCriticalStockDescription,
        activeAlerts: dictionary.admin.inventoryActiveAlerts,
        reportsTitle: dictionary.admin.inventoryReportsTitle,
        reportsDescription: dictionary.admin.inventoryReportsDescription,
        sectionsTitle: dictionary.admin.inventorySectionsTitle,
        sectionReports: dictionary.admin.inventorySectionReports,
        sectionSync: dictionary.admin.inventorySectionSync,
        sectionCritical: dictionary.admin.inventorySectionCritical,
        sectionCounts: dictionary.admin.inventorySectionCounts,
        sectionWarehouses: dictionary.admin.inventorySectionWarehouses,
        sectionTransactions: dictionary.admin.inventorySectionTransactions,
        sectionInventoryList: dictionary.admin.inventorySectionInventoryList,
        integrationTitle: dictionary.admin.inventoryIntegrationTitle,
        integrationDescription: dictionary.admin.inventoryIntegrationDescription,
        syncPending: dictionary.admin.inventorySyncPending,
        syncProcessing: dictionary.admin.inventorySyncProcessing,
        syncFailed: dictionary.admin.inventorySyncFailed,
        syncDeadLetter: dictionary.admin.inventorySyncDeadLetter,
        syncSuccess: dictionary.admin.inventorySyncSuccess,
        syncRecentJobs: dictionary.admin.inventorySyncRecentJobs,
        syncLastError: dictionary.admin.inventorySyncLastError,
        totalOnHandUnits: dictionary.admin.inventoryTotalOnHandUnits,
        totalCostValue: dictionary.admin.inventoryTotalCostValue,
        totalSalesValue: dictionary.admin.inventoryTotalSalesValue,
        totalPotentialProfit: dictionary.admin.inventoryTotalPotentialProfit,
        warehouseCount: dictionary.admin.inventoryWarehouseCount,
        lowStockRows: dictionary.admin.inventoryLowStockRows,
        outOfStockRows: dictionary.admin.inventoryOutOfStockRows,
        warehousePerformance: dictionary.admin.inventoryWarehousePerformance,
        lowStockReport: dictionary.admin.inventoryLowStockReport,
        movementSummaryTitle: dictionary.admin.inventoryMovementSummaryTitle,
        trendTitle: dictionary.admin.inventoryTrendTitle,
        costValue: dictionary.admin.inventoryCostValue,
        salesValue: dictionary.admin.inventorySalesValue,
        potentialProfit: dictionary.admin.inventoryPotentialProfit,
        movementCount: dictionary.admin.inventoryMovementCount,
        totalQuantityLabel: dictionary.admin.inventoryTotalQuantityLabel,
        trendStockIn: dictionary.admin.inventoryTrendStockIn,
        trendStockOut: dictionary.admin.inventoryTrendStockOut,
        trendNet: dictionary.admin.inventoryTrendNet,
        stockCountTitle: dictionary.admin.inventoryStockCountTitle,
        stockCountDescription: dictionary.admin.inventoryStockCountDescription,
        createStockCount: dictionary.admin.inventoryCreateStockCount,
        stockCountWarehouseScope: dictionary.admin.inventoryStockCountWarehouseScope,
        stockCountDate: dictionary.admin.inventoryStockCountDate,
        stockCountNote: dictionary.admin.inventoryStockCountNote,
        stockCountSearch: dictionary.admin.inventoryStockCountSearch,
        stockCountCreateAction: dictionary.admin.inventoryStockCountCreateAction,
        stockCountSaved: dictionary.admin.inventoryStockCountSaved,
        stockCountSaveFailed: dictionary.admin.inventoryStockCountSaveFailed,
        stockCountApply: dictionary.admin.inventoryStockCountApply,
        stockCountApplied: dictionary.admin.inventoryStockCountApplied,
        stockCountApplyFailed: dictionary.admin.inventoryStockCountApplyFailed,
        stockCountLineCount: dictionary.admin.inventoryStockCountLineCount,
        stockCountVarianceCount: dictionary.admin.inventoryStockCountVarianceCount,
        stockCountCountedOnHand: dictionary.admin.inventoryStockCountCountedOnHand,
        stockCountDifference: dictionary.admin.inventoryStockCountDifference,
        stockCountEditLine: dictionary.admin.inventoryStockCountEditLine,
        stockCountLineSaved: dictionary.admin.inventoryStockCountLineSaved,
        stockCountLineSaveFailed: dictionary.admin.inventoryStockCountLineSaveFailed,
        stockCountStatusDraft: dictionary.admin.inventoryStockCountStatusDraft,
        stockCountStatusCounted: dictionary.admin.inventoryStockCountStatusCounted,
        stockCountStatusApplied: dictionary.admin.inventoryStockCountStatusApplied,
        alertTypeLowStock: dictionary.admin.inventoryAlertTypeLowStock,
        alertTypeOutOfStock: dictionary.admin.inventoryAlertTypeOutOfStock,
        alertMessage: dictionary.admin.inventoryAlertMessage,
        alertCreatedAt: dictionary.admin.inventoryAlertCreatedAt,
        noAlerts: dictionary.admin.inventoryNoAlerts,
        transactionNumber: dictionary.admin.inventoryTransactionNumber,
        transactionType: dictionary.admin.inventoryTransactionType,
        transactionCreatedAt: dictionary.admin.inventoryTransactionCreatedAt,
        transactionLines: dictionary.admin.inventoryTransactionLines,
        transactionSearch: dictionary.admin.search,
        transactionFilterType: dictionary.admin.inventoryTransactionType,
        transactionFilterWarehouse: dictionary.admin.inventoryWarehouseFilter,
        transactionFilterSku: dictionary.admin.sku,
        transactionFilterStartDate: dictionary.admin.inventoryTransactionStartDate,
        transactionFilterEndDate: dictionary.admin.inventoryTransactionEndDate,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}
