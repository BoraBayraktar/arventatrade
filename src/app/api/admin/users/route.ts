import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { identityAdminService } from "@/modules/identity/services/identity-admin.service";
import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET(request: Request) {
  try {
    await requireUserRoles(["ADMIN"]);
    const { searchParams } = new URL(request.url);

    const users = await identityAdminService.listUsers({
      search: searchParams.get("search") ?? undefined,
      role: (searchParams.get("role") as "ADMIN" | "EDITOR" | "CUSTOMER" | null) ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 10,
    });

    return NextResponse.json(users);
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

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN"]);
    const payload = await request.json();
    const created = await identityAdminService.createUser(payload);
    await auditLogService.record({
      entityType: "USER",
      entityId: created.id,
      action: "CREATE",
      actorUserId: user.id,
      summary: `User created: ${created.email}`,
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
