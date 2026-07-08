import Link from "next/link";

import { GridTileImage } from "@/components/grid/tile";
import { FavoriteToggle } from "@/components/commerce/favorite-toggle";
import type { Locale } from "@/lib/i18n";
import type { ProductCard } from "@/modules/catalog/contracts/catalog.contract";

type ThreeItemGridProps = {
  locale: Locale;
  products: ProductCard[];
};

function ThreeItemGridItem({ locale, item, priority }: { locale: Locale; item: ProductCard; priority?: boolean }) {
  return (
    <div className="relative">
      <Link className="relative block aspect-square h-full w-full" href={`/${locale}/product/${item.slug}`} prefetch>
        <GridTileImage
          src={item.imageUrl}
          fill
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
          priority={priority}
          alt={item.name}
          label={{
            position: "bottom",
            title: item.name,
            amount: item.price,
            currencyCode: item.currency,
            locale,
          }}
        />
      </Link>
      <FavoriteToggle productId={item.id} productName={item.name} />
    </div>
  );
}

export function ThreeItemGrid({ locale, products }: ThreeItemGridProps) {
  if (!products[0]) {
    return null;
  }

  const showcaseItems = products.slice(0, 4);

  return (
    <section className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-2 px-2 pb-2 sm:grid-cols-2 md:grid-cols-4 md:gap-3 md:px-3 md:pb-3">
      {showcaseItems.map((product, index) => (
        <ThreeItemGridItem
          key={product.id}
          locale={locale}
          item={product}
          priority={index < 2}
        />
      ))}
    </section>
  );
}