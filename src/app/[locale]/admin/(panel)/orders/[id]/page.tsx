import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { CommerceOrderAdminError, commerceService } from "@/modules/commerce/services/commerce.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { OrderDetailManager } from "@/ui/admin/order-detail-manager";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const user = await getCurrentUserFromContext();

  if (!user) {
    notFound();
  }

  let order;

  try {
    order = await commerceService.getOrderById(id);
  } catch (error) {
    if (error instanceof CommerceOrderAdminError) {
      notFound();
    }

    throw error;
  }

  return (
    <OrderDetailManager
      locale={locale}
      order={order}
      canManage={user.role === "ADMIN"}
      labels={{
        back: dictionary.admin.backToOrders,
        orderNumber: dictionary.admin.orderNumber,
        orderStatus: dictionary.admin.orderStatus,
        orderStatusConfirmed: dictionary.admin.orderStatusConfirmed,
        orderStatusCancelled: dictionary.admin.orderStatusCancelled,
        paymentStatus: dictionary.admin.paymentStatus,
        orderItems: dictionary.admin.orderItems,
        orderSubtotal: dictionary.admin.orderSubtotal,
        orderTotal: dictionary.admin.orderTotal,
        orderDiscount: dictionary.admin.orderDiscount,
        promotionCode: dictionary.admin.promotionCode,
        orderDate: dictionary.admin.orderDate,
        updateStatus: dictionary.admin.updateOrderStatus,
        deleteOrder: dictionary.admin.deleteOrder,
        operationFailed: dictionary.admin.operationFailed,
        loading: dictionary.common.loading,
        statusHistoryTitle: dictionary.admin.orderStatusHistory,
        historyFrom: dictionary.admin.historyFrom,
        historyTo: dictionary.admin.historyTo,
        historySource: dictionary.admin.historySource,
        historyBy: dictionary.admin.historyBy,
        historyNote: dictionary.admin.historyNote,
        historyAt: dictionary.admin.historyAt,
        historySourceSystem: dictionary.admin.historySourceSystem,
        historySourceAdmin: dictionary.admin.historySourceAdmin,
        paymentHistoryTitle: dictionary.admin.paymentStatusHistory,
        paymentHistoryFrom: dictionary.admin.paymentHistoryFrom,
        paymentHistoryTo: dictionary.admin.paymentHistoryTo,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}
