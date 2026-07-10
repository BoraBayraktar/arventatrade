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
    });

    await auditLogService.record({
      entityType: "PRODUCT",
      entityId: payload.productId,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Stock in applied for ${payload.sku}`,
      metadata: {
        warehouseCode: payload.warehouseCode,
        quantity: payload.quantity,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof Error && error.message.startsWith("WAREHOUSE_NOT_FOUND:")) {
      return NextResponse.json({ message: "Warehouse not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
