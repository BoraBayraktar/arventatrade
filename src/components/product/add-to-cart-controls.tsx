"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddToCartControlsProps = {
	locale: string;
	product: {
		id: string;
		stock: number;
		inStock: boolean;
		selectedVariantId?: string | null;
		selectedVariantLabel?: string | null;
	};
	labels: {
		addToCart: string;
		inStock: string;
		outOfStock: string;
		quantity: string;
		addedToCart: string;
		viewCart: string;
	};
};

type CartLine = {
	productId: string;
	quantity: number;
	variantId?: string;
	variantLabel?: string;
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

export function AddToCartControls({ locale, product, labels }: AddToCartControlsProps) {
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(false);

	const maxQuantity = useMemo(() => Math.max(1, Math.min(product.stock, 99)), [product.stock]);

	function addToCart() {
		const cart = readCart();
		const existing = cart.find((line) => line.productId === product.id && (line.variantId ?? null) === (product.selectedVariantId ?? null));

		if (existing) {
			const next = cart.map((line) => (
				line.productId === product.id && (line.variantId ?? null) === (product.selectedVariantId ?? null)
					? { ...line, quantity: Math.min(99, line.quantity + quantity) }
					: line
			));
			writeCart(next);
		} else {
			writeCart([...cart, {
				productId: product.id,
				quantity,
				variantId: product.selectedVariantId ?? undefined,
				variantLabel: product.selectedVariantLabel ?? undefined,
			}]);
		}

		setAdded(true);
		setTimeout(() => setAdded(false), 2200);
	}

	return (
		<div className="space-y-3">
			<div className="text-sm text-neutral-600">
				{product.inStock ? labels.inStock : labels.outOfStock}
			</div>

			<div className="flex items-center gap-2">
				<label className="text-sm text-neutral-600" htmlFor="product-quantity">{labels.quantity}</label>
				<Input
					id="product-quantity"
					type="number"
					min={1}
					max={maxQuantity}
					value={quantity}
					onChange={(event) => {
						const next = Number(event.target.value);
						if (Number.isNaN(next)) {
							return;
						}

						setQuantity(Math.max(1, Math.min(maxQuantity, next)));
					}}
					className="w-24"
				/>
			</div>

			<Button className="w-full rounded-full" disabled={!product.inStock} onClick={addToCart}>
				{labels.addToCart}
			</Button>

			{added ? (
				<p className="text-sm text-emerald-700">
					{labels.addedToCart} <Link href={`/${locale}/cart`} className="underline">{labels.viewCart}</Link>
				</p>
			) : null}
		</div>
	);
}
