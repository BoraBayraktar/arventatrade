import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { receivablesService } from "@/modules/finance/services/receivables.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { CustomerReceivablesManager } from "@/ui/admin/customer-receivables-manager";

export default async function AdminCustomerReceivablesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; paymentStatus?: string; page?: string }>;
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
  const paymentStatus =
    resolvedSearchParams.paymentStatus === "PENDING" ||
    resolvedSearchParams.paymentStatus === "AUTHORIZED" ||
    resolvedSearchParams.paymentStatus === "FAILED"
      ? resolvedSearchParams.paymentStatus
      : "all";

  const result = await receivablesService.listOperationalReceivables({
    search: resolvedSearchParams.search,
    paymentStatus,
    page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1,
    pageSize: 12,
  });

  return (
    <CustomerReceivablesManager
      locale={locale}
      result={result}
      initialSearch={resolvedSearchParams.search ?? ""}
      initialPaymentStatus={paymentStatus}
      labels={{
        title: dictionary.admin.financeReceivablesTitle,
        description: dictionary.admin.financeReceivablesDescription,
        search: dictionary.admin.financeReceivablesSearch,
        allStatuses: dictionary.admin.financeReceivablesAllStatuses,
        pending: dictionary.admin.financeReceivablesPending,
        authorized: dictionary.admin.financeReceivablesAuthorized,
        failed: dictionary.admin.financeReceivablesFailed,
        totalOpenAmount: dictionary.admin.financeReceivablesTotalOpenAmount,
        pendingCount: dictionary.admin.financeReceivablesPendingCount,
        authorizedCount: dictionary.admin.financeReceivablesAuthorizedCount,
        failedCount: dictionary.admin.financeReceivablesFailedCount,
        noResults: dictionary.admin.financeReceivablesEmpty,
        orderNumber: dictionary.admin.orderNumber,
        counterparty: dictionary.admin.documentsCounterparty,
        paymentStatus: dictionary.admin.paymentStatus,
        totalAmount: dictionary.admin.orderTotal,
        itemCount: dictionary.admin.orderItems,
        orderDate: dictionary.admin.orderDate,
        latestDocument: dictionary.admin.financeReceivablesLatestDocument,
        openOrder: dictionary.admin.financeReceivablesOpenOrder,
        openDetail: dictionary.admin.financeCollectionsOpenDetail,
        notSpecified: dictionary.common.notSpecified,
        cancel: dictionary.admin.cancel,
      }}
    />
  );
}
