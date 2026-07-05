import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { Footer } from "@/components/layout/footer";
import { GridTileImage } from "@/components/grid/tile";
import { Gallery } from "@/components/product/gallery";
import { ProductDescription } from "@/components/product/product-description";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";

type ProductDetailPageProps = {
	params: Promise<{ locale: string; slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
	const { locale, slug } = await params;

	if (!isLocale(locale)) {
		notFound();
	}

	const dictionary = getDictionary(locale as Locale);
	const product = await catalogService.getProductBySlug(slug);

	if (!product) {
		notFound();
	}

	await catalogService.trackProductView(product.id);

	const relatedProducts = await catalogService.listProducts({
		categorySlug: product.category?.slug,
		page: 1,
		pageSize: 6,
	});

	const related = relatedProducts.items.filter((item) => item.slug !== product.slug);

	const productJsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		description: product.description,
		image: product.imageUrl,
		offers: {
			"@type": "AggregateOffer",
			availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			priceCurrency: product.currency,
			highPrice: product.compareAtPrice ?? product.price,
			lowPrice: product.price,
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
			<div className="mx-auto max-w-screen-2xl px-4">
				<div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8">
					<div className="h-full w-full basis-full lg:basis-4/6">
						<Suspense fallback={<div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />}>
							<Gallery images={[{ src: product.imageUrl, altText: product.name }]} />
						</Suspense>
					</div>

					<div className="basis-full lg:basis-2/6">
						<Suspense fallback={null}>
							<ProductDescription
								locale={locale}
								product={product}
								labels={{
									category: dictionary.catalog.category,
									notSpecified: dictionary.common.notSpecified,
									addToCart: dictionary.commerce.addToCart,
									compareAtPrice: dictionary.commerce.compareAtPrice,
									discount: dictionary.commerce.discount,
									stockStatus: dictionary.commerce.stockStatus,
									inStock: dictionary.commerce.inStock,
									outOfStock: dictionary.commerce.outOfStock,
									quantity: dictionary.commerce.quantity,
									addedToCart: dictionary.commerce.addedToCart,
									viewCart: dictionary.commerce.viewCart,
								}}
							/>
						</Suspense>
					</div>
				</div>

				{related.length ? (
					<div className="py-8">
						<h2 className="mb-4 text-2xl font-bold">{dictionary.commerce.relatedProducts}</h2>
						<ul className="flex w-full gap-4 overflow-x-auto pt-1">
							{related.map((item) => (
								<li key={item.slug} className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
									<Link className="relative h-full w-full" href={`/${locale}/product/${item.slug}`} prefetch>
										<GridTileImage
											alt={item.name}
											label={{
												title: item.name,
												amount: item.price,
												currencyCode: item.currency,
												locale,
											}}
											src={item.imageUrl}
											fill
											sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
										/>
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>
			<Footer locale={locale} dictionary={dictionary} />
		</>
	);
}
