"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/ui/admin/logout-button";

type MenuItem = {
  href: string;
  label: string;
};

type Props = {
  locale: string;
  title: string;
  userName: string;
  userEmail: string;
  userRole: string;
  logoutLabel: string;
  loadingLabel: string;
  menuItems: MenuItem[];
  children: React.ReactNode;
};

export function AdminPanelShell({
  locale,
  title,
  userName,
  userEmail,
  userRole,
  logoutLabel,
  loadingLabel,
  menuItems,
  children,
}: Props) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid max-w-screen-2xl gap-4 px-4 py-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-neutral-200 bg-white p-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Backoffice</p>
          <h1 className="px-2 pt-1 text-xl font-semibold tracking-tight text-neutral-950">{title}</h1>

          <nav className="mt-6 grid gap-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-black text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="grid gap-4">
          <header className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="sm:text-right">
              <p className="text-sm font-semibold text-neutral-950">{userName}</p>
              <p className="text-xs text-neutral-500">{userEmail}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-400">{userRole}</p>
            </div>
            <LogoutButton locale={locale} label={logoutLabel} loadingLabel={loadingLabel} />
          </header>

          <div className="grid gap-4">{children}</div>
        </section>
      </div>
    </main>
  );
}
