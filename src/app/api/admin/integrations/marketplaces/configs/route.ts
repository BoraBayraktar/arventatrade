import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireUserRoles, AuthContextError } from "@/modules/identity/services/auth-context.service";
import { marketplaceIntegrationService } from "@/modules/integration/services/marketplace-integration.service";

export async function GET() {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const result = await marketplaceIntegrationService.listConfigs();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireUserRoles(["ADMIN"]);
    const payload = await request.json();
    const result = await marketplaceIntegrationService.upsertConfig(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "MARKETPLACE_CONFIG_SECRET_REQUIRED") {
      return NextResponse.json({ message: "Marketplace credentials are required" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
