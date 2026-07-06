"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Compass, CreditCard, ShoppingCart, TicketPercent } from "lucide-react";
import styles from "@/ui/shop/surface.module.css";

type CartDropdownLabels = {
	cartTitle: string;
	cartEmpty: string;
	viewCart: string;
	checkout: string;
	continueShopping: string;
	promotionCode: string;
};

type CartLine = {
	productId: string;
	quantity: number;
};

const CART_KEY = "arventa:cart";

function readCartCount() {
	if (typeof window === "undefined") {
		return 0;
	}

	try {
		const raw = window.localStorage.getItem(CART_KEY);
		if (!raw) {
			return 0;
		}

		const parsed = JSON.parse(raw) as CartLine[];
		if (!Array.isArray(parsed)) {
			return 0;
		}

		return parsed.reduce((total, line) => {
			if (typeof line?.quantity !== "number") {
				return total;
			}

			return total + Math.max(0, line.quantity);
		}, 0);
	} catch {
		return 0;
	}
}

export function CartDropdown({ locale, labels }: { locale: string; labels: CartDropdownLabels }) {
	const [open, setOpen] = useState(false);
	const [count, setCount] = useState(0);
	const [promotionCode, setPromotionCode] = useState("");
	const rootRef = useRef<HTMLDivElement | null>(null);

	const hasItems = useMemo(() => count > 0, [count]);
	const itemLabel = locale === "tr" ? "ürün" : "items";

	useEffect(() => {
		const syncCount = () => setCount(readCartCount());

		syncCount();
		window.addEventListener("storage", syncCount);
		window.addEventListener("arventa:cart-updated", syncCount);

		const onOutsidePointer = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		window.addEventListener("mousedown", onOutsidePointer);
		window.addEventListener("keydown", onEscape);

		return () => {
			window.removeEventListener("storage", syncCount);
			window.removeEventListener("arventa:cart-updated", syncCount);
			window.removeEventListener("mousedown", onOutsidePointer);
			window.removeEventListener("keydown", onEscape);
		};
	}, []);

	return (
		<div className="relative" ref={rootRef}>
			<button
				type="button"
				aria-haspopup="dialog"
				aria-label={labels.cartTitle}
				onClick={() => setOpen((prev) => !prev)}
				className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100/90 hover:text-neutral-950"
			>
				<span className="relative inline-flex">
					<ShoppingCart className="h-[18px] w-[18px]" />
					{count > 0 ? (
						<span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-semibold leading-none text-white shadow-[0_0_0_2px_white]">
							{count > 99 ? "99+" : count}
						</span>
					) : null}
				</span>
				<span className="hidden lg:inline">{labels.cartTitle}</span>
				<ChevronDown className="h-[14px] w-[14px] text-neutral-500" />
			</button>

			{open ? (
				<div className={`${styles.panelSoft} absolute right-0 top-full z-50 mt-2 w-[min(92vw,340px)] overflow-hidden shadow-[0_12px_30px_-12px_rgba(0,0,0,0.24)]`}>
					<div className="bg-[linear-gradient(115deg,#ff7a00_0%,#ff5a1f_45%,#ff3d68_100%)] p-4 text-white">
						<p className="text-[11px] uppercase tracking-[0.2em] opacity-90">{labels.cartTitle}</p>
						<p className="mt-1 text-lg font-semibold">{hasItems ? `${count} ${itemLabel}` : labels.cartEmpty}</p>
					</div>

					<div className="space-y-3 p-3">
						<div className="rounded-xl border border-neutral-200 p-2">
							<div className="relative">
								<TicketPercent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
								<input
									type="text"
									value={promotionCode}
									onChange={(event) => setPromotionCode(event.target.value)}
									placeholder={labels.promotionCode}
									className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
								/>
							</div>
						</div>

						<div className="overflow-hidden rounded-xl border border-orange-100 bg-orange-50/40">
							<Link
								href={`/${locale}/cart`}
								onClick={() => setOpen(false)}
								className="group flex items-center justify-between border-b border-orange-100 px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-orange-100/60"
							>
								<span className="inline-flex items-center gap-2">
									<ShoppingCart className="h-4 w-4 text-orange-500" />
									{labels.viewCart}
								</span>
								<ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
							</Link>

							<Link
								href={`/${locale}/search`}
								onClick={() => setOpen(false)}
								className="group flex items-center justify-between border-b border-orange-100 px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-orange-100/60"
							>
								<span className="inline-flex items-center gap-2">
									<Compass className="h-4 w-4 text-orange-500" />
									{labels.continueShopping}
								</span>
								<ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
							</Link>

							<Link
								href={`/${locale}/cart`}
								onClick={() => setOpen(false)}
								className="group flex items-center justify-between px-3 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100/60"
							>
								<span className="inline-flex items-center gap-2">
									<CreditCard className="h-4 w-4 text-orange-500" />
									{labels.checkout}
								</span>
								<ChevronRight className="h-4 w-4 text-orange-500 transition-transform group-hover:translate-x-0.5" />
							</Link>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
