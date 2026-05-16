import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  cookieStore.delete("current_user_id");
  cookieStore.delete("chzzk_access_token");
  cookieStore.delete("chzzk_refresh_token");

  return NextResponse.redirect(new URL("/me", req.url));
}