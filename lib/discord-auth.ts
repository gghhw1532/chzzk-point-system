export function createDiscordLoginUrl() {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = process.env.DISCORD_REDIRECT_URI!;git add .

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    prompt: "consent",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function getDiscordAccessToken(code: string) {
  const response = await fetch(
    "https://discord.com/api/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret:
          process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function getDiscordMe(
  accessToken: string
) {
  const response = await fetch(
    "https://discord.com/api/users/@me",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}