import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { documentDispatchService } from "@/modules/documents/services/document-dispatch.service";
import { DocumentAdminError } from "@/modules/documents/services/document.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const { id } = await context.params;
    const payload = await request.json().catch(() => ({}));
    const item = await documentDispatchService.queueOutboundDispatch({
      id,
      channel: "EDOCS_MOCK",
      forceFail: payload.forceFail === true,
    });

    await auditLogService.record({
      entityType: "ORDER",
      entityId: item.orderId ?? item.id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Belge outbound kuyruğuna alındı: ${item.documentNumber}`,
      metadata: {
        documentId: item.id,
        documentNumber: item.documentNumber,
        externalSystemStatus: item.externalSystemStatus,
        dispatchCount: item.dispatches.length,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
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
