import Link from "next/link";

import { GridTileImage } from "@/components/grid/tile";
import { FavoriteToggle } from "@/components/commerce/favorite-toggle";
import type { Locale } from "@/lib/i18n";
import type { ProductCard } from "@/modules/catalog/contracts/catalog.contract";

type CarouselProps = {
  locale: Locale;
  products: ProductCard[];
};

export function Carousel({ locale, products }: CarouselProps) {
  if (!products.length) {
    return null;
  }

  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, index) => (
          <li key={`${product.slug}-${index}`} className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3">
            <Link href={`/${locale}/product/${product.slug}`} className="relative h-full w-full">
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
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
            <FavoriteToggle productId={product.id} productName={product.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}