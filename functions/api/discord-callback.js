export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return Response.redirect(`${url.origin}/login.html?error=missing_code`, 302);
  }

  const clientId = context.env.DISCORD_CLIENT_ID;
  const clientSecret = context.env.DISCORD_CLIENT_SECRET;
  const redirectUri = context.env.DISCORD_REDIRECT_URI;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!tokenResponse.ok) {
    return Response.redirect(`${url.origin}/login.html?error=token_failed`, 302);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    return Response.redirect(`${url.origin}/login.html?error=user_failed`, 302);
  }

  const user = await userResponse.json();

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : "";

  const redirectTo = new URL(`${url.origin}/login.html`);
  redirectTo.searchParams.set("logged_in", "1");
  redirectTo.searchParams.set("id", user.id);
  redirectTo.searchParams.set("username", user.username);
  redirectTo.searchParams.set("avatar", avatarUrl);

  return Response.redirect(redirectTo.toString(), 302);
}
