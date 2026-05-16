import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getChzzkAccessToken, getChzzkMe } from "@/lib/chzzk-auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(new URL("/me?error=missing_code", req.url));
    }

    const tokenData = await getChzzkAccessToken(code, state);
    const accessToken = tokenData.content?.accessToken ?? tokenData.accessToken;
    const refreshToken = tokenData.content?.refreshToken ?? tokenData.refreshToken;

    const meData = await getChzzkMe(accessToken);
    const userContent = meData.content ?? meData;

    const chzzkChannelId =
      userContent.channelId ?? userContent.channel?.channelId;
    const nickname =
      userContent.channelName ?? userContent.channel?.channelName ?? "이름 없음";
    const profileImageUrl =
      userContent.profileImageUrl ?? userContent.channel?.profileImageUrl ?? null;

    if (!chzzkChannelId) {
      return NextResponse.redirect(new URL("/me?error=no_channel_id", req.url));
    }

    

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("chzzk_channel_id", chzzkChannelId)
      .maybeSingle();

    let userId = existingUser?.id;

    if (existingUser) {
      await supabase
        .from("users")
        .update({
          nickname,
          profile_image_url: profileImageUrl,
          updated_at: new Date().toISOString(),
          chzzk_access_token: accessToken,
chzzk_refresh_token: refreshToken,
chzzk_token_updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id);
    } else {
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          chzzk_channel_id: chzzkChannelId,
          nickname,
          profile_image_url: profileImageUrl,
          points: 0,
          role: "user",
          chzzk_access_token: accessToken,
chzzk_refresh_token: refreshToken,
chzzk_token_updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      userId = newUser.id;
    }

    const cookieStore = await cookies();

    cookieStore.set("current_user_id", userId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    cookieStore.set("chzzk_access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (refreshToken) {
      cookieStore.set("chzzk_refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.redirect(new URL("/me", req.url));
  } catch (error) {
    console.error("[CHZZK CALLBACK ERROR]", error);
    return NextResponse.redirect(new URL("/me?error=login_failed", req.url));
  }
}