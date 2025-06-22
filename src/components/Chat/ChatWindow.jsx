// src/components/Chat/ChatWindow.jsx

import React, { useEffect, useRef, useState } from "react";
import "../../styles/chat.scss";

export default function ChatWindow({ whopId, whopName, whopLogo }) {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [hasMore, setHasMore]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showBack, setShowBack]       = useState(false);
  const [replyTo, setReplyTo]         = useState(null);

  // autocomplete state
  const [suggestions, setSuggestions]         = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const firstIdRef   = useRef(null);
  const lastIdRef    = useRef(null);
  const containerRef = useRef(null);
  const inputRef     = useRef(null);

  const myUsername = sessionStorage.getItem("username");

  // Participants for mention suggestions
  const participants = Array.from(
    new Set(messages.map(m => m.username))
  ).filter(u => u !== myUsername);

  // Highlight @mentions in message text
  const renderMessage = text =>
    text.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="mention">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );

  // 1) Initial load
  const loadInitial = async () => {
    const res = await fetch(
      `https://app.byxbot.com/php/chat/fetch_messages.php?whop_id=${whopId}`,
      { credentials: "include" }
    );
    const d = await res.json();
    if (d.status === "success") {
      setMessages(d.messages);
      setHasMore(d.hasMore);
      firstIdRef.current = d.messages[0]?.id   ?? null;
      lastIdRef.current  = d.messages.slice(-1)[0]?.id ?? null;
      setTimeout(() => {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }, 0);
    }
  };

  // 2) Load older messages
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const c = containerRef.current;
    const prevH = c.scrollHeight;

    const res = await fetch(
      `https://app.byxbot.com/php/chat/fetch_messages.php?` +
      `whop_id=${whopId}&before_id=${firstIdRef.current}`,
      { credentials: "include" }
    );
    const d = await res.json();
    if (d.status === "success" && d.messages.length) {
      setMessages(old => [...d.messages, ...old]);
      setHasMore(d.hasMore);
      firstIdRef.current = d.messages[0].id;
      setTimeout(() => {
        c.scrollTop = c.scrollHeight - prevH;
      }, 0);
      setShowBack(true);
    }
    setLoadingMore(false);
  };

  // 3) Poll for new messages
  useEffect(() => {
    let pollId;
    const start = async () => {
      await loadInitial();
      pollId = setInterval(async () => {
        if (!lastIdRef.current) return;
        const res = await fetch(
          `https://app.byxbot.com/php/chat/fetch_messages.php?` +
          `whop_id=${whopId}&last_id=${lastIdRef.current}`,
          { credentials: "include" }
        );
        const d = await res.json();
        if (d.status === "success" && d.messages.length) {
          setMessages(old => [...old, ...d.messages]);
          lastIdRef.current = d.messages.slice(-1)[0].id;
          setTimeout(() => {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }, 0);
        }
      }, 1000);
    };
    start();
    return () => clearInterval(pollId);
  }, [whopId]);

  // 4) Send message
  const send = async () => {
    let text = input.trim();
    if (!text) return;
    if (replyTo) {
      text = `@${replyTo.username} ${text}`;
    }
    setInput("");
    setReplyTo(null);
    await fetch(
      "https://app.byxbot.com/php/chat/send_message.php",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whop_id: whopId, message: text }),
      }
    );
  };

  // 5) Start replying
  const onReply = msg => {
    setReplyTo({ id: msg.id, username: msg.username });
    setInput(`@${msg.username} `);
    setTimeout(() => inputRef.current.focus(), 0);
  };

  // 6) Handle input change for autocomplete
  const onChange = e => {
    const val = e.target.value;
    setInput(val);
    const match = /@([A-Za-z0-9_]*)$/.exec(val);
    if (match) {
      const term = match[1].toLowerCase();
      const filtered = participants.filter(u =>
        u.toLowerCase().startsWith(term)
      );
      setSuggestions(filtered);
      setActiveSuggestion(0);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // 7) Keyboard nav in suggestions and Enter to send
  const onKeyDown = e => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion(i =>
          i + 1 < suggestions.length ? i + 1 : i
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion(i => (i > 0 ? i - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        onClickSuggestion(suggestions[activeSuggestion]);
      }
      return;
    }
    if (e.key === "Enter") send();
  };

  // 8) Click suggestion
  const onClickSuggestion = username => {
    const newText = input.replace(/@([A-Za-z0-9_]*)$/, `@${username} `);
    setInput(newText);
    setShowSuggestions(false);
    setTimeout(() => inputRef.current.focus(), 0);
  };

  // 9) Scroll to bottom
  const scrollToBottom = () => {
    const c = containerRef.current;
    c.scrollTop = c.scrollHeight;
    setShowBack(false);
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        {whopLogo && (
          <img src={whopLogo} className="chat-whop-logo" alt={whopName} />
        )}
        <h4>{whopName}</h4>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={containerRef}>
        {hasMore && (
          <div className="load-more-wrapper">
            <button
              className="btn-load-more"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Načítám…" : "Načíst další"}
            </button>
          </div>
        )}

        {messages.map(msg => {
          const ts = Number(msg.ts);
          const time = isNaN(ts)
            ? ""
            : new Date(ts).toLocaleTimeString("cs-CZ", {
                hour: "2-digit",
                minute: "2-digit",
              });
          return (
            <div
              key={msg.id}
              className={`chat-message ${msg.mine ? "mine" : "other"}`}
            >
              {!msg.mine && msg.avatar_url && (
                <img src={msg.avatar_url} className="chat-avatar" alt="" />
              )}
              <div className="chat-bubble">
                <div className="chat-bubble-header">
                  <span className="chat-username">{msg.username}</span>
                  <button
                    className="btn-reply"
                    onClick={() => onReply(msg)}
                    title={`Reply to ${msg.username}`}
                  >
                    ↩
                  </button>
                </div>
                <p className="chat-text">{renderMessage(msg.message)}</p>
                <span className="chat-time">{time}</span>
              </div>
              {msg.mine && msg.avatar_url && (
                <img src={msg.avatar_url} className="chat-avatar" alt="" />
              )}
            </div>
          );
        })}

        {showBack && (
          <button className="btn-back-bottom" onClick={scrollToBottom}>
            ↘ Zpět dolu
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="chat-input">
        {replyTo && (
          <div className="reply-indicator">
            Replying to <strong>@{replyTo.username}</strong>
            <button
              className="btn-cancel-reply"
              onClick={() => setReplyTo(null)}
            >
              ✕
            </button>
          </div>
        )}

        <div className="input-wrapper">
          <input
            ref={inputRef}
            placeholder="Napiš zprávu…"
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          {showSuggestions && (
            <ul className="suggestions-list">
              {suggestions.map((u, idx) => (
                <li
                  key={u}
                  className={idx === activeSuggestion ? "active" : ""}
                  onClick={() => onClickSuggestion(u)}
                >
                  {u}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="btn-send" onClick={send}>
          Odeslat
        </button>
      </div>
    </div>
  );
}
