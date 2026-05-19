import {
  chzzkBotFetchWithRefresh,
  chzzkFetchWithRefresh,
} from "@/lib/chzzk-token";

export async function sendChzzkChat(message: string) {
  try {
    const result = await chzzkBotFetchWithRefresh("/open/v1/chats/send", {
      method: "POST",
      body: JSON.stringify({
        message,
      }),
    });

    console.log("[CHZZK BOT CHAT SEND]", result);

    return result;
  } catch (botError) {
    console.error("[CHZZK BOT CHAT ERROR]", botError);

    console.log("[CHZZK CHAT] 봇 토큰 실패 → 스트리머 토큰으로 재시도");

    try {
      const result = await chzzkFetchWithRefresh("/open/v1/chats/send", {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
      });

      console.log("[CHZZK STREAMER CHAT SEND]", result);

      return result;
    } catch (streamerError) {
      console.error("[CHZZK STREAMER CHAT ERROR]", streamerError);
    }
  }
}

export function createHighlightMessage(lines: string[]) {
  return ["━━━━━━━━━━━━━━", ...lines, "━━━━━━━━━━━━━━"].join(" ");
}