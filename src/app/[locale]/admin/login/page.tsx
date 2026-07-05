import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { identityService } from "@/modules/identity/services/identity.service";
import { LoginForm } from "@/ui/admin/login-form";
import styles from "@/ui/admin/admin.module.css";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = await identityService.getAuthenticatedUser(token);

  if (user) {
    redirect(`/${locale}/admin`);
  }

  const requestedRedirect = query.redirect;
  const safeRedirect = requestedRedirect && requestedRedirect.startsWith(`/${locale}`)
    ? requestedRedirect
    : `/${locale}/admin`;

  return (
    <main className={`container ${styles.loginShell}`}>
      <LoginForm
        locale={locale}
        redirectTo={safeRedirect}
        labels={{
          title: dictionary.admin.loginTitle,
          subtitle: dictionary.admin.loginSubtitle,
          email: dictionary.admin.email,
          password: dictionary.admin.password,
          submit: dictionary.admin.loginButton,
          invalidCredentials: dictionary.admin.invalidCredentials,
          loading: dictionary.common.loading,
        }}
      />
    </main>
  );
}
