import React, { useEffect } from "react";
import { useNotifications } from "../components/NotificationProvider";

export default function DiscordAccess() {
  const { showNotification } = useNotifications();
  const DISCORD_CLIENT_ID = "1391881188901388348";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      showNotification({ type: "error", message: error });
      return;
    }
    if (params.get("code")) {
      showNotification({ type: "success", message: "Discord authorization successful." });
    }
  }, [showNotification]);

  const handleConnect = async () => {
    try {
      showNotification({ type: "info", message: "Redirecting to Discord..." });
      const redirect = encodeURIComponent(window.location.origin + '/discord-access');
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
      <button className="primary-btn" onClick={handleConnect}>
        Get Access
      </button>
    </div>
  );
}
