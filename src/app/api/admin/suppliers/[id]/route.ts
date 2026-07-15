import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const { id } = await context.params;
    const payload = await request.json();
    const updated = await catalogAdminService.updateSupplier({
      id,
      ...payload,
    });

    await auditLogService.record({
      entityType: "PRODUCT",
      entityId: updated.id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Tedarikçi güncellendi: ${updated.name}`,
      metadata: {
        scope: "supplier",
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUserRoles(["ADMIN"]);
    const { id } = await context.params;
    await catalogAdminService.softDeleteSupplier(id, user.id);

    await auditLogService.record({
      entityType: "PRODUCT",
      entityId: id,
      action: "DELETE",
      actorUserId: user.id,
      summary: "Tedarikçi silindi",
      metadata: {
        scope: "supplier",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
