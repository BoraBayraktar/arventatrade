import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AUTH_COOKIE_NAME, AUTH_TOKEN_REMEMBER_ME_TTL_SECONDS, AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { identityService } from "@/modules/identity/services/identity.service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await identityService.register(payload);
    const maxAge = payload?.rememberMe ? AUTH_TOKEN_REMEMBER_ME_TTL_SECONDS : AUTH_TOKEN_TTL_SECONDS;

    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: result.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
