// src/components/Sidebar.jsx

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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
import { FaUserShield } from "react-icons/fa"; // ikona Memberships
import { FaDollarSign } from "react-icons/fa"; // ikona pro Payments

const Sidebar = () => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://app.byxbot.com/php/profile.php", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.status === "success") {
          setAvatarUrl(data.data.avatar_url || "");
        }
      })
      .catch((err) => {
        console.error("Chyba při načítání profilu (Sidebar):", err);
        setError("Nepodařilo se načíst data.");
      });
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src={Logo} alt="Logo platformy" />
      </div>

      <nav className="sidebar__nav">
        <ul>
          <li className="sidebar__nav-item">
            <NavLink to="/" className="sidebar__link" end>
              <FiHome className="sidebar__icon" />
            </NavLink>
          </li>
          <li className="sidebar__nav-item">
            <NavLink to="/search" className="sidebar__link">
              <FiSearch className="sidebar__icon" />
            </NavLink>
          </li>
          <li className="sidebar__nav-item">
            <NavLink to="/messages" className="sidebar__link">
              <FiMessageSquare className="sidebar__icon" />
            </NavLink>
          </li>
          <li className="sidebar__nav-item">
            <NavLink to="/notifications" className="sidebar__link">
              <FiBell className="sidebar__icon" />
            </NavLink>
          </li>
          <li className="sidebar__nav-item">
            <NavLink to="/balances" className="sidebar__link">
              <FiBarChart2 className="sidebar__icon" />
            </NavLink>
          </li>
          <li className="sidebar__nav-item">
            <NavLink to="/memberships" className="sidebar__link">
              <FaUserShield className="sidebar__icon" />
            </NavLink>
          </li>
          {/* Nový odkaz na Payments */}
          <li className="sidebar__nav-item">
            <NavLink to="/payments" className="sidebar__link">
              <FaDollarSign className="sidebar__icon" />
            </NavLink>
          </li>
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
  );
};

export default Sidebar;
