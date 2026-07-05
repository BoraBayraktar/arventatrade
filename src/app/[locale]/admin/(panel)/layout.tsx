import { notFound, redirect } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { AdminPanelShell } from "@/ui/admin/panel-shell";

export default async function AdminPanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    redirect(`/${locale}`);
  }

  const localizedRole = user.role === "ADMIN" ? dictionary.admin.roleAdmin : dictionary.admin.roleEditor;

  return (
    <AdminPanelShell
      locale={locale}
      title={dictionary.admin.title}
      userName={user.name}
      userEmail={user.email}
      userRole={localizedRole}
      logoutLabel={dictionary.admin.logout}
      loadingLabel={dictionary.common.loading}
      menuItems={[
        { href: `/${locale}/admin`, label: dictionary.admin.dashboardMenu },
        { href: `/${locale}/admin/products`, label: dictionary.admin.productManager },
        { href: `/${locale}/admin/categories`, label: dictionary.admin.categoryManager },
        { href: `/${locale}/admin/orders`, label: dictionary.admin.orderManager },
        { href: `/${locale}/admin/integrations`, label: dictionary.admin.integrationManager },
        ...(user.role === "ADMIN" ? [{ href: `/${locale}/admin/customers`, label: dictionary.admin.customerManager }] : []),
        ...(user.role === "ADMIN" ? [{ href: `/${locale}/admin/users`, label: dictionary.admin.userManager }] : []),
        ...(user.role === "ADMIN" ? [{ href: `/${locale}/admin/audit-logs`, label: dictionary.admin.auditLogMenu }] : []),
        { href: `/${locale}/admin/storefront`, label: dictionary.admin.storefrontManager },
      ]}
    >
      {children}
    </AdminPanelShell>
  );
}
