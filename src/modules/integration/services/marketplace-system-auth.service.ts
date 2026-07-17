function getExpectedSecret() {
  return process.env.MARKETPLACE_SYNC_SECRET ?? process.env.CRON_SECRET ?? null;
}

export function isMarketplaceSystemRequestAuthorized(request: Request) {
  const expectedSecret = getExpectedSecret();

  if (!expectedSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-marketplace-sync-secret");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");

  return authorization === `Bearer ${expectedSecret}`
    || headerSecret === expectedSecret
    || querySecret === expectedSecret;
}
