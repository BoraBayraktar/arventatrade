import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { SupplierDirectoryManager } from "@/ui/admin/supplier-directory-manager";

export default async function AdminSuppliersPage({
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
  const items = await catalogAdminService.listSuppliers();

  return (
    <SupplierDirectoryManager
      items={items}
      labels={{
        title: dictionary.admin.suppliersTitle,
        description: dictionary.admin.suppliersDescription,
        createTitle: dictionary.admin.suppliersCreateTitle,
        slug: dictionary.admin.slug,
        name: dictionary.admin.name,
        email: dictionary.admin.supplierEmail,
        phone: dictionary.admin.supplierPhone,
        taxNumber: dictionary.admin.supplierTaxNumber,
        create: dictionary.admin.create,
        saving: dictionary.common.loading,
        empty: dictionary.admin.suppliersEmpty,
      }}
    />
  );
}
