const baseUrl = process.env.APP_URL || "http://localhost:3001";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const healthResponse = await fetch(`${baseUrl}/api/system/health`, {
    headers: {
      "x-request-id": "verify-platform-health",
    },
  });
  assert(healthResponse.status === 200, `Health expected 200, got ${healthResponse.status}`);
  assert(healthResponse.headers.get("x-request-id"), "Health response should include request id header");
  assert(healthResponse.headers.get("x-content-type-options") === "nosniff", "Health response should include security headers");

  const healthPayload = await healthResponse.json();
  assert(healthPayload.status === "ok", "Health payload status should be ok");

  const readyResponse = await fetch(`${baseUrl}/api/system/ready`, {
    headers: {
      "x-request-id": "verify-platform-ready",
    },
  });
  assert(readyResponse.status === 200, `Ready expected 200, got ${readyResponse.status}`);
  const readyPayload = await readyResponse.json();
  assert(readyPayload.status === "ready", "Ready payload should be ready");

  const homeResponse = await fetch(`${baseUrl}/tr`);
  assert(homeResponse.status === 200, `Home expected 200, got ${homeResponse.status}`);
  const csp = homeResponse.headers.get("content-security-policy") || "";
  assert(csp.includes("default-src 'self'"), "Home response should include CSP header");

  console.log("Platform verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
