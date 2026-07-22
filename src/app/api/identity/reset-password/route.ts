import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { identityService } from "@/modules/identity/services/identity.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await identityService.resetPassword(payload);
    await auditLogService.recordFromRequest(request, {
      entityType: "AUTH",
      action: "PASSWORD_RESET_COMPLETE",
      actorType: "SYSTEM",
      summary: "Şifre sıfırlama tamamlandı",
      metadata: {
        tokenProvided: Boolean(payload?.token),
      },
    });

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
