"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "@/ui/shop/auth.module.css";

type Labels = {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  name: string;
  submit: string;
  loading: string;
  switchText: string;
  switchCta: string;
  invalidCredentials: string;
  emailExists: string;
};

type Props = {
  locale: string;
  mode: "login" | "register";
  redirectTo: string;
  switchHref: string;
  labels: Labels;
};

export function AuthForm({ locale, mode, redirectTo, switchHref, labels }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "register" ? "/api/identity/register" : "/api/identity/login";
      const body = mode === "register" ? { name, email, password } : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setError(labels.emailExists);
          return;
        }

        setError(labels.invalidCredentials);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(labels.invalidCredentials);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.authShell}>
      <section className={styles.formPane}>
        <Card className={styles.authCard}>
          <CardHeader>
            <CardTitle className={styles.authTitle}>{labels.title}</CardTitle>
            <CardDescription className={styles.authSubtitle}>{labels.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className={styles.authForm} onSubmit={handleSubmit}>
              {mode === "register" ? (
                <div className="grid gap-2">
                  <Label>{labels.name}</Label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    required
                  />
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label>{labels.email}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>{labels.password}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {error ? <p className={styles.authError}>{error}</p> : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? labels.loading : labels.submit}
              </Button>

              <p className={styles.authSwitch}>
                {labels.switchText}{" "}
                <Link href={`/${locale}/${switchHref}`}>{labels.switchCta}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className={styles.visualPane} aria-hidden>
        <div className={styles.visualFrame}>
          <div className={styles.visualOverlay} />

          <header className={styles.visualTitle}>
            <h2>{labels.title}</h2>
            <p>{labels.subtitle}</p>
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

          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.dot1}`} />
            <span className={`${styles.dot} ${styles.dot2}`} />
            <span className={`${styles.dot} ${styles.dot3}`} />
          </div>
        </div>
      </section>
    </main>
  );
}
