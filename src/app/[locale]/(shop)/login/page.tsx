import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { identityService } from "@/modules/identity/services/identity.service";
import { AuthForm } from "@/ui/shop/auth-form";

export default async function ShopLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = await identityService.getAuthenticatedUser(token);

  if (user) {
    redirect(`/${locale}`);
  }

  return (
    <AuthForm
      locale={locale}
      mode="login"
      redirectTo={`/${locale}`}
      switchHref="register"
      labels={{
        title: dictionary.auth.loginTitle,
        subtitle: dictionary.auth.loginSubtitle,
        email: dictionary.auth.email,
        password: dictionary.auth.password,
        name: dictionary.auth.name,
        submit: dictionary.auth.loginButton,
        loading: dictionary.common.loading,
        switchText: dictionary.auth.noAccount,
        switchCta: dictionary.auth.registerButton,
        invalidCredentials: dictionary.auth.invalidCredentials,
        emailExists: dictionary.auth.emailExists,
      }}
    />
  );
}
