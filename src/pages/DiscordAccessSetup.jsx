import React from "react";

export default function DiscordAccessSetup() {
  return (
    <div className="discord-setup-page">
      <h2>Discord Access Setup</h2>
      <ol>
        <li>Invite the bot to your Discord server using the link from your dashboard.</li>
        <li>Generate a setup code in the dashboard.</li>
        <li>
          Run <code>/setup &lt;code&gt;</code> in your server with that code to finish linking.
        </li>
      </ol>
      <p>Once completed, this page will show your connected server.</p>
    </div>
  );
}
