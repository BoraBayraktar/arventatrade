import type { AdminOperationalPayableDocument } from "@/modules/documents/contracts/document.contract";

export type AdminSupplierPayablesQuery = {
  search?: string;
};

export type AdminSupplierPayableSummary = {
  supplierKey: string;
  supplierName: string;
  currency: string;
  totalAmount: number;
  documentCount: number;
  draftCount: number;
  lastIssueDate: string | null;
  documents: AdminOperationalPayableDocument[];
};
