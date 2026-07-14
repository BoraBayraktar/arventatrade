export type AdminPaymentReadinessItem = {
  supplierId: string;
  supplierKey: string;
  supplierName: string;
  totalAmount: number;
  currency: string;
  documentCount: number;
  draftCount: number;
  lastIssueDate: string | null;
  recordedPaymentCount: number;
  remainingAmount: number;
  detailHref: string;
  sourceHref: string;
};

export type AdminPaymentsSummary = {
  totalPendingAmount: number;
  totalRecordedAmount: number;
  supplierCount: number;
  draftDocumentCount: number;
  recordedCount: number;
  currency: string;
};

export type AdminPaymentsResult = {
  items: AdminPaymentReadinessItem[];
  summary: AdminPaymentsSummary;
};

export type AdminPaymentRecordItem = {
  id: string;
  supplierId: string;
  amount: number;
  currency: string;
  status: "RECORDED" | "CANCELLED";
  paidAt: string;
  note: string | null;
  recordedByUserId: string | null;
  createdAt: string;
};

export type AdminCreatePaymentRecordInput = {
  supplierId: string;
  amount: number;
  paidAt: string;
  note?: string | null;
  recordedByUserId: string;
};
