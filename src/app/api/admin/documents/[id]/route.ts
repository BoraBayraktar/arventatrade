import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { documentService, DocumentAdminError } from "@/modules/documents/services/document.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const { id } = await context.params;
    const item = await documentService.getBusinessDocumentById(id);
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof DocumentAdminError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Doğrulama hatası oluştu." }, { status: 400 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const { id } = await context.params;
    const payload = await request.json();
    const updated = await documentService.updateBusinessDocument({ id, ...payload });

    await auditLogService.record({
      entityType: "ORDER",
      entityId: updated.orderId ?? updated.id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Belge güncellendi: ${updated.documentNumber}`,
      metadata: {
        documentId: updated.id,
        status: updated.status,
        externalSystemStatus: updated.externalSystemStatus,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof DocumentAdminError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Doğrulama hatası oluştu." }, { status: 400 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
