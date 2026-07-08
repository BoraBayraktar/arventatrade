import { notFound, redirect } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { AdminPanelShell, type MenuItem } from "@/ui/admin/panel-shell";

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
  const adminMenuItems: MenuItem[] =
    user.role === "ADMIN"
      ? [
          { href: `/${locale}/admin/customers`, label: dictionary.admin.customerManager },
          { href: `/${locale}/admin/users`, label: dictionary.admin.userManager },
          { href: `/${locale}/admin/audit-logs`, label: dictionary.admin.auditLogMenu },
        ]
      : [];

  const menuItems: MenuItem[] = [
    { href: `/${locale}/admin/products`, label: dictionary.admin.productManager },
    { href: `/${locale}/admin/inventory`, label: dictionary.admin.inventoryManager },
    { href: `/${locale}/admin/product-questions`, label: dictionary.admin.questionManager },
    { href: `/${locale}/admin/categories`, label: dictionary.admin.categoryManager },
    { href: `/${locale}/admin/storefront`, label: dictionary.admin.storefrontManager },
    { href: `/${locale}/admin/orders`, label: dictionary.admin.orderManager },
    { href: `/${locale}/admin/integrations`, label: dictionary.admin.integrationManager },
    ...adminMenuItems,
  ];

  return (
    <AdminPanelShell
      locale={locale}
      title={dictionary.admin.title}
      userName={user.name}
      userEmail={user.email}
      userRole={localizedRole}
      logoutLabel={dictionary.admin.logout}
      loadingLabel={dictionary.common.loading}
      storeLabel={dictionary.admin.goStore}
      notificationsLabel={dictionary.admin.notifications}
      noNotificationsLabel={dictionary.admin.noNotifications}
      markAllReadLabel={dictionary.admin.markAllRead}
      menuItems={menuItems}
    >
      {children}
    </AdminPanelShell>
  );
}
