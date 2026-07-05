import { NextResponse } from "next/server";

import { getRequestIdFromHeaders, logInfo } from "@/lib/observability";

export async function GET(request: Request) {
  const requestId = getRequestIdFromHeaders(request);
  logInfo("Health endpoint invoked", { scope: "health", requestId });

  return NextResponse.json({
    status: "ok",
    service: "arventatrade",
    timestamp: new Date().toISOString(),
    requestId: requestId ?? null,
  });
}
