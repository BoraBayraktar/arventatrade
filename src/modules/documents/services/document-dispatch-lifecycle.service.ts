import { Prisma } from "@prisma/client";

import { DocumentRepository } from "@/modules/documents/repositories/document.repository";
import { documentLifecycleService } from "@/modules/documents/services/document-lifecycle.service";

export class DocumentDispatchLifecycleService {
  constructor(private readonly repository: DocumentRepository) {}

  async markQueued(args: {
    documentId: string;
    integrationJobId: string;
    channel: "EDOCS_MOCK";
    providerKey: string;
    requestPayload?: Record<string, unknown> | null;
  }) {
    return this.repository.markBusinessDocumentQueued({
      id: args.documentId,
      integrationJobId: args.integrationJobId,
      channel: args.channel,
      providerKey: args.providerKey,
      requestPayload: (args.requestPayload ?? null) as Prisma.InputJsonValue | null,
    });
  }

  async markSuccess(args: {
    documentId: string;
    integrationJobId: string;
    providerKey: string;
    externalReference?: string | null;
    responsePayload?: Record<string, unknown> | null;
  }) {
    const updated = await this.repository.markBusinessDocumentDispatchSuccess({
      id: args.documentId,
      integrationJobId: args.integrationJobId,
      providerKey: args.providerKey,
      externalReference: args.externalReference ?? null,
      responsePayload: (args.responsePayload ?? null) as Prisma.InputJsonValue | null,
    });

    await documentLifecycleService.recordEvent({
      businessDocumentId: args.documentId,
      eventType: "OUTBOUND_SENT",
      status: updated.status,
      externalStatus: updated.externalSystemStatus,
      providerCode: args.providerKey,
      integrationJobId: args.integrationJobId,
      actorType: "INTEGRATION",
      summary: "Belge sağlayıcıya başarıyla gönderildi",
      metadata: {
        externalReference: args.externalReference ?? null,
      },
      message: {
        direction: "INBOUND",
        providerCode: args.providerKey,
        messageType: "DOCUMENT_OUTBOUND_RESPONSE",
        payload: args.responsePayload ?? null,
      },
    });

    return updated;
  }

  async markFailure(args: {
    documentId: string;
    integrationJobId: string;
    providerKey: string;
    errorMessage: string;
    responsePayload?: Record<string, unknown> | null;
  }) {
    const updated = await this.repository.markBusinessDocumentDispatchFailure({
      id: args.documentId,
      integrationJobId: args.integrationJobId,
      providerKey: args.providerKey,
      errorMessage: args.errorMessage,
      responsePayload: (args.responsePayload ?? null) as Prisma.InputJsonValue | null,
    });

    await documentLifecycleService.recordEvent({
      businessDocumentId: args.documentId,
      eventType: "OUTBOUND_FAILED",
      status: updated.status,
      externalStatus: updated.externalSystemStatus,
      providerCode: args.providerKey,
      integrationJobId: args.integrationJobId,
      actorType: "INTEGRATION",
      summary: "Belge sağlayıcı gönderimi başarısız oldu",
      metadata: {
        errorMessage: args.errorMessage,
      },
      message: {
        direction: "INBOUND",
        providerCode: args.providerKey,
        messageType: "DOCUMENT_OUTBOUND_ERROR_RESPONSE",
        payload: args.responsePayload ?? null,
        errorMessage: args.errorMessage,
      },
    });

    return updated;
  }

  async markStatusSynced(args: {
    documentId: string;
    externalSystemStatus: "NOT_SENT" | "QUEUED" | "SENT" | "FAILED";
    externalReference?: string | null;
  }) {
    const updated = await this.repository.markBusinessDocumentStatusSynced({
      id: args.documentId,
      externalSystemStatus: args.externalSystemStatus,
      externalReference: args.externalReference,
    });

    await documentLifecycleService.recordEvent({
      businessDocumentId: args.documentId,
      eventType: "STATUS_SYNCED",
      status: updated.status,
      externalStatus: updated.externalSystemStatus,
      providerCode: updated.providerConfig?.displayName ?? null,
      actorType: "INTEGRATION",
      summary: "Belge durumu sağlayıcıdan senkronlandı",
      metadata: {
        externalReference: args.externalReference ?? null,
      },
    });

    return updated;
  }
}

export const documentDispatchLifecycleService = new DocumentDispatchLifecycleService(new DocumentRepository());
