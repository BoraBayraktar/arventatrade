import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { financeOverviewService } from "@/modules/finance/services/finance-overview.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { FinanceOverviewManager } from "@/ui/admin/finance-overview-manager";

export default async function AdminFinancePage({
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
  const overview = await financeOverviewService.getOverview(locale);

  return (
    <FinanceOverviewManager
      locale={locale}
      overview={overview}
      labels={{
        title: dictionary.admin.financeOverviewTitle,
        description: dictionary.admin.financeOverviewDescription,
        sectionsTitle: dictionary.admin.financeOverviewSectionsTitle,
        openRoute: dictionary.admin.financeOverviewOpenRoute,
      }}
    />
  );
}
