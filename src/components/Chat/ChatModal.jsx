import React, { useEffect, useState } from "react";
import "../../styles/chat.scss";
import ChatWindow from "./ChatWindow";

export default function ChatModal({ onClose }) {
  const [whops, setWhops] = useState([]);
  const [sel, setSel]     = useState(null);

  useEffect(() => {
    fetch("https://app.byxbot.com/php/chat/list_whops.php", {
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === "success") setWhops(d.data);
      });
  }, []);

  const onBackdropClick = e => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="chat-modal-backdrop" onClick={onBackdropClick}>
      <div className="chat-modal">
        <button
          className="chat-modal-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          ✕
        </button>

        <div className="chat-modal-sidebar">
          <ul>
            {whops.map(w => (
              <li
                key={w.id}
                className={sel?.id === w.id ? "active" : ""}
                onClick={() => setSel(w)}
              >
                {w.logo_url && (
                  <img src={w.logo_url} className="whop-logo-sm" alt="" />
                )}
                <span>{w.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-modal-content">
          {sel ? (
            <ChatWindow
              whopId={sel.id}
              whopName={sel.name}
              whopLogo={sel.logo_url}
            />
          ) : (
            <div className="chat-placeholder">Vyber Whop</div>
          )}
        </div>
      </div>
    </div>
  );
}
