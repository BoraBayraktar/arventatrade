"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  ClipboardList,
  FolderTree,
  LayoutGrid,
  Package,
  ReceiptText,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/ui/admin/logout-button";

export type MenuItem = {
  href: string;
  label: string;
};

const adminMenuIcons: Array<{ route: string; icon: LucideIcon }> = [
  { route: "/admin/products", icon: Package },
  { route: "/admin/inventory", icon: Boxes },
  { route: "/admin/product-questions", icon: ClipboardList },
  { route: "/admin/categories", icon: FolderTree },
  { route: "/admin/storefront", icon: LayoutGrid },
  { route: "/admin/orders", icon: ReceiptText },
  { route: "/admin/integrations", icon: Boxes },
  { route: "/admin/customers", icon: Users },
  { route: "/admin/users", icon: UserRound },
  { route: "/admin/audit-logs", icon: ShieldCheck },
];

function resolveMenuIcon(href: string): LucideIcon {
  const matched = adminMenuIcons.find((entry) => href.includes(entry.route));
  return matched?.icon ?? LayoutGrid;
}

type Props = {
  locale: string;
  title: string;
  userName: string;
  userEmail: string;
  userRole: string;
  logoutLabel: string;
  loadingLabel: string;
  storeLabel: string;
  notificationsLabel: string;
  noNotificationsLabel: string;
  markAllReadLabel: string;
  menuItems: MenuItem[];
  children: React.ReactNode;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  linkUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export function AdminPanelShell({
  locale,
  title,
  userName,
  userEmail,
  userRole,
  logoutLabel,
  loadingLabel,
  storeLabel,
  notificationsLabel,
  noNotificationsLabel,
  markAllReadLabel,
  menuItems,
  children,
}: Props) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  async function loadNotifications() {
    setLoadingNotifications(true);
    try {
      const response = await fetch("/api/admin/notifications?page=1&pageSize=8", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        items?: NotificationItem[];
        unreadCount?: number;
      };
      setNotifications(payload.items ?? []);
      setUnreadCount(payload.unreadCount ?? 0);
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onOutsidePointer = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("mousedown", onOutsidePointer);
    return () => {
      window.removeEventListener("mousedown", onOutsidePointer);
    };
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  async function markNotificationAsRead(notificationId: string) {
    let decremented = false;
    setNotifications((prev) => prev.map((item) => {
      if (item.id !== notificationId) {
        return item;
      }

      if (!item.readAt) {
        decremented = true;
      }

      return { ...item, readAt: item.readAt ?? new Date().toISOString() };
    }));
    if (decremented) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    await fetch(`/api/admin/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);

    await fetch("/api/admin/notifications/read-all", {
      method: "PATCH",
    });
  }

  function resolveLocalizedLink(linkUrl: string | null) {
    if (!linkUrl) {
      return null;
    }

    if (linkUrl.startsWith("/admin")) {
      return `/${locale}${linkUrl}`;
    }

    return linkUrl;
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid items-start max-w-screen-2xl gap-3 px-2 py-2 lg:grid-cols-[260px_1fr]">
        <aside className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.05)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Backoffice</p>
            <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-neutral-950">{title}</h1>
          </div>

          <nav className="mt-4 grid gap-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              const MenuIcon = resolveMenuIcon(item.href);

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
                  <MenuIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

        </aside>

        <section className="grid content-start gap-4">
          <header className="flex h-[72px] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-5 text-neutral-950">{userName}</p>
              <div className="flex min-w-0 items-center gap-2 text-xs leading-4 text-neutral-500">
                <p className="truncate">{userEmail}</p>
                <span aria-hidden="true" className="text-neutral-300">•</span>
                <p className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
                  {userRole}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative" ref={notificationRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={notificationsLabel}
                  title={notificationsLabel}
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                      {Math.min(unreadCount, 99)}
                    </span>
                  ) : null}
                </Button>

                {notificationsOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
                      <p className="text-sm font-semibold text-neutral-900">{notificationsLabel}</p>
                      <Button type="button" variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                        {markAllReadLabel}
                      </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <p className="px-3 py-3 text-sm text-neutral-500">{loadingLabel}</p>
                      ) : notifications.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-neutral-500">{noNotificationsLabel}</p>
                      ) : (
                        notifications.map((item) => {
                          const localizedLink = resolveLocalizedLink(item.linkUrl);
                          const content = (
                            <>
                              <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{item.title}</p>
                              <p className="line-clamp-2 text-xs text-neutral-600">{item.message}</p>
                            </>
                          );

                          if (!localizedLink) {
                            return (
                              <button
                                key={item.id}
                                type="button"
                                className="grid w-full gap-1 border-b border-neutral-100 px-3 py-2 text-left hover:bg-neutral-50"
                                onClick={() => markNotificationAsRead(item.id)}
                              >
                                {content}
                              </button>
                            );
                          }

                          return (
                            <Link
                              key={item.id}
                              href={localizedLink}
                              className="grid gap-1 border-b border-neutral-100 px-3 py-2 hover:bg-neutral-50"
                              onClick={() => {
                                void markNotificationAsRead(item.id);
                                setNotificationsOpen(false);
                              }}
                            >
                              {content}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <Button asChild variant="outline" size="icon">
                <Link href={`/${locale}`} aria-label={storeLabel} title={storeLabel}>
                  <Store className="h-4 w-4" />
                </Link>
              </Button>
              <LogoutButton locale={locale} label={logoutLabel} loadingLabel={loadingLabel} />
            </div>
          </header>

          <div className="grid gap-4">{children}</div>
        </section>
      </div>
    </main>
  );
}
