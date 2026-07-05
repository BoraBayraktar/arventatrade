import { NextResponse } from "next/server";

import { catalogService } from "@/modules/catalog/services/catalog.service";

export async function GET() {
  const categories = await catalogService.listCategories();
  return NextResponse.json(categories);
}
