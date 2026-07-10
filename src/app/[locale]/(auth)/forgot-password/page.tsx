import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { PasswordRecoveryForm } from "@/ui/shop/password-recovery-form";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);

  return (
    <PasswordRecoveryForm
      locale={locale}
      labels={{
        title: dictionary.auth.forgotPasswordTitle,
        subtitle: dictionary.auth.forgotPasswordSubtitle,
        email: dictionary.auth.email,
        submit: dictionary.auth.forgotPasswordButton,
        success: dictionary.auth.forgotPasswordSuccess,
        failure: dictionary.auth.forgotPasswordFailure,
        backToLogin: dictionary.auth.backToLogin,
        loading: dictionary.common.loading,
        heroEyebrow: dictionary.auth.heroEyebrow,
        heroTitle: dictionary.auth.forgotPasswordHeroTitle,
        heroBody: dictionary.auth.forgotPasswordHeroBody,
      }}
    />
  );
}
