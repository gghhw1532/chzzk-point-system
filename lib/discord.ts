const DISCORD_API = "https://discord.com/api/v10";

function getBotToken() {
  return process.env.DISCORD_BOT_TOKEN;
}

export async function sendDiscordChannelMessage(message: string) {
  const token = getBotToken();
  const channelId = process.env.DISCORD_NOTIFY_CHANNEL_ID;

  if (!token || !channelId) {
    console.log("[DISCORD CHANNEL TEST]", message);
    return;
  }

  await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  });
}

export async function sendDiscordDM(discordUserId: string, message: string) {
  const token = getBotToken();

  if (!token || !discordUserId) {
    console.log("[DISCORD DM TEST]", discordUserId, message);
    return;
  }

  const dmResponse = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient_id: discordUserId,
    }),
  });

  if (!dmResponse.ok) {
    console.error("[DISCORD DM CHANNEL ERROR]", await dmResponse.text());
    return;
  }

  const dmChannel = await dmResponse.json();

  const messageResponse = await fetch(
    `${DISCORD_API}/channels/${dmChannel.id}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    }
  );

  if (!messageResponse.ok) {
    console.error("[DISCORD DM SEND ERROR]", await messageResponse.text());
  }
}