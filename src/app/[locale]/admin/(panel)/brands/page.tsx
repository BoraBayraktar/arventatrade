import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { BrandDirectoryManager } from "@/ui/admin/brand-directory-manager";

export default async function AdminBrandsPage({
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
  const items = await catalogAdminService.listBrands();

  return (
    <BrandDirectoryManager
      items={items}
      labels={{
        title: dictionary.admin.brandsTitle,
        description: dictionary.admin.brandsDescription,
        createTitle: dictionary.admin.brandsCreateTitle,
        slug: dictionary.admin.slug,
        name: dictionary.admin.brandName,
        productCount: dictionary.admin.productCount,
        create: dictionary.admin.create,
        saving: dictionary.common.loading,
        empty: dictionary.admin.brandsEmpty,
      }}
    />
  );
}
