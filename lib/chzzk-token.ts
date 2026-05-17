import { supabaseAdmin } from "@/lib/supabase/admin";

const CHZZK_API = "https://openapi.chzzk.naver.com";

type StreamerToken = {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
};

export async function getStreamerToken(): Promise<StreamerToken> {
  const { data: streamer, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("role", "streamer")
    .not("chzzk_access_token", "is", null)
    .order("chzzk_token_updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!streamer?.chzzk_access_token) {
    throw new Error("DB에서 스트리머 chzzk_access_token을 찾지 못했습니다.");
  }

  return {
    userId: streamer.id,
    accessToken: streamer.chzzk_access_token,
    refreshToken: streamer.chzzk_refresh_token,
  };
}

export async function refreshStreamerToken(token: StreamerToken) {
  if (!token.refreshToken) {
    throw new Error("스트리머 refresh_token이 없습니다. 다시 로그인해야 합니다.");
  }

  const response = await fetch(`${CHZZK_API}/auth/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": process.env.CHZZK_CLIENT_ID!,
      "Client-Secret": process.env.CHZZK_CLIENT_SECRET!,
    },
    body: JSON.stringify({
      grantType: "refresh_token",
      refreshToken: token.refreshToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[CHZZK TOKEN REFRESH ERROR]", data);
    throw new Error("치지직 토큰 자동 재발급 실패");
  }

  const content = data.content ?? data;

  const newAccessToken = content.accessToken;
  const newRefreshToken = content.refreshToken ?? token.refreshToken;

  if (!newAccessToken) {
    throw new Error("치지직 새 access_token이 없습니다.");
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      chzzk_access_token: newAccessToken,
      chzzk_refresh_token: newRefreshToken,
      chzzk_token_updated_at: new Date().toISOString(),
    })
    .eq("id", token.userId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    userId: token.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function chzzkFetchWithRefresh(
  path: string,
  options: RequestInit = {}
) {
  let token = await getStreamerToken();

  async function request(accessToken: string) {
    return fetch(`${CHZZK_API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  }

  let response = await request(token.accessToken);

  if (response.status === 401) {
    console.log("[CHZZK] access_token 만료 감지 → 자동 재발급 시도");

    token = await refreshStreamerToken(token);

    response = await request(token.accessToken);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[CHZZK API ERROR] ${response.status} ${text}`);
  }

  return response.json();
}