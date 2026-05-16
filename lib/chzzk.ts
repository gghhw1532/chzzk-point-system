export async function sendChzzkChat(message: string) {
  try {
    const accessToken = process.env.CHZZK_ACCESS_TOKEN;

    // 테스트 모드
    if (!accessToken) {
      console.log("[CHZZK BOT TEST]", message);

      return {
        ok: true,
        testMode: true,
      };
    }

    const safeMessage = message.slice(0, 100);

    const response = await fetch(
      "https://openapi.chzzk.naver.com/open/v1/chats/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: safeMessage,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();

      console.error("[CHZZK API ERROR]", text);

      return {
        ok: false,
        error: text,
      };
    }

    return {
      ok: true,
      data: await response.json(),
    };
  } catch (error) {
    console.error("[CHZZK BOT ERROR]", error);

    return {
      ok: false,
      error,
    };
  }
}