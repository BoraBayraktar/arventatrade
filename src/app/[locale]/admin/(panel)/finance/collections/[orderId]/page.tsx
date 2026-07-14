import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { collectionsService } from "@/modules/finance/services/collections.service";
import { receivablesService } from "@/modules/finance/services/receivables.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { ReceivableDetailManager } from "@/ui/admin/receivable-detail-manager";

export default async function AdminCollectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const user = await getCurrentUserFromContext();
  if (!user) {
    notFound();
  }

  const [collectionItem, receivableItem] = await Promise.all([
    collectionsService.getCollectionReadinessByOrderId(locale, orderId),
    receivablesService.getReceivableByOrderId(orderId),
  ]);

  if (!collectionItem || !receivableItem) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);

  return (
    <ReceivableDetailManager
      locale={locale}
      item={receivableItem}
      labels={{
        title: dictionary.admin.documentsCounterparty,
        description: dictionary.admin.financeCollectionDetailDescription,
        paymentStatus: dictionary.admin.paymentStatus,
        totalAmount: dictionary.admin.orderTotal,
        itemCount: dictionary.admin.orderItems,
        orderDate: dictionary.admin.orderDate,
        latestDocument: dictionary.admin.financeReceivablesLatestDocument,
        backToList: dictionary.admin.financeDetailBackToCollections,
        openOrder: dictionary.admin.financeCollectionsOpenSource,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}
