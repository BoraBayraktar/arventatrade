import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { payablesService } from "@/modules/finance/services/payables.service";
import { paymentsService } from "@/modules/finance/services/payments.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { SupplierPayableDetailManager } from "@/ui/admin/supplier-payable-detail-manager";

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; supplierKey: string }>;
}) {
  const { locale, supplierKey } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const user = await getCurrentUserFromContext();
  if (!user) {
    notFound();
  }

  const decodedSupplierKey = decodeURIComponent(supplierKey);
  const [paymentItem, payableItem] = await Promise.all([
    paymentsService.getPaymentReadinessBySupplierKey(locale, decodedSupplierKey),
    payablesService.getSupplierPayableByKey(decodedSupplierKey),
  ]);

  if (!paymentItem || !payableItem) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);

  return (
    <SupplierPayableDetailManager
      locale={locale}
      item={payableItem}
      labels={{
        title: dictionary.admin.financePaymentsTitle,
        description: dictionary.admin.financePaymentDetailDescription,
        totalAmount: dictionary.admin.financeSupplierPayablesTotalAmount,
        documentCount: dictionary.admin.financeSupplierPayablesDocumentCount,
        draftCount: dictionary.admin.financeSupplierPayablesDraftCount,
        lastIssueDate: dictionary.admin.financeSupplierPayablesLastIssueDate,
        documentNumber: dictionary.admin.documentsDocumentNumber,
        documentType: dictionary.admin.documentsDocumentType,
        documentStatus: dictionary.admin.documentsDocumentStatus,
        orderNumber: dictionary.admin.documentsOrderNumber,
        inventoryTransactionNumber: dictionary.admin.documentsInventoryTransactionNumber,
        backToList: dictionary.admin.financeDetailBackToPayments,
        openDocuments: dictionary.admin.financePaymentsOpenSource,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}
