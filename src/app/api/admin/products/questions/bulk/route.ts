import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";
import { auditLogService } from "@/modules/system/services/audit-log.service";

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const payload = (await request.json().catch(() => null)) as {
      ids?: string[];
      action?: "answer" | "delete";
      answer?: string;
    } | null;

    const result = await catalogAdminService.bulkModerateProductQuestions({
      ids: payload?.ids ?? [],
      action: payload?.action ?? "delete",
      answer: payload?.answer,
      answeredBy: payload?.action === "answer" ? user.name : undefined,
      deletedUserId: payload?.action === "delete" ? user.id : undefined,
    });

    await auditLogService.record({
      entityType: "PRODUCT",
      action: payload?.action === "answer" ? "UPDATE" : "DELETE",
      actorUserId: user.id,
      summary:
        payload?.action === "answer"
          ? `Bulk answer for product questions: ${result.affected}`
          : `Bulk remove product questions: ${result.affected}`,
      metadata: {
        action: payload?.action,
        count: result.affected,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
