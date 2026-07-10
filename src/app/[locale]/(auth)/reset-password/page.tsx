import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { PasswordResetForm } from "@/ui/shop/password-reset-form";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);

  return (
    <PasswordResetForm
      locale={locale}
      token={query.token ?? ""}
      labels={{
        title: dictionary.auth.resetPasswordTitle,
        subtitle: dictionary.auth.resetPasswordSubtitle,
        password: dictionary.auth.password,
        confirmPassword: dictionary.auth.confirmPassword,
        submit: dictionary.auth.resetPasswordButton,
        success: dictionary.auth.resetPasswordSuccess,
        invalidToken: dictionary.auth.resetPasswordInvalidToken,
        mismatch: dictionary.auth.resetPasswordMismatch,
        failure: dictionary.auth.resetPasswordFailure,
        backToLogin: dictionary.auth.backToLogin,
        loading: dictionary.common.loading,
        heroEyebrow: dictionary.auth.heroEyebrow,
        heroTitle: dictionary.auth.resetPasswordHeroTitle,
        heroBody: dictionary.auth.resetPasswordHeroBody,
        passwordStrengthWeak: dictionary.auth.passwordStrengthWeak,
        passwordStrengthMedium: dictionary.auth.passwordStrengthMedium,
        passwordStrengthStrong: dictionary.auth.passwordStrengthStrong,
      }}
    />
  );
}
