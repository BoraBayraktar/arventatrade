import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { logError, logInfo } from "@/lib/observability";
import { identityService } from "@/modules/identity/services/identity.service";

export async function GET(request: Request) {
  const config = identityService.getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  const cookieStore = await cookies();
  const rawState = cookieStore.get("oauth_google_state")?.value;
  const parsedState = rawState ? JSON.parse(rawState) as { state: string; redirectTo: string } : null;

  if (!state || !code || !parsedState || parsedState.state !== state) {
    logError("Google OAuth callback state validation failed", {
      scope: "identity.oauth.google",
      hasState: Boolean(state),
      hasCode: Boolean(code),
      hasParsedState: Boolean(parsedState),
    });
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    logError("Google OAuth token exchange failed", {
      scope: "identity.oauth.google",
      status: tokenResponse.status,
    });
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const tokenPayload = await tokenResponse.json() as { id_token?: string };
  if (!tokenPayload.id_token) {
    logError("Google OAuth token payload did not include id_token", {
      scope: "identity.oauth.google",
    });
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const result = await identityService.loginWithSocialProfile(identityService.extractGoogleProfile(tokenPayload.id_token));
  const redirectUrl = new URL(parsedState.redirectTo.startsWith("/") ? parsedState.redirectTo : "/", config.appUrl);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: result.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_TOKEN_TTL_SECONDS,
  });
  logInfo("Google OAuth login completed", {
    scope: "identity.oauth.google",
    userId: result.user.id,
    redirectUrl: redirectUrl.toString(),
    appUrl: config.appUrl,
    requestOrigin: new URL(request.url).origin,
  });
  response.cookies.set({
    name: "oauth_google_state",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
