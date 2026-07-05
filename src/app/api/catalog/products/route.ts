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
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
