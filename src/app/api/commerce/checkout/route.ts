import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { CommerceCheckoutError, commerceService } from "@/modules/commerce/services/commerce.service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await commerceService.checkout(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    if (error instanceof CommerceCheckoutError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
