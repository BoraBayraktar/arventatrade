import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { inventoryService } from "@/modules/inventory/services/inventory.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

const stockInSchema = z.object({
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(64),
  warehouseCode: z.string().trim().min(1).max(32),
  quantity: z.coerce.number().int().min(1),
  note: z.string().trim().min(3).max(280).optional(),
  sourceDocumentNumber: z.string().trim().min(1).max(120).optional(),
  sourceDocumentDate: z.string().datetime().optional(),
  sourceDocumentSupplier: z.string().trim().min(2).max(160).optional(),
  sourceDocumentReference: z.string().trim().min(1).max(160).optional(),
  unitCost: z.coerce.number().nonnegative().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const payload = stockInSchema.parse(await request.json());

    await inventoryService.recordProductInventoryMovement({
      productId: payload.productId,
      sku: payload.sku,
      warehouseCode: payload.warehouseCode,
      quantity: payload.quantity,
      type: "PURCHASE_RECEIPT",
      note: payload.note ?? "Inventory manager stock in",
      sourceDocumentNumber: payload.sourceDocumentNumber,
      sourceDocumentDate: payload.sourceDocumentDate,
      sourceDocumentSupplier: payload.sourceDocumentSupplier,
      sourceDocumentReference: payload.sourceDocumentReference,
      unitCost: payload.unitCost ?? null,
    });

    await auditLogService.record({
      entityType: "PRODUCT",
      entityId: payload.productId,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Stok girişi uygulandı: ${payload.sku}`,
      metadata: {
        warehouseCode: payload.warehouseCode,
        quantity: payload.quantity,
        sourceDocumentNumber: payload.sourceDocumentNumber ?? null,
        sourceDocumentSupplier: payload.sourceDocumentSupplier ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Doğrulama hatası oluştu." }, { status: 400 });
    }

    if (error instanceof Error && error.message.startsWith("WAREHOUSE_NOT_FOUND:")) {
      return NextResponse.json({ message: "Depo bulunamadı." }, { status: 404 });
    }

    if (error instanceof Error && error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      return NextResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });
    }

    if (error instanceof Error && error.message.includes("PurchaseReceipt_receiptNumber_key")) {
      return NextResponse.json({ message: "Bu satın alma belge numarası zaten kullanılıyor." }, { status: 409 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
