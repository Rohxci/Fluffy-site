import pg from "pg";

const { Client } = pg;
const GUILD_ID = "1477760575575687182";

async function getUsername(userId, botToken) {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );

    if (!response.ok) return userId;

    const member = await response.json();
    if (member.nick) return member.nick;
    if (member.user?.global_name) return member.user.global_name;
    if (member.user?.username) return member.user.username;

    return userId;
  } catch {
    return userId;
  }
}

function normalizeDbUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  const trimmed = rawUrl.trim();

  // forza sslmode=require se manca
  if (!trimmed.includes("sslmode=")) {
    return trimmed.includes("?")
      ? `${trimmed}&sslmode=require`
      : `${trimmed}?sslmode=require`;
  }

  return trimmed;
}

export async function onRequest(context) {
  let client;

  try {
    const url = new URL(context.request.url);
    const type = url.searchParams.get("type") || "levels";

    const botToken = context.env.BOT_TOKEN;
    const databaseUrl = normalizeDbUrl(context.env.DATABASE_URL);

    if (!databaseUrl) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_database_url" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!botToken) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_bot_token" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let query = "";
    let label = "";

    if (type === "levels") {
      label = "Level";
      query = `
        SELECT user_id, level AS value, xp
        FROM users
        WHERE guild_id = $1
        ORDER BY level DESC, xp DESC
        LIMIT 10
      `;
    } else if (type === "reputation") {
      label = "Reputation";
      query = `
        SELECT user_id, reputation AS value
        FROM users
        WHERE guild_id = $1
        ORDER BY reputation DESC
        LIMIT 10
      `;
    } else if (type === "economy") {
      label = "Coins";
      query = `
        SELECT user_id, coins AS value
        FROM users
        WHERE guild_id = $1
        ORDER BY coins DESC
        LIMIT 10
      `;
    } else {
      return new Response(
        JSON.stringify({ ok: false, error: "invalid_type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    const result = await client.query(query, [GUILD_ID]);

    const rows = await Promise.all(
      result.rows.map(async (row, index) => {
        const username = await getUsername(row.user_id, botToken);
        return {
          position: index + 1,
          user_id: row.user_id,
          username,
          value: row.value
        };
      })
    );

    return new Response(
      JSON.stringify({ ok: true, type, label, rows }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "server_error",
        details: String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (client) {
      try {
        await client.end();
      } catch {}
    }
  }
}
