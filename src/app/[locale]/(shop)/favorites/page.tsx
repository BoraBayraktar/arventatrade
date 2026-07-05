import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { FavoritesClient } from "@/ui/shop/favorites-client";

type FavoritesPageProps = {
  params: Promise<{ locale: string }>;
};

async function listAllProducts() {
  const firstPage = await catalogService.listProducts({ page: 1, pageSize: 24 });
  if (firstPage.totalPages <= 1) {
    return firstPage.items;
  }

  const pages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      catalogService.listProducts({ page: index + 2, pageSize: 24 }),
    ),
  );

  return [
    ...firstPage.items,
    ...pages.flatMap((page) => page.items),
  ];
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const products = await listAllProducts();

  return (
    <>
      <FavoritesClient
        locale={locale as Locale}
        products={products}
        labels={{
          title: dictionary.commerce.favoritesTitle,
          empty: dictionary.commerce.favoritesEmpty,
          continueShopping: dictionary.commerce.continueShopping,
        }}
      />
      <Footer locale={locale as Locale} dictionary={dictionary} />
    </>
  );
}