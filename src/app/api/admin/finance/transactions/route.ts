import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { cashTransactionsService } from "@/modules/finance/services/cash-transactions.service";
import { AuthContextError, requireUserRoles } from "@/modules/identity/services/auth-context.service";

export async function GET(request: Request) {
  try {
    await requireUserRoles(["ADMIN", "EDITOR"]);
    const { searchParams } = new URL(request.url);
    const items = await cashTransactionsService.listTransactions({
      search: searchParams.get("search") ?? undefined,
      direction: (searchParams.get("direction") as "all" | "IN" | "OUT" | "TRANSFER" | null) ?? undefined,
      accountId: searchParams.get("accountId") ?? undefined,
    });
    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Doğrulama hatası oluştu." }, { status: 400 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUserRoles(["ADMIN", "EDITOR"]);
    const payload = await request.json();
    const item = await cashTransactionsService.createTransaction({
      ...payload,
      recordedByUserId: user.id,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthContextError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Doğrulama hatası oluştu." }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
