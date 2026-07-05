import { NextResponse } from "next/server";

import { getRequestIdFromHeaders, logError, logInfo } from "@/lib/observability";
import { systemService } from "@/modules/system/services/system.service";

export async function GET(request: Request) {
  const requestId = getRequestIdFromHeaders(request);

  const readiness = await systemService.checkReadiness();

  if (readiness.status === "ready") {
    logInfo("Readiness endpoint succeeded", { scope: "readiness", requestId });

    return NextResponse.json({
      ...readiness,
      requestId: requestId ?? null,
    });
  }

  logError("Readiness endpoint failed", {
    scope: "readiness",
    requestId,
  });

  return NextResponse.json({
    ...readiness,
    requestId: requestId ?? null,
  }, { status: 503 });
}
