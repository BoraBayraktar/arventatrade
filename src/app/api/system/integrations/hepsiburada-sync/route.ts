import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { isMarketplaceSystemRequestAuthorized } from "@/modules/integration/services/marketplace-system-auth.service";
import { marketplaceIntegrationService } from "@/modules/integration/services/marketplace-integration.service";
import { hepsiburadaStockSyncService } from "@/modules/integration/services/hepsiburada-stock-sync.service";

async function handle(request: Request) {
  if (!isMarketplaceSystemRequestAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const result = await marketplaceIntegrationService.scheduleActiveHepsiburadaImports({
      processQueue: searchParams.get("processQueue") !== "false",
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    });
    const uploadFollowUp = searchParams.get("followUpUploads") === "false"
      ? null
      : await hepsiburadaStockSyncService.followUpPendingUploads({
          limit: searchParams.get("uploadLimit") ? Number(searchParams.get("uploadLimit")) : undefined,
          minCheckIntervalMinutes: searchParams.get("uploadMinCheckIntervalMinutes")
            ? Number(searchParams.get("uploadMinCheckIntervalMinutes"))
            : undefined,
        });

    return NextResponse.json({
      ...result,
      uploadFollowUp,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
