import { NextResponse } from "next/server";

import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { trendyolProductSyncService } from "@/modules/integration/services/trendyol-product-sync.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const result = await trendyolProductSyncService.preflightProduct(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "TRENDYOL_PRODUCT_SYNC_PRODUCT_NOT_FOUND") {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
