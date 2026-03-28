export async function onRequest() {
  const partners = [
    {
      name: "United Union Community",
      description: `A friendly and supportive community where people can connect, grow, discover new interests, and enjoy meaningful conversations in a respectful environment.`,
      invite: "https://discord.gg/ZTeWtNdtup"
    },
    {
      name: "Femboy Social",
      description: `A welcoming community for femboys and allies to connect, chat, and share interests. Includes media, art, roleplay, voice chat, and a moderated environment with optional 18+ sections.`,
      invite: "https://discord.gg/HcD98hsdRc"
    },
    {
      name: "The Cozy Furs Lounge",
      description: `A cozy and friendly furry community focused on fun, chats, events, and games. Offers custom roles, giveaways, and an active, moderated environment.`,
      invite: "https://discord.gg/jJDNSGChQr"
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
            name: partner.name,
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
          name: guild.name || partner.name,
          icon: iconUrl,
          description: partner.description,
          invite: partner.invite
        };
      } catch {
        return {
          name: partner.name,
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
