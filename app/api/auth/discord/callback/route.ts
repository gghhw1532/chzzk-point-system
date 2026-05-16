import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getDiscordAccessToken,
  getDiscordMe,
} from "@/lib/discord-auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/me", req.url)
      );
    }

    const url = new URL(req.url);

    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/me?error=discord_code", req.url)
      );
    }

    const tokenData =
      await getDiscordAccessToken(code);

    const discordUser = await getDiscordMe(
      tokenData.access_token
    );

    await supabase
      .from("users")
      .update({
        discord_user_id: discordUser.id,
      })
      .eq("id", user.id);

    return NextResponse.redirect(
      new URL("/me?discord=connected", req.url)
    );
  } catch (error) {
    console.error(
      "[DISCORD CONNECT ERROR]",
      error
    );

    return NextResponse.redirect(
      new URL("/me?discord=failed", req.url)
    );
  }
}