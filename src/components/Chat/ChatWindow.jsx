// src/components/Chat/ChatWindow.jsx

import React, { useEffect, useRef, useState } from "react";
import "../../styles/chat.scss";

export default function ChatWindow({ whopId, whopName, whopLogo }) {
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [hasMore, setHasMore]             = useState(false);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [showBack, setShowBack]           = useState(false);
  const [replyTo, setReplyTo]             = useState(null);
  const [suggestions, setSuggestions]     = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [errorMsg, setErrorMsg]           = useState("");
  const [muteUntil, setMuteUntil]         = useState(null);
  const [openEmojiPickerFor, setOpenEmojiPickerFor] = useState(null);

  const firstIdRef   = useRef(null);
  const lastIdRef    = useRef(null);
  const containerRef = useRef(null);
  const inputRef     = useRef(null);

  const myUsername = sessionStorage.getItem("username");

  // All participants except self
  const participants = Array.from(
    new Set(messages.map(m => m.username))
  ).filter(u => u !== myUsername);

  // Load messages
  const loadInitial = async () => {
    const res = await fetch(`https://app.byxbot.com/php/chat/fetch_messages.php?whop_id=${whopId}`, { credentials: "include" });
    const d = await res.json();
    if (d.status === "success") {
      setMessages(d.messages);
      setHasMore(d.hasMore);
      firstIdRef.current = d.messages[0]?.id ?? null;
      lastIdRef.current  = d.messages.slice(-1)[0]?.id ?? null;
      setTimeout(() => containerRef.current.scrollTop = containerRef.current.scrollHeight, 0);
    }
  };

  // Load older
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const c = containerRef.current, prevH = c.scrollHeight;
    const res = await fetch(
      `https://app.byxbot.com/php/chat/fetch_messages.php?whop_id=${whopId}&before_id=${firstIdRef.current}`,
      { credentials: "include" }
    );
    const d = await res.json();
    if (d.status === "success" && d.messages.length) {
      setMessages(old => [...d.messages, ...old]);
      setHasMore(d.hasMore);
      firstIdRef.current = d.messages[0].id;
      setTimeout(() => c.scrollTop = c.scrollHeight - prevH, 0);
      setShowBack(true);
    }
    setLoadingMore(false);
  };

  // Polling
  useEffect(() => {
    let pollId;
    (async () => {
      await loadInitial();
      pollId = setInterval(async () => {
        if (!lastIdRef.current) return;
        const res = await fetch(
          `https://app.byxbot.com/php/chat/fetch_messages.php?whop_id=${whopId}&last_id=${lastIdRef.current}`,
          { credentials: "include" }
        );
        const d = await res.json();
        if (d.status === "success" && d.messages.length) {
          setMessages(old => [...old, ...d.messages]);
          lastIdRef.current = d.messages.slice(-1)[0].id;
          setTimeout(() => containerRef.current.scrollTop = containerRef.current.scrollHeight, 0);
        }
      }, 1000);
    })();
    return () => clearInterval(pollId);
  }, [whopId]);

  // Send with JSON-parse fallback
  const send = async () => {
    setErrorMsg("");
    if (muteUntil && new Date() < muteUntil) {
      setErrorMsg(`Zablokován do ${muteUntil.toLocaleTimeString("cs-CZ")}`);
      return;
    }
    const text = input.trim();
    if (!text) return;
    setInput("");
    const res = await fetch("https://app.byxbot.com/php/chat/send_message.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whop_id: whopId, message: text, reply_to: replyTo?.id ?? null }),
    });
    let d;
    const txt = await res.text();
    try { d = JSON.parse(txt); } catch { d = null; }
    if (d?.status === "error") {
      setErrorMsg(d.message);
      if (d.message.includes("muted")) {
        const until = new Date(Date.now() + 30*1000);
        setMuteUntil(until);
        setTimeout(() => setErrorMsg(""), 30*1000);
      }
    } else {
      setReplyTo(null);
      await loadInitial();
    }
  };

  // Reply handler
  const onReply = msg => {
    setReplyTo({
      id: msg.id,
      username: msg.username,
      excerpt: msg.message.length > 30 ? msg.message.slice(0,30) + "…" : msg.message
    });
    setTimeout(() => inputRef.current.focus(), 0);
  };

  // Autocomplete
  const onChange = e => {
    const val = e.target.value;
    setInput(val);
    const match = /@([A-Za-z0-9_]*)$/.exec(val);
    if (match) {
      const term = match[1].toLowerCase();
      const filtered = participants.filter(u => u.toLowerCase().startsWith(term));
      setSuggestions(filtered);
      setActiveSuggestion(0);
      setShowSuggestions(filtered.length > 0);
    } else setShowSuggestions(false);
  };
  const onKeyDown = e => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion(i => Math.min(i+1, suggestions.length-1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion(i => Math.max(i-1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        chooseSuggestion(suggestions[activeSuggestion]);
      }
    } else if (e.key === "Enter") send();
  };
  const chooseSuggestion = u => {
    setInput(input.replace(/@([A-Za-z0-9_]*)$/, `@${u} `));
    setShowSuggestions(false);
    setTimeout(() => inputRef.current.focus(), 0);
  };

  // Scroll helpers
  const scrollToMessage = id => {
    const el = containerRef.current.querySelector(`[data-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const scrollToBottom = () => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
    setShowBack(false);
  };

  // Emoji map
  const emojiMap = { like: "👍", smile: "😊", fire: "🔥", heart: "❤️", dislike: "👎" };
  const react = async (msgId, type) => {
    await fetch("https://app.byxbot.com/php/chat/react_message.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id: msgId, reaction_type: type }),
    });
    setOpenEmojiPickerFor(null);
    await loadInitial();
  };

  // Render each message
  const renderMessage = msg => {
    const time = isNaN(msg.ts)
      ? ""
      : new Date(msg.ts).toLocaleTimeString("cs-CZ",{hour:"2-digit",minute:"2-digit"});
    // find original reply
    const orig = msg.reply_to ? messages.find(m=>m.id===msg.reply_to) : null;
    return (
      <div key={msg.id} data-id={msg.id} className={`chat-message ${msg.mine?"mine":"other"}`}>
        {!msg.mine && msg.avatar_url && <img src={msg.avatar_url} className="chat-avatar" alt="" />}
        <div className="chat-bubble">
          <div className="chat-bubble-header">
            <span className="chat-username">{msg.username}</span>
            <button className="btn-reply" onClick={()=>onReply(msg)}>↩</button>
          </div>
          {orig && (
            <div className="chat-reply-ref" onClick={()=>scrollToMessage(orig.id)}>
              <strong>@{orig.username}</strong>: {orig.message.slice(0,30)}{orig.message.length>30?"…":""}
            </div>
          )}
          <p className="chat-text">
            {msg.message.split(/(@\w+)/g).map((part,i)=>
              part.startsWith("@") ? <span key={i} className="mention">{part}</span> : <span key={i}>{part}</span>
            )}
          </p>
          <div className="chat-reactions">
            {Object.entries(msg.reactions||{}).map(([type,cnt])=>
              cnt>0 && <span key={type} className="reaction-display">{emojiMap[type]} {cnt}</span>
            )}
            <button className="btn-emoji-picker" onClick={()=>setOpenEmojiPickerFor(msg.id)}>😊</button>
            {openEmojiPickerFor===msg.id && (
              <div className="emoji-picker">
                {Object.entries(emojiMap).map(([type,emoji])=>(
                  <button key={type} onClick={()=>react(msg.id,type)}>{emoji}</button>
                ))}
              </div>
            )}
          </div>
          <span className="chat-time">{time}</span>
        </div>
        {msg.mine && msg.avatar_url && <img src={msg.avatar_url} className="chat-avatar" alt="" />}
      </div>
    );
  };

  const isMuted = muteUntil && new Date() < muteUntil;

  return (
    <div className="chat-window">
      <div className="chat-header">
        {whopLogo && <img src={whopLogo} className="chat-whop-logo" alt={whopName} />}
        <h4>{whopName}</h4>
      </div>
      <div className="chat-messages" ref={containerRef}>
        {hasMore && (
          <div className="load-more-wrapper">
            <button className="btn-load-more" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Načítám…" : "Načíst další"}
            </button>
          </div>
        )}
        {messages.map(renderMessage)}
        {showBack && <button className="btn-back-bottom" onClick={scrollToBottom}>↘ Zpět dolu</button>}
      </div>
      <div className={`chat-input ${isMuted?"muted":""}`}>
        {errorMsg && <div className="chat-error">{errorMsg}</div>}
        {replyTo && (
          <div className="reply-indicator" onClick={()=>scrollToMessage(replyTo.id)}>
            Replying to <strong>@{replyTo.username}</strong>: “{replyTo.excerpt}”
            <button className="btn-cancel-reply" onClick={()=>setReplyTo(null)}>✕</button>
          </div>
        )}
        <div className="input-wrapper">
          <input
            ref={inputRef}
            placeholder={isMuted?"Zablokován…":"Napiš zprávu…"}
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={isMuted}
          />
          {showSuggestions && (
            <ul className="suggestions-list">
              {suggestions.map((u,idx)=>(
                <li key={u} className={idx===activeSuggestion?"active":""} onClick={()=>chooseSuggestion(u)}>
                  {u}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="btn-send" onClick={send} disabled={isMuted}>Odeslat</button>
      </div>
    </div>
  );
}
