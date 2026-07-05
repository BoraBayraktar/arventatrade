import Link from "next/link";

import Grid from "@/components/grid";
import { GridTileImage } from "@/components/grid/tile";
import { FavoriteToggle } from "@/components/commerce/favorite-toggle";
import type { Locale } from "@/lib/i18n";
import type { ProductCard } from "@/modules/catalog/contracts/catalog.contract";

type ProductGridItemsProps = {
	locale: Locale;
	products: ProductCard[];
};

export function ProductGridItems({ locale, products }: ProductGridItemsProps) {
	return (
		<>
			{products.map((product) => (
				<Grid.Item key={product.slug} className="animate-fadeIn">
					<div className="relative h-full w-full">
						<Link className="relative inline-block h-full w-full" href={`/${locale}/product/${product.slug}`} prefetch>
							<GridTileImage
								alt={product.name}
								label={{
									title: product.name,
									amount: product.price,
									currencyCode: product.currency,
									locale,
								}}
								src={product.imageUrl}
								fill
								sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
							/>
						</Link>
						<FavoriteToggle productId={product.id} productName={product.name} />
					</div>
				</Grid.Item>
			))}
		</>
	);
}
