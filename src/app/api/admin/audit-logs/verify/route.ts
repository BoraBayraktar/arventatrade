import { NextResponse } from "next/server";

import { AuthContextError, requirePermission } from "@/modules/identity/services/auth-context.service";
import { auditAnchorService } from "@/modules/system/services/audit-anchor.service";

export async function GET(request: Request) {
  try {
    await requirePermission("audit.read");
    const { searchParams } = new URL(request.url);
    const result = await auditAnchorService.verifyRange({
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      take: searchParams.get("take") ? Number(searchParams.get("take")) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
