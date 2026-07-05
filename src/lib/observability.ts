type LogLevel = "INFO" | "ERROR";

type LogContext = {
  requestId?: string;
  scope?: string;
  [key: string]: unknown;
};

function writeLog(level: LogLevel, message: string, context: LogContext = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const serialized = JSON.stringify(payload);
  if (level === "ERROR") {
    console.error(serialized);
    return;
  }

  console.info(serialized);
}

export function createRequestId() {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `rid-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function getRequestIdFromHeaders(request: Request) {
  return request.headers.get("x-request-id") ?? undefined;
}

export function logInfo(message: string, context?: LogContext) {
  writeLog("INFO", message, context);
}

export function logError(message: string, context?: LogContext) {
  writeLog("ERROR", message, context);
}
