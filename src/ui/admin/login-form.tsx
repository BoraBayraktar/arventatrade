"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "@/ui/admin/admin.module.css";

type LoginFormProps = {
  locale: string;
  redirectTo?: string;
  labels: {
    email: string;
    password: string;
    submit: string;
    invalidCredentials: string;
    title: string;
    subtitle: string;
    loading: string;
  };
};

export function LoginForm({ locale, redirectTo, labels }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/identity/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError(labels.invalidCredentials);
        return;
      }

      const target = redirectTo && redirectTo.startsWith(`/${locale}`)
        ? redirectTo
        : `/${locale}/admin`;

      router.push(target);
      router.refresh();
    } catch {
      setError(labels.invalidCredentials);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={styles.loginCard}>
      <CardHeader>
        <CardTitle className={styles.loginTitle}>{labels.title}</CardTitle>
        <CardDescription className={styles.loginSubtitle}>{labels.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className={styles.form} onSubmit={handleSubmit}>
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
              required
            />
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? labels.loading : labels.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
