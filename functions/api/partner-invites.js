export async function onRequest() {
  const partners = [
    {
      name: "United Union Community",
      description: `Welcome to the United Union Community. A friendly and supportive community where people can connect, grow together, discover new interests, join events and enjoy meaningful conversations in a respectful and welcoming environment.`,
      invite: "https://discord.gg/ZTeWtNdtup"
    },
    {
      name: "Femboy Social",
      description: `🌸 Femboy Social 🌸  

A welcoming, chill community space designed for femboys and allies to hang out, express themselves, and connect with others.

✨ What we offer:  
• Friendly and inclusive environment  
• Channels for chatting, media, memes, art, pets, and roleplay  
• Dedicated about-me and birthday sections to share who you are  
• Voice chat for real-time conversations  
• Organized ticket system for support and moderation  

🔞 18+ sections available for mature conversations (kept separate and moderated)

🛡️ Safe & moderated:  
Active staff, clear rules, and admin logs help keep the server respectful and enjoyable for everyone.

💬 Whether you’re here to make friends, share your interests, or just vibe—there’s a place for you here.

Join, introduce yourself, and be part of the community 💖`,
      invite: "https://discord.gg/HcD98hsdRc"
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
