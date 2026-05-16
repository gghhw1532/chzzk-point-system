import { NextResponse } from "next/server";
import { createChzzkLoginUrl } from "@/lib/chzzk-auth";

export async function GET() {
  const loginUrl = createChzzkLoginUrl();

  return NextResponse.redirect(loginUrl);
}