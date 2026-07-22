import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  IdentityAdminDeleteError,
  identityAdminService,
} from "@/modules/identity/services/identity-admin.service";
import {
  AuthContextError,
  requirePermission,
} from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("users.manage");
    const { id } = await context.params;
    const payload = await request.json();
    const updated = await identityAdminService.updateUser({
      id,
      ...payload,
    }, user.id);

    await auditLogService.recordFromRequest(request, {
      entityType: "USER",
      entityId: updated.id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Kullanıcı güncellendi: ${updated.email}`,
    });
    if (payload.role !== undefined || payload.roleIds !== undefined || payload.password !== undefined) {
      await auditLogService.recordFromRequest(request, {
        entityType: "AUTH",
        entityId: updated.id,
        action: "PERMISSION_CHANGE",
        actorUserId: user.id,
        summary: `Kullanıcı güvenlik bilgisi güncellendi: ${updated.email}`,
        metadata: {
          roleChanged: payload.role !== undefined,
          rbacRolesChanged: payload.roleIds !== undefined,
          passwordChanged: payload.password !== undefined,
          targetRole: payload.role ?? updated.role,
          targetRoleIds: payload.roleIds ?? updated.roleIds,
        },
      });
    }

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
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("users.manage");
    const { id } = await context.params;
    await identityAdminService.softDeleteUser(id, user.id);
    await auditLogService.recordFromRequest(request, {
      entityType: "USER",
      entityId: id,
      action: "DELETE",
      actorUserId: user.id,
      summary: "Kullanıcı silindi",
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
