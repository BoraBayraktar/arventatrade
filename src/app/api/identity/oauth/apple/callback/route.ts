import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { identityService } from "@/modules/identity/services/identity.service";

export async function POST(request: Request) {
  const config = identityService.getAppleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const form = await request.formData();
  const code = form.get("code");
  const state = form.get("state");

  const cookieStore = await cookies();
  const rawState = cookieStore.get("oauth_apple_state")?.value;
  const parsedState = rawState ? JSON.parse(rawState) as { state: string; redirectTo: string } : null;

  if (typeof code !== "string" || typeof state !== "string" || !parsedState || parsedState.state !== state) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const clientSecret = await identityService.createAppleClientSecret();
  if (!clientSecret) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const tokenPayload = await tokenResponse.json() as { id_token?: string };
  if (!tokenPayload.id_token) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const result = await identityService.loginWithSocialProfile(identityService.extractAppleProfile(tokenPayload.id_token));
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
  response.cookies.set({
    name: "oauth_apple_state",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
