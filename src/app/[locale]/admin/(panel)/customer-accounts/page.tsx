import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { customerAccountService } from "@/modules/customers/services/customer-account.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { CustomerAccountManager } from "@/ui/admin/customer-account-manager";

export default async function AdminCustomerAccountsPage({
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
  const items = await customerAccountService.listCustomerAccounts();

  return (
    <CustomerAccountManager
      items={items}
      labels={{
        title: dictionary.admin.customerAccountsTitle,
        description: dictionary.admin.customerAccountsDescription,
        createTitle: dictionary.admin.customerAccountsCreateTitle,
        slug: dictionary.admin.slug,
        name: dictionary.admin.name,
        email: dictionary.admin.email,
        phone: dictionary.admin.supplierPhone,
        taxNumber: dictionary.admin.supplierTaxNumber,
        address: dictionary.admin.customerAccountsAddress,
        note: dictionary.admin.documentsNote,
        create: dictionary.admin.create,
        saving: dictionary.common.loading,
        empty: dictionary.admin.customerAccountsEmpty,
      }}
    />
  );
}
