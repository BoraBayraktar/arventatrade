import { NextResponse } from "next/server";

import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";
import { inventoryService } from "@/modules/inventory/services/inventory.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const { id } = await context.params;
    const applied = await inventoryService.applyStockCount(id);

    await auditLogService.record({
      entityType: "PRODUCT",
      entityId: id,
      action: "UPDATE",
      actorUserId: user.id,
      summary: `Stock count applied: ${applied.countNumber}`,
      metadata: {
        transactionNumber: applied.transactionNumber,
      },
    });

    return NextResponse.json({ ok: true, ...applied });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message.startsWith("STOCK_COUNT_NOT_FOUND:")) {
      return NextResponse.json({ message: "Stock count not found" }, { status: 404 });
    }

    if (error instanceof Error && (error.message === "STOCK_COUNT_ALREADY_APPLIED" || error.message === "STOCK_COUNT_NOT_READY")) {
      return NextResponse.json({ message: error.message === "STOCK_COUNT_NOT_READY" ? "Count lines must be entered before apply" : "Stock count is already applied" }, { status: 409 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
