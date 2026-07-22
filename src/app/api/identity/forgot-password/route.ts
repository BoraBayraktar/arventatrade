import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { identityService } from "@/modules/identity/services/identity.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

function maskEmail(value: unknown) {
  if (typeof value !== "string" || !value.includes("@")) {
    return null;
  }

  const [name, domain] = value.toLowerCase().split("@");
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await identityService.requestPasswordReset(payload);
    await auditLogService.recordFromRequest(request, {
      entityType: "AUTH",
      action: "PASSWORD_RESET_REQUEST",
      actorType: "SYSTEM",
      summary: "Şifre sıfırlama talebi alındı",
      metadata: {
        emailMasked: maskEmail(payload?.email),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
