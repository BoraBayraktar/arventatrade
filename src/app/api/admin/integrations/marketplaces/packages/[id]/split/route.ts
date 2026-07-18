import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { marketplaceIntegrationService } from "@/modules/integration/services/marketplace-integration.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUserRoles(["ADMIN"]);
    const { id } = await params;
    const payload = await request.json();
    const result = await marketplaceIntegrationService.splitPackage({
      packageId: id,
      ...payload,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "MARKETPLACE_PACKAGE_NOT_FOUND") {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "N11_PACKAGE_SPLIT_STATUS_INVALID") {
      return NextResponse.json({ message: "Only Picking packages can be split" }, { status: 409 });
    }

    if (error instanceof Error && error.message === "TRENDYOL_PACKAGE_SPLIT_STATUS_INVALID") {
      return NextResponse.json({ message: "Package status is not eligible for split" }, { status: 409 });
    }

    if (error instanceof Error && error.message === "N11_PACKAGE_SPLIT_QUANTITY_INVALID") {
      return NextResponse.json({ message: "Split quantity exceeds line quantity" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "TRENDYOL_PACKAGE_SPLIT_QUANTITY_INVALID") {
      return NextResponse.json({ message: "Split quantity exceeds line quantity" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "TRENDYOL_PACKAGE_SPLIT_ALL_LINES_INVALID") {
      return NextResponse.json({ message: "At least one line must remain in the original package" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "MARKETPLACE_LINE_NOT_FOUND") {
      return NextResponse.json({ message: "Package line not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "MARKETPLACE_PACKAGE_UNSUPPORTED_CHANNEL") {
      return NextResponse.json({ message: "Package split is not supported for this channel" }, { status: 409 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
