export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const {
      username,
      userId,
      discordTag,
      banReason,
      unbanReason,
      notes
    } = body;

    if (!username || !discordTag || !banReason || !unbanReason) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const webhookUrl = context.env.BAN_APPEAL_WEBHOOK_URL;

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_ban_webhook_secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const content =
      `**New Ban Appeal**\n` +
      `**Logged in user:** ${username} (${userId || "unknown"})\n` +
      `**Discord username:** ${discordTag}\n` +
      `**Reason for ban:** ${banReason}\n` +
      `**Why should we unban you:** ${unbanReason}\n` +
      `**Additional notes:** ${notes || "None"}`;

    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    if (!discordResponse.ok) {
      const discordText = await discordResponse.text();

      return new Response(
        JSON.stringify({
          ok: false,
          error: "discord_failed",
          status: discordResponse.status,
          details: discordText
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "server_error",
        details: String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
