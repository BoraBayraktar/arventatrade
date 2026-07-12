import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth";
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
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
  const user = await identityService.getAuthenticatedUser(token);
  const socialGoogleHref = identityService.getGoogleOAuthConfig()
    ? `/api/identity/oauth/google/start?redirectTo=${encodeURIComponent(`/${locale}/admin`)}`
    : null;
  const socialAppleHref = identityService.getAppleOAuthConfig()
    ? `/api/identity/oauth/apple/start?redirectTo=${encodeURIComponent(`/${locale}/admin`)}`
    : null;
  const socialFacebookHref = identityService.getFacebookOAuthConfig()
    ? `/api/identity/oauth/facebook/start?redirectTo=${encodeURIComponent(`/${locale}/admin`)}`
    : null;

  if (user) {
    redirect(`/${locale}/admin`);
  }

  const requestedRedirect = query.redirect;
  const safeRedirect = requestedRedirect && requestedRedirect.startsWith(`/${locale}`)
    ? requestedRedirect
    : `/${locale}/admin`;

  return (
    <main className={styles.loginShell}>
      <section className={styles.loginFormPane}>
        <LoginForm
          locale={locale}
          redirectTo={safeRedirect}
          socialGoogleHref={socialGoogleHref}
          socialAppleHref={socialAppleHref}
          socialFacebookHref={socialFacebookHref}
          labels={{
            title: dictionary.admin.loginTitle,
            subtitle: dictionary.admin.loginSubtitle,
            email: dictionary.admin.email,
            password: dictionary.admin.password,
            submit: dictionary.admin.loginButton,
            invalidCredentials: dictionary.admin.invalidCredentials,
            loading: dictionary.common.loading,
            forgotPassword: dictionary.auth.forgotPassword,
            rememberMe: dictionary.auth.rememberMe,
            socialDivider: dictionary.auth.socialDivider,
            socialGoogle: dictionary.auth.socialGoogle,
            socialApple: dictionary.auth.socialApple,
            socialFacebook: dictionary.auth.socialFacebook,
            socialComingSoon: dictionary.auth.socialComingSoon,
          }}
        />
      </section>

      <section className={styles.loginVisualPane} aria-hidden>
        <div className={styles.loginVisualFrame}>
          <div className={styles.loginVisualOverlay} />

          <header className={styles.loginVisualTitle}>
            <h2>{dictionary.admin.title}</h2>
            <p>{dictionary.admin.phase2Note}</p>
          </header>

          <div className={`${styles.authSlide} ${styles.slide1}`}>
            <div className={`${styles.slideCard} ${styles.slideCardTop}`} />
            <div className={`${styles.slideCard} ${styles.slideCardBottom}`} />
            <div className={styles.slidePill} />
          </div>

          <div className={`${styles.authSlide} ${styles.slide2}`}>
            <div className={`${styles.slideCard} ${styles.slideCardAlt}`} />
            <div className={`${styles.slideCard} ${styles.slideCardSoft}`} />
            <div className={styles.slidePillAlt} />
          </div>

          <div className={`${styles.authSlide} ${styles.slide3}`}>
            <div className={`${styles.slideCard} ${styles.slideCardTop}`} />
            <div className={`${styles.slideCard} ${styles.slideCardSoft}`} />
            <div className={styles.slidePill} />
          </div>

          <div className={styles.loginDots}>
            <span className={`${styles.loginDot} ${styles.dot1}`} />
            <span className={`${styles.loginDot} ${styles.dot2}`} />
            <span className={`${styles.loginDot} ${styles.dot3}`} />
          </div>
        </div>
      </section>
    </main>
  );
}
