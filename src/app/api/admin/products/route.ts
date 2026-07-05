import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET(request: Request) {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const { searchParams } = new URL(request.url);
    const products = await catalogAdminService.listProducts({
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 10,
    });
    return NextResponse.json(products);
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
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const payload = await request.json();
    const created = await catalogAdminService.createProduct(payload);
    await auditLogService.record({
      entityType: "PRODUCT",
      entityId: created.id,
      action: "CREATE",
      actorUserId: user.id,
      summary: `Product created: ${created.slug}`,
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
