import { z } from "zod";

import type {
  AdminBusinessDocumentDetail,
  AdminBusinessDocumentListItem,
  AdminBusinessDocumentListQuery,
  AdminBusinessDocumentListResult,
  AdminCreateBusinessDocumentInput,
  AdminDocumentProviderConfigItem,
  AdminOperationalPayableDocument,
  AdminPendingInvoiceDeliveryNoteListItem,
  AdminPendingInvoiceDeliveryNoteListResult,
  AdminUpsertDocumentProviderConfigInput,
  AdminUpdateBusinessDocumentInput,
  DocumentProviderResolvedConfig,
} from "@/modules/documents/contracts/document.contract";
import { DocumentRepository } from "@/modules/documents/repositories/document.repository";
import { documentProviderCryptoService } from "@/modules/documents/services/document-provider-crypto.service";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  documentType: z.enum(["all", "PURCHASE_DOCUMENT", "DELIVERY_NOTE", "E_INVOICE", "E_DISPATCH"]).default("all"),
  status: z.enum(["all", "DRAFT", "LINKED", "ISSUED", "CANCELLED"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const reportListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
  documentNumber: z.string().trim().min(1).max(120),
  documentType: z.enum(["PURCHASE_DOCUMENT", "DELIVERY_NOTE", "E_INVOICE", "E_DISPATCH"]),
  status: z.enum(["DRAFT", "LINKED", "ISSUED", "CANCELLED"]).optional(),
  issueDate: z.string().datetime(),
  currency: z.string().trim().min(3).max(8).optional(),
  totalAmount: z.coerce.number().nonnegative().optional().nullable(),
  externalReference: z.string().trim().max(160).optional().nullable(),
  externalSystemStatus: z.enum(["NOT_SENT", "QUEUED", "SENT", "FAILED"]).optional(),
  providerConfigId: z.string().trim().min(1).optional().nullable(),
  counterpartyName: z.string().trim().max(160).optional().nullable(),
  counterpartyTaxNumber: z.string().trim().max(64).optional().nullable(),
  counterpartyTaxOffice: z.string().trim().max(120).optional().nullable(),
  counterpartyEmail: z.string().trim().email().max(160).optional().nullable(),
  counterpartyAddress: z.string().trim().max(500).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
  orderNumber: z.string().trim().max(120).optional().nullable(),
  inventoryTransactionNumber: z.string().trim().max(120).optional().nullable(),
}).refine((value) => Boolean(value.orderNumber || value.inventoryTransactionNumber), {
  message: "Belgeyi bir siparişe veya stok işlemine bağlamalısınız.",
});

const updateSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["DRAFT", "LINKED", "ISSUED", "CANCELLED"]).optional(),
  externalSystemStatus: z.enum(["NOT_SENT", "QUEUED", "SENT", "FAILED"]).optional(),
  externalReference: z.string().trim().max(160).optional().nullable(),
  providerConfigId: z.string().trim().min(1).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
}).refine((value) => (
  value.status !== undefined
  || value.externalSystemStatus !== undefined
  || value.externalReference !== undefined
  || value.providerConfigId !== undefined
  || value.note !== undefined
), {
  message: "En az bir güncelleme alanı göndermelisiniz.",
});

const providerConfigSchema = z.object({
  id: z.string().trim().min(1).optional(),
  providerCode: z.string().trim().min(2).max(64),
  channel: z.enum(["EDOCS_MOCK"]).default("EDOCS_MOCK"),
  displayName: z.string().trim().min(2).max(120),
  endpointUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")).transform((value) => value || null),
  senderLabel: z.string().trim().max(120).optional().nullable().or(z.literal("")).transform((value) => value || null),
  senderVkn: z.string().trim().max(32).optional().nullable().or(z.literal("")).transform((value) => value || null),
  username: z.string().trim().max(120).optional().nullable().or(z.literal("")).transform((value) => value || null),
  secretKey: z.string().trim().max(200).optional().nullable().or(z.literal("")).transform((value) => value || null),
  companyName: z.string().trim().max(160).optional().nullable().or(z.literal("")).transform((value) => value || null),
  webhookSecret: z.string().trim().max(200).optional().nullable().or(z.literal("")).transform((value) => value || null),
  supportsStatusSync: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  note: z.string().trim().max(500).optional().nullable().or(z.literal("")).transform((value) => value || null),
});

export class DocumentAdminError extends Error {
  constructor(message: string, public readonly status = 404) {
    super(message);
    this.name = "DocumentAdminError";
  }
}

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

function maskSecret(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value.length <= 4) {
    return "****";
  }

  return `${"*".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
}

function mapProviderConfig(item: Awaited<ReturnType<DocumentRepository["listProviderConfigs"]>>[number]): AdminDocumentProviderConfigItem {
  return {
    id: item.id,
    providerCode: item.providerCode,
    channel: "EDOCS_MOCK",
    displayName: item.displayName,
    endpointUrl: item.endpointUrl,
    senderLabel: item.senderLabel,
    senderVkn: item.senderVkn,
    username: item.username,
    secretKeyMasked: maskSecret(item.secretKey),
    companyName: item.companyName,
    webhookSecretMasked: maskSecret(item.webhookSecret),
    supportsStatusSync: item.supportsStatusSync,
    isActive: item.isActive,
    isDefault: item.isDefault,
    note: item.note,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapResolvedProviderConfig(item: NonNullable<Awaited<ReturnType<DocumentRepository["findProviderConfigById"]>>>) : DocumentProviderResolvedConfig {
  return {
    id: item.id,
    providerCode: item.providerCode,
    channel: "EDOCS_MOCK",
    displayName: item.displayName,
    endpointUrl: item.endpointUrl,
    senderLabel: item.senderLabel,
    senderVkn: item.senderVkn,
    username: item.username,
    secretKey: documentProviderCryptoService.decrypt(item.secretKey),
    companyName: item.companyName,
    webhookSecret: documentProviderCryptoService.decrypt(item.webhookSecret),
    supportsStatusSync: item.supportsStatusSync,
    isActive: item.isActive,
    isDefault: item.isDefault,
    note: item.note,
  };
}

function mapDocumentListItem(item: Awaited<ReturnType<DocumentRepository["listBusinessDocuments"]>>[number]): AdminBusinessDocumentListItem {
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
    orderId: item.order?.id ?? null,
    orderNumber: item.order?.orderNumber ?? null,
    inventoryTransactionId: item.inventoryTransaction?.id ?? null,
    inventoryTransactionNumber: item.inventoryTransaction?.transactionNumber ?? null,
    lineCount: item._count.lines,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const normalizedPage = Math.min(page, totalPages);
  const start = (normalizedPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: normalizedPage,
    pageSize,
    total,
    totalPages,
  };
}

function buildInvoiceDocumentNumber(sourceDocumentNumber: string, sourceDocumentId: string) {
  const sanitizedBase = sourceDocumentNumber.replace(/[^A-Za-z0-9-]/g, "").slice(0, 80) || "DOC";
  const suffix = sourceDocumentId.slice(-6).toUpperCase();
  return `EF-${sanitizedBase}-${suffix}`.slice(0, 120);
}

export class DocumentService {
  constructor(private readonly repository: DocumentRepository) {}

  async listBusinessDocuments(query: AdminBusinessDocumentListQuery = {}): Promise<AdminBusinessDocumentListResult> {
    const parsed = listQuerySchema.parse(query);
    const [items, total] = await Promise.all([
      this.repository.listBusinessDocuments(parsed),
      this.repository.countBusinessDocuments(parsed),
    ]);

    return {
      items: items.map(mapDocumentListItem),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }

  async getBusinessDocumentById(id: string): Promise<AdminBusinessDocumentDetail> {
    const parsedId = z.string().trim().min(1).parse(id);
    const item = await this.repository.findBusinessDocumentById(parsedId);
    if (!item) {
      throw new DocumentAdminError("Belge bulunamadı.", 404);
    }

    return mapDocument(item);
  }

  async listPendingInvoiceDeliveryNotes(query: Pick<AdminBusinessDocumentListQuery, "search" | "page" | "pageSize"> = {}): Promise<AdminPendingInvoiceDeliveryNoteListResult> {
    const parsed = reportListQuerySchema.parse(query);
    const [candidateNotes, issuedInvoices] = await Promise.all([
      this.repository.listPendingInvoiceCandidateDeliveryNotes(parsed.search),
      this.repository.listIssuedInvoiceDocuments(),
    ]);

    const invoicedOrderIds = new Set(
      issuedInvoices
        .map((item) => item.orderId)
        .filter((item): item is string => Boolean(item)),
    );
    const invoicedTransactionIds = new Set(
      issuedInvoices
        .map((item) => item.inventoryTransactionId)
        .filter((item): item is string => Boolean(item)),
    );

    const pendingItems: AdminPendingInvoiceDeliveryNoteListItem[] = candidateNotes
      .filter((item) => {
        if (item.orderId && invoicedOrderIds.has(item.orderId)) {
          return false;
        }

        if (item.inventoryTransactionId && invoicedTransactionIds.has(item.inventoryTransactionId)) {
          return false;
        }

        return true;
      })
      .map((item) => ({
        ...mapDocumentListItem(item),
        sourceLabel: item.order?.orderNumber ?? item.inventoryTransaction?.transactionNumber ?? item.documentNumber,
      }));

    return paginateItems(pendingItems, parsed.page, parsed.pageSize);
  }

  async listOperationalPayableDocuments(search?: string): Promise<AdminOperationalPayableDocument[]> {
    const items = await this.repository.listOperationalPayableDocuments(search?.trim() || undefined);
    return items.map(mapDocumentListItem);
  }

  async createInvoiceFromDeliveryNote(id: string): Promise<AdminBusinessDocumentDetail> {
    const parsedId = z.string().trim().min(1).parse(id);
    const sourceDocument = await this.repository.findBusinessDocumentById(parsedId);
    if (!sourceDocument) {
      throw new DocumentAdminError("İrsaliye bulunamadı.", 404);
    }

    if (sourceDocument.documentType !== "DELIVERY_NOTE") {
      throw new DocumentAdminError("Yalnızca irsaliyeden e-fatura oluşturabilirsiniz.", 400);
    }

    if (sourceDocument.status === "CANCELLED") {
      throw new DocumentAdminError("İptal edilmiş irsaliyeden e-fatura oluşturulamaz.", 400);
    }

    const existingInvoice = await this.repository.findInvoiceForSourceDocument({
      orderId: sourceDocument.orderId,
      inventoryTransactionId: sourceDocument.inventoryTransactionId,
    });

    if (existingInvoice) {
      throw new DocumentAdminError(`Bu kayıt için zaten bir e-fatura mevcut: ${existingInvoice.documentNumber}`, 409);
    }

    const created = await this.repository.createBusinessDocumentFromSource({
      sourceDocumentId: sourceDocument.id,
      documentNumber: buildInvoiceDocumentNumber(sourceDocument.documentNumber, sourceDocument.id),
      documentType: "E_INVOICE",
      status: "LINKED",
      note: sourceDocument.note
        ? `${sourceDocument.note}\nKaynak irsaliye: ${sourceDocument.documentNumber}`
        : `Kaynak irsaliye: ${sourceDocument.documentNumber}`,
    });

    if (!created) {
      throw new DocumentAdminError("Kaynak irsaliye bulunamadı.", 404);
    }

    return mapDocument(created);
  }

  async createBusinessDocument(input: AdminCreateBusinessDocumentInput): Promise<AdminBusinessDocumentDetail> {
    const parsed = createSchema.parse(input);
    const orderSource = parsed.orderNumber ? await this.repository.findOrderDocumentSource(parsed.orderNumber) : null;
    const transactionSource = parsed.inventoryTransactionNumber ? await this.repository.findInventoryTransactionDocumentSource(parsed.inventoryTransactionNumber) : null;

    if (parsed.orderNumber && !orderSource) {
      throw new DocumentAdminError("Bağlanacak sipariş bulunamadı.", 404);
    }

    if (parsed.inventoryTransactionNumber && !transactionSource) {
      throw new DocumentAdminError("Bağlanacak stok işlemi bulunamadı.", 404);
    }

    if (parsed.providerConfigId) {
      const provider = await this.repository.findProviderConfigById(parsed.providerConfigId);
      if (!provider || !provider.isActive) {
        throw new DocumentAdminError("Seçilen belge sağlayıcısı bulunamadı veya aktif değil.", 404);
      }
    }

    const resolvedLines = orderSource
      ? orderSource.items.map((item) => ({
          productId: item.productId,
          productSku: item.productSku,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toNumber(),
          lineTotal: item.lineTotal.toNumber(),
          currency: item.currency,
        }))
      : (transactionSource?.lines ?? []).map((line) => ({
          productId: line.inventoryItem.product.id,
          productSku: line.inventoryItem.product.sku,
          productName: line.inventoryItem.product.name,
          quantity: line.quantity,
          unitPrice: line.inventoryItem.product.purchasePrice?.toNumber() ?? null,
          lineTotal: line.inventoryItem.product.purchasePrice?.toNumber() !== undefined && line.inventoryItem.product.purchasePrice !== null
            ? Number((line.inventoryItem.product.purchasePrice.toNumber() * line.quantity).toFixed(2))
            : null,
          currency: line.inventoryItem.product.currency,
          note: line.note,
        }));

    const created = await this.repository.createBusinessDocument({
      input: parsed,
      resolvedOrderId: orderSource?.id ?? null,
      resolvedInventoryTransactionId: transactionSource?.id ?? null,
      resolvedProviderConfigId: parsed.providerConfigId ?? null,
      resolvedCounterpartyName: parsed.counterpartyName?.trim() || transactionSource?.counterpartyName || "Belirtilmedi",
      resolvedCurrency: parsed.currency ?? orderSource?.currency ?? "TRY",
      resolvedTotalAmount: parsed.totalAmount ?? orderSource?.total.toNumber() ?? null,
      resolvedLines,
    });

    return mapDocument(created);
  }

  async updateBusinessDocument(input: AdminUpdateBusinessDocumentInput): Promise<AdminBusinessDocumentDetail> {
    const parsed = updateSchema.parse(input);
    const existing = await this.repository.findBusinessDocumentById(parsed.id);
    if (!existing) {
      throw new DocumentAdminError("Belge bulunamadı.", 404);
    }

    if (parsed.providerConfigId) {
      const provider = await this.repository.findProviderConfigById(parsed.providerConfigId);
      if (!provider || !provider.isActive) {
        throw new DocumentAdminError("Seçilen belge sağlayıcısı bulunamadı veya aktif değil.", 404);
      }
    }

    const updated = await this.repository.updateBusinessDocument(parsed);
    return mapDocument(updated);
  }

  async listProviderConfigs(): Promise<AdminDocumentProviderConfigItem[]> {
    const items = await this.repository.listProviderConfigs();
    return items.map(mapProviderConfig);
  }

  async upsertProviderConfig(input: AdminUpsertDocumentProviderConfigInput): Promise<AdminDocumentProviderConfigItem> {
    const parsed = providerConfigSchema.parse(input);
    const item = await this.repository.upsertProviderConfig({
      ...parsed,
      secretKey: parsed.secretKey ? documentProviderCryptoService.encrypt(parsed.secretKey) : parsed.secretKey,
      webhookSecret: parsed.webhookSecret ? documentProviderCryptoService.encrypt(parsed.webhookSecret) : parsed.webhookSecret,
    });
    return mapProviderConfig(item);
  }

  async getResolvedProviderConfigById(id: string): Promise<DocumentProviderResolvedConfig> {
    const item = await this.repository.findProviderConfigById(z.string().trim().min(1).parse(id));
    if (!item) {
      throw new DocumentAdminError("Belge sağlayıcısı bulunamadı.", 404);
    }

    return mapResolvedProviderConfig(item);
  }

  async getResolvedProviderConfigByCode(providerCode: string): Promise<DocumentProviderResolvedConfig> {
    const item = await this.repository.findProviderConfigByCode(z.string().trim().min(1).parse(providerCode));
    if (!item) {
      throw new DocumentAdminError("Belge sağlayıcısı bulunamadı.", 404);
    }

    return mapResolvedProviderConfig(item);
  }
}

export const documentService = new DocumentService(new DocumentRepository());
