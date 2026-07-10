import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { identityService } from "@/modules/identity/services/identity.service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await identityService.resetPassword(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "PASSWORD_RESET_TOKEN_INVALID") {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
