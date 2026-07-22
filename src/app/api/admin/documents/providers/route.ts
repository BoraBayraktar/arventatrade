import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { documentService, DocumentAdminError } from "@/modules/documents/services/document.service";
import { AuthContextError, requirePermission } from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET() {
  try {
    await requirePermission("documents.read");
    const items = await documentService.listProviderConfigs();
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("documents.manage");
    const payload = await request.json();
    const item = await documentService.upsertProviderConfig(payload);

    await auditLogService.recordFromRequest(request, {
      entityType: "INTEGRATION",
      entityId: item.id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Belge sağlayıcısı kaydedildi: ${item.displayName}`,
      metadata: {
        providerCode: item.providerCode,
        isDefault: item.isDefault,
        isActive: item.isActive,
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

    if (error instanceof Error && error.message.includes("DocumentProviderConfig_providerCode_key")) {
      return NextResponse.json({ message: "Bu sağlayıcı kodu zaten kullanılıyor." }, { status: 409 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
