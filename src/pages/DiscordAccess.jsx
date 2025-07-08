import React, { useEffect, useState } from "react";
import { useNotifications } from "../components/NotificationProvider";

export default function DiscordAccess() {
  const { showNotification } = useNotifications();
  const DISCORD_CLIENT_ID = "1391881188901388348";
  const [joined, setJoined] = useState(false);
  const [guildId, setGuildId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const whopId = params.get("whop_id");
    const error = params.get("error");
    if (error) {
      showNotification({ type: "error", message: error });
      return;
    }
    const code = params.get("code");
    if (code) {
      fetch("https://app.byxbot.com/php/discord_oauth.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, whop_id: Number(whopId), redirect_uri: window.location.origin + "/discord-access?whop_id=" + whopId })
      })
        .then(res => res.json())
        .then(json => {
          if (json.status === "success") {
            setJoined(true);
            setGuildId(json.guild_id || "");
            showNotification({ type: "success", message: "Discord account linked." });
          } else {
            showNotification({ type: "error", message: json.message || "Failed to link Discord" });
          }
        })
        .catch(() => {
          showNotification({ type: "error", message: "Failed to link Discord" });
        });
    }
  }, [showNotification]);

  const handleConnect = async () => {
    try {
      showNotification({ type: "info", message: "Redirecting to Discord..." });
      const params = new URLSearchParams(window.location.search);
      const whopId = params.get("whop_id");
      const redirect = encodeURIComponent(window.location.origin + '/discord-access?whop_id=' + whopId);
      window.location.href =
        `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
        `&response_type=code&scope=identify+guilds.join&redirect_uri=${redirect}`;
    } catch (err) {
      showNotification({ type: "error", message: "Failed to start Discord OAuth" });
    }
  };

  return (
    <div className="discord-access-page">
      <h2>Discord Access</h2>
      <p>Connect your Discord account to join the server.</p>
      {joined ? (
        <a
          className="primary-btn"
          href={
            guildId
              ? `https://discord.com/channels/${guildId}`
              : "https://discord.com/channels/@me"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Discord Server
        </a>
      ) : (
        <button className="primary-btn" onClick={handleConnect}>
          Get Access
        </button>
      )}
    </div>
  );
}
