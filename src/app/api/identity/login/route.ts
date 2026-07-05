import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { identityService } from "@/modules/identity/services/identity.service";

export async function POST(request: Request) {
  const payload = await request.json();

  const result = await identityService.login(payload);
  if (!result) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ user: result.user });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: result.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_TOKEN_TTL_SECONDS,
  });

  return response;
}
