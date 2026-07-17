import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { integrationService } from "@/modules/integration/services/integration.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";

export async function GET(request: Request) {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const { searchParams } = new URL(request.url);

    const result = await integrationService.listJobs({
      channel: (searchParams.get("channel") as "TRENDYOL" | "N11" | "EDOCS_MOCK" | null) ?? undefined,
      jobType: (searchParams.get("jobType") as "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC" | "ORDER_IMPORT" | "ORDER_STATUS_SYNC" | "DOCUMENT_OUTBOUND" | "DOCUMENT_STATUS_SYNC" | null) ?? undefined,
      status: (searchParams.get("status") as "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "DEAD_LETTER" | null) ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireUserRoles(["ADMIN"]);
    const payload = await request.json();
    const result = await integrationService.dispatchJobs(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
