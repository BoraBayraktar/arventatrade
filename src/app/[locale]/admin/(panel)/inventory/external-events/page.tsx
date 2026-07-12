import { InventoryManager } from "@/ui/admin/inventory-manager";

import { loadInventoryRouteContext, type InventoryRouteSearchParams } from "../_shared";

export default async function AdminInventoryExternalEventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<InventoryRouteSearchParams>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const context = await loadInventoryRouteContext(locale, resolvedSearchParams, "external-events");

  return (
    <InventoryManager
      locale={context.locale}
      result={context.result}
      transactionResult={context.transactionResult}
      warehouses={context.warehouses}
      alertResult={context.alertResult}
      stockCounts={context.stockCounts}
      reports={context.reports}
      integrationSummary={context.integrationSummary}
      externalEventMonitoring={context.externalEventMonitoring}
      operationHistory={context.operationHistory}
      exportHistory={context.exportHistory}
      inventoryPreferences={context.inventoryPreferences}
      query={context.query}
      labels={context.labels}
      overviewPath={`/${context.locale}/admin/inventory`}
      inventoryListPath={`/${context.locale}/admin/inventory`}
      transactionListPath={`/${context.locale}/admin/inventory/transactions`}
      stockCountsPath={`/${context.locale}/admin/inventory/counts`}
      warehousesPath={`/${context.locale}/admin/inventory/warehouses`}
      exportsPath={`/${context.locale}/admin/inventory/exports`}
      externalEventsPath={`/${context.locale}/admin/inventory/external-events`}
      pageVariant="external-events"
      initialSectionGroup="operations"
      initialSection="inventory-sync"
    />
  );
}
