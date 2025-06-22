// src/components/Chat/ChatWindow.jsx

import React, { useEffect, useRef, useState } from "react";
import "../../styles/chat.scss";

export default function ChatWindow({ whopId, whopName, whopLogo }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [muteUntil, setMuteUntil] = useState(null);
  const [openEmojiPickerFor, setOpenEmojiPickerFor] = useState(null);

  const firstMessageIdRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const currentUsername = sessionStorage.getItem("username");

  // All participants except the current user
  const participants = Array.from(
    new Set(messages.map(m => m.username))
  ).filter(u => u !== currentUsername);

  // Load the initial batch of messages
  const loadInitialMessages = async () => {
    const response = await fetch(
      `https://app.byxbot.com/php/chat/fetch_messages.php?whop_id=${whopId}`,
      { credentials: "include" }
    );
    const data = await response.json();
    if (data.status === "success") {
      setMessages(data.messages);
      setHasMore(data.hasMore);
      firstMessageIdRef.current = data.messages[0]?.id ?? null;
      lastMessageIdRef.current = data.messages.slice(-1)[0]?.id ?? null;
      // Scroll to bottom after loading
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 0);
    }
  };

  // Load older messages
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const container = messagesContainerRef.current;
    const previousHeight = container.scrollHeight;

    const response = await fetch(
      `https://app.byxbot.com/php/chat/fetch_messages.php?whop_id=${whopId}&before_id=${firstMessageIdRef.current}`,
      { credentials: "include" }
    );
    const data = await response.json();
    if (data.status === "success" && data.messages.length) {
      setMessages(old => [...data.messages, ...old]);
      setHasMore(data.hasMore);
      firstMessageIdRef.current = data.messages[0].id;
      // Maintain scroll position
      setTimeout(() => {
        container.scrollTop = container.scrollHeight - previousHeight;
      }, 0);
      setShowScrollToBottom(true);
    }
    setLoadingMore(false);
  };

  // Poll for new messages
  useEffect(() => {
    let pollingId;
    (async () => {
      await loadInitialMessages();
      pollingId = setInterval(async () => {
        if (!lastMessageIdRef.current) return;
        const response = await fetch(
          `https://app.byxbot.com/php/chat/fetch_messages.php?whop_id=${whopId}&last_id=${lastMessageIdRef.current}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.status === "success" && data.messages.length) {
          setMessages(old => [...old, ...data.messages]);
          lastMessageIdRef.current = data.messages.slice(-1)[0].id;
          setTimeout(() => {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }, 0);
        }
      }, 1000);
    })();
    return () => clearInterval(pollingId);
  }, [whopId]);

  // Send a message (with JSON-parse fallback)
  const sendMessage = async () => {
    setErrorMessage("");
    if (muteUntil && new Date() < muteUntil) {
      setErrorMessage(`Blocked until ${muteUntil.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`);
      return;
    }
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");

    const response = await fetch("https://app.byxbot.com/php/chat/send_message.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whop_id: whopId,
        message: text,
        reply_to: replyToMessage?.id ?? null
      })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
    if (data?.status === "error") {
      setErrorMessage(data.message);
      if (data.message.includes("muted")) {
        const unblockTime = new Date(Date.now() + 30 * 1000);
        setMuteUntil(unblockTime);
        setTimeout(() => setErrorMessage(""), 30 * 1000);
      }
    } else {
      setReplyToMessage(null);
      await loadInitialMessages();
    }
  };

  // Handle replying to a message
  const handleReply = msg => {
    setReplyToMessage({
      id: msg.id,
      username: msg.username,
      excerpt:
        msg.message.length > 30
          ? msg.message.slice(0, 30) + "…"
          : msg.message
    });
    setTimeout(() => inputRef.current.focus(), 0);
  };

  // Autocomplete for @mentions
  const handleInputChange = e => {
    const value = e.target.value;
    setInputValue(value);
    const match = /@([A-Za-z0-9_]*)$/.exec(value);
    if (match) {
      const term = match[1].toLowerCase();
      const filtered = participants.filter(u =>
        u.toLowerCase().startsWith(term)
      );
      setAutocompleteSuggestions(filtered);
      setActiveSuggestionIndex(0);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputKeyDown = e => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex(i => Math.min(i + 1, autocompleteSuggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        chooseSuggestion(autocompleteSuggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Enter") {
      sendMessage();
    }
  };

  const chooseSuggestion = username => {
    setInputValue(inputValue.replace(/@([A-Za-z0-9_]*)$/, `@${username} `));
    setShowSuggestions(false);
    setTimeout(() => inputRef.current.focus(), 0);
  };

  // Scroll helpers
  const scrollToMessage = id => {
    const element = messagesContainerRef.current.querySelector(`[data-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const scrollToBottom = () => {
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    setShowScrollToBottom(false);
  };

  // Emoji reactions
  const emojiMap = {
    like: "👍",
    smile: "😊",
    fire: "🔥",
    heart: "❤️",
    dislike: "👎"
  };

  const addReaction = async (messageId, type) => {
    await fetch("https://app.byxbot.com/php/chat/react_message.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id: messageId, reaction_type: type })
    });
    setOpenEmojiPickerFor(null);
    await loadInitialMessages();
  };

  // Render a single message bubble
  const renderMessage = msg => {
    const timeString = isNaN(msg.ts)
      ? ""
      : new Date(msg.ts).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });
    const original = msg.reply_to
      ? messages.find(m => m.id === msg.reply_to)
      : null;

    return (
      <div
        key={msg.id}
        data-id={msg.id}
        className={`chat-message ${msg.mine ? "mine" : "other"}`}
      >
        {!msg.mine && msg.avatar_url && (
          <img src={msg.avatar_url} className="chat-avatar" alt="" />
        )}
        <div className="chat-bubble">
          <div className="chat-bubble-header">
            <span className="chat-username">{msg.username}</span>
            <button className="btn-reply" onClick={() => handleReply(msg)}>
              ↩
            </button>
          </div>
          {original && (
            <div
              className="chat-reply-ref"
              onClick={() => scrollToMessage(original.id)}
            >
              <strong>@{original.username}</strong>:{" "}
              {original.message.slice(0, 30)}
              {original.message.length > 30 ? "…" : ""}
            </div>
          )}
          <p className="chat-text">
            {msg.message.split(/(@\w+)/g).map((part, i) =>
              part.startsWith("@") ? (
                <span key={i} className="mention">
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
          <div className="chat-reactions">
            {Object.entries(msg.reactions || {}).map(
              ([type, count]) =>
                count > 0 && (
                  <span key={type} className="reaction-display">
                    {emojiMap[type]} {count}
                  </span>
                )
            )}
            <button
              className="btn-emoji-picker"
              onClick={() => setOpenEmojiPickerFor(msg.id)}
            >
              😊
            </button>
            {openEmojiPickerFor === msg.id && (
              <div className="emoji-picker">
                {Object.entries(emojiMap).map(([type, emoji]) => (
                  <button
                    key={type}
                    onClick={() => addReaction(msg.id, type)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="chat-time">{timeString}</span>
        </div>
        {msg.mine && msg.avatar_url && (
          <img src={msg.avatar_url} className="chat-avatar" alt="" />
        )}
      </div>
    );
  };

  const isCurrentlyMuted = muteUntil && new Date() < muteUntil;

  return (
    <div className="chat-window">
      <div className="chat-header">
        {whopLogo && (
          <img src={whopLogo} className="chat-whop-logo" alt={whopName} />
        )}
        <h4>{whopName}</h4>
      </div>
      <div className="chat-messages" ref={messagesContainerRef}>
        {hasMore && (
          <div className="load-more-wrapper">
            <button
              className="btn-load-more"
              onClick={loadMoreMessages}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading…" : "Load More"}
            </button>
          </div>
        )}
        {messages.map(renderMessage)}
        {showScrollToBottom && (
          <button
            className="btn-back-bottom"
            onClick={scrollToBottom}
          >
            ↘ Back to Bottom
          </button>
        )}
      </div>
      <div className={`chat-input ${isCurrentlyMuted ? "muted" : ""}`}>
        {errorMessage && (
          <div className="chat-error">{errorMessage}</div>
        )}
        {replyToMessage && (
          <div
            className="reply-indicator"
            onClick={() => scrollToMessage(replyToMessage.id)}
          >
            Replying to <strong>@{replyToMessage.username}</strong>: “
            {replyToMessage.excerpt}”
            <button
              className="btn-cancel-reply"
              onClick={() => setReplyToMessage(null)}
            >
              ✕
            </button>
          </div>
        )}
        <div className="input-wrapper">
          <input
            ref={inputRef}
            placeholder={
              isCurrentlyMuted ? "You are muted…" : "Type a message…"
            }
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            disabled={isCurrentlyMuted}
          />
          {showSuggestions && (
            <ul className="suggestions-list">
              {autocompleteSuggestions.map((user, idx) => (
                <li
                  key={user}
                  className={idx === activeSuggestionIndex ? "active" : ""}
                  onClick={() => chooseSuggestion(user)}
                >
                  {user}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="btn-send"
          onClick={sendMessage}
          disabled={isCurrentlyMuted}
        >
          Send
        </button>
      </div>
    </div>
  );
}
