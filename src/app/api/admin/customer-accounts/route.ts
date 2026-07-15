import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { customerAccountService } from "@/modules/customers/services/customer-account.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET() {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const items = await customerAccountService.listCustomerAccounts();
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const payload = await request.json();
    const created = await customerAccountService.createCustomerAccount(payload);
    await auditLogService.record({
      entityType: "CUSTOMER_ACCOUNT",
      entityId: created.id,
      action: "CREATE",
      actorUserId: user.id,
      summary: `Müşteri kartı oluşturuldu: ${created.name}`,
      metadata: {
        scope: "customer-account",
      },
    });
    return NextResponse.json({ item: created }, { status: 201 });
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
