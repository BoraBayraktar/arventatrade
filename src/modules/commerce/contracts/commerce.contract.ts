export type CartLineInput = {
  productId: string;
  quantity: number;
};

export type CommerceQuoteInput = {
  lines: CartLineInput[];
  promotionCode?: string;
};

export type CommerceLineQuote = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  imageUrl: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  lineTotal: number;
  inStock: boolean;
  availableStock: number;
};

export type CommerceQuoteResult = {
  lines: CommerceLineQuote[];
  subtotal: number;
  discountTotal: number;
  total: number;
  promotionCode: string | null;
  currency: string;
  allInStock: boolean;
};

export type CommerceCheckoutInput = CommerceQuoteInput;

export type CommerceCheckoutResult = {
  orderNumber: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  promotionCode: string | null;
  currency: string;
  lines: CommerceLineQuote[];
};

export type AdminOrderStatus = "CONFIRMED" | "CANCELLED";
export type AdminOrderStatusChangeSource = "SYSTEM" | "ADMIN";
export type AdminPaymentStatus = "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
export type AdminPaymentStatusChangeSource = "SYSTEM" | "ADMIN";

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  status: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  restockStatus: "NOT_RESTOCKED" | "RESTOCKED" | "PARTIALLY_RESTOCKED";
  lastRestockedAt: string | null;
  subtotal: number;
  discountTotal: number;
  total: number;
  promotionCode: string | null;
  currency: string;
  itemCount: number;
  createdAt: string;
};

export type AdminOrderListQuery = {
  search?: string;
  status?: AdminOrderStatus;
  paymentStatus?: AdminPaymentStatus;
  page?: number;
  pageSize?: number;
};

export type AdminOrderListResult = {
  items: AdminOrderListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminOrderSummary = {
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  paidOrders: number;
  pendingPayments: number;
  currency: string;
};

export type AdminOrderDetailItem = {
  id: string;
  productId: string | null;
  productSlug: string;
  productSku: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  lineTotal: number;
  currency: string;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  status: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  subtotal: number;
  discountTotal: number;
  total: number;
  promotionCode: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderDetailItem[];
  inventorySummary: AdminOrderInventorySummary;
  inventoryMovements: AdminOrderInventoryMovementEntry[];
  statusHistory: AdminOrderStatusHistoryEntry[];
  paymentStatusHistory: AdminPaymentStatusHistoryEntry[];
};

export type AdminOrderInventorySummary = {
  reservationCount: number;
  committedReservationCount: number;
  releasedReservationCount: number;
  cancelledReservationCount: number;
  activeReservationCount: number;
  totalReservedQuantity: number;
  restockStatus: "NOT_RESTOCKED" | "RESTOCKED" | "PARTIALLY_RESTOCKED";
  lastRestockedAt: string | null;
};

export type AdminOrderInventoryMovementEntry = {
  id: string;
  type: string;
  quantity: number;
  warehouseCode: string | null;
  reservationId: string | null;
  note: string | null;
  createdAt: string;
};

export type AdminOrderStatusHistoryEntry = {
  id: string;
  fromStatus: AdminOrderStatus | null;
  toStatus: AdminOrderStatus;
  source: AdminOrderStatusChangeSource;
  changedByUserId: string | null;
  note: string | null;
  createdAt: string;
};

export type AdminPaymentStatusHistoryEntry = {
  id: string;
  fromStatus: AdminPaymentStatus | null;
  toStatus: AdminPaymentStatus;
  source: AdminPaymentStatusChangeSource;
  changedByUserId: string | null;
  note: string | null;
  createdAt: string;
};

export type AdminUpdateOrderStatusInput = {
  id: string;
  status?: AdminOrderStatus;
  paymentStatus?: AdminPaymentStatus;
  changedByUserId: string;
  note?: string;
};
