import React, { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function DiscordSetupSection({ isEditing, whopId }) {
  const [guildId, setGuildId] = useState("");
  const [loading, setLoading] = useState(true);
  const [setupCode, setSetupCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [joinRole, setJoinRole] = useState("");
  const [expireAction, setExpireAction] = useState("kick");
  const [expireRole, setExpireRole] = useState("");
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
          setJoinRole(json.data.join_role_id || "");
          setExpireAction(json.data.expire_action || "kick");
          setExpireRole(json.data.expire_role_id || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [whopId]);

  useEffect(() => {
    if (guildId && isEditing) {
      fetch(`https://app.byxbot.com/php/discord_roles.php?whop_id=${whopId}`, {
        credentials: "include",
      })
        .then(res => res.json())
        .then(json => {
          if (json.status === "success" && Array.isArray(json.roles)) {
            setRoles(json.roles);
          }
        })
        .catch(() => {});
    }
  }, [guildId, isEditing, whopId]);

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

  const requestCode = async () => {
    setCodeLoading(true);
    setSetupCode("");
    try {
      const res = await fetch("https://app.byxbot.com/php/discord_link.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_code", whop_id: whopId })
      });
      const json = await res.json();
      if (json.status === "success" && json.code) {
        setSetupCode(json.code);
      }
    } catch {
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch("https://app.byxbot.com/php/discord_link.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          whop_id: whopId,
          join_role_id: joinRole || null,
          expire_action: expireAction,
          expire_role_id: expireRole || null,
        }),
      });
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
          <p className="discord-connected-message">
            <FaCheckCircle /> Discord Connected: {guildId}
          </p>
          {isEditing && (
            <div className="discord-settings-form">
              <label>
                Join Action:
                <select value={joinRole ? "role" : "none"} onChange={e => setJoinRole(e.target.value === "role" ? roles[0]?.id || "" : "")}>
                  <option value="none">Join Only</option>
                  <option value="role">Give Role</option>
                </select>
              </label>
              {joinRole && (
                <select value={joinRole} onChange={e => setJoinRole(e.target.value)}>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
              <label>
                On Expiration:
                <select value={expireAction} onChange={e => setExpireAction(e.target.value)}>
                  <option value="kick">Kick</option>
                  <option value="remove_role">Remove Role</option>
                  <option value="remove_all">Remove All Roles</option>
                </select>
              </label>
              {expireAction === "remove_role" && (
                <select value={expireRole} onChange={e => setExpireRole(e.target.value)}>
                  <option value="">Select role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
              <button className="primary-btn" onClick={handleSaveSettings}>Save Settings</button>
              <button className="primary-btn" onClick={handleDisconnect}>Disconnect</button>
            </div>
          )}
        </div>
      ) : isEditing ? (
        <ol>
          <li>
            Invite the bot to your Discord server using{' '}
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              this link
            </a>
            . After approving, return here.
          </li>
          <li>
            {setupCode ? (
              <>
                Run <code>/setup {setupCode}</code> in your server to finish.
              </>
            ) : (
              <>
                <button
                  className="primary-btn"
                  onClick={requestCode}
                  disabled={codeLoading}
                >
                  {codeLoading ? 'Generating...' : 'Generate Setup Code'}
                </button>
                <div className="setup-hint">Use the code with /setup</div>
              </>
            )}
          </li>
        </ol>
      ) : (
        <p>No Discord server connected.</p>
      )}
    </div>
  );
}
