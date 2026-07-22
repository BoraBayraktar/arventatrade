import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { inventoryService } from "@/modules/inventory/services/inventory.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function GET() {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const result = await inventoryService.listInventoryIntegrationMappings();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN"]);
    const payload = await request.json();
    const result = await inventoryService.upsertInventoryIntegrationMapping(payload);

    await auditLogService.recordFromRequest(request, {
      entityType: "INVENTORY",
      entityId: result.productId,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Entegrasyon eşlemesi güncellendi: ${result.channel} / ${result.productSku}`,
      metadata: {
        channel: result.channel,
        externalProductId: result.externalProductId,
        externalSku: result.externalSku,
        externalWarehouseCode: result.externalWarehouseCode,
        warehouseCode: result.warehouseCode,
        allowInboundUpdates: result.allowInboundUpdates,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Doğrulama hatası oluştu." }, { status: 400 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
