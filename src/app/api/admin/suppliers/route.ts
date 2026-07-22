import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { AuthContextError, requirePermission } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET() {
  try {
    await requirePermission("products.read");
    const items = await catalogAdminService.listSuppliers();
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
    const user = await requirePermission("products.manage");
    const payload = await request.json();
    const created = await catalogAdminService.createSupplier(payload);
    await auditLogService.recordFromRequest(request, {
      entityType: "SUPPLIER",
      entityId: created.id,
      action: "CREATE",
      actorUserId: user.id,
      summary: `Tedarikçi oluşturuldu: ${created.name}`,
      metadata: {
        scope: "supplier",
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
