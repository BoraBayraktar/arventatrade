import { NextResponse } from "next/server";

import { catalogExportService } from "@/modules/catalog/services/catalog-export.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const { searchParams } = new URL(request.url);

    const exported = await catalogExportService.exportProducts({
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      status: searchParams.get("status") as "all" | "DRAFT" | "ACTIVE" | "ARCHIVED" | null ?? undefined,
      brandId: searchParams.get("brandId") ?? undefined,
      supplierId: searchParams.get("supplierId") ?? undefined,
    });

    await auditLogService.record({
      entityType: "PRODUCT",
      action: "UPDATE",
      actorUserId: user.id,
      summary: `ÜRÜN_DIŞA_AKTARIM | ${exported.total} satır dışa aktarıldı`,
      metadata: {
        scope: "product_export",
        total: exported.total,
      },
    });

    return new NextResponse(exported.content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exported.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
