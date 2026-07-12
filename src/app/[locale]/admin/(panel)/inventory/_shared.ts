import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { inventoryService } from "@/modules/inventory/services/inventory.service";

export type InventoryRouteSearchParams = {
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
  reportPeriodDays?: string;
  reportComparePrevious?: string;
  reportCostingMethod?: string;
  page?: string;
};

export type InventoryRoutePageVariant =
  | "overview"
  | "transactions"
  | "counts"
  | "warehouses"
  | "exports"
  | "external-events";

export async function loadInventoryRouteContext(
  localeValue: string,
  searchParams: InventoryRouteSearchParams,
  pageVariant: InventoryRoutePageVariant = "overview",
) {
  if (!isLocale(localeValue)) {
    notFound();
  }

  const locale = localeValue as Locale;
  const dictionary = getDictionary(locale);
  const user = await getCurrentUserFromContext();

  if (!user) {
    notFound();
  }

  const [result, transactionResult, warehouses] = await Promise.all([
    inventoryService.listInventoryOverview({
      search: searchParams.search,
      stockStatusFilter:
        searchParams.stockStatusFilter === "all"
        || searchParams.stockStatusFilter === "in_stock"
        || searchParams.stockStatusFilter === "low_stock"
        || searchParams.stockStatusFilter === "out_of_stock"
          ? searchParams.stockStatusFilter
          : undefined,
      reservationFilter:
        searchParams.reservationFilter === "all"
        || searchParams.reservationFilter === "with_reserved"
        || searchParams.reservationFilter === "without_reserved"
          ? searchParams.reservationFilter
          : undefined,
      warehouseFilter: searchParams.warehouseFilter?.trim() || undefined,
      movementTypeFilter:
        searchParams.movementTypeFilter === "all"
        || searchParams.movementTypeFilter === "INITIAL_LOAD"
        || searchParams.movementTypeFilter === "MANUAL_ADJUSTMENT"
        || searchParams.movementTypeFilter === "PURCHASE_RECEIPT"
        || searchParams.movementTypeFilter === "RESERVATION_HOLD"
        || searchParams.movementTypeFilter === "RESERVATION_RELEASE"
        || searchParams.movementTypeFilter === "ORDER_COMMIT"
        || searchParams.movementTypeFilter === "ORDER_CANCEL_RESTOCK"
        || searchParams.movementTypeFilter === "RETURN_RESTOCK"
        || searchParams.movementTypeFilter === "DAMAGE_WRITE_OFF"
          ? searchParams.movementTypeFilter
          : undefined,
      page: searchParams.page ? Number(searchParams.page) : 1,
      pageSize: 12,
    }),
    inventoryService.listInventoryTransactions({
      search: searchParams.transactionSearch,
      type:
        searchParams.transactionType === "all"
        || searchParams.transactionType === "MANUAL_ADJUSTMENT"
        || searchParams.transactionType === "STOCK_IN"
        || searchParams.transactionType === "STOCK_OUT"
        || searchParams.transactionType === "TRANSFER"
        || searchParams.transactionType === "STOCK_COUNT"
          ? searchParams.transactionType
          : undefined,
      warehouseCode: searchParams.transactionWarehouse?.trim() || undefined,
      sku: searchParams.transactionSku?.trim() || undefined,
      startDate: searchParams.transactionStartDate?.trim() || undefined,
      endDate: searchParams.transactionEndDate?.trim() || undefined,
      page: searchParams.transactionPage ? Number(searchParams.transactionPage) : 1,
      pageSize: 8,
    }),
    inventoryService.listWarehouses(),
  ]);

  const [alertResult, stockCounts, reports] = await Promise.all([
    inventoryService.listInventoryAlerts(),
    pageVariant === "counts" || pageVariant === "overview"
      ? inventoryService.listStockCounts()
      : Promise.resolve([]),
    pageVariant === "overview"
      ? inventoryService.getInventoryReports({
        periodDays:
          searchParams.reportPeriodDays === "7"
          || searchParams.reportPeriodDays === "30"
          || searchParams.reportPeriodDays === "90"
            ? Number(searchParams.reportPeriodDays) as 7 | 30 | 90
            : undefined,
        comparePreviousPeriod: searchParams.reportComparePrevious === "0" ? false : true,
        costingMethod:
          searchParams.reportCostingMethod === "AVERAGE_COST"
          || searchParams.reportCostingMethod === "LAST_PURCHASE_COST"
            ? searchParams.reportCostingMethod
            : undefined,
      })
      : inventoryService.getInventoryReports().then((result) => ({
        ...result,
        lowStock: [],
        movementSummary: [],
        trend: [],
        velocity: [],
        slowMoving: [],
        abcSegments: [],
        consistency: [],
      })),
  ]);

  const [integrationSummary, operationHistory, exportHistory] = await Promise.all([
    pageVariant === "overview"
      ? inventoryService.getInventoryIntegrationSummary()
      : Promise.resolve({
        pendingCount: 0,
        processingCount: 0,
        failedCount: 0,
        deadLetterCount: 0,
        successCount: 0,
        recentJobs: [],
      }),
    pageVariant === "overview" || pageVariant === "transactions"
      ? inventoryService.getOperationHistory()
      : Promise.resolve([]),
    pageVariant === "exports"
      ? inventoryService.listInventoryExportHistory()
      : Promise.resolve([]),
  ]);

  const externalEventMonitoring = pageVariant === "overview" || pageVariant === "external-events"
    ? await inventoryService.getExternalStockEventMonitoring()
    : {
      receivedCount: 0,
      appliedCount: 0,
      failedCount: 0,
      duplicateCount: 0,
      latestFailedMessage: null,
      items: [],
    };

  const inventoryPreferences = await inventoryService.getUserInventoryPreferences(user.id);

  return {
    locale,
    dictionary,
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
    query: {
      search: searchParams.search ?? "",
      stockStatusFilter: searchParams.stockStatusFilter ?? "all",
      reservationFilter: searchParams.reservationFilter ?? "all",
      warehouseFilter: searchParams.warehouseFilter ?? "all",
      movementTypeFilter: searchParams.movementTypeFilter ?? "all",
      transactionSearch: searchParams.transactionSearch ?? "",
      transactionType: searchParams.transactionType ?? "all",
      transactionWarehouse: searchParams.transactionWarehouse ?? "all",
      transactionSku: searchParams.transactionSku ?? "",
      transactionStartDate: searchParams.transactionStartDate ?? "",
      transactionEndDate: searchParams.transactionEndDate ?? "",
      transactionPage: searchParams.transactionPage ?? "1",
      reportPeriodDays: searchParams.reportPeriodDays ?? "30",
      reportComparePrevious: searchParams.reportComparePrevious ?? "1",
      reportCostingMethod: searchParams.reportCostingMethod ?? "AVERAGE_COST",
    },
    labels: {
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
      averageCoverageDays: dictionary.admin.inventoryAverageCoverageDays,
      stockTurnoverRate: dictionary.admin.inventoryStockTurnoverRate,
      legacyStockFallbackCount: dictionary.admin.inventoryLegacyStockFallbackCount,
      stockMismatchCount: dictionary.admin.inventoryStockMismatchCount,
      consistencyTitle: dictionary.admin.inventoryConsistencyTitle,
      consistencyDescription: dictionary.admin.inventoryConsistencyDescription,
      legacyStockLabel: dictionary.admin.inventoryLegacyStockLabel,
      aggregateStockLabel: dictionary.admin.inventoryAggregateStockLabel,
      differenceLabel: dictionary.admin.inventoryDifferenceLabel,
      noConsistencyIssues: dictionary.admin.inventoryNoConsistencyIssues,
      warehouseCount: dictionary.admin.inventoryWarehouseCount,
      lowStockRows: dictionary.admin.inventoryLowStockRows,
      outOfStockRows: dictionary.admin.inventoryOutOfStockRows,
      warehousePerformance: dictionary.admin.inventoryWarehousePerformance,
      lowStockReport: dictionary.admin.inventoryLowStockReport,
      movementSummaryTitle: dictionary.admin.inventoryMovementSummaryTitle,
      trendTitle: dictionary.admin.inventoryTrendTitle,
      reportPeriod: dictionary.admin.inventoryReportPeriod,
      reportComparePrevious: dictionary.admin.inventoryReportComparePrevious,
      reportCostingMethod: dictionary.admin.inventoryReportCostingMethod,
      reportPeriod7Days: dictionary.admin.inventoryReportPeriod7Days,
      reportPeriod30Days: dictionary.admin.inventoryReportPeriod30Days,
      reportPeriod90Days: dictionary.admin.inventoryReportPeriod90Days,
      reportCostAverage: dictionary.admin.inventoryReportCostAverage,
      reportCostLastPurchase: dictionary.admin.inventoryReportCostLastPurchase,
      reportCurrentPeriod: dictionary.admin.inventoryReportCurrentPeriod,
      reportPreviousPeriod: dictionary.admin.inventoryReportPreviousPeriod,
      reportDifference: dictionary.admin.inventoryReportDifference,
      reportMovementCount: dictionary.admin.inventoryReportMovementCount,
      reportRange: dictionary.admin.inventoryReportRange,
      velocityTitle: dictionary.admin.inventoryVelocityTitle,
      velocityDescription: dictionary.admin.inventoryVelocityDescription,
      slowMovingTitle: dictionary.admin.inventorySlowMovingTitle,
      slowMovingDescription: dictionary.admin.inventorySlowMovingDescription,
      abcTitle: dictionary.admin.inventoryAbcTitle,
      abcDescription: dictionary.admin.inventoryAbcDescription,
      costValue: dictionary.admin.inventoryCostValue,
      salesValue: dictionary.admin.inventorySalesValue,
      potentialProfit: dictionary.admin.inventoryPotentialProfit,
      movementCount: dictionary.admin.inventoryMovementCount,
      totalQuantityLabel: dictionary.admin.inventoryTotalQuantityLabel,
      trendStockIn: dictionary.admin.inventoryTrendStockIn,
      trendStockOut: dictionary.admin.inventoryTrendStockOut,
      trendNet: dictionary.admin.inventoryTrendNet,
      last30DayOutboundUnits: dictionary.admin.inventoryLast30DayOutboundUnits,
      coverageDays: dictionary.admin.inventoryCoverageDays,
      inactivityDays: dictionary.admin.inventoryInactivityDays,
      sharePercent: dictionary.admin.inventorySharePercent,
      segment: dictionary.admin.inventorySegment,
      viewInInventory: dictionary.admin.inventoryViewInInventory,
      openInTransactions: dictionary.admin.inventoryOpenInTransactions,
      startStockCount: dictionary.admin.inventoryStartStockCount,
      reviewLowStock: dictionary.admin.inventoryReviewLowStock,
      reviewSlowMoving: dictionary.admin.inventoryReviewSlowMoving,
      focusWarehouse: dictionary.admin.inventoryFocusWarehouse,
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
    },
  };
}
