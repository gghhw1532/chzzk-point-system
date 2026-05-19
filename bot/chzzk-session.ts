import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import io from "socket.io-client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { startBotHeartbeat, updateBotStatus } from "@/lib/bot-status";
import { chzzkFetchWithRefresh } from "@/lib/chzzk-token";
import { startWatchRewardLoop } from "./watch-reward-loop";
import { handleChzzkCommand } from "./chzzk-commands";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";



async function createSessionUrl() {
  const data = await chzzkFetchWithRefresh("/open/v1/sessions/auth");
  return data.content?.url ?? data.url;
}

async function subscribeEvent(
  sessionKey: string,
  type: "chat" | "donation" | "subscription"
) {
  await chzzkFetchWithRefresh(
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



console.log("[CHZZK] DB에서 스트리머 토큰 로드 시도");

startWatchRewardLoop();

const sessionUrl = await createSessionUrl();

console.log("[CHZZK] 세션 URL 발급 완료");

  const socket = io.connect(sessionUrl, {
    reconnection: true,
    timeout: 3000,
    transports: ["websocket"],
  });

  socket.on("connect", async () => {
  console.log("[CHZZK] Socket.IO 연결 완료");

  startBotHeartbeat(
    "chzzk",
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

await subscribeEvent(sessionKey, "chat");
await subscribeEvent(sessionKey, "donation");
await subscribeEvent(sessionKey, "subscription");
  });

  socket.on("CHAT", async (rawData: any) => {
    const data = parseEvent(rawData);

    console.log("[CHZZK CHAT]", data);

    const handledCommand = await handleChzzkCommand(data);

if (handledCommand) {
  return;
}

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