import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { catalogService } from "@/modules/catalog/services/catalog.service";
import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireUserRoles(["CUSTOMER", "ADMIN", "EDITOR"]);
    const { slug } = await context.params;
    const item = await catalogService.getOwnReview({ slug, userId: user.id });
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireUserRoles(["CUSTOMER", "ADMIN", "EDITOR"]);
    const { slug } = await context.params;
    const payload = await request.json();

    const item = await catalogService.updateOwnReview({
      slug,
      userId: user.id,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Review not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireUserRoles(["CUSTOMER", "ADMIN", "EDITOR"]);
    const { slug } = await context.params;

    await catalogService.deleteOwnReview({ slug, userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Review not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
