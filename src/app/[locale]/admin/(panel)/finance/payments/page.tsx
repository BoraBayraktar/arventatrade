import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { paymentsService } from "@/modules/finance/services/payments.service";
import { PaymentReadinessManager } from "@/ui/admin/payment-readiness-manager";

export default async function AdminFinancePaymentsPage({
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
  const result = await paymentsService.listPaymentReadiness(locale);

  return (
    <PaymentReadinessManager
      result={result}
      labels={{
        title: dictionary.admin.financePaymentsTitle,
        description: dictionary.admin.financePaymentsDescription,
        totalPendingAmount: dictionary.admin.financePaymentsTotalPendingAmount,
        totalRecordedAmount: dictionary.admin.financePaymentsTotalRecordedAmount,
        supplierCount: dictionary.admin.financePaymentsSupplierCount,
        draftDocumentCount: dictionary.admin.financePaymentsDraftDocumentCount,
        recordedCount: dictionary.admin.financePaymentsRecordedCount,
        documentCount: dictionary.admin.financePaymentsDocumentCount,
        lastIssueDate: dictionary.admin.financePaymentsLastIssueDate,
        amount: dictionary.admin.financePaymentsAmount,
        remainingAmount: dictionary.admin.financePaymentsRemainingAmount,
        recordedPaymentCount: dictionary.admin.financePaymentsRecordedPaymentCount,
        openDetail: dictionary.admin.financePaymentsOpenDetail,
        openSource: dictionary.admin.financePaymentsOpenSource,
        createRecord: dictionary.admin.financePaymentsCreateRecord,
        creatingRecord: dictionary.admin.financePaymentsCreatingRecord,
        createRecordSuccess: dictionary.admin.financePaymentsCreateRecordSuccess,
        createRecordFailed: dictionary.admin.financePaymentsCreateRecordFailed,
        noResults: dictionary.admin.financePaymentsEmpty,
      }}
    />
  );
}
