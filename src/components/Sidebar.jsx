// src/components/Sidebar.jsx

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.scss";
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

export default function Sidebar() {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Načtení profilových dat uživatele (avatar)
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
        console.error("Chyba při načítání profilu (Sidebar):", err);
      });
  }, []);

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar__logo">
          <img src={Logo} alt="Logo platformy" />
        </div>

        {/* Navigace */}
        <nav className="sidebar__nav">
          <ul>
            {/* Domů */}
            <li className="sidebar__nav-item">
              <NavLink to="/" className="sidebar__link" end>
                <FiHome className="sidebar__icon" />
              </NavLink>
            </li>

            {/* Vyhledávání */}
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
              </a>
            </li>

            {/* Chat (otevře modal) */}
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
              </a>
            </li>

            {/* Notifikace */}
            <li className="sidebar__nav-item">
              <NavLink to="/notifications" className="sidebar__link">
                <FiBell className="sidebar__icon" />
              </NavLink>
            </li>

            {/* Bilance */}
            <li className="sidebar__nav-item">
              <NavLink to="/balances" className="sidebar__link">
                <FiBarChart2 className="sidebar__icon" />
              </NavLink>
            </li>

            {/* Předplatná */}
            <li className="sidebar__nav-item">
              <NavLink to="/memberships" className="sidebar__link">
                <FaUserShield className="sidebar__icon" />
              </NavLink>
            </li>

            {/* Platby */}
            <li className="sidebar__nav-item">
              <NavLink to="/payments" className="sidebar__link">
                <FaDollarSign className="sidebar__icon" />
              </NavLink>
            </li>

            {/* Profil */}
            <li className="sidebar__nav-item">
              <NavLink to="/profile" className="sidebar__link">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profilová fotka"
                    className="sidebar__profile-img"
                  />
                ) : (
                  <FiUser className="sidebar__icon" />
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* Chat Modal */}
      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
    </>
  );
}
