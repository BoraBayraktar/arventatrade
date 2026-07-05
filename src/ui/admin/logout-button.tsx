"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  locale: string;
  label: string;
  loadingLabel: string;
};

export function LogoutButton({ locale, label, loadingLabel }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch("/api/identity/logout", {
        method: "POST",
      });
      router.push(`/${locale}/admin/login`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleLogout} disabled={loading}>
      {loading ? loadingLabel : label}
    </Button>
  );
}
