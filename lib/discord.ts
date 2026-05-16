const botToken = process.env.DISCORD_BOT_TOKEN;
const notifyChannelId = process.env.DISCORD_NOTIFY_CHANNEL_ID;

export async function sendDiscordDM(userId: string, message: string) {
  if (!botToken) return;

  const dmResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient_id: userId,
    }),
  });

  const dmChannel = await dmResponse.json();

  await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  });
}

export async function sendDiscordChannelMessage(message: string) {
  if (!botToken || !notifyChannelId) {
    console.log("[DISCORD CHANNEL] 토큰 또는 채널 ID 없음");
    return;
  }

  const response = await fetch(
    `https://discord.com/api/v10/channels/${notifyChannelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("[DISCORD CHANNEL ERROR]", response.status, text);
  }
}