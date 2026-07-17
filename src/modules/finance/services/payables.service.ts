import { documentService } from "@/modules/documents/services/document.service";
import { financeRepository } from "@/modules/finance/repositories/finance.repository";
import type {
  AdminSupplierPayableDetail,
  AdminSupplierPayableSummary,
  AdminSupplierPayablesQuery,
} from "@/modules/finance/contracts/payables.contract";

function normalizeSupplierKey(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function buildTopVariantSummary(documents: Array<{
  lines?: Array<{
    productName: string;
    productVariantTitle?: string | null;
    lineTotal?: number | null;
  }>;
}>) {
  const totals = new Map<string, number>();

  for (const document of documents) {
    for (const line of document.lines ?? []) {
      const label = line.productVariantTitle
        ? `${line.productName} / ${line.productVariantTitle}`
        : line.productName;
      const current = totals.get(label) ?? 0;
      totals.set(label, current + (line.lineTotal ?? 0));
    }
  }

  const topEntries = Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([label]) => label);

  return topEntries.length > 0 ? topEntries.join(" + ") : null;
}

export class PayablesService {
  async listSupplierPayables(query: AdminSupplierPayablesQuery = {}): Promise<AdminSupplierPayableSummary[]> {
    const documents = await documentService.listOperationalPayableDocuments(query.search);
    const grouped = new Map<string, AdminSupplierPayableSummary>();

    for (const document of documents) {
      const supplierName = document.counterpartyName.trim() || "Belirtilmedi";
      const supplierId = document.supplierId ?? null;
      const currency = document.currency || "TRY";
      const supplierKey = `${normalizeSupplierKey(supplierName)}:${currency}`;
      const current = grouped.get(supplierKey);

      if (!current) {
        grouped.set(supplierKey, {
          supplierId,
          supplierKey,
          supplierName,
          currency,
          totalAmount: document.totalAmount ?? 0,
          documentCount: 1,
          draftCount: document.status === "DRAFT" ? 1 : 0,
          lastIssueDate: document.issueDate,
          topVariantSummary: null,
          documents: [document],
        });
        continue;
      }

      current.supplierId = current.supplierId ?? supplierId;
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
        topVariantSummary: null,
        documents: item.documents.sort((left, right) => right.issueDate.localeCompare(left.issueDate)),
      }))
      .sort((left, right) => right.totalAmount - left.totalAmount);
  }

  async getSupplierPayableByKey(supplierKey: string): Promise<AdminSupplierPayableDetail | null> {
    const items = await this.listSupplierPayables();
    const summary = items.find((item) => item.supplierKey === supplierKey) ?? null;
    if (!summary) {
      return null;
    }

    const documents = await Promise.all(
      summary.documents.map((document) => documentService.getBusinessDocumentById(document.id)),
    );

    return {
      ...summary,
      topVariantSummary: buildTopVariantSummary(documents),
      documents,
    };
  }
}

export const payablesService = new PayablesService();
