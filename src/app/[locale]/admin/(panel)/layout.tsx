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
          {
            href: `/${locale}/admin/users`,
            label: dictionary.admin.userManagerGroup,
            children: [
              { href: `/${locale}/admin/customers`, label: dictionary.admin.customerManager },
              { href: `/${locale}/admin/users`, label: dictionary.admin.userManager },
              { href: `/${locale}/admin/audit-logs`, label: dictionary.admin.auditLogMenu },
            ],
          },
        ]
      : [];

  const menuItems: MenuItem[] = [
    {
      href: `/${locale}/admin/products`,
      label: dictionary.admin.productManager,
      children: [
        { href: `/${locale}/admin/products`, label: "Ürünler" },
        { href: `/${locale}/admin/product-questions`, label: dictionary.admin.questionManager },
        { href: `/${locale}/admin/categories`, label: dictionary.admin.categoryManager },
        { href: `/${locale}/admin/storefront`, label: dictionary.admin.storefrontManager },
        { href: `/${locale}/admin/product-attributes`, label: dictionary.admin.productAttributesTitle },
        { href: `/${locale}/admin/orders`, label: dictionary.admin.orderManager },
        { href: `/${locale}/admin/brands`, label: dictionary.admin.brandsTitle },
      ],
    },
    {
      href: `/${locale}/admin/inventory`,
      label: dictionary.admin.inventoryManager,
      children: [
        { href: `/${locale}/admin/inventory`, label: "Genel Bakış" },
        { href: `/${locale}/admin/inventory/quick-actions`, label: "Hızlı Barkod İşlemleri" },
        { href: `/${locale}/admin/inventory/products`, label: "Ürün Stokları" },
        { href: `/${locale}/admin/inventory/transactions`, label: dictionary.admin.inventoryTransactionsTitle },
        { href: `/${locale}/admin/inventory/counts`, label: dictionary.admin.inventoryStockCountTitle },
        { href: `/${locale}/admin/inventory/warehouses`, label: dictionary.admin.inventoryWarehousesTitle },
        { href: `/${locale}/admin/suppliers`, label: dictionary.admin.suppliersTitle },
        { href: `/${locale}/admin/inventory/exports`, label: "Dışa Aktarım Geçmişi" },
      ],
    },
    {
      href: `/${locale}/admin/documents`,
      label: dictionary.admin.documentManager,
      children: [
        { href: `/${locale}/admin/documents`, label: dictionary.admin.documentsMenuOverview },
        { href: `/${locale}/admin/documents/pending-invoices`, label: dictionary.admin.documentsMenuPendingInvoices },
        { href: `/${locale}/admin/documents/providers`, label: dictionary.admin.documentsMenuProviders },
        { href: `/${locale}/admin/documents/webhooks`, label: dictionary.admin.documentsMenuWebhooks },
      ],
    },
    {
      href: `/${locale}/admin/finance`,
      label: dictionary.admin.financeManager,
      children: [
        { href: `/${locale}/admin/finance`, label: dictionary.admin.financeMenuOverview },
        { href: `/${locale}/admin/finance/payables`, label: dictionary.admin.financeMenuSupplierPayables },
        { href: `/${locale}/admin/finance/receivables`, label: dictionary.admin.financeMenuCustomerReceivables },
        { href: `/${locale}/admin/finance/accounts`, label: dictionary.admin.financeMenuAccounts },
        { href: `/${locale}/admin/customer-accounts`, label: dictionary.admin.customerAccountsTitle },
        { href: `/${locale}/admin/finance/collections`, label: dictionary.admin.financeMenuCollections },
        { href: `/${locale}/admin/finance/payments`, label: dictionary.admin.financeMenuPayments },
        { href: `/${locale}/admin/finance/bank-cash`, label: dictionary.admin.financeMenuBankCash },
        { href: `/${locale}/admin/finance/transactions`, label: dictionary.admin.financeMenuTransactions },
        { href: `/${locale}/admin/finance/reports`, label: dictionary.admin.financeMenuReports },
      ],
    },
    {
      href: `/${locale}/admin/integrations`,
      label: dictionary.admin.integrationManager,
      children: [
        { href: `/${locale}/admin/integrations`, label: dictionary.admin.integrationManager },
        { href: `/${locale}/admin/integrations/trendyol`, label: dictionary.admin.integrationMarketplaceTrendyol },
        { href: `/${locale}/admin/inventory/external-events`, label: "Harici Stok Eventleri" },
      ],
    },
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
