import { NextResponse } from "next/server";

import { createRequestId, getRequestIdFromHeaders, logInfo } from "@/lib/observability";

export async function GET(request: Request) {
  const requestId = getRequestIdFromHeaders(request) ?? createRequestId();
  logInfo("Health endpoint invoked", { scope: "health", requestId });

  return NextResponse.json(
    {
      status: "ok",
      service: "2bem",
      timestamp: new Date().toISOString(),
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
