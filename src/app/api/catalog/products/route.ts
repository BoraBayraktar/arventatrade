import { NextResponse } from "next/server";

import { catalogService } from "@/modules/catalog/services/catalog.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize")
    ? Number(searchParams.get("pageSize"))
    : 12;

  const result = await catalogService.listProducts({
    search: searchParams.get("search") ?? undefined,
    categorySlug: searchParams.get("category") ?? undefined,
    sort: (searchParams.get("sort") as "latest" | "price-asc" | "price-desc" | null) ?? undefined,
    inStockOnly: searchParams.get("inStock") === "1",
    outOfStockOnly: searchParams.get("outOfStock") === "1",
    lowStockOnly: searchParams.get("lowStock") === "1",
    newOnly: searchParams.get("onlyNew") === "1",
    discountedOnly: searchParams.get("discounted") === "1",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    featureFilters: searchParams.getAll("feature"),
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
