import { NextResponse } from "next/server";

import { documentEvidencePackageService } from "@/modules/documents/services/document-evidence-package.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUserRoles(["ADMIN"]);
    const { id } = await context.params;
    const evidencePackage = await documentEvidencePackageService.buildPackage(id);

    await auditLogService.recordFromRequest(request, {
      entityType: "BUSINESS_DOCUMENT",
      entityId: id,
      action: "AUDIT_EXPORT",
      actorUserId: user.id,
      summary: "E-belge kanıt paketi dışa aktarıldı",
      metadata: {
        packageHash: evidencePackage.packageHash,
        documentNumber: evidencePackage.document.documentNumber,
      },
    });

    return new NextResponse(JSON.stringify(evidencePackage, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="document-evidence-${evidencePackage.document.documentNumber}.json"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "DOCUMENT_NOT_FOUND") {
      return NextResponse.json({ message: "Belge bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
