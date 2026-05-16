import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import io from "socket.io-client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateBotStatus } from "@/lib/bot-status";

const CHZZK_API = "https://openapi.chzzk.naver.com";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";


async function getStreamerToken() {
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

  return streamer.chzzk_access_token;
}

async function chzzkFetch(
  accessToken: string,
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${CHZZK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[CHZZK API ERROR] ${response.status} ${text}`);
  }

  return response.json();
}

async function createSessionUrl(accessToken: string) {
  const data = await chzzkFetch(accessToken, "/open/v1/sessions/auth");
  return data.content?.url ?? data.url;
}

async function subscribeEvent(
  accessToken: string,
  sessionKey: string,
  type: "chat" | "donation" | "subscription"
) {
  await chzzkFetch(
    accessToken,
    `/open/v1/sessions/events/subscribe/${type}?sessionKey=${sessionKey}`,
    { method: "POST" }
  );

  console.log(`[CHZZK] ${type} 구독 요청 완료`);
}

async function postToLocalApi(path: string, body: unknown) {
  const response = await fetch(`${siteUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  let result: unknown = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    console.log(`[LOCAL API ERROR] ${path}`, {
      status: response.status,
      result,
    });
  } else {
    console.log(`[LOCAL API SUCCESS] ${path}`, result);
  }

  return result;
}

function parseEvent(rawData: any) {
  if (typeof rawData === "string") {
    return JSON.parse(rawData);
  }

  return rawData;
}

async function start() {
  console.log("[CHZZK] 세션 봇 시작");

  const accessToken = await getStreamerToken();

  console.log("[CHZZK] DB에서 스트리머 토큰 로드 완료");

  const sessionUrl = await createSessionUrl(accessToken);

  console.log("[CHZZK] 세션 URL 발급 완료");

  const socket = io.connect(sessionUrl, {
    reconnection: true,
    timeout: 3000,
    transports: ["websocket"],
  });

  socket.on("connect", async () => {
    console.log("[CHZZK] Socket.IO 연결 완료");

    await updateBotStatus(
      "chzzk",
      "online",
      "치지직 세션 연결됨"
    );
  });

  socket.on("SYSTEM", async (rawData: any) => {
    const data = parseEvent(rawData);

    console.log("[CHZZK SYSTEM]", JSON.stringify(data));

    if (data?.type !== "connected") {
      return;
    }

    const sessionKey = data?.data?.sessionKey;

    if (!sessionKey) {
      console.log("[CHZZK] sessionKey 없음");
      return;
    }

    console.log("[CHZZK] sessionKey:", sessionKey);

    await subscribeEvent(accessToken, sessionKey, "chat");
    await subscribeEvent(accessToken, sessionKey, "donation");
    await subscribeEvent(accessToken, sessionKey, "subscription");
  });

  socket.on("CHAT", async (rawData: any) => {
    const data = parseEvent(rawData);

    console.log("[CHZZK CHAT]", data);

    await postToLocalApi("/api/chzzk/chat-reward", {
      chzzkChannelId: data.senderChannelId,
      message: data.content,
    });
  });

  socket.on("DONATION", async (rawData: any) => {
    const data = parseEvent(rawData);

    console.log("[CHZZK DONATION]", data);

    await postToLocalApi("/api/chzzk/donation-reward", {
      chzzkChannelId: data.donatorChannelId,
      nickname: data.donatorNickname,
      payAmount: Number(data.payAmount),
      message: data.donationText,
    });
  });

  socket.on("SUBSCRIPTION", async (rawData: any) => {
    const data = parseEvent(rawData);

    console.log("[CHZZK SUBSCRIPTION]", data);

    const giftCount =
      data.giftCount ||
      data.gift_count ||
      data.count ||
      0;

    const gifterChannelId =
      data.gifterChannelId ||
      data.senderChannelId ||
      data.subscriberChannelId;

    if (giftCount > 0) {
      await postToLocalApi("/api/chzzk/subscription-gift-reward", {
        chzzkChannelId: gifterChannelId,
        nickname: data.gifterNickname || data.subscriberNickname,
        giftCount,
      });

      return;
    }

    await postToLocalApi("/api/chzzk/subscription-reward", {
      chzzkChannelId: data.subscriberChannelId,
      nickname: data.subscriberNickname,
      tierNo: data.tierNo,
      month: data.month,
    });
  });

  socket.on("disconnect", async () => {
    console.log("[CHZZK] 연결 종료");

    await updateBotStatus(
      "chzzk",
      "offline",
      "치지직 세션 연결 종료"
    );
  });

  socket.on("connect_error", async (error: any) => {
    console.error("[CHZZK CONNECT ERROR]", error);

    await updateBotStatus(
      "chzzk",
      "error",
      "치지직 세션 연결 오류"
    );
  });
}

start().catch((error) => {
  console.error("[CHZZK SESSION BOT ERROR]", error);

  updateBotStatus(
    "chzzk",
    "error",
    "치지직 세션 봇 실행 오류"
  ).catch(console.error);
});