import { NextResponse } from "next/server";

import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";
import { notificationService } from "@/modules/system/services/notification.service";

export async function PATCH() {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    await notificationService.markAllAsRead(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
