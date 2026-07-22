import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { customerAccountService } from "@/modules/customers/services/customer-account.service";
import { AuthContextError, requirePermission } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("finance.manage");
    const { id } = await context.params;
    const payload = await request.json();
    const updated = await customerAccountService.updateCustomerAccount({
      id,
      ...payload,
    });

    await auditLogService.recordFromRequest(request, {
      entityType: "CUSTOMER_ACCOUNT",
      entityId: updated.id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Müşteri kartı güncellendi: ${updated.name}`,
      metadata: {
        scope: "customer-account",
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Doğrulama hatası oluştu." }, { status: 400 });
    }

    return NextResponse.json({ message: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
