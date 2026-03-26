export async function onRequest() {
  const partners = [
    {
      description: `Welcome to the United Union Community. A friendly and supportive community where people can connect, grow together, discover new interests, join events and enjoy meaningful conversations in a respectful and welcoming environment.`,
      invite: "https://discord.gg/ZTeWtNdtup"
    }
  ];

  const results = await Promise.all(
    partners.map(async (partner) => {
      try {
        const code = partner.invite
          .replace("https://discord.gg/", "")
          .replace("https://discord.com/invite/", "")
          .trim();

        const response = await fetch(
          `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true&with_expiration=true`,
          {
            headers: {
              "User-Agent": "TheFluffyKingdomSite/1.0"
            }
          }
        );

        if (!response.ok) {
          return {
            name: code === "ZTeWtNdtup" ? "United Union Community" : "Unknown Server",
            icon: "",
            description: partner.description,
            invite: partner.invite
          };
        }

        const data = await response.json();
        const guild = data.guild || {};

        const iconUrl =
          guild.icon && guild.id
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256`
            : "";

        return {
          name: guild.name || (code === "ZTeWtNdtup" ? "United Union Community" : "Unknown Server"),
          icon: iconUrl,
          description: partner.description,
          invite: partner.invite
        };
      } catch {
        const code = partner.invite
          .replace("https://discord.gg/", "")
          .replace("https://discord.com/invite/", "")
          .trim();

        return {
          name: code === "ZTeWtNdtup" ? "United Union Community" : "Unknown Server",
          icon: "",
          description: partner.description,
          invite: partner.invite
        };
      }
    })
  );

  return new Response(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}
