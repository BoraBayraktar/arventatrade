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
      }}
    />
  );
}
