export type ProductInventoryAvailability = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  imageUrl: string;
  currency: string;
  unitPrice: number;
  compareAtPrice: number | null;
  onHandStock: number;
  reservedStock: number;
  availableStock: number;
  inStock: boolean;
  warehouseCode: string | null;
};

export type SyncProductInventoryInput = {
  productId: string;
  sku: string;
  warehouseCode?: string;
  targetOnHandStock?: number;
  reorderPoint?: number;
  safetyStock?: number;
  note?: string;
};

export type TransferProductInventoryInput = {
  productId: string;
  sku: string;
  fromWarehouseCode: string;
  toWarehouseCode: string;
  quantity: number;
  note?: string;
};

export type RecordProductInventoryMovementInput = {
  productId: string;
  sku: string;
  warehouseCode: string;
  quantity: number;
  type: "PURCHASE_RECEIPT" | "DAMAGE_WRITE_OFF";
  note?: string;
};

export type AdminInventoryMovementPreview = {
  type: string;
  quantity: number;
  note: string | null;
  reference: string | null;
  counterpartyWarehouseCode: string | null;
  createdAt: string;
};

export type AdminInventoryItem = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  imageUrl: string;
  currency: string;
  onHandStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  safetyStock: number;
  warehouseCode: string | null;
  warehouseName: string | null;
  isDefaultWarehouse: boolean;
  hasReservations: boolean;
  lastMovementType: string | null;
  recentMovements: AdminInventoryMovementPreview[];
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  lastMovementAt: string | null;
};

export type AdminInventoryListQuery = {
  search?: string;
  stockStatusFilter?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  reservationFilter?: "all" | "with_reserved" | "without_reserved";
  warehouseFilter?: string;
  movementTypeFilter?:
    | "all"
    | "INITIAL_LOAD"
    | "MANUAL_ADJUSTMENT"
    | "PURCHASE_RECEIPT"
    | "DAMAGE_WRITE_OFF"
    | "TRANSFER_OUT"
    | "TRANSFER_IN"
    | "RESERVATION_HOLD"
    | "RESERVATION_RELEASE"
    | "ORDER_COMMIT"
    | "ORDER_CANCEL_RESTOCK"
    | "RETURN_RESTOCK";
  page?: number;
  pageSize?: number;
};

export type AdminInventorySummary = {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalAvailableStock: number;
  totalReservedStock: number;
  rowsWithReservations: number;
};

export type AdminInventoryListResult = {
  items: AdminInventoryItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  summary: AdminInventorySummary;
};

export type AdminInventoryTransactionLineItem = {
  id: string;
  quantity: number;
  note: string | null;
  fromWarehouseCode: string | null;
  toWarehouseCode: string | null;
  inventoryItemSku: string;
  inventoryItemName: string;
};

export type AdminInventoryTransactionItem = {
  id: string;
  transactionNumber: string;
  type: "MANUAL_ADJUSTMENT" | "STOCK_IN" | "STOCK_OUT" | "TRANSFER" | "STOCK_COUNT";
  reference: string | null;
  note: string | null;
  createdAt: string;
  lines: AdminInventoryTransactionLineItem[];
};

export type AdminInventoryTransactionListQuery = {
  search?: string;
  type?: "all" | "MANUAL_ADJUSTMENT" | "STOCK_IN" | "STOCK_OUT" | "TRANSFER" | "STOCK_COUNT";
  warehouseCode?: string;
  sku?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type AdminInventoryTransactionListResult = {
  items: AdminInventoryTransactionItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminWarehouseItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
  levelCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCreateWarehouseInput = {
  code: string;
  name: string;
  description?: string | null;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  priority?: number;
  isActive?: boolean;
  isDefault?: boolean;
};

export type AdminUpdateWarehouseInput = {
  id: string;
  code?: string;
  name?: string;
  description?: string | null;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  priority?: number;
  isActive?: boolean;
  isDefault?: boolean;
};

export type AdminInventoryAlertItem = {
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
};

export type AdminInventoryAlertSummary = {
  activeCount: number;
  outOfStockCount: number;
  lowStockCount: number;
};

export type AdminStockCountLineItem = {
  id: string;
  inventoryItemId: string;
  productId: string;
  sku: string;
  productName: string;
  warehouseCode: string;
  warehouseName: string;
  systemOnHand: number;
  countedOnHand: number | null;
  difference: number | null;
  note: string | null;
};

export type AdminStockCountItem = {
  id: string;
  countNumber: string;
  status: "DRAFT" | "COUNTED" | "APPLIED";
  countedAt: string;
  note: string | null;
  warehouseCode: string | null;
  warehouseName: string | null;
  lineCount: number;
  varianceLineCount: number;
  createdAt: string;
  updatedAt: string;
  lines: AdminStockCountLineItem[];
};

export type AdminCreateStockCountInput = {
  warehouseCode?: string | null;
  countedAt: string;
  note?: string | null;
  search?: string | null;
};

export type AdminUpdateStockCountLineInput = {
  stockCountId: string;
  lineId: string;
  countedOnHand: number;
  note?: string | null;
};

export type AdminInventoryReportOverview = {
  totalOnHandUnits: number;
  totalAvailableUnits: number;
  totalCostValue: number;
  totalSalesValue: number;
  totalPotentialProfit: number;
  warehouseCount: number;
  lowStockRowCount: number;
  outOfStockRowCount: number;
};

export type AdminInventoryWarehouseReportItem = {
  warehouseCode: string;
  warehouseName: string;
  skuCount: number;
  onHandUnits: number;
  availableUnits: number;
  costValue: number;
  salesValue: number;
};

export type AdminInventoryLowStockReportItem = {
  productId: string;
  productName: string;
  sku: string;
  warehouseCode: string;
  warehouseName: string;
  availableUnits: number;
  reorderPoint: number;
  safetyStock: number;
  unitCost: number;
  unitPrice: number;
};

export type AdminInventoryMovementSummaryItem = {
  movementType: string;
  movementCount: number;
  totalQuantity: number;
  lastMovementAt: string | null;
};

export type AdminInventoryTrendPoint = {
  date: string;
  stockInQuantity: number;
  stockOutQuantity: number;
  netQuantity: number;
};

export type AdminInventoryReportsResult = {
  overview: AdminInventoryReportOverview;
  warehouses: AdminInventoryWarehouseReportItem[];
  lowStock: AdminInventoryLowStockReportItem[];
  movementSummary: AdminInventoryMovementSummaryItem[];
  trend: AdminInventoryTrendPoint[];
};

export type AdminInventoryIntegrationJobItem = {
  id: string;
  channel: "TRENDYOL" | "N11";
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "DEAD_LETTER";
  entityId: string;
  createdAt: string;
  lastError: string | null;
};

export type AdminInventoryIntegrationSummary = {
  pendingCount: number;
  processingCount: number;
  failedCount: number;
  deadLetterCount: number;
  successCount: number;
  recentJobs: AdminInventoryIntegrationJobItem[];
};
