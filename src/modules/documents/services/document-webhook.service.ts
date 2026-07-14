import { createHmac } from "node:crypto";

import type { AdminBusinessDocumentDetail, DocumentWebhookPayload } from "@/modules/documents/contracts/document.contract";
import { DocumentRepository } from "@/modules/documents/repositories/document.repository";
import { DocumentAdminError } from "@/modules/documents/services/document.service";
import { documentProviderCryptoService } from "@/modules/documents/services/document-provider-crypto.service";
import { documentService } from "@/modules/documents/services/document.service";

function toNumber(value: { toNumber: () => number } | null | undefined) {
  return value ? value.toNumber() : null;
}

function mapDocument(item: Awaited<ReturnType<DocumentRepository["findBusinessDocumentById"]>> extends infer T ? NonNullable<T> : never): AdminBusinessDocumentDetail {
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
    counterpartyName: item.counterpartyName,
    counterpartyTaxNumber: item.counterpartyTaxNumber,
    counterpartyTaxOffice: item.counterpartyTaxOffice,
    counterpartyEmail: item.counterpartyEmail,
    counterpartyAddress: item.counterpartyAddress,
    note: item.note,
    orderId: item.order?.id ?? null,
    orderNumber: item.order?.orderNumber ?? null,
    inventoryTransactionId: item.inventoryTransaction?.id ?? null,
    inventoryTransactionNumber: item.inventoryTransaction?.transactionNumber ?? null,
    lineCount: item.lines.length,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    lines: item.lines.map((line) => ({
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
    dispatches: item.dispatches.map((dispatch) => ({
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

export class DocumentWebhookService {
  constructor(private readonly repository: DocumentRepository) {}

  verifySignature(rawBody: string, signature: string | null, webhookSecret: string | null) {
    if (!webhookSecret) {
      return false;
    }

    if (!signature) {
      return false;
    }

    const digest = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    return documentProviderCryptoService.compareSecret(digest, signature);
  }

  async processProviderWebhook(args: {
    providerCode: string;
    rawBody: string;
    signature: string | null;
    payload: DocumentWebhookPayload;
  }): Promise<AdminBusinessDocumentDetail> {
    const provider = await documentService.getResolvedProviderConfigByCode(args.providerCode);
    if (!provider.isActive) {
      throw new DocumentAdminError("Belge sağlayıcısı aktif değil.", 400);
    }

    if (!this.verifySignature(args.rawBody, args.signature, provider.webhookSecret)) {
      throw new DocumentAdminError("Webhook imzası doğrulanamadı.", 401);
    }

    if (!args.payload.documentNumber && !args.payload.externalReference) {
      throw new DocumentAdminError("Webhook içinde belge numarası veya harici referans bulunmalı.", 400);
    }

    const document = await this.repository.findBusinessDocumentForWebhook({
      documentNumber: args.payload.documentNumber ?? null,
      externalReference: args.payload.externalReference ?? null,
      providerConfigId: provider.id,
    });

    if (!document) {
      throw new DocumentAdminError("Webhook ile eşleşen belge bulunamadı.", 404);
    }

    const updated = await this.repository.markBusinessDocumentStatusSynced({
      id: document.id,
      externalSystemStatus: args.payload.status ?? "SENT",
      externalReference: args.payload.externalReference ?? document.externalReference,
    });

    return mapDocument(updated);
  }
}

export const documentWebhookService = new DocumentWebhookService(new DocumentRepository());
