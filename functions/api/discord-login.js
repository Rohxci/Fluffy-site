export async function onRequest(context) {
  const clientId = context.env.DISCORD_CLIENT_ID;
  const redirectUri = context.env.DISCORD_REDIRECT_URI;

  const authUrl =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=identify`;

  return Response.redirect(authUrl, 302);
}
