import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { documentWebhookService } from "@/modules/documents/services/document-webhook.service";
import { DocumentAdminError } from "@/modules/documents/services/document.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

const webhookSchema = z.object({
  documentNumber: z.string().trim().min(1).optional().nullable(),
  externalReference: z.string().trim().min(1).optional().nullable(),
  status: z.enum(["NOT_SENT", "QUEUED", "SENT", "FAILED"]).optional().nullable(),
  providerCode: z.string().trim().min(1).optional().nullable(),
});

export async function POST(request: Request, context: { params: Promise<{ providerCode: string }> }) {
  try {
    const { providerCode } = await context.params;
    const rawBody = await request.text();
    const parsedBody = webhookSchema.parse(JSON.parse(rawBody));
    const signature = request.headers.get("x-arventa-signature");

    const item = await documentWebhookService.processProviderWebhook({
      providerCode,
      rawBody,
      signature,
      payload: parsedBody,
    });

    await auditLogService.record({
      entityType: "ORDER",
      entityId: item.orderId ?? item.id,
      action: "STATUS_UPDATE",
      summary: `Belge webhook durumu işlendi: ${item.documentNumber}`,
      metadata: {
        documentId: item.id,
        providerCode,
        externalSystemStatus: item.externalSystemStatus,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof DocumentAdminError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Webhook doğrulama hatası oluştu." }, { status: 400 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
