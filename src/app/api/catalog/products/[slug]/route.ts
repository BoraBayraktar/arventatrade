import { NextResponse } from "next/server";

import { catalogService } from "@/modules/catalog/services/catalog.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = await catalogService.getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
