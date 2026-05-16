export function createChzzkLoginUrl() {
  const clientId = process.env.CHZZK_CLIENT_ID!;
  const redirectUri = process.env.CHZZK_REDIRECT_URI!;

  const state = crypto.randomUUID();

  const url = new URL("https://chzzk.naver.com/account-interlock");
  url.searchParams.set("clientId", clientId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function getChzzkAccessToken(code: string, state: string) {
  const clientId = process.env.CHZZK_CLIENT_ID!;
  const clientSecret = process.env.CHZZK_CLIENT_SECRET!;

  const response = await fetch(
    "https://openapi.chzzk.naver.com/auth/v1/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grantType: "authorization_code",
        clientId,
        clientSecret,
        code,
        state,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function getChzzkMe(accessToken: string) {
  const response = await fetch(
    "https://openapi.chzzk.naver.com/open/v1/users/me",
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