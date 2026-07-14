import { Prisma } from "@prisma/client";

import { DocumentRepository } from "@/modules/documents/repositories/document.repository";

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
    return this.repository.markBusinessDocumentDispatchSuccess({
      id: args.documentId,
      integrationJobId: args.integrationJobId,
      providerKey: args.providerKey,
      externalReference: args.externalReference ?? null,
      responsePayload: (args.responsePayload ?? null) as Prisma.InputJsonValue | null,
    });
  }

  async markFailure(args: {
    documentId: string;
    integrationJobId: string;
    providerKey: string;
    errorMessage: string;
    responsePayload?: Record<string, unknown> | null;
  }) {
    return this.repository.markBusinessDocumentDispatchFailure({
      id: args.documentId,
      integrationJobId: args.integrationJobId,
      providerKey: args.providerKey,
      errorMessage: args.errorMessage,
      responsePayload: (args.responsePayload ?? null) as Prisma.InputJsonValue | null,
    });
  }

  async markStatusSynced(args: {
    documentId: string;
    externalSystemStatus: "NOT_SENT" | "QUEUED" | "SENT" | "FAILED";
    externalReference?: string | null;
  }) {
    return this.repository.markBusinessDocumentStatusSynced({
      id: args.documentId,
      externalSystemStatus: args.externalSystemStatus,
      externalReference: args.externalReference,
    });
  }
}

export const documentDispatchLifecycleService = new DocumentDispatchLifecycleService(new DocumentRepository());
