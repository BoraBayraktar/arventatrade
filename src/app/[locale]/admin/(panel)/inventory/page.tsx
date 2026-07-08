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
  const result = await inventoryService.listInventoryOverview({
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
  });

  return (
    <InventoryManager
      locale={locale as Locale}
      result={result}
      query={{
        search: query.search ?? "",
        stockStatusFilter: query.stockStatusFilter ?? "all",
        reservationFilter: query.reservationFilter ?? "all",
        warehouseFilter: query.warehouseFilter ?? "all",
        movementTypeFilter: query.movementTypeFilter ?? "all",
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
        stockStatus: dictionary.admin.stockStatus,
        movementType: dictionary.admin.inventoryMovementType,
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
        exportCsv: dictionary.admin.inventoryExportCsv,
        movementHistoryFilter: dictionary.admin.inventoryMovementHistoryFilter,
        adjustStock: dictionary.admin.inventoryAdjustStock,
        targetOnHandStock: dictionary.admin.inventoryTargetOnHandStock,
        adjustmentNote: dictionary.admin.inventoryAdjustmentNote,
        applyAdjustment: dictionary.admin.inventoryApplyAdjustment,
        adjustmentSaved: dictionary.admin.inventoryAdjustmentSaved,
        adjustmentFailed: dictionary.admin.inventoryAdjustmentFailed,
        inventoryMovementInitialLoad: dictionary.admin.inventoryMovementInitialLoad,
        inventoryMovementManualAdjustment: dictionary.admin.inventoryMovementManualAdjustment,
        inventoryMovementPurchaseReceipt: dictionary.admin.inventoryMovementPurchaseReceipt,
        inventoryMovementReservationHold: dictionary.admin.inventoryMovementReservationHold,
        inventoryMovementReservationRelease: dictionary.admin.inventoryMovementReservationRelease,
        inventoryMovementOrderCommit: dictionary.admin.inventoryMovementOrderCommit,
        inventoryMovementOrderCancelRestock: dictionary.admin.inventoryMovementOrderCancelRestock,
        inventoryMovementReturnRestock: dictionary.admin.inventoryMovementReturnRestock,
        inventoryMovementDamageWriteOff: dictionary.admin.inventoryMovementDamageWriteOff,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}