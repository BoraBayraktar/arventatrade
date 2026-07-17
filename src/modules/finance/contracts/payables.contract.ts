import type { AdminBusinessDocumentDetail, AdminOperationalPayableDocument } from "@/modules/documents/contracts/document.contract";

export type AdminSupplierPayablesQuery = {
  search?: string;
};

export type AdminSupplierPayableSummary = {
  supplierId: string | null;
  supplierKey: string;
  supplierName: string;
  currency: string;
  totalAmount: number;
  documentCount: number;
  draftCount: number;
  lastIssueDate: string | null;
  topVariantSummary: string | null;
  documents: AdminOperationalPayableDocument[];
};

export type AdminSupplierPayableDetailDocument = AdminBusinessDocumentDetail;

export type AdminSupplierPayableDetail = Omit<AdminSupplierPayableSummary, "documents"> & {
  documents: AdminSupplierPayableDetailDocument[];
};
