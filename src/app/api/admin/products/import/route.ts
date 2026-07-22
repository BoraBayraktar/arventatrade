import { NextResponse } from "next/server";

import { catalogImportService } from "@/modules/catalog/services/catalog-import.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "İçe aktarmak için CSV dosyası gereklidir." }, { status: 400 });
    }

    const result = await catalogImportService.importProductsFromCsv(await file.text());

    await auditLogService.recordFromRequest(request, {
      entityType: "PRODUCT",
      action: "IMPORT",
      actorUserId: user.id,
      summary: `ÜRÜN_İÇE_AKTARIM | ${result.createdCount} ürün oluşturuldu`,
      metadata: {
        scope: "product_import",
        createdCount: result.createdCount,
        failedCount: result.failedCount,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
