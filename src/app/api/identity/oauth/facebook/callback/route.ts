import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { identityService } from "@/modules/identity/services/identity.service";

type FacebookTokenResponse = {
  access_token?: string;
};

type FacebookProfileResponse = {
  id: string;
  email?: string;
  name?: string;
};

export async function GET(request: Request) {
  const config = identityService.getFacebookOAuthConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  const cookieStore = await cookies();
  const rawState = cookieStore.get("oauth_facebook_state")?.value;
  const parsedState = rawState ? JSON.parse(rawState) as { state: string; redirectTo: string } : null;

  if (!state || !code || !parsedState || parsedState.state !== state) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const tokenUrl = new URL("https://graph.facebook.com/v23.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", config.clientId);
  tokenUrl.searchParams.set("client_secret", config.clientSecret);
  tokenUrl.searchParams.set("redirect_uri", config.redirectUri);
  tokenUrl.searchParams.set("code", code);

  const finalTokenResponse = await fetch(tokenUrl, {
    method: "GET",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!finalTokenResponse.ok) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const tokenPayload = await finalTokenResponse.json() as FacebookTokenResponse;
  if (!tokenPayload.access_token) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const profileUrl = new URL("https://graph.facebook.com/me");
  profileUrl.searchParams.set("fields", "id,name,email");
  profileUrl.searchParams.set("access_token", tokenPayload.access_token);

  const profileResponse = await fetch(profileUrl, {
    method: "GET",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!profileResponse.ok) {
    return NextResponse.redirect(new URL("/?oauth=failed", request.url));
  }

  const profilePayload = await profileResponse.json() as FacebookProfileResponse;
  const result = await identityService.loginWithSocialProfile(identityService.createFacebookProfile(profilePayload));
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
    name: "oauth_facebook_state",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
