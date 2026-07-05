"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

type UserMenuProps = {
	locale: string;
	initialUser?: AuthUser | null;
};

type AuthUser = {
	id: string;
	name: string;
	email: string;
};

export function UserMenu({ locale, initialUser = null }: UserMenuProps) {
	const labels = locale === "tr"
		? {
			login: "Giris Yap",
			account: "Hesabim",
			orders: "Siparislerim",
			coupons: "Indirim Kuponlarim",
			messages: "Mesajlarim",
			logout: "Cikis Yap",
				loginMenu: "Giris Yap",
				registerMenu: "Kayit Ol",
		}
		: {
			login: "Sign In",
			account: "My Account",
			orders: "My Orders",
			coupons: "My Coupons",
			messages: "Messages",
			logout: "Sign Out",
			loginMenu: "Sign In",
			registerMenu: "Sign Up",
		};

	const [user, setUser] = useState<AuthUser | null>(initialUser);
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		if (initialUser) {
			setUser(initialUser);
		}

		let active = true;

		async function loadMe() {
			try {
				const response = await fetch("/api/identity/me", { cache: "no-store" });
				if (!response.ok) {
					if (active) {
						setUser(null);
					}
					return;
				}

				const payload = (await response.json()) as { user?: AuthUser };
				if (active) {
					setUser(payload.user ?? null);
				}
			} catch {
				if (active) {
					setUser(null);
				}
			}
		}

		void loadMe();

		const onOutsidePointer = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		window.addEventListener("mousedown", onOutsidePointer);

		return () => {
			active = false;
			window.removeEventListener("mousedown", onOutsidePointer);
		};
	}, [pathname, initialUser]);

	async function logout() {
		await fetch("/api/identity/logout", { method: "POST" });
		window.location.href = `/${locale}`;
	}

	if (!user) {
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
					<div className="absolute right-0 top-full z-40 mt-1 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl">
						<Link href={`/${locale}/login`} className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
							{labels.loginMenu}
						</Link>
						<Link href={`/${locale}/register`} className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
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
				<span className="max-w-[140px] truncate">{user.name || labels.account}</span>
				<ChevronDown className="h-4 w-4" />
			</button>

			{open ? (
				<div className="absolute right-0 top-full z-40 mt-1 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl">
					<Link href={`/${locale}/account/orders`} className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						{labels.orders}
					</Link>
					<Link href={`/${locale}/account/coupons`} className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						{labels.coupons}
					</Link>
					<Link href={`/${locale}/account/messages`} className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						{labels.messages}
					</Link>
					<button type="button" onClick={logout} className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
						{labels.logout}
					</button>
				</div>
			) : null}
		</div>
	);
}
