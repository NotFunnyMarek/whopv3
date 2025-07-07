import React, { useEffect, useState } from "react";

export default function DiscordSetupSection({ isEditing }) {
  const [guildId, setGuildId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://app.byxbot.com/php/discord_link.php", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(json => {
        if (json.status === "success" && json.data && json.data.guild_id) {
          setGuildId(json.data.guild_id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const inviteUrl =
    `https://discord.com/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&permissions=8&scope=bot+applications.commands`;

  return (
    <div className="discord-setup-section">
      <h2 className="discord-setup-title">Discord Access Setup</h2>
      {loading ? (
        <p>Loading...</p>
      ) : guildId ? (
        <p>Connected server ID: {guildId}</p>
      ) : isEditing ? (
        <ol>
          <li>
            Invite the bot to your Discord server using
            {" "}
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              this link
            </a>
            .
          </li>
          <li>Run the <code>/setup</code> command in your server.</li>
          <li>
            The bot will DM you a six digit code. Run
            <code> /setup &lt;code&gt;</code> to finish.
          </li>
        </ol>
      ) : (
        <p>No Discord server connected.</p>
      )}
    </div>
  );
}
