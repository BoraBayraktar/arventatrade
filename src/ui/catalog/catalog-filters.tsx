"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  slug: string;
  name: string;
};

type SortValue = "latest" | "price-asc" | "price-desc";

type FeatureFacet = {
  key: string;
  options: Array<{
    value: string;
    count: number;
  }>;
};

type Props = {
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: SortValue;
  initialInStockOnly?: boolean;
  initialOutOfStockOnly?: boolean;
  initialLowStockOnly?: boolean;
  initialNewOnly?: boolean;
  initialDiscountedOnly?: boolean;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialFeatureFilters?: string[];
  featureFacets: FeatureFacet[];
  labels: {
    searchPlaceholder: string;
    allCategories: string;
    filter: string;
    clear: string;
    activeFilters: string;
    quickCategories: string;
    searchLabel: string;
    categoryLabel: string;
    sortLabel: string;
    sortLatest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    inStockOnly: string;
    outOfStockOnly: string;
    lowStockOnly: string;
    newOnly: string;
    discountedOnly: string;
    minPrice: string;
    maxPrice: string;
    priceRange: string;
    featureFiltersTitle: string;
    featureSearchPlaceholder: string;
    facetShowMore: string;
    facetShowLess: string;
  };
};

export function CatalogFilters({
  categories,
  initialSearch,
  initialCategory,
  initialSort,
  initialInStockOnly,
  initialOutOfStockOnly,
  initialLowStockOnly,
  initialNewOnly,
  initialDiscountedOnly,
  initialMinPrice,
  initialMaxPrice,
  initialFeatureFilters,
  featureFacets,
  labels,
}: Props) {
  const PRICE_MIN = 0;
  const PRICE_MAX = 100000;
  const PRICE_STEP = 100;

  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch ?? "");
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [sort, setSort] = useState<SortValue>(initialSort ?? "latest");
  const [inStockOnly, setInStockOnly] = useState(Boolean(initialInStockOnly));
  const [outOfStockOnly, setOutOfStockOnly] = useState(Boolean(initialOutOfStockOnly));
  const [lowStockOnly, setLowStockOnly] = useState(Boolean(initialLowStockOnly));
  const [newOnly, setNewOnly] = useState(Boolean(initialNewOnly));
  const [discountedOnly, setDiscountedOnly] = useState(Boolean(initialDiscountedOnly));
  const [minPrice, setMinPrice] = useState(initialMinPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice ?? "");
  const [selectedFeatureFilters, setSelectedFeatureFilters] = useState<string[]>(initialFeatureFilters ?? []);
  const [featureSearch, setFeatureSearch] = useState("");
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>({});

  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.slug, item.name])), [categories]);
  const visibleFeatureFacets = useMemo(() => {
    const selectedSet = new Set(selectedFeatureFilters);
    const searchTerm = featureSearch.trim().toLocaleLowerCase("tr-TR");

    return featureFacets
      .map((facet) => {
        const scopedOptions = searchTerm
          ? facet.options.filter((option) => (
            option.value.toLocaleLowerCase("tr-TR").includes(searchTerm)
            || facet.key.toLocaleLowerCase("tr-TR").includes(searchTerm)
          ))
          : facet.options;
        const merged = [...scopedOptions];
        const selectedOptions = facet.options.filter((option) => selectedSet.has(`${facet.key}::${option.value}`));

        for (const selected of selectedOptions) {
          if (!merged.some((option) => option.value === selected.value)) {
            merged.push(selected);
          }
        }

        return {
          ...facet,
          options: merged,
        };
      })
      .filter((facet) => facet.options.length > 0);
  }, [featureFacets, selectedFeatureFilters, featureSearch]);

  function toggleFacetExpand(key: string) {
    setExpandedFacets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  const hasSearch = search.trim().length > 0;
  const hasCategory = category !== "all";
  const hasSort = sort !== "latest";
  const hasStockOnly = inStockOnly;
  const hasOutOfStockOnly = outOfStockOnly;
  const hasLowStockOnly = lowStockOnly;
  const hasNewOnly = newOnly;
  const hasDiscountOnly = discountedOnly;
  const hasFeatureFilters = selectedFeatureFilters.length > 0;
  const hasMinPrice = minPrice.trim().length > 0;
  const hasMaxPrice = maxPrice.trim().length > 0;
  const hasActiveFilters = hasSearch || hasCategory || hasSort || hasStockOnly || hasOutOfStockOnly || hasLowStockOnly || hasNewOnly || hasDiscountOnly || hasFeatureFilters || hasMinPrice || hasMaxPrice;

  const parsedMin = Number(minPrice);
  const parsedMax = Number(maxPrice);

  const currentMinValue = Number.isFinite(parsedMin) ? Math.max(PRICE_MIN, Math.min(parsedMin, PRICE_MAX)) : PRICE_MIN;
  const currentMaxValue = Number.isFinite(parsedMax) ? Math.max(PRICE_MIN, Math.min(parsedMax, PRICE_MAX)) : PRICE_MAX;

  const sliderMin = Math.min(currentMinValue, currentMaxValue);
  const sliderMax = Math.max(currentMinValue, currentMaxValue);

  function applyFilters(next: {
    searchText?: string;
    categorySlug?: string;
    sortValue?: SortValue;
    inStock?: boolean;
    outOfStock?: boolean;
    lowStock?: boolean;
    onlyNew?: boolean;
    discounted?: boolean;
    featureFilters?: string[];
    min?: string;
    max?: string;
  } = {}) {
    const nextSearch = (next.searchText ?? search).trim();
    const nextCategory = next.categorySlug ?? category;
    const nextSort = next.sortValue ?? sort;
    const nextInStock = next.inStock ?? inStockOnly;
    const nextOutOfStock = next.outOfStock ?? outOfStockOnly;
    const nextLowStock = next.lowStock ?? lowStockOnly;
    const nextOnlyNew = next.onlyNew ?? newOnly;
    const nextDiscounted = next.discounted ?? discountedOnly;
    const nextFeatureFilters = next.featureFilters ?? selectedFeatureFilters;
    const nextMin = (next.min ?? minPrice).trim();
    const nextMax = (next.max ?? maxPrice).trim();

    const params = new URLSearchParams();
    if (nextSearch) {
      params.set("q", nextSearch);
    }

    if (nextCategory !== "all") {
      params.set("category", nextCategory);
    }

    if (nextSort !== "latest") {
      params.set("sort", nextSort);
    }

    if (nextInStock) {
      params.set("inStock", "1");
    }

    if (nextOutOfStock) {
      params.set("outOfStock", "1");
    }

    if (nextLowStock) {
      params.set("lowStock", "1");
    }

    if (nextOnlyNew) {
      params.set("onlyNew", "1");
    }

    if (nextDiscounted) {
      params.set("discounted", "1");
    }

    for (const filter of nextFeatureFilters) {
      if (filter.trim()) {
        params.append("feature", filter);
      }
    }

    if (nextMin) {
      params.set("minPrice", nextMin);
    }

    if (nextMax) {
      params.set("maxPrice", nextMax);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function toggleFeatureFilter(key: string, value: string) {
    const token = `${key}::${value}`;
    const next = selectedFeatureFilters.includes(token)
      ? selectedFeatureFilters.filter((item) => item !== token)
      : [...selectedFeatureFilters, token];

    setSelectedFeatureFilters(next);
    applyFilters({ featureFilters: next });
  }

  function removeFeatureFilter(token: string) {
    const next = selectedFeatureFilters.filter((item) => item !== token);
    setSelectedFeatureFilters(next);
    applyFilters({ featureFilters: next });
  }

  const sortLabelByValue: Record<SortValue, string> = {
    latest: labels.sortLatest,
    "price-asc": labels.sortPriceAsc,
    "price-desc": labels.sortPriceDesc,
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            applyFilters({ categorySlug: value });
          }}
        >
          <SelectTrigger aria-label={labels.categoryLabel}>
            <SelectValue placeholder={labels.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.allCategories}</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item.id} value={item.slug}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) => {
            const nextValue = value as SortValue;
            setSort(nextValue);
            applyFilters({ sortValue: nextValue });
          }}
        >
          <SelectTrigger aria-label={labels.sortLabel}>
            <SelectValue placeholder={labels.sortLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{labels.sortLatest}</SelectItem>
            <SelectItem value="price-asc">{labels.sortPriceAsc}</SelectItem>
            <SelectItem value="price-desc">{labels.sortPriceDesc}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={inStockOnly ? "default" : "outline"}
          onClick={() => {
            const next = !inStockOnly;
            setInStockOnly(next);
            if (next) {
              setOutOfStockOnly(false);
            }
            applyFilters({ inStock: next, outOfStock: next ? false : outOfStockOnly });
          }}
        >
          {labels.inStockOnly}
        </Button>

        <div className="grid gap-2">
          <Button
            type="button"
            variant={outOfStockOnly ? "default" : "outline"}
            onClick={() => {
              const next = !outOfStockOnly;
              setOutOfStockOnly(next);
              if (next) {
                setInStockOnly(false);
                setLowStockOnly(false);
              }
              applyFilters({
                outOfStock: next,
                inStock: next ? false : inStockOnly,
                lowStock: next ? false : lowStockOnly,
              });
            }}
          >
            {labels.outOfStockOnly}
          </Button>
          <Button
            type="button"
            variant={lowStockOnly ? "default" : "outline"}
            onClick={() => {
              const next = !lowStockOnly;
              setLowStockOnly(next);
              if (next) {
                setOutOfStockOnly(false);
              }
              applyFilters({ lowStock: next, outOfStock: next ? false : outOfStockOnly });
            }}
          >
            {labels.lowStockOnly}
          </Button>
          <Button
            type="button"
            variant={newOnly ? "default" : "outline"}
            onClick={() => {
              const next = !newOnly;
              setNewOnly(next);
              applyFilters({ onlyNew: next });
            }}
          >
            {labels.newOnly}
          </Button>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">{labels.minPrice}</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              onBlur={(event) => applyFilters({ min: event.target.value })}
              placeholder="0"
              aria-label={labels.minPrice}
            />
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">{labels.maxPrice}</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              onBlur={(event) => applyFilters({ max: event.target.value })}
              placeholder="99999"
              aria-label={labels.maxPrice}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              className="w-full"
              variant={discountedOnly ? "default" : "outline"}
              onClick={() => {
                const next = !discountedOnly;
                setDiscountedOnly(next);
                applyFilters({ discounted: next });
              }}
            >
              {labels.discountedOnly}
            </Button>
          </div>
        </div>

        <div className="grid gap-2 rounded-lg border border-border/70 bg-background/70 p-3">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
            <span>{labels.priceRange}</span>
            <span>{sliderMin} - {sliderMax}</span>
          </div>

          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={sliderMin}
            aria-label={labels.minPrice}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              const bounded = Math.min(nextValue, sliderMax);
              setMinPrice(String(bounded));
              applyFilters({ min: String(bounded) });
            }}
            className="h-2 w-full cursor-pointer accent-[color:var(--primary)]"
          />

          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={sliderMax}
            aria-label={labels.maxPrice}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              const bounded = Math.max(nextValue, sliderMin);
              setMaxPrice(String(bounded));
              applyFilters({ max: String(bounded) });
            }}
            className="h-2 w-full cursor-pointer accent-[color:var(--primary)]"
          />
        </div>
      </div>

      {visibleFeatureFacets.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">{labels.featureFiltersTitle}</p>
          <Input
            value={featureSearch}
            onChange={(event) => setFeatureSearch(event.target.value)}
            placeholder={labels.featureSearchPlaceholder}
            aria-label={labels.featureSearchPlaceholder}
          />
          <div className="grid gap-4">
            {visibleFeatureFacets.map((facet) => (
              <div key={facet.key} className="grid gap-2 border-b border-border/70 pb-4 last:border-b-0 last:pb-0">
                <p className="text-sm font-semibold text-foreground/85">{facet.key}</p>
                <div className="grid gap-2">
                  {(expandedFacets[facet.key] ? facet.options : facet.options.slice(0, 8)).map((option) => {
                    const token = `${facet.key}::${option.value}`;
                    const active = selectedFeatureFilters.includes(token);

                    return (
                      <button
                        key={token}
                        type="button"
                        onClick={() => toggleFeatureFilter(facet.key, option.value)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                          active
                            ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-white"
                            : "border-border bg-white text-foreground hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                        }`}
                      >
                        <span>{option.value}</span>
                        <span className={active ? "text-white/80" : "text-muted-foreground"}>({option.count})</span>
                      </button>
                    );
                  })}
                </div>
                {facet.options.length > 8 ? (
                  <div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFacetExpand(facet.key)}
                      className="h-7 px-2 text-xs"
                    >
                      {expandedFacets[facet.key] ? labels.facetShowLess : labels.facetShowMore}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">{labels.activeFilters}</p>
          <div className="flex flex-wrap gap-2">
            {hasSearch ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  applyFilters({ searchText: "" });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.searchLabel}: {search.trim()} x
              </button>
            ) : null}

            {hasCategory ? (
              <button
                type="button"
                onClick={() => {
                  setCategory("all");
                  applyFilters({ categorySlug: "all" });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.categoryLabel}: {categoryMap.get(category) ?? category} x
              </button>
            ) : null}

            {hasSort ? (
              <button
                type="button"
                onClick={() => {
                  setSort("latest");
                  applyFilters({ sortValue: "latest" });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.sortLabel}: {sortLabelByValue[sort]} x
              </button>
            ) : null}

            {hasStockOnly ? (
              <button
                type="button"
                onClick={() => {
                  setInStockOnly(false);
                  applyFilters({ inStock: false });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.inStockOnly} x
              </button>
            ) : null}

            {hasOutOfStockOnly ? (
              <button
                type="button"
                onClick={() => {
                  setOutOfStockOnly(false);
                  applyFilters({ outOfStock: false });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.outOfStockOnly} x
              </button>
            ) : null}

            {hasLowStockOnly ? (
              <button
                type="button"
                onClick={() => {
                  setLowStockOnly(false);
                  applyFilters({ lowStock: false });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.lowStockOnly} x
              </button>
            ) : null}

            {hasNewOnly ? (
              <button
                type="button"
                onClick={() => {
                  setNewOnly(false);
                  applyFilters({ onlyNew: false });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.newOnly} x
              </button>
            ) : null}

            {hasDiscountOnly ? (
              <button
                type="button"
                onClick={() => {
                  setDiscountedOnly(false);
                  applyFilters({ discounted: false });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.discountedOnly} x
              </button>
            ) : null}

            {selectedFeatureFilters.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => removeFeatureFilter(token)}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {token.replace("::", ": ")} x
              </button>
            ))}

            {hasMinPrice || hasMaxPrice ? (
              <button
                type="button"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  applyFilters({ min: "", max: "" });
                }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {labels.priceRange}: {hasMinPrice ? minPrice : "0"} - {hasMaxPrice ? maxPrice : "..."} x
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

    </div>
  );
}
