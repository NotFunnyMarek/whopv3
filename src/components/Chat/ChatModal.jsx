import React, { useEffect, useState } from "react";
import "../../styles/chat.scss";
import ChatWindow from "./ChatWindow";

export default function ChatModal({ onClose }) {
  const [whopList, setWhopList] = useState([]);
  const [selectedWhop, setSelectedWhop] = useState(null);

  useEffect(() => {
    fetch("https://app.byxbot.com/php/chat/list_whops.php", {
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          setWhopList(data.data);
        }
      });
  }, []);

  const handleBackdropClick = event => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="chat-modal-backdrop" onClick={handleBackdropClick}>
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
            {whopList.map(whop => (
              <li
                key={whop.id}
                className={selectedWhop?.id === whop.id ? "active" : ""}
                onClick={() => setSelectedWhop(whop)}
              >
                {whop.logo_url && (
                  <img src={whop.logo_url} className="whop-logo-sm" alt="" />
                )}
                <span>{whop.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-modal-content">
          {selectedWhop ? (
            <ChatWindow
              whopId={selectedWhop.id}
              whopName={selectedWhop.name}
              whopLogo={selectedWhop.logo_url}
            />
          ) : (
            <div className="chat-placeholder">Select Whop</div>
          )}
        </div>
      </div>
    </div>
  );
}
