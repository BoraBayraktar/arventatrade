"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn, LogOut, MessageSquare, Package, Shield, TicketPercent, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import styles from "@/ui/shop/surface.module.css";

type UserMenuProps = {
	locale: string;
	initialUser?: AuthUser | null;
};

type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "EDITOR" | "CUSTOMER";
};

export function UserMenu({ locale, initialUser = null }: UserMenuProps) {
	const labels = {
		login: "Giriş Yap",
		account: "Hesabım",
		adminPanel: "Admin Paneli",
		orders: "Siparişlerim",
		coupons: "İndirim Kuponlarım",
		messages: "Mesajlarım",
		logout: "Çıkış Yap",
		loginMenu: "Giriş Yap",
		registerMenu: "Kayıt Ol",
	};

	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onOutsidePointer = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		window.addEventListener("mousedown", onOutsidePointer);

		return () => {
			window.removeEventListener("mousedown", onOutsidePointer);
		};
	}, []);

	async function logout() {
		await fetch("/api/identity/logout", { method: "POST" });
		window.location.href = `/${locale}`;
	}

	if (!initialUser) {
		return (
			<div className="relative" ref={rootRef}>
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onClick={() => setOpen((prev) => !prev)}
					className="inline-flex items-center gap-1"
				>
					{labels.login}
					<ChevronDown className="h-4 w-4" />
				</Button>

				{open ? (
					<div className={`${styles.panelSoft} absolute right-0 top-full z-40 mt-1 w-56 p-2 shadow-xl`}>
						<Link href={`/${locale}/login`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
							<LogIn className="h-4 w-4" />
							{labels.loginMenu}
						</Link>
						<Link href={`/${locale}/register`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
							<UserPlus className="h-4 w-4" />
							{labels.registerMenu}
						</Link>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div className="relative" ref={rootRef}>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-black"
			>
				<span className="max-w-[140px] truncate">{initialUser.name || labels.account}</span>
				<ChevronDown className="h-4 w-4" />
			</button>

			{open ? (
				<div className={`${styles.panelSoft} absolute right-0 top-full z-40 mt-1 w-56 p-2 shadow-xl`}>
					{initialUser.role === "ADMIN" ? (
						<Link href={`/${locale}/admin`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
							<Shield className="h-4 w-4" />
							{labels.adminPanel}
						</Link>
					) : null}
					<Link href={`/${locale}/account/orders`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						<Package className="h-4 w-4" />
						{labels.orders}
					</Link>
					<Link href={`/${locale}/account/coupons`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						<TicketPercent className="h-4 w-4" />
						{labels.coupons}
					</Link>
					<Link href={`/${locale}/account/messages`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						<MessageSquare className="h-4 w-4" />
						{labels.messages}
					</Link>
					<button type="button" onClick={logout} className="mt-1 inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
						<LogOut className="h-4 w-4" />
						{labels.logout}
					</button>
				</div>
			) : null}
		</div>
	);
}
