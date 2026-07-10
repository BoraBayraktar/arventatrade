import { notFound, redirect } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { integrationService } from "@/modules/integration/services/integration.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { IntegrationManager } from "@/ui/admin/integration-manager";

export default async function AdminIntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const user = await getCurrentUserFromContext();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const [jobs, deadLetters] = await Promise.all([
    integrationService.listJobs({ page: 1, pageSize: 20 }),
    integrationService.listDeadLetters(),
  ]);

  return (
    <IntegrationManager
      locale={locale}
      canManage={user.role === "ADMIN"}
      initialJobs={jobs.items}
      initialDeadLetters={deadLetters.items}
      labels={{
        title: dictionary.admin.integrationManager,
        subtitle: dictionary.admin.integrationSubtitle,
        createJob: dictionary.admin.integrationCreateJob,
        processQueue: dictionary.admin.integrationProcessQueue,
        deadLetters: dictionary.admin.integrationDeadLetters,
        jobs: dictionary.admin.integrationJobs,
        channel: dictionary.admin.integrationChannel,
        jobType: dictionary.admin.integrationJobType,
        status: dictionary.admin.integrationStatus,
        entityId: dictionary.admin.integrationEntityId,
        actions: dictionary.admin.integrationActions,
        retry: dictionary.admin.integrationRetry,
        operationFailed: dictionary.admin.operationFailed,
        loading: dictionary.common.loading,
        forceFail: dictionary.admin.integrationForceFail,
        openCreateDrawer: dictionary.admin.integrationOpenCreateDrawer,
        openProcessDrawer: dictionary.admin.integrationOpenProcessDrawer,
        drawerCreateTitle: dictionary.admin.integrationDrawerCreateTitle,
        drawerProcessTitle: dictionary.admin.integrationDrawerProcessTitle,
        drawerDescription: dictionary.admin.integrationDrawerDescription,
        entityIds: dictionary.admin.integrationEntityIds,
        entityIdsHint: dictionary.admin.integrationEntityIdsHint,
        stockSyncHint: dictionary.admin.integrationStockSyncHint,
        genericSyncHint: dictionary.admin.integrationGenericSyncHint,
        maxAttempts: dictionary.admin.integrationMaxAttempts,
        idempotencySuffix: dictionary.admin.integrationIdempotencySuffix,
        integrationReference: dictionary.admin.integrationReference,
        trigger: dictionary.admin.integrationTrigger,
        triggerPreset: dictionary.admin.integrationTriggerPreset,
        stockSyncReferenceHint: dictionary.admin.integrationStockSyncReferenceHint,
        stockSyncTriggerHint: dictionary.admin.integrationStockSyncTriggerHint,
        triggerManualDispatch: dictionary.admin.integrationTriggerManualDispatch,
        triggerManualAdjustment: dictionary.admin.integrationTriggerManualAdjustment,
        triggerOrderCommit: dictionary.admin.integrationTriggerOrderCommit,
        triggerStockCount: dictionary.admin.integrationTriggerStockCount,
        triggerTransfer: dictionary.admin.integrationTriggerTransfer,
        triggerPurchaseReceipt: dictionary.admin.integrationTriggerPurchaseReceipt,
        triggerPriceUpdate: dictionary.admin.integrationTriggerPriceUpdate,
        triggerProductUpdate: dictionary.admin.integrationTriggerProductUpdate,
        queueLimit: dictionary.admin.integrationQueueLimit,
        apply: dictionary.admin.inventoryApplyAdjustment,
        close: dictionary.admin.cancel,
        filterSearch: dictionary.admin.integrationFilterSearch,
        filterStatus: dictionary.admin.integrationStatus,
        filterChannel: dictionary.admin.integrationChannel,
        filterJobType: dictionary.admin.integrationJobType,
        clearFilters: dictionary.admin.clearFilters,
        summaryPending: dictionary.admin.integrationSummaryPending,
        summaryProcessing: dictionary.admin.integrationSummaryProcessing,
        summarySuccess: dictionary.admin.integrationSummarySuccess,
        summaryFailed: dictionary.admin.integrationSummaryFailed,
        summaryDeadLetter: dictionary.admin.integrationSummaryDeadLetter,
        emptyJobs: dictionary.admin.integrationEmptyJobs,
        nextAttemptAt: dictionary.admin.integrationNextAttemptAt,
        lastError: dictionary.admin.integrationLastError,
        createdAt: dictionary.admin.integrationCreatedAt,
        all: dictionary.admin.statusAll,
        validationEntityIds: dictionary.admin.integrationValidationEntityIds,
        validationQueueLimit: dictionary.admin.integrationValidationQueueLimit,
      }}
    />
  );
}
