import React, { useEffect, useState } from "react";

export default function DiscordSetupSection({ isEditing, whopId }) {
  const [guildId, setGuildId] = useState("");
  const [loading, setLoading] = useState(true);
  const DISCORD_CLIENT_ID = "1391881188901388348";

  useEffect(() => {
    fetch(`https://app.byxbot.com/php/discord_link.php?whop_id=${whopId}`, {
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
  }, [whopId]);

  const handleDisconnect = async () => {
    try {
      await fetch("https://app.byxbot.com/php/discord_link.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink", whop_id: whopId })
      });
      setGuildId("");
    } catch {}
  };

  const inviteUrl =
    `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot+applications.commands`;

  return (
    <div className="discord-setup-section">
      <h2 className="discord-setup-title">Discord Access Setup</h2>
      {loading ? (
        <p>Loading...</p>
      ) : guildId ? (
        <div>
          <p>Connected server ID: {guildId}</p>
          {isEditing && (
            <button className="primary-btn" onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
        </div>
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
