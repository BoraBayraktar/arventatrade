import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { documentService } from "@/modules/documents/services/document.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { DocumentManager } from "@/ui/admin/document-manager";

export default async function AdminDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const user = await getCurrentUserFromContext();
  if (!user) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const [result, providerConfigs] = await Promise.all([
    documentService.listBusinessDocuments({
      search: resolvedSearchParams.search,
      page: 1,
      pageSize: 20,
    }),
    documentService.listProviderConfigs(),
  ]);

  return (
    <DocumentManager
      locale={locale}
      result={result}
      providerOptions={providerConfigs.map((item) => ({
        id: item.id,
        displayName: item.displayName,
        isDefault: item.isDefault,
      }))}
      initialSearch={resolvedSearchParams.search ?? ""}
      labels={{
        title: dictionary.admin.documentManager,
        description: dictionary.admin.documentsDescription,
        createTitle: dictionary.admin.documentsCreateTitle,
        documentNumber: dictionary.admin.documentsDocumentNumber,
        documentType: dictionary.admin.documentsDocumentType,
        documentStatus: dictionary.admin.documentsDocumentStatus,
        issueDate: dictionary.admin.documentsIssueDate,
        counterparty: dictionary.admin.documentsCounterparty,
        externalReference: dictionary.admin.documentsExternalReference,
        externalSystemStatus: dictionary.admin.documentsExternalSystemStatus,
        orderNumber: dictionary.admin.documentsOrderNumber,
        inventoryTransactionNumber: dictionary.admin.documentsInventoryTransactionNumber,
        note: dictionary.admin.documentsNote,
        create: dictionary.admin.documentsCreateAction,
        saving: dictionary.common.loading,
        search: dictionary.admin.documentsSearch,
        noResults: dictionary.admin.documentsNoResults,
        viewLines: dictionary.admin.documentsViewLines,
        notSpecified: dictionary.common.notSpecified,
        queueDispatch: dictionary.admin.documentsQueueDispatch,
        queueing: dictionary.admin.documentsQueueing,
        dispatchHistory: dictionary.admin.documentsDispatchHistory,
        dispatchProvider: dictionary.admin.documentsDispatchProvider,
        dispatchError: dictionary.admin.documentsDispatchError,
        dispatchQueuedAt: dictionary.admin.documentsDispatchQueuedAt,
        noDispatchHistory: dictionary.admin.documentsNoDispatchHistory,
        providerSelection: dictionary.admin.documentsProviderSelection,
        providerNone: dictionary.admin.documentsProviderNone,
        queueStatusSync: dictionary.admin.documentsQueueStatusSync,
        statusSyncing: dictionary.admin.documentsStatusSyncing,
        badgeNotSent: dictionary.admin.documentsBadgeNotSent,
        badgeQueued: dictionary.admin.documentsBadgeQueued,
        badgeSent: dictionary.admin.documentsBadgeSent,
        badgeFailed: dictionary.admin.documentsBadgeFailed,
        slaAttention: dictionary.admin.documentsSlaAttention,
        slaCritical: dictionary.admin.documentsSlaCritical,
        slaQueuedStale: dictionary.admin.documentsSlaQueuedStale,
      }}
    />
  );
}
