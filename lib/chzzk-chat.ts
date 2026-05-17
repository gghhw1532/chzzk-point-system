import { chzzkFetchWithRefresh } from "@/lib/chzzk-token";

export async function sendChzzkChat(message: string) {
  try {
    const result = await chzzkFetchWithRefresh(
      "/open/v1/chats/send",
      {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
      }
    );

    console.log("[CHZZK CHAT SEND]", result);

    return result;
  } catch (error) {
    console.error("[CHZZK CHAT ERROR]", error);
  }
}

export function createHighlightMessage(lines: string[]) {
  return [
    "━━━━━━━━━━━━━━",
    ...lines,
    "━━━━━━━━━━━━━━",
  ].join(" ");
}