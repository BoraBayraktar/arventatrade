import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { documentService, DocumentAdminError } from "@/modules/documents/services/document.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const { id } = await context.params;
    const created = await documentService.createInvoiceFromDeliveryNote(id);

    await auditLogService.record({
      entityType: "ORDER",
      entityId: created.orderId ?? created.id,
      action: "CREATE",
      actorUserId: user.id,
      summary: `İrsaliyeden e-fatura oluşturuldu: ${created.documentNumber}`,
      metadata: {
        documentId: created.id,
        documentType: created.documentType,
        sourceDocumentId: id,
        inventoryTransactionId: created.inventoryTransactionId,
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
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

    if (error instanceof Error && error.message.includes("BusinessDocument_documentNumber_key")) {
      return NextResponse.json({ message: "Bu e-fatura numarası zaten kullanılıyor." }, { status: 409 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
