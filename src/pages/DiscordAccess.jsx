import React from "react";
import { useNotifications } from "../components/NotificationProvider";

export default function DiscordAccess() {
  const { showNotification } = useNotifications();
  const DISCORD_CLIENT_ID = "1391881188901388348";

  const handleConnect = async () => {
    try {
      showNotification({ type: "info", message: "Redirecting to Discord..." });
      window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify+guilds.join`;
    } catch (err) {
      showNotification({ type: "error", message: "Failed to start Discord OAuth" });
    }
  };

  return (
    <div className="discord-access-page">
      <h2>Discord Access</h2>
      <p>Connect your Discord account to join the server.</p>
      <button className="primary-btn" onClick={handleConnect}>
        Get Access
      </button>
    </div>
  );
}
