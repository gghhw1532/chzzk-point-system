import { chzzkBotFetchWithRefresh } from "@/lib/chzzk-token";

export async function sendChzzkChat(message: string) {
  try {
    console.log("[CHZZK BOT CHAT TRY]", message);

    const result = await chzzkBotFetchWithRefresh("/open/v1/chats/send", {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    console.log("[CHZZK BOT CHAT SEND]", result);
    return result;
  } catch (error) {
    console.error("[CHZZK BOT CHAT ERROR]", error);
    return null;
  }
}

export function createHighlightMessage(lines: string[]) {
  return ["━━━━━━━━━━━━━━", ...lines, "━━━━━━━━━━━━━━"].join(" ");
}