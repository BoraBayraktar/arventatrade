"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "@/ui/shop/surface.module.css";

type Labels = {
	title: string;
	empty: string;
	quantity: string;
	subtotal: string;
	discountTotal: string;
	total: string;
	promotionCode: string;
	checkout: string;
	continueShopping: string;
	remove: string;
	stockWarning: string;
	checkoutSuccess: string;
	checkoutFailed: string;
};

type CartLine = {
	productId: string;
	variantId?: string;
	variantLabel?: string;
	quantity: number;
};

type QuoteLine = {
	productId: string;
	variantId: string | null;
	variantTitle: string | null;
	variantOptionSummary: string | null;
	slug: string;
	name: string;
	imageUrl: string;
	currency: string;
	quantity: number;
	unitPrice: number;
	compareAtPrice: number | null;
	lineTotal: number;
	inStock: boolean;
	availableStock: number;
};

type QuoteResult = {
	lines: QuoteLine[];
	subtotal: number;
	discountTotal: number;
	total: number;
	promotionCode: string | null;
	currency: string;
	allInStock: boolean;
};

const CART_KEY = "2bem:cart";
const LEGACY_CART_KEY = "arventa:cart";
const CART_UPDATED_EVENT = "2bem:cart-updated";
const LEGACY_CART_UPDATED_EVENT = "arventa:cart-updated";

function readCart(): CartLine[] {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const raw = window.localStorage.getItem(CART_KEY) ?? window.localStorage.getItem(LEGACY_CART_KEY);
		if (!raw) {
			return [];
		}

		const parsed = JSON.parse(raw) as CartLine[];
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed.filter((line) => typeof line?.productId === "string" && typeof line?.quantity === "number" && line.quantity > 0);
	} catch {
		return [];
	}
}

function writeCart(lines: CartLine[]) {
	window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
	window.dispatchEvent(new Event(CART_UPDATED_EVENT));
	window.dispatchEvent(new Event(LEGACY_CART_UPDATED_EVENT));
}

function formatMoney(amount: number, currency: string, locale: string) {
	return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
		style: "currency",
		currency,
	}).format(amount);
}

export function CartClient({ locale, labels }: { locale: string; labels: Labels }) {
	const [cart, setCart] = useState<CartLine[]>(() => readCart());
	const [quote, setQuote] = useState<QuoteResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [promotionCode, setPromotionCode] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const refreshQuote = useCallback(async (nextCart: CartLine[], nextPromotionCode?: string) => {
		setLoading(true);
		setError(null);

		if (nextCart.length === 0) {
			setQuote(null);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/commerce/quote", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ lines: nextCart, promotionCode: nextPromotionCode ?? promotionCode }),
			});

			if (!response.ok) {
				setError(labels.checkoutFailed);
				setLoading(false);
				return;
			}

			const payload = (await response.json()) as QuoteResult;
			setQuote(payload);
		} catch {
			setError(labels.checkoutFailed);
		} finally {
			setLoading(false);
		}
	}, [labels.checkoutFailed, promotionCode]);

	useEffect(() => {
		const timer = setTimeout(() => {
			void refreshQuote(cart, promotionCode);
		}, 0);

		return () => clearTimeout(timer);
	}, [cart, refreshQuote, promotionCode]);

	function updateQuantity(productId: string, quantity: number, variantId?: string | null) {
		const next = cart
			.map((line) => (
				line.productId === productId && (line.variantId ?? null) === (variantId ?? null)
					? { ...line, quantity }
					: line
			))
			.filter((line) => line.quantity > 0);

		setCart(next);
		writeCart(next);
	}

	function removeLine(productId: string, variantId?: string | null) {
		const next = cart.filter((line) => !(line.productId === productId && (line.variantId ?? null) === (variantId ?? null)));
		setCart(next);
		writeCart(next);
	}

	const currency = quote?.currency ?? "TRY";
	const canCheckout = useMemo(() => Boolean(quote && quote.lines.length > 0 && quote.allInStock), [quote]);

	async function checkout() {
		if (!canCheckout || !quote) {
			return;
		}

		setSubmitting(true);
		setError(null);
		setMessage(null);

		try {
			const response = await fetch("/api/commerce/checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ lines: cart, promotionCode }),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { message?: string } | null;
				setError(payload?.message ?? labels.checkoutFailed);
				await refreshQuote(cart);
				return;
			}

			const payload = (await response.json()) as { orderNumber: string };
			setMessage(`${labels.checkoutSuccess} ${payload.orderNumber}`);
			setCart([]);
			writeCart([]);
			setQuote(null);
		} catch {
			setError(labels.checkoutFailed);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section className={`${styles.shell} py-8`}>
			<h1 className="mb-6 text-3xl font-semibold tracking-tight">{labels.title}</h1>

			{message ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
			{error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

			{loading ? <p className="text-sm text-neutral-500">...</p> : null}

			{!loading && (!quote || quote.lines.length === 0) ? (
				<div className={`${styles.panel} p-6`}>
					<p className={`mb-4 text-sm ${styles.panelSubtle}`}>{labels.empty}</p>
					<Button asChild variant="secondary">
						<Link href={`/${locale}/search`}>{labels.continueShopping}</Link>
					</Button>
				</div>
			) : null}

			{quote && quote.lines.length > 0 ? (
				<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
					<div className="rounded-xl border border-neutral-200 bg-white">
						<div className="divide-y divide-neutral-200">
							{quote.lines.map((line) => (
								<article key={`${line.productId}:${line.variantId ?? ""}`} className="grid gap-4 p-4 md:grid-cols-[100px_1fr_auto] md:items-center">
									<div className="h-24 w-24 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
									</div>
									<div>
										<p className="font-medium text-neutral-900">{line.name}</p>
										{line.variantTitle ? (
											<p className="mt-1 text-xs text-neutral-500">
												{line.variantTitle}{line.variantOptionSummary ? ` • ${line.variantOptionSummary}` : ""}
											</p>
										) : null}
										<p className="mt-1 text-sm text-neutral-500">{formatMoney(line.unitPrice, line.currency, locale)}</p>
										{!line.inStock ? (
											<p className="mt-1 text-sm text-red-600">{labels.stockWarning} ({line.availableStock})</p>
										) : null}
										<div className="mt-2 flex items-center gap-2">
											<label className="text-sm text-neutral-600" htmlFor={`qty-${line.productId}-${line.variantId ?? "base"}`}>{labels.quantity}</label>
											<Input
												id={`qty-${line.productId}-${line.variantId ?? "base"}`}
												type="number"
												min={1}
												max={99}
												value={line.quantity}
												onChange={(event) => {
													const next = Number(event.target.value);
													if (Number.isNaN(next)) {
														return;
													}

													updateQuantity(line.productId, Math.max(1, Math.min(99, next)), line.variantId);
												}}
												className="h-9 w-20"
											/>
											<Button type="button" variant="ghost" className="h-auto px-0 text-sm text-neutral-500 underline hover:bg-transparent hover:text-neutral-700" onClick={() => removeLine(line.productId, line.variantId)}>
												{labels.remove}
											</Button>
										</div>
									</div>
									<div className="text-sm font-semibold text-neutral-900">{formatMoney(line.lineTotal, line.currency, locale)}</div>
								</article>
							))}
						</div>
					</div>

					<aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5">
						<label className="text-sm text-neutral-500" htmlFor="promotion-code">{labels.promotionCode}</label>
						<Input
							id="promotion-code"
							value={promotionCode}
							onChange={(event) => setPromotionCode(event.target.value.toUpperCase())}
							className="mt-1 h-10"
							placeholder="SUMMER10"
						/>
						<p className="text-sm text-neutral-500">{labels.subtotal}</p>
						<p className="mt-1 text-2xl font-semibold text-neutral-950">{formatMoney(quote.subtotal, currency, locale)}</p>
						<p className="mt-1 text-sm text-neutral-500">{labels.discountTotal}: {formatMoney(quote.discountTotal, currency, locale)}</p>
						<p className="mt-1 text-lg font-semibold text-neutral-950">{labels.total}: {formatMoney(quote.total, currency, locale)}</p>
						<Button className="mt-4 w-full" disabled={!canCheckout || submitting} onClick={checkout}>
							{labels.checkout}
						</Button>
						<Button asChild variant="secondary" className="mt-2 w-full">
							<Link href={`/${locale}/search`}>{labels.continueShopping}</Link>
						</Button>
					</aside>
				</div>
			) : null}
		</section>
	);
}
