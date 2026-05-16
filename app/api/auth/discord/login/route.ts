import { NextResponse } from "next/server";
import { createDiscordLoginUrl } from "@/lib/discord-auth";

export async function GET() {
  return NextResponse.redirect(
    createDiscordLoginUrl()
  );
}