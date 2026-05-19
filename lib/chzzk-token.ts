import { supabaseAdmin } from "@/lib/supabase/admin";

const CHZZK_API = "https://openapi.chzzk.naver.com";

type ChzzkToken = {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  role: "streamer" | "chzzk_bot";
};

async function getTokenByRole(role: "streamer" | "chzzk_bot"): Promise<ChzzkToken> {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("role", role)
    .not("chzzk_access_token", "is", null)
    .order("chzzk_token_updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!user?.chzzk_access_token) {
    throw new Error(`DB에서 ${role} access_token을 찾지 못했습니다.`);
  }

  return {
    userId: user.id,
    accessToken: user.chzzk_access_token,
    refreshToken: user.chzzk_refresh_token,
    role,
  };
}

async function refreshChzzkToken(token: ChzzkToken): Promise<ChzzkToken> {
  if (!token.refreshToken) {
    throw new Error(`${token.role} refresh_token이 없습니다. 다시 로그인해야 합니다.`);
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

  if (error) throw new Error(error.message);

  return {
    ...token,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

async function requestWithToken(
  token: ChzzkToken,
  path: string,
  options: RequestInit = {}
) {
  return fetch(`${CHZZK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function fetchWithRoleRefresh(
  role: "streamer" | "chzzk_bot",
  path: string,
  options: RequestInit = {}
) {
  let token = await getTokenByRole(role);

  let response = await requestWithToken(token, path, options);
if (response.status === 401) {
  console.log(`[CHZZK ${role}] access_token 만료됨 → 재로그인 필요`);

  await supabaseAdmin.from("bot_status").upsert(
    {
      name: role === "streamer" ? "chzzk" : "chzzk_bot",
      status: "error",
      memo:
        role === "streamer"
          ? "치지직 스트리머 재로그인 필요"
          : "치지직 봇 계정 재로그인 필요",
      last_ping: new Date().toISOString(),
    },
    { onConflict: "name" }
  );

  throw new Error(
    role === "streamer"
      ? "치지직 스트리머 계정 재로그인 필요"
      : "치지직 봇 계정 재로그인 필요"
  );
}

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error(`[CHZZK ${role} API ERROR]`, response.status, data);
    throw new Error(`[CHZZK API ERROR] ${response.status}`);
  }

  return data;
}

export function chzzkFetchWithRefresh(path: string, options: RequestInit = {}) {
  return fetchWithRoleRefresh("streamer", path, options);
}

export function chzzkBotFetchWithRefresh(path: string, options: RequestInit = {}) {
  return fetchWithRoleRefresh("chzzk_bot", path, options);
}