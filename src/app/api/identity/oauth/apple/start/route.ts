import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createRequestId } from "@/lib/observability";
import { identityService } from "@/modules/identity/services/identity.service";

export async function GET(request: Request) {
  const config = identityService.getAppleOAuthConfig();
  if (!config) {
    return NextResponse.json({ message: "Apple OAuth is not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const state = createRequestId();

  const cookieStore = await cookies();
  cookieStore.set("oauth_apple_state", JSON.stringify({ state, redirectTo }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const authorizeUrl = new URL("https://appleid.apple.com/auth/authorize");
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("response_mode", "form_post");
  authorizeUrl.searchParams.set("scope", "name email");
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl);
}
