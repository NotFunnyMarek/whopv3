// src/components/SearchModal.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/searchModal.scss";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(
        `https://app.byxbot.com/php/search_whops.php?q=${encodeURIComponent(
          query.trim()
        )}`,
        {
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setResults(data.status === "success" ? data.data : []);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={wrapperRef}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        <input
          className="search-input"
          autoFocus
          type="text"
          placeholder="Search Whops..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <div className="loading">Searching…</div>}
        {query.trim().length > 0 && !loading && (
          <ul className="results">
            {results.map((item) => (
              <li
                key={item.slug}
                className="result-item"
                onClick={() => navigate(`/c/${item.slug}`)}
              >
                <div className="thumb">
                  <img
                    src={item.banner_url || item.logo_url || "/placeholder.png"}
                    alt={item.name}
                  />
                </div>
                <div className="meta">
                  <div className="title">{item.name}</div>
                  <div className="slug">/{item.slug}</div>
                  {item.description && (
                    <div className="desc">
                      {item.description.length > 60
                        ? item.description.slice(0, 57) + "…"
                        : item.description}
                    </div>
                  )}
                </div>
              </li>
            ))}
            {results.length === 0 && (
              <li className="no-results">No Whops found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
