import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { collectionsService } from "@/modules/finance/services/collections.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { CollectionReadinessManager } from "@/ui/admin/collection-readiness-manager";

export default async function AdminFinanceCollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const user = await getCurrentUserFromContext();
  if (!user) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const result = await collectionsService.listCollectionReadiness(locale);

  return (
    <CollectionReadinessManager
      result={result}
      labels={{
        title: dictionary.admin.financeCollectionsTitle,
        description: dictionary.admin.financeCollectionsDescription,
        totalPendingAmount: dictionary.admin.financeCollectionsTotalPendingAmount,
        totalRecordedAmount: dictionary.admin.financeCollectionsTotalRecordedAmount,
        pendingCount: dictionary.admin.financeCollectionsPendingCount,
        authorizedCount: dictionary.admin.financeCollectionsAuthorizedCount,
        failedCount: dictionary.admin.financeCollectionsFailedCount,
        recordedCount: dictionary.admin.financeCollectionsRecordedCount,
        counterparty: dictionary.admin.documentsCounterparty,
        paymentStatus: dictionary.admin.paymentStatus,
        orderDate: dictionary.admin.orderDate,
        amount: dictionary.admin.orderTotal,
        remainingAmount: dictionary.admin.financeCollectionsRemainingAmount,
        recordedCollectionCount: dictionary.admin.financeCollectionsRecordedCollectionCount,
        openDetail: dictionary.admin.financeCollectionsOpenDetail,
        openSource: dictionary.admin.financeCollectionsOpenSource,
        createRecord: dictionary.admin.financeCollectionsCreateRecord,
        creatingRecord: dictionary.admin.financeCollectionsCreatingRecord,
        createRecordSuccess: dictionary.admin.financeCollectionsCreateRecordSuccess,
        createRecordFailed: dictionary.admin.financeCollectionsCreateRecordFailed,
        noResults: dictionary.admin.financeCollectionsEmpty,
      }}
    />
  );
}
