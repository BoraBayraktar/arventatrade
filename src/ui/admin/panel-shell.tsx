"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/ui/admin/logout-button";

export type MenuItem = {
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
        <aside className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.05)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Backoffice</p>
            <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-neutral-950">{title}</h1>
          </div>

          <nav className="mt-4 grid gap-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-neutral-100 font-semibold text-neutral-950 shadow-sm ring-1 ring-neutral-200"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                  )}
                >
                  <span
                    className={cn(
                      "mr-3 h-4 w-1 rounded-full transition-opacity",
                      active ? "bg-neutral-950 opacity-100" : "bg-neutral-300 opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Signed in as</p>
            <p className="mt-0.5 text-sm font-semibold text-neutral-950">{userName}</p>
            <p className="text-xs text-neutral-500">{userRole}</p>
          </div>
        </aside>

        <section className="grid gap-4">
          <header className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Workspace</p>
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
