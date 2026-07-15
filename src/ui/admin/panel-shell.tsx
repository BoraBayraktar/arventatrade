"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  BadgeDollarSign,
  Bell,
  Barcode,
  ChevronRight,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  DatabaseZap,
  FileOutput,
  FileClock,
  Files,
  FolderTree,
  HandCoins,
  LayoutGrid,
  Landmark,
  Menu,
  Package,
  PackageSearch,
  PlugZap,
  PieChart,
  ReceiptText,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  Warehouse,
  Wallet,
  Webhook,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/ui/admin/logout-button";

export type MenuItem = {
  href: string;
  label: string;
  children?: MenuItem[];
};

const adminMenuIcons: Array<{ route: string; icon: LucideIcon }> = [
  { route: "/admin/products", icon: Package },
  { route: "/admin/inventory/quick-actions", icon: Barcode },
  { route: "/admin/inventory/products", icon: PackageSearch },
  { route: "/admin/inventory/transactions", icon: ClipboardList },
  { route: "/admin/inventory/counts", icon: ClipboardCheck },
  { route: "/admin/inventory/warehouses", icon: Warehouse },
  { route: "/admin/inventory/exports", icon: FileOutput },
  { route: "/admin/inventory/external-events", icon: DatabaseZap },
  { route: "/admin/inventory", icon: Boxes },
  { route: "/admin/product-questions", icon: ClipboardList },
  { route: "/admin/categories", icon: FolderTree },
  { route: "/admin/storefront", icon: LayoutGrid },
  { route: "/admin/orders", icon: ReceiptText },
  { route: "/admin/brands", icon: Users },
  { route: "/admin/suppliers", icon: Users },
  { route: "/admin/customer-accounts", icon: Users },
  { route: "/admin/product-attributes", icon: ClipboardList },
  { route: "/admin/documents/pending-invoices", icon: FileClock },
  { route: "/admin/documents/providers", icon: PlugZap },
  { route: "/admin/documents/webhooks", icon: Webhook },
  { route: "/admin/documents", icon: Files },
  { route: "/admin/finance/payables", icon: HandCoins },
  { route: "/admin/finance/receivables", icon: BadgeDollarSign },
  { route: "/admin/finance/accounts", icon: Landmark },
  { route: "/admin/finance/collections", icon: Wallet },
  { route: "/admin/finance/payments", icon: CreditCard },
  { route: "/admin/finance/reports", icon: PieChart },
  { route: "/admin/finance", icon: BarChart3 },
  { route: "/admin/documents", icon: ReceiptText },
  { route: "/admin/integrations", icon: Workflow },
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
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [openMenuGroups, setOpenMenuGroups] = useState<Record<string, boolean>>({});
  const [menuSearch, setMenuSearch] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const loadingNotificationsRef = useRef(false);

  async function loadNotifications() {
    if (loadingNotificationsRef.current) {
      return;
    }

    loadingNotificationsRef.current = true;
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
      loadingNotificationsRef.current = false;
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    if (document.visibilityState !== "visible") {
      return undefined;
    }

    const initialTimer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    let interval: number | null = null;

    const startInterval = () => {
      if (interval !== null) {
        window.clearInterval(interval);
      }

      interval = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          void loadNotifications();
        }
      }, 90000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
        startInterval();
        return;
      }

      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    };

    startInterval();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(initialTimer);
      if (interval !== null) {
        window.clearInterval(interval);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    const timer = window.setTimeout(() => {
      setNotificationsOpen(false);
      setMobileMenuOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
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

  function isMenuItemActive(item: MenuItem): boolean {
    const url = new URL(item.href, "http://localhost");
    const section = url.searchParams.get("section");
    const itemPath = url.pathname;

    if (section) {
      return pathname === itemPath && searchParams.get("section") === section;
    }

    if (item.children?.length) {
      return pathname === itemPath || item.children.some((child) => isMenuItemActive(child));
    }

    return pathname === itemPath;
  }

  function renderMenuItem(item: MenuItem, depth = 0, compact = false): ReactElement {
    const active = isMenuItemActive(item);
    const hasChildren = Boolean(item.children?.length);
    const MenuIcon = resolveMenuIcon(item.href);
    const searchingMenu = menuSearch.trim().length > 0;

    if (hasChildren) {
      const isOpen = searchingMenu || (openMenuGroups[item.href] ?? active);

      return (
        <div key={item.href} className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setOpenMenuGroups((current) => ({
                ...current,
                [item.href]: !(current[item.href] ?? active),
              }));
            }}
            className={cn(
              "flex w-full items-center rounded-lg text-left font-medium transition-colors",
              compact ? "h-10 px-2.5 text-[14px]" : "h-11 px-3 text-[15px]",
              depth > 0 && (compact ? "pl-9" : "pl-10"),
              active
                ? "bg-blue-50 text-blue-700 shadow-none"
                : isOpen
                  ? "bg-slate-50 text-slate-900"
                  : "text-slate-700 hover:bg-slate-50/80",
            )}
            aria-expanded={isOpen}
          >
            <MenuIcon className={cn("mr-3 shrink-0 text-slate-500", compact ? "h-4 w-4" : "h-4 w-4")} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
                isOpen ? "rotate-90" : "rotate-0",
              )}
              aria-hidden="true"
            />
          </button>
          <div className={cn(isOpen ? "block" : "hidden")}>
            <div className="space-y-0.5 pt-1">
              {item.children?.map((child) => renderMenuItem(child, depth + 1, compact))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center rounded-lg font-normal transition-colors",
          compact ? "h-10 px-2.5 text-[14px]" : "h-11 px-3 text-[15px]",
          depth > 0 && (compact ? "h-10 pl-9" : "h-10 pl-10 text-[14px]"),
          active
            ? "bg-blue-50 font-medium text-blue-700 shadow-none"
            : "text-slate-700 hover:bg-slate-50/80 hover:text-slate-950",
        )}
      >
        <MenuIcon className={cn("mr-3 shrink-0 text-slate-500", compact ? "h-4 w-4" : "h-4 w-4")} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </Link>
    );
  }

  function filterMenuTree(item: MenuItem, query: string): MenuItem | null {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

    if (!normalizedQuery) {
      return item;
    }

    const selfMatches = item.label.toLocaleLowerCase("tr-TR").includes(normalizedQuery);
    const filteredChildren = item.children
      ?.map((child) => filterMenuTree(child, normalizedQuery))
      .filter((child): child is MenuItem => child !== null);

    if (selfMatches) {
      return {
        ...item,
        children: filteredChildren,
      };
    }

    if (filteredChildren && filteredChildren.length > 0) {
      return {
        ...item,
        children: filteredChildren,
      };
    }

    return null;
  }

  const visibleMenuItems = menuItems
    .map((item) => filterMenuTree(item, menuSearch))
    .filter((item): item is MenuItem => item !== null);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto grid min-h-screen max-w-screen-2xl items-start gap-3 px-2 py-2 lg:grid-cols-[280px_1fr]">
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Mobil menüyü kapat"
              className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-[min(88vw,332px)] flex-col overflow-hidden rounded-r-[24px] border-r border-slate-200 bg-white shadow-2xl">
              <Card className="flex h-full flex-col rounded-none border-0 shadow-none">
                <CardHeader className="space-y-3 border-b border-slate-200 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                        <Store className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Backoffice</p>
                        <CardTitle className="truncate text-base text-slate-900">{title}</CardTitle>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Kapat">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={menuSearch}
                      onChange={(event) => setMenuSearch(event.target.value)}
                      placeholder="Ara"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm shadow-none focus-visible:ring-slate-300"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-4 pt-0">
                  <div className="shrink-0 border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
                    <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] text-slate-500">
                      <p className="truncate">{userEmail}</p>
                      <Badge variant="secondary" className="shrink-0 rounded-md bg-slate-100 uppercase text-slate-600">{userRole}</Badge>
                    </div>
                  </div>

                  <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 py-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
                    {visibleMenuItems.map((item) => renderMenuItem(item, 0, true))}
                  </nav>

                  <div className="shrink-0 px-4">
                    <Separator className="mb-3 bg-slate-200" />
                    <div className="grid gap-2">
                      <Button asChild variant="secondary" className="h-10 justify-between rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
                        <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)}>
                          {storeLabel}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <LogoutButton locale={locale} label={logoutLabel} loadingLabel={loadingLabel} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : null}

        <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:min-h-0">
          <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border-y-0 border-l-0 border-r border-slate-200 bg-white shadow-none">
            <CardHeader className="space-y-3 border-b border-slate-200 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <Store className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Backoffice</p>
                  <CardTitle className="truncate text-base text-slate-900">{title}</CardTitle>
                </div>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={menuSearch}
                  onChange={(event) => setMenuSearch(event.target.value)}
                  placeholder="Ara"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm shadow-none focus-visible:ring-slate-300"
                />
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 px-0 pb-4 pt-0">
              <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-3 [scrollbar-width:thin]">
                {visibleMenuItems.map((item) => renderMenuItem(item))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <section className="grid min-h-0 content-start gap-4">
          <header className="flex h-[72px] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white px-3 py-2">
            <div className="min-w-0 flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2 lg:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Menüyü aç"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Menü</span>
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-semibold leading-5 text-neutral-950">{userName}</p>
                <div className="flex min-w-0 items-center gap-2 text-xs leading-4 text-neutral-500">
                <p className="truncate">{userEmail}</p>
                <span aria-hidden="true" className="text-neutral-300">•</span>
                <p className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
                  {userRole}
                </p>
                </div>
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
