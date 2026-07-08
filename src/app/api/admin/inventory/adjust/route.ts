import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { inventoryService } from "@/modules/inventory/services/inventory.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

const adjustInventorySchema = z.object({
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(64),
  warehouseCode: z.string().trim().min(1).max(32).optional(),
  targetOnHandStock: z.coerce.number().int().min(0),
  note: z.string().trim().min(3).max(280).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const payload = adjustInventorySchema.parse(await request.json());

    await inventoryService.syncProductInventoryState({
      productId: payload.productId,
      sku: payload.sku,
      warehouseCode: payload.warehouseCode,
      targetOnHandStock: payload.targetOnHandStock,
      note: payload.note ?? "Inventory manager manual adjustment",
    });

    await auditLogService.record({
      entityType: "PRODUCT",
      entityId: payload.productId,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Manual stock adjustment applied for ${payload.sku}`,
      metadata: {
        warehouseCode: payload.warehouseCode ?? null,
        targetOnHandStock: payload.targetOnHandStock,
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
