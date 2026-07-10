import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { identityService } from "@/modules/identity/services/identity.service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await identityService.requestPasswordReset(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
