import Link from "next/link";
import { notFound } from "next/navigation";

import Grid from "@/components/grid";
import { ProductGridItems } from "@/components/layout/product-grid-items";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { CatalogFilters } from "@/ui/catalog/catalog-filters";
import surfaceStyles from "@/ui/shop/surface.module.css";

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: "latest" | "price-asc" | "price-desc";
    inStock?: string;
    outOfStock?: string;
    lowStock?: string;
    onlyNew?: string;
    discounted?: string;
    minPrice?: string;
    maxPrice?: string;
    feature?: string | string[];
    page?: string;
  }>;
};

function toFeatureFilters(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((item) => item.trim() !== "");
  }

  return value.trim() ? [value] : [];
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const query = await searchParams;
  const page = query.page ? Number(query.page) : 1;
  const sort = query.sort ?? "latest";
  const outOfStockOnly = query.outOfStock === "1";
  const inStockOnly = !outOfStockOnly && query.inStock === "1";
  const lowStockOnly = !outOfStockOnly && query.lowStock === "1";
  const newOnly = query.onlyNew === "1";
  const discountedOnly = query.discounted === "1";
  const minPrice = query.minPrice && query.minPrice.trim() !== "" ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice && query.maxPrice.trim() !== "" ? Number(query.maxPrice) : undefined;
  const featureFilters = toFeatureFilters(query.feature);

  const [products, categories] = await Promise.all([
    catalogService.listProducts({
      search: query.q,
      categorySlug: query.category,
      sort,
      inStockOnly,
      outOfStockOnly,
      lowStockOnly,
      newOnly,
      discountedOnly,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      featureFilters,
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
    <section className="w-full py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{dictionary.home.campaignTitle}</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{dictionary.catalog.title}</h1>
        </div>
        {categoryName ? <p className="text-sm text-muted-foreground">{dictionary.catalog.category}: {categoryName}</p> : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className={`${surfaceStyles.panel} h-fit p-5 md:p-6 lg:sticky lg:top-24`}>
          <CatalogFilters
            locale={locale}
            categories={categories.map((item) => ({ id: item.id, slug: item.slug, name: item.name }))}
            initialSearch={query.q}
            initialCategory={query.category}
            initialSort={sort}
            initialInStockOnly={inStockOnly}
            initialOutOfStockOnly={outOfStockOnly}
            initialLowStockOnly={lowStockOnly}
            initialNewOnly={newOnly}
            initialDiscountedOnly={discountedOnly}
            initialMinPrice={query.minPrice}
            initialMaxPrice={query.maxPrice}
            initialFeatureFilters={featureFilters}
            featureFacets={products.featureFacets}
            labels={{
              searchPlaceholder: dictionary.catalog.searchPlaceholder,
              allCategories: dictionary.catalog.allCategories,
              filter: dictionary.catalog.filter,
              clear: dictionary.admin.cancel,
              activeFilters: locale === "tr" ? "Aktif Filtreler" : "Active Filters",
              quickCategories: locale === "tr" ? "Hizli Kategoriler" : "Quick Categories",
              searchLabel: locale === "tr" ? "Arama" : "Search",
              categoryLabel: dictionary.catalog.category,
              sortLabel: dictionary.commerce.sortBy,
              sortLatest: dictionary.commerce.latest,
              sortPriceAsc: dictionary.catalog.sortPriceAsc,
              sortPriceDesc: dictionary.catalog.sortPriceDesc,
              inStockOnly: dictionary.commerce.inStock,
              outOfStockOnly: dictionary.commerce.outOfStock,
              lowStockOnly: dictionary.catalog.lowStockOnly,
              newOnly: dictionary.catalog.newOnly,
              discountedOnly: dictionary.catalog.discountedOnly,
              minPrice: dictionary.catalog.minPrice,
              maxPrice: dictionary.catalog.maxPrice,
              priceRange: dictionary.catalog.priceRange,
              featureFiltersTitle: dictionary.catalog.featureFiltersTitle,
              featureSearchPlaceholder: dictionary.catalog.featureSearchPlaceholder,
              facetShowMore: dictionary.catalog.facetShowMore,
              facetShowLess: dictionary.catalog.facetShowLess,
            }}
          />
        </aside>

        <div className="grid gap-5">
          <div className={`${surfaceStyles.panel} p-5 md:p-6`}>
            {query.q ? (
              <p className="mb-4 text-sm text-muted-foreground">
                {products.total === 0
                  ? dictionary.commerce.noProductsMatch
                  : `${dictionary.commerce.showing} ${products.total} ${resultsText} ${dictionary.commerce.for}`}
                <span className="font-semibold text-foreground"> &quot;{query.q}&quot;</span>
              </p>
            ) : null}

            {products.items.length > 0 ? (
              <Grid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                <ProductGridItems locale={locale} products={products.items} />
              </Grid>
            ) : null}

            {products.items.length === 0 ? (
              <div className={`${surfaceStyles.panelSoft} p-6`}>
                <p className="text-sm text-muted-foreground">{dictionary.catalog.empty}</p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{dictionary.catalog.page} {products.page}/{products.totalPages}</span>
            <div className="flex gap-4">
            {prevPage ? (
              <Link
                href={{
                  pathname: `/${locale}/search`,
                  query: {
                    ...(query.q ? { q: query.q } : {}),
                    ...(query.category ? { category: query.category } : {}),
                    ...(query.sort ? { sort: query.sort } : {}),
                    ...(query.inStock ? { inStock: query.inStock } : {}),
                    ...(query.outOfStock ? { outOfStock: query.outOfStock } : {}),
                    ...(query.lowStock ? { lowStock: query.lowStock } : {}),
                    ...(query.onlyNew ? { onlyNew: query.onlyNew } : {}),
                    ...(query.discounted ? { discounted: query.discounted } : {}),
                    ...(query.minPrice ? { minPrice: query.minPrice } : {}),
                    ...(query.maxPrice ? { maxPrice: query.maxPrice } : {}),
                    ...(featureFilters.length > 0 ? { feature: featureFilters } : {}),
                    page: String(prevPage),
                  },
                }}
                className="underline-offset-4 hover:text-foreground hover:underline"
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
                    ...(query.sort ? { sort: query.sort } : {}),
                    ...(query.inStock ? { inStock: query.inStock } : {}),
                    ...(query.outOfStock ? { outOfStock: query.outOfStock } : {}),
                    ...(query.lowStock ? { lowStock: query.lowStock } : {}),
                    ...(query.onlyNew ? { onlyNew: query.onlyNew } : {}),
                    ...(query.discounted ? { discounted: query.discounted } : {}),
                    ...(query.minPrice ? { minPrice: query.minPrice } : {}),
                    ...(query.maxPrice ? { maxPrice: query.maxPrice } : {}),
                    ...(featureFilters.length > 0 ? { feature: featureFilters } : {}),
                    page: String(nextPage),
                  },
                }}
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                {dictionary.admin.next}
              </Link>
            ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
