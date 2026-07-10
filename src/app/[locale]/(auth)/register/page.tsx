import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { identityService } from "@/modules/identity/services/identity.service";
import { AuthForm } from "@/ui/shop/auth-form";

export default async function ShopRegisterPage({
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
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
  const user = await identityService.getAuthenticatedUser(token);

  if (user) {
    redirect(`/${locale}`);
  }

  return (
    <AuthForm
      locale={locale}
      mode="register"
      redirectTo={`/${locale}`}
      switchHref="login"
      labels={{
        title: dictionary.auth.registerTitle,
        subtitle: dictionary.auth.registerSubtitle,
        email: dictionary.auth.email,
        password: dictionary.auth.password,
        name: dictionary.auth.name,
        submit: dictionary.auth.registerButton,
        loading: dictionary.common.loading,
        switchText: dictionary.auth.haveAccount,
        switchCta: dictionary.auth.loginButton,
        invalidCredentials: dictionary.auth.registerFailed,
        emailExists: dictionary.auth.emailExists,
        forgotPassword: dictionary.auth.forgotPassword,
        rememberMe: dictionary.auth.rememberMe,
        socialDivider: dictionary.auth.socialDivider,
        socialGoogle: dictionary.auth.socialGoogle,
        socialApple: dictionary.auth.socialApple,
        socialComingSoon: dictionary.auth.socialComingSoon,
        passwordStrengthWeak: dictionary.auth.passwordStrengthWeak,
        passwordStrengthMedium: dictionary.auth.passwordStrengthMedium,
        passwordStrengthStrong: dictionary.auth.passwordStrengthStrong,
        heroEyebrow: dictionary.auth.heroEyebrow,
        heroTitle: dictionary.auth.registerHeroTitle,
        heroBody: dictionary.auth.registerHeroBody,
        featureFast: dictionary.auth.featureFast,
        featureSafe: dictionary.auth.featureSafe,
        featureOrders: dictionary.auth.featureOrders,
      }}
    />
  );
}
