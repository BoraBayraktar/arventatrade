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
	};
};

export function ProductDescription({ locale, product, labels }: ProductDescriptionProps) {
	return (
		<>
			<div className="mb-6 flex flex-col border-b border-neutral-200 pb-6">
				<h1 className="mb-2 text-5xl font-medium tracking-tight">{product.name}</h1>
				<div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
					<Price amount={product.price} currencyCode={product.currency} locale={locale} />
				</div>
				{product.compareAtPrice ? (
					<div className="mt-2 flex items-center gap-2 text-sm">
						<span className="text-neutral-500">{labels.compareAtPrice}:</span>
						<Price amount={product.compareAtPrice} currencyCode={product.currency} locale={locale} className="text-neutral-500 line-through" />
						{product.discountRate ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">%{product.discountRate} {labels.discount}</span> : null}
					</div>
				) : null}
			</div>

			<div className="mb-6 text-sm text-neutral-500">
				{labels.category}: {product.category?.name ?? labels.notSpecified}
			</div>

			<div className="mb-6 text-sm text-neutral-600">
				{labels.stockStatus}: {product.inStock ? labels.inStock : labels.outOfStock} ({product.stock})
			</div>

			<div className="mb-6 text-sm leading-6 text-neutral-600">
				<p>{product.description}</p>
			</div>

			<AddToCartControls
				locale={locale}
				product={{
					id: product.id,
					stock: product.stock,
					inStock: product.inStock,
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
