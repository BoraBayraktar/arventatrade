import { z } from "zod";

import type {
  AdminBusinessDocumentDetail,
  AdminQueueBusinessDocumentDispatchInput,
  AdminQueueBusinessDocumentStatusSyncInput,
} from "@/modules/documents/contracts/document.contract";
import { DocumentRepository } from "@/modules/documents/repositories/document.repository";
import { documentDispatchLifecycleService } from "@/modules/documents/services/document-dispatch-lifecycle.service";
import { DocumentAdminError } from "@/modules/documents/services/document.service";
import { integrationService } from "@/modules/integration/services/integration.service";

const queueDispatchSchema = z.object({
  id: z.string().trim().min(1),
  channel: z.enum(["EDOCS_MOCK"]).default("EDOCS_MOCK"),
  providerConfigId: z.string().trim().min(1).optional(),
  forceFail: z.boolean().optional(),
});

const queueStatusSyncSchema = z.object({
  id: z.string().trim().min(1),
  providerConfigId: z.string().trim().min(1).optional(),
  forceFail: z.boolean().optional(),
});

function toNumber(value: { toNumber: () => number } | null | undefined) {
  return value ? value.toNumber() : null;
}

function mapDetail(item: Awaited<ReturnType<DocumentRepository["findBusinessDocumentById"]>> extends infer T ? NonNullable<T> : never): AdminBusinessDocumentDetail {
  return {
    id: item.id,
    documentNumber: item.documentNumber,
    documentType: item.documentType,
    status: item.status,
    issueDate: item.issueDate.toISOString(),
    currency: item.currency,
    totalAmount: toNumber(item.totalAmount),
    externalReference: item.externalReference,
    externalSystemStatus: item.externalSystemStatus,
    providerConfigId: item.providerConfig?.id ?? null,
    providerDisplayName: item.providerConfig?.displayName ?? null,
    supplierId: item.supplier?.id ?? null,
    customerAccountId: item.customerAccount?.id ?? null,
    counterpartyName: item.counterpartyName,
    orderId: item.order?.id ?? null,
    orderNumber: item.order?.orderNumber ?? null,
    inventoryTransactionId: item.inventoryTransaction?.id ?? null,
    inventoryTransactionNumber: item.inventoryTransaction?.transactionNumber ?? null,
    lineCount: item.lines.length,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    counterpartyTaxNumber: item.counterpartyTaxNumber,
    counterpartyTaxOffice: item.counterpartyTaxOffice,
    counterpartyEmail: item.counterpartyEmail,
    counterpartyAddress: item.counterpartyAddress,
    note: item.note,
    lines: item.lines.map((line: {
      id: string;
      productId: string | null;
      productSku: string;
      productName: string;
      quantity: number;
      unitPrice: { toNumber: () => number } | null;
      lineTotal: { toNumber: () => number } | null;
      currency: string;
      note: string | null;
    }) => ({
      id: line.id,
      productId: line.productId,
      productSku: line.productSku,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: toNumber(line.unitPrice),
      lineTotal: toNumber(line.lineTotal),
      currency: line.currency,
      note: line.note,
    })),
    dispatches: item.dispatches.map((dispatch: {
      id: string;
      integrationJobId: string | null;
      channel: "TRENDYOL" | "N11" | "EDOCS_MOCK";
      providerKey: string;
      status: "NOT_SENT" | "QUEUED" | "SENT" | "FAILED";
      externalReference: string | null;
      errorMessage: string | null;
      queuedAt: Date;
      dispatchedAt: Date | null;
      createdAt: Date;
    }) => ({
      id: dispatch.id,
      integrationJobId: dispatch.integrationJobId ?? null,
      channel: dispatch.channel,
      providerKey: dispatch.providerKey,
      status: dispatch.status,
      externalReference: dispatch.externalReference ?? null,
      errorMessage: dispatch.errorMessage ?? null,
      queuedAt: dispatch.queuedAt.toISOString(),
      dispatchedAt: dispatch.dispatchedAt ? dispatch.dispatchedAt.toISOString() : null,
      createdAt: dispatch.createdAt.toISOString(),
    })),
  };
}

export class DocumentDispatchService {
  constructor(private readonly repository: DocumentRepository) {}

  private async resolveProviderConfig(providerConfigId?: string) {
    const provider = providerConfigId
      ? await this.repository.findProviderConfigById(providerConfigId)
      : await this.repository.findDefaultProviderConfig();

    if (!provider || !provider.isActive) {
      throw new DocumentAdminError("Aktif bir belge sağlayıcısı bulunamadı. Önce belge sağlayıcısı tanımlayın.", 400);
    }

    return provider;
  }

  async queueOutboundDispatch(input: AdminQueueBusinessDocumentDispatchInput): Promise<AdminBusinessDocumentDetail> {
    const parsed = queueDispatchSchema.parse(input);
    const document = await this.repository.findDispatchableBusinessDocumentById(parsed.id);

    if (!document) {
      throw new DocumentAdminError("Belge bulunamadı.", 404);
    }

    if (!["E_INVOICE", "E_DISPATCH"].includes(document.documentType)) {
      throw new DocumentAdminError("Yalnızca e-fatura ve e-irsaliye belgeleri outbound entegrasyona gönderilebilir.", 400);
    }

    if (document.status === "CANCELLED") {
      throw new DocumentAdminError("İptal edilmiş belge gönderim kuyruğuna alınamaz.", 400);
    }

    const provider = await this.resolveProviderConfig(parsed.providerConfigId ?? document.providerConfigId ?? undefined);

    const payload = {
      documentId: document.id,
      documentNumber: document.documentNumber,
      documentType: document.documentType,
      providerConfigId: provider.id,
      providerCode: provider.providerCode,
      providerDisplayName: provider.displayName,
      endpointUrl: provider.endpointUrl,
      username: provider.username,
      hasSecretKey: Boolean(provider.secretKey),
      senderLabel: provider.senderLabel,
      senderVkn: provider.senderVkn,
      issueDate: document.issueDate.toISOString(),
      counterpartyName: document.counterpartyName,
      counterpartyTaxNumber: document.counterpartyTaxNumber,
      currency: document.currency,
      totalAmount: toNumber(document.totalAmount),
      lines: document.lines.map((line: {
        id: string;
        productSku: string;
        productName: string;
        quantity: number;
        unitPrice: { toNumber: () => number } | null;
        lineTotal: { toNumber: () => number } | null;
        currency: string;
      }) => ({
        id: line.id,
        productSku: line.productSku,
        productName: line.productName,
        quantity: line.quantity,
        unitPrice: toNumber(line.unitPrice),
        lineTotal: toNumber(line.lineTotal),
        currency: line.currency,
      })),
      forceFail: parsed.forceFail ?? false,
    };

    const dispatchResult = await integrationService.dispatchJobs({
      channel: parsed.channel,
      jobType: "DOCUMENT_OUTBOUND",
      entityType: "BUSINESS_DOCUMENT",
      entityIds: [document.id],
      maxAttempts: 3,
      idempotencySuffix: `dispatch-${provider.providerCode}-${Date.now()}`,
      payload,
    });

    const queuedJob = dispatchResult.jobs[0];
    if (!queuedJob) {
      throw new DocumentAdminError("Belge gönderim işi oluşturulamadı.", 500);
    }

    await this.repository.updateBusinessDocument({
      id: document.id,
      providerConfigId: provider.id,
    });

    await documentDispatchLifecycleService.markQueued({
      documentId: document.id,
      integrationJobId: queuedJob.id,
      channel: parsed.channel,
      providerKey: provider.providerCode,
      requestPayload: payload,
    });

    const updated = await this.repository.findBusinessDocumentById(document.id);
    if (!updated) {
      throw new DocumentAdminError("Belge bulunamadı.", 404);
    }

    return mapDetail(updated);
  }

  async queueStatusSync(input: AdminQueueBusinessDocumentStatusSyncInput): Promise<AdminBusinessDocumentDetail> {
    const parsed = queueStatusSyncSchema.parse(input);
    const document = await this.repository.findDispatchableBusinessDocumentById(parsed.id);

    if (!document) {
      throw new DocumentAdminError("Belge bulunamadı.", 404);
    }

    const provider = await this.resolveProviderConfig(parsed.providerConfigId ?? document.providerConfigId ?? undefined);
    if (!provider.supportsStatusSync) {
      throw new DocumentAdminError("Seçilen sağlayıcı durum senkronunu desteklemiyor.", 400);
    }

    const payload = {
      documentId: document.id,
      documentNumber: document.documentNumber,
      documentType: document.documentType,
      externalReference: document.externalReference,
      providerConfigId: provider.id,
      providerCode: provider.providerCode,
      providerDisplayName: provider.displayName,
      endpointUrl: provider.endpointUrl,
      username: provider.username,
      hasSecretKey: Boolean(provider.secretKey),
      forceFail: parsed.forceFail ?? false,
    };

    await integrationService.dispatchJobs({
      channel: provider.channel,
      jobType: "DOCUMENT_STATUS_SYNC",
      entityType: "BUSINESS_DOCUMENT",
      entityIds: [document.id],
      maxAttempts: 3,
      idempotencySuffix: `status-${provider.providerCode}-${Date.now()}`,
      payload,
    });

    const updated = await this.repository.findBusinessDocumentById(document.id);
    if (!updated) {
      throw new DocumentAdminError("Belge bulunamadı.", 404);
    }

    return mapDetail(updated);
  }
}

export const documentDispatchService = new DocumentDispatchService(new DocumentRepository());
