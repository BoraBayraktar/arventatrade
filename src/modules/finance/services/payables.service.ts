import { documentService } from "@/modules/documents/services/document.service";
import type {
  AdminSupplierPayableDetail,
  AdminSupplierPayableSummary,
  AdminSupplierPayablesQuery,
} from "@/modules/finance/contracts/payables.contract";

function normalizeSupplierKey(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export class PayablesService {
  async listSupplierPayables(query: AdminSupplierPayablesQuery = {}): Promise<AdminSupplierPayableSummary[]> {
    const documents = await documentService.listOperationalPayableDocuments(query.search);
    const grouped = new Map<string, AdminSupplierPayableSummary>();

    for (const document of documents) {
      const supplierName = document.counterpartyName.trim() || "Belirtilmedi";
      const currency = document.currency || "TRY";
      const supplierKey = `${normalizeSupplierKey(supplierName)}:${currency}`;
      const current = grouped.get(supplierKey);

      if (!current) {
        grouped.set(supplierKey, {
          supplierKey,
          supplierName,
          currency,
          totalAmount: document.totalAmount ?? 0,
          documentCount: 1,
          draftCount: document.status === "DRAFT" ? 1 : 0,
          lastIssueDate: document.issueDate,
          documents: [document],
        });
        continue;
      }

      current.totalAmount += document.totalAmount ?? 0;
      current.documentCount += 1;
      current.draftCount += document.status === "DRAFT" ? 1 : 0;
      current.lastIssueDate = !current.lastIssueDate || new Date(document.issueDate) > new Date(current.lastIssueDate)
        ? document.issueDate
        : current.lastIssueDate;
      current.documents.push(document);
    }

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        totalAmount: Number(item.totalAmount.toFixed(2)),
        documents: item.documents.sort((left, right) => right.issueDate.localeCompare(left.issueDate)),
      }))
      .sort((left, right) => right.totalAmount - left.totalAmount);
  }

  async getSupplierPayableByKey(supplierKey: string): Promise<AdminSupplierPayableDetail | null> {
    const items = await this.listSupplierPayables();
    return items.find((item) => item.supplierKey === supplierKey) ?? null;
  }
}

export const payablesService = new PayablesService();
