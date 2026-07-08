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
  note?: string;
};

export type AdminInventoryMovementPreview = {
  type: string;
  quantity: number;
  note: string | null;
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
    | "RESERVATION_HOLD"
    | "RESERVATION_RELEASE"
    | "ORDER_COMMIT"
    | "ORDER_CANCEL_RESTOCK"
    | "RETURN_RESTOCK"
    | "DAMAGE_WRITE_OFF";
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
