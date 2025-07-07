import React from "react";

export default function DiscordAccessSetup() {
  return (
    <div className="discord-setup-page">
      <h2>Discord Access Setup</h2>
      <ol>
        <li>Invite the bot to your Discord server using the link from your dashboard.</li>
        <li>Run the `/setup` command in your server.</li>
        <li>The bot will DM you a six digit code. Run `/setup <code>` to finish.</li>
      </ol>
      <p>Once completed, this page will show your connected server.</p>
    </div>
  );
}
