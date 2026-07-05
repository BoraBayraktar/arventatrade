import Link from "next/link";
import { notFound } from "next/navigation";

import Grid from "@/components/grid";
import { ProductGridItems } from "@/components/layout/product-grid-items";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const query = await searchParams;
  const page = query.page ? Number(query.page) : 1;

  const [products, categories] = await Promise.all([
    catalogService.listProducts({
      search: query.q,
      categorySlug: query.category,
      page,
      pageSize: 12,
    }),
    catalogService.listCategories(),
  ]);

  const prevPage = products.page > 1 ? products.page - 1 : null;
  const nextPage = products.page < products.totalPages ? products.page + 1 : null;

  const categoryMap = new Map(categories.map((item) => [item.slug, item.name]));
  const categoryName = query.category ? categoryMap.get(query.category) : undefined;
  const resultsText = products.total > 1 ? "results" : "result";

  return (
    <>
      {query.q ? (
        <p className="mb-4">
          {products.total === 0
            ? dictionary.commerce.noProductsMatch
            : `${dictionary.commerce.showing} ${products.total} ${resultsText} ${dictionary.commerce.for}`}
          <span className="font-bold">&quot;{query.q}&quot;</span>
        </p>
      ) : null}
      {categoryName ? <p className="mb-4 text-sm text-neutral-500">{dictionary.catalog.category}: {categoryName}</p> : null}
      {products.items.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems locale={locale} products={products.items} />
        </Grid>
      ) : null}
      {products.items.length === 0 ? <p className="text-sm text-neutral-500">{dictionary.catalog.empty}</p> : null}
      <div className="mt-6 flex items-center justify-between text-sm text-neutral-500">
        <span>{dictionary.catalog.page} {products.page}/{products.totalPages}</span>
        <div className="flex gap-4">
          {prevPage ? (
            <Link
              href={{
                pathname: `/${locale}/search`,
                query: {
                  ...(query.q ? { q: query.q } : {}),
                  ...(query.category ? { category: query.category } : {}),
                  page: String(prevPage),
                },
              }}
              className="underline-offset-4 hover:text-black hover:underline"
            >
              {dictionary.admin.prev}
            </Link>
          ) : null}
          {nextPage ? (
            <Link
              href={{
                pathname: `/${locale}/search`,
                query: {
                  ...(query.q ? { q: query.q } : {}),
                  ...(query.category ? { category: query.category } : {}),
                  page: String(nextPage),
                },
              }}
              className="underline-offset-4 hover:text-black hover:underline"
            >
              {dictionary.admin.next}
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
