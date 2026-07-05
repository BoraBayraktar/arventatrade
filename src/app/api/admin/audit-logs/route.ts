import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET(request: Request) {
  try {
    await requireUserRoles(["ADMIN"]);
    const { searchParams } = new URL(request.url);

    const result = await auditLogService.list({
      search: searchParams.get("search") ?? undefined,
      entityType: (searchParams.get("entityType") as
        | "USER"
        | "PRODUCT"
        | "CATEGORY"
        | "ORDER"
        | "STOREFRONT_ITEM"
        | "AUTH"
        | null) ?? undefined,
      actorUserId: searchParams.get("actorUserId") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 20,
    });

    return NextResponse.json(result);
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
