import { notFound, redirect } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { rbacService } from "@/modules/identity/services/rbac.service";
import { RoleManager } from "@/ui/admin/role-manager";

export default async function AdminRolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const user = await getCurrentUserFromContext();
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const canManageUsers = await rbacService.hasPermission(user, "users.manage");
  if (!canManageUsers) {
    redirect(`/${locale}/admin`);
  }

  const dictionary = getDictionary(locale as Locale);
  const [roles, permissions] = await Promise.all([
    rbacService.listRoles(),
    rbacService.listPermissions(),
  ]);

  return (
    <RoleManager
      initialRoles={roles}
      permissions={permissions}
      labels={{
        title: dictionary.admin.roleManager,
        subtitle: dictionary.admin.roleManagerSubtitle,
        newRole: dictionary.admin.newRole,
        key: dictionary.admin.roleKey,
        name: dictionary.admin.name,
        description: dictionary.admin.description,
        permissions: dictionary.admin.permissions,
        save: dictionary.admin.save,
        create: dictionary.admin.create,
        cancel: dictionary.admin.cancel,
        edit: dictionary.admin.edit,
        delete: dictionary.admin.delete,
        systemRole: dictionary.admin.systemRole,
        active: dictionary.admin.active,
        passive: dictionary.admin.passive,
        users: dictionary.admin.users,
        operationFailed: dictionary.admin.operationFailed,
        permissionModules: dictionary.admin.permissionModules,
      }}
    />
  );
}
