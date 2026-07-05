import Link from "next/link";
import { notFound } from "next/navigation";

import { Carousel } from "@/components/carousel";
import { GridTileImage } from "@/components/grid/tile";
import { ThreeItemGrid } from "@/components/grid/three-items";
import { Footer } from "@/components/layout/footer";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import type { ProductCard } from "@/modules/catalog/contracts/catalog.contract";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import type { StorefrontItem } from "@/modules/storefront/contracts/storefront.contract";
import { storefrontService } from "@/modules/storefront/services/storefront.service";

function getStorefrontTile(item: StorefrontItem, locale: Locale, fallbackProduct: ProductCard | undefined) {
  if (item.target?.type === "PRODUCT") {
    return {
      href: `/${locale}/product/${item.target.slug}`,
      imageUrl: item.target.imageUrl,
      imageAlt: item.target.title,
      amount: item.target.price,
      currency: item.target.currency,
    };
  }

  if (item.target?.type === "CATEGORY" && item.target.imageUrl) {
    return {
      href: `/${locale}/search?category=${item.target.slug}`,
      imageUrl: item.target.imageUrl,
      imageAlt: item.target.title,
      amount: "0",
      currency: "TRY",
    };
  }

  if (fallbackProduct) {
    return {
      href: `/${locale}/product/${fallbackProduct.slug}`,
      imageUrl: fallbackProduct.imageUrl,
      imageAlt: fallbackProduct.name,
      amount: fallbackProduct.price,
      currency: fallbackProduct.currency,
    };
  }

  return null;
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const [products, storefront] = await Promise.all([
    catalogService.listProducts({ page: 1, pageSize: 8 }),
    storefrontService.getHomeSections(locale as Locale),
  ]);
  const storefrontItems = [...storefront.campaigns, ...storefront.features];

  return (
    <>
      <ThreeItemGrid locale={locale} products={products.items} />
      <Carousel locale={locale} products={products.items} />
      {storefrontItems.length ? (
        <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
          {storefrontItems.map((item, index) => {
            const tile = getStorefrontTile(item, locale as Locale, products.items[index % products.items.length]);

            if (!tile) {
              return null;
            }

            return (
              <Link key={item.id} href={tile.href} className="group block">
                <article className="grid gap-3">
                  <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                    <GridTileImage
                      alt={tile.imageAlt}
                      src={tile.imageUrl}
                      width={600}
                      height={600}
                      label={{
                        title: item.title,
                        amount: tile.amount,
                        currencyCode: tile.currency,
                        locale: locale as Locale,
                      }}
                    />
                  </div>
                  <div className="px-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{item.targetType === "CATEGORY" ? dictionary.catalog.category : item.variant}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-500">{item.description}</p>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>
      ) : null}
      <Footer locale={locale} dictionary={dictionary} />
    </>
  );
}
