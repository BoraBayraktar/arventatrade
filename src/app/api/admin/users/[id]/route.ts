import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  IdentityAdminDeleteError,
  identityAdminService,
} from "@/modules/identity/services/identity-admin.service";
import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUserRoles(["ADMIN"]);
    const { id } = await context.params;
    const payload = await request.json();
    const updated = await identityAdminService.updateUser({
      id,
      ...payload,
    });

    await auditLogService.record({
      entityType: "USER",
      entityId: updated.id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `User updated: ${updated.email}`,
    });

    return NextResponse.json({ item: updated });
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUserRoles(["ADMIN"]);
    const { id } = await context.params;
    await identityAdminService.softDeleteUser(id, user.id);
    await auditLogService.record({
      entityType: "USER",
      entityId: id,
      action: "DELETE",
      actorUserId: user.id,
      summary: "User soft-deleted",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof IdentityAdminDeleteError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
