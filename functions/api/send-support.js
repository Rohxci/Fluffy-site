export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { username, userId, subject, category, message } = body;

    if (!username || !subject || !category || !message) {
      return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const webhookUrl = context.env.SUPPORT_WEBHOOK_URL;

    const content =
      `**New Support Request**\n` +
      `**User:** ${username} (${userId || "unknown"})\n` +
      `**Subject:** ${subject}\n` +
      `**Category:** ${category}\n` +
      `**Message:**\n${message}`;

    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content
      })
    });

    if (!discordResponse.ok) {
      return new Response(JSON.stringify({ ok: false, error: "discord_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: "server_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
