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
        customerAccount: dictionary.admin.customerAccountsTitle,
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
        orderDocumentsTitle: dictionary.admin.documentManager,
        inventorySummaryTitle: dictionary.admin.inventorySummaryTitle,
        inventoryReservations: dictionary.admin.inventoryReservations,
        inventoryReservedQuantity: dictionary.admin.inventoryReservedQuantity,
        inventoryRestockStatus: dictionary.admin.inventoryRestockStatus,
        inventoryLastRestockedAt: dictionary.admin.inventoryLastRestockedAt,
        inventoryMovementTitle: dictionary.admin.inventoryMovementTitle,
        inventoryMovementType: dictionary.admin.inventoryMovementType,
        inventoryMovementQuantity: dictionary.admin.inventoryMovementQuantity,
        inventoryMovementWarehouse: dictionary.admin.inventoryMovementWarehouse,
        inventoryMovementReservation: dictionary.admin.inventoryMovementReservation,
        inventoryMovementInitialLoad: dictionary.admin.inventoryMovementInitialLoad,
        inventoryMovementManualAdjustment: dictionary.admin.inventoryMovementManualAdjustment,
        inventoryMovementPurchaseReceipt: dictionary.admin.inventoryMovementPurchaseReceipt,
        inventoryMovementReservationHold: dictionary.admin.inventoryMovementReservationHold,
        inventoryMovementReservationRelease: dictionary.admin.inventoryMovementReservationRelease,
        inventoryMovementOrderCommit: dictionary.admin.inventoryMovementOrderCommit,
        inventoryMovementOrderCancelRestock: dictionary.admin.inventoryMovementOrderCancelRestock,
        inventoryMovementReturnRestock: dictionary.admin.inventoryMovementReturnRestock,
        inventoryMovementDamageWriteOff: dictionary.admin.inventoryMovementDamageWriteOff,
        inventoryMovementRestockNone: dictionary.admin.inventoryMovementRestockNone,
        inventoryMovementRestockPartial: dictionary.admin.inventoryMovementRestockPartial,
        inventoryMovementRestockDone: dictionary.admin.inventoryMovementRestockDone,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}
