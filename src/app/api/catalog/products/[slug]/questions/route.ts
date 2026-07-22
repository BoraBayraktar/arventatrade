import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { catalogService } from "@/modules/catalog/services/catalog.service";
import {
  AuthContextError,
  requireUserRoles,
} from "@/modules/identity/services/auth-context.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireUserRoles(["CUSTOMER", "ADMIN", "EDITOR"]);
    const { slug } = await context.params;
    const payload = await request.json();

    const created = await catalogService.createQuestion({
      slug,
      askedBy: user.name,
      question: payload.question,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Product not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
// AUDIT_EXEMPT_REASON: Müşteri ürün soru akışı katalog question tablosunda ve moderasyon auditinde takip edilir; finans/e-belge audit kapsamı değildir.
