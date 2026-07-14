export type AdminReceivableStatus = "PENDING" | "AUTHORIZED" | "FAILED";

export type AdminReceivablesQuery = {
  search?: string;
  paymentStatus?: "all" | AdminReceivableStatus;
  page?: number;
  pageSize?: number;
};

export type AdminReceivableDocumentPreview = {
  id: string;
  documentNumber: string;
  issueDate: string;
  totalAmount: number | null;
  currency: string;
};

export type AdminReceivableListItem = {
  orderId: string;
  orderNumber: string;
  counterpartyName: string;
  paymentStatus: AdminReceivableStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  latestDocument: AdminReceivableDocumentPreview | null;
};

export type AdminReceivableDetail = AdminReceivableListItem;

export type AdminReceivablesSummary = {
  totalOpenAmount: number;
  pendingCount: number;
  authorizedCount: number;
  failedCount: number;
  currency: string;
};

export type AdminReceivablesResult = {
  items: AdminReceivableListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  summary: AdminReceivablesSummary;
};
