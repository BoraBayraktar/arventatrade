import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { integrationService } from "@/modules/integration/services/integration.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";

export async function POST(request: Request) {
  try {
    await requireUserRoles(["ADMIN"]);
    const payload = await request.json().catch(() => ({}));
    const result = await integrationService.processQueue(payload);
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
