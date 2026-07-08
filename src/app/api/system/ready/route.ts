import { NextResponse } from "next/server";

import { createRequestId, getRequestIdFromHeaders, logError, logInfo } from "@/lib/observability";
import { systemService } from "@/modules/system/services/system.service";

export async function GET(request: Request) {
  const requestId = getRequestIdFromHeaders(request) ?? createRequestId();

  const readiness = await systemService.checkReadiness();

  if (readiness.status === "ready") {
    logInfo("Readiness endpoint succeeded", { scope: "readiness", requestId });

    return NextResponse.json(
      {
        ...readiness,
        requestId,
      },
      {
        headers: {
          "x-request-id": requestId,
          "x-content-type-options": "nosniff",
        },
      },
    );
  }

  logError("Readiness endpoint failed", {
    scope: "readiness",
    requestId,
  });

  return NextResponse.json(
    {
      ...readiness,
      requestId,
    },
    {
      status: 503,
      headers: {
        "x-request-id": requestId,
        "x-content-type-options": "nosniff",
      },
    },
  );
}
