// src/components/Sidebar.jsx

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.scss";
import { FiX } from "react-icons/fi";
import Logo from "../assets/logo.png";
import {
  FiHome,
  FiSearch,
  FiMessageSquare,
  FiBell,
  FiBarChart2,
  FiUser,
} from "react-icons/fi";
import { FaUserShield, FaDollarSign } from "react-icons/fa";
import ChatModal from "./Chat/ChatModal";
import SearchModal from "./SearchModal";
import useJoinedWhops from "../hooks/useJoinedWhops";

export default function Sidebar({ isOpen, onClose }) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { joinedWhops } = useJoinedWhops();
  const navigate = useNavigate();

  // Load user profile data (avatar)
  useEffect(() => {
    fetch("https://app.byxbot.com/php/profile.php", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.status === "success") {
          setAvatarUrl(data.data.avatar_url || "");
        }
      })
      .catch((err) => {
        console.error("Error loading profile (Sidebar):", err);
      });
  }, []);

  return (
    <>
      <aside className={`sidebar${isOpen ? ' open' : ''}`}
        onClick={() => {
          if (window.innerWidth <= 1024) onClose?.();
        }}
      >
        <button
          className="sidebar__close"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          type="button"
        >
          <FiX />
        </button>
        {/* Logo */}
        <div className="sidebar__logo">
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <ul>
            {/* Home */}
            <li className="sidebar__nav-item">
              <NavLink to="/" className="sidebar__link" end>
                <FiHome className="sidebar__icon" />
                <span className="sidebar__label">Home</span>
              </NavLink>
            </li>

            {/* Search */}
            <li className="sidebar__nav-item">
              <a
                href="#"
                className="sidebar__link"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchOpen(true);
                }}
              >
                <FiSearch className="sidebar__icon" />
                <span className="sidebar__label">Search</span>
              </a>
            </li>

            {/* Chat (opens modal) */}
            <li className="sidebar__nav-item">
              <a
                href="#"
                className="sidebar__link"
                onClick={(e) => {
                  e.preventDefault();
                  setChatOpen(true);
                }}
              >
                <FiMessageSquare className="sidebar__icon" />
                <span className="sidebar__label">Chat</span>
              </a>
            </li>

            {/* Notifications */}
            <li className="sidebar__nav-item">
              <NavLink to="/notifications" className="sidebar__link">
                <FiBell className="sidebar__icon" />
                <span className="sidebar__label">Notifications</span>
              </NavLink>
            </li>

            {/* Balances */}
            <li className="sidebar__nav-item">
              <NavLink to="/balances" className="sidebar__link">
                <FiBarChart2 className="sidebar__icon" />
                <span className="sidebar__label">Balances</span>
              </NavLink>
            </li>

            {/* Memberships */}
            <li className="sidebar__nav-item">
              <NavLink to="/memberships" className="sidebar__link">
                <FaUserShield className="sidebar__icon" />
                <span className="sidebar__label">Memberships</span>
              </NavLink>
            </li>

            {/* Payments */}
            <li className="sidebar__nav-item">
              <NavLink to="/payments" className="sidebar__link">
                <FaDollarSign className="sidebar__icon" />
                <span className="sidebar__label">Payments</span>
              </NavLink>
            </li>

            {/* Profile */}
            <li className="sidebar__nav-item">
              <NavLink to="/profile" className="sidebar__link">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="sidebar__profile-img"
                  />
                ) : (
                  <FiUser className="sidebar__icon" />
                )}
                <span className="sidebar__label">Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        {/* Joined Whops shown on mobile */}
        <div className="sidebar__whops-list">
          {joinedWhops.map((whop) => (
            <button
              key={whop.slug}
              className="sidebar__whops-item"
              onClick={() => {
                navigate(`/c/${whop.slug}?mode=member`);
                if (window.innerWidth <= 1024) onClose?.();
              }}
              type="button"
            >
              <img
                src={whop.banner_url}
                alt={whop.slug}
                className="sidebar__whop-avatar"
              />
              <span>{whop.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* Chat Modal */}
      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
    </>
  );
}
