 "use client";

import { useMemo, useState } from "react";

import { Price } from "@/components/price";
import { AddToCartControls } from "@/components/product/add-to-cart-controls";
import type { Locale } from "@/lib/i18n";
import type { ProductDetail } from "@/modules/catalog/contracts/catalog.contract";

type ProductDescriptionProps = {
	locale: Locale;
	product: ProductDetail;
	labels: {
		category: string;
		notSpecified: string;
		addToCart: string;
		compareAtPrice: string;
		discount: string;
		stockStatus: string;
		inStock: string;
		outOfStock: string;
		quantity: string;
		addedToCart: string;
		viewCart: string;
		variants: string;
	};
};

export function ProductDescription({ locale, product, labels }: ProductDescriptionProps) {
	const initialVariantId = product.defaultVariantId ?? product.variants[0]?.id ?? null;
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(initialVariantId);
	const selectedVariant = useMemo(
		() => product.variants.find((variant) => variant.id === selectedVariantId) ?? null,
		[product.variants, selectedVariantId],
	);
	const effectivePrice = selectedVariant?.price ?? product.price;
	const effectiveCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
	const effectiveDiscountRate = selectedVariant?.discountRate ?? product.discountRate;
	const effectiveStock = selectedVariant?.stock ?? product.stock;
	const effectiveInStock = selectedVariant?.inStock ?? product.inStock;

	return (
		<>
			<div className="mb-6 flex flex-col border-b border-neutral-200 pb-6">
				<h1 className="mb-2 text-5xl font-medium tracking-tight">{product.name}</h1>
				<div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
					<Price amount={effectivePrice} currencyCode={product.currency} locale={locale} />
				</div>
				{effectiveCompareAtPrice ? (
					<div className="mt-2 flex items-center gap-2 text-sm">
						<span className="text-neutral-500">{labels.compareAtPrice}:</span>
						<Price amount={effectiveCompareAtPrice} currencyCode={product.currency} locale={locale} className="text-neutral-500 line-through" />
						{effectiveDiscountRate ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">%{effectiveDiscountRate} {labels.discount}</span> : null}
					</div>
				) : null}
			</div>

			<div className="mb-6 text-sm text-neutral-500">
				{labels.category}: {product.category?.name ?? labels.notSpecified}
			</div>

			<div className="mb-6 text-sm text-neutral-600">
				{labels.stockStatus}: {effectiveInStock ? labels.inStock : labels.outOfStock} ({effectiveStock})
			</div>

			{product.variants.length > 0 ? (
				<div className="mb-6 space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
					<p className="text-sm font-medium text-neutral-900">{labels.variants}</p>
					{product.variantAxes.length > 0 ? (
						<div className="space-y-2">
							{product.variantAxes.map((axis) => {
								const selectedValue = selectedVariant?.attributes.find((attribute) => attribute.attributeDefinitionId === axis.attributeDefinitionId)?.value ?? null;
								return (
									<div key={axis.attributeDefinitionId} className="text-sm text-neutral-700">
										<span className="font-medium text-neutral-900">{axis.name}:</span>{" "}
										<span>{selectedValue ?? axis.values.join(", ")}</span>
									</div>
								);
							})}
						</div>
					) : null}
					<div className="flex flex-wrap gap-2">
						{product.variants.map((variant) => {
							const active = variant.id === selectedVariant?.id;
							return (
								<button
									key={variant.id}
									type="button"
									onClick={() => setSelectedVariantId(variant.id)}
									className={`rounded-full border px-3 py-2 text-sm transition ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-700"}`}
								>
									{variant.optionSummary}
								</button>
							);
						})}
					</div>
				</div>
			) : null}

			<div className="mb-6 text-sm leading-6 text-neutral-600">
				<p>{product.description}</p>
			</div>

			<AddToCartControls
				locale={locale}
				product={{
					id: product.id,
					stock: effectiveStock,
					inStock: effectiveInStock,
					selectedVariantId: selectedVariant?.id ?? null,
					selectedVariantLabel: selectedVariant?.optionSummary ?? null,
				}}
				labels={{
					addToCart: labels.addToCart,
					inStock: labels.inStock,
					outOfStock: labels.outOfStock,
					quantity: labels.quantity,
					addedToCart: labels.addedToCart,
					viewCart: labels.viewCart,
				}}
			/>
		</>
	);
}
