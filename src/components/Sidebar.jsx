import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.scss";
import {
  FiX,
  FiChevronLeft,
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
import Logo from "../assets/load.png";

export default function Sidebar({ isOpen, onClose }) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { joinedWhops } = useJoinedWhops();
  const navigate = useNavigate();

  const isMobile = window.innerWidth <= 1024;

  useEffect(() => {
    fetch("https://app.byxbot.com/php/profile.php", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => (res.status === 401 ? null : res.json()))
      .then((data) => {
        if (data?.status === "success") {
          setAvatarUrl(data.data.avatar_url || "");
        }
      })
      .catch((err) => console.error("Sidebar profile error:", err));
  }, []);

  const sidebarClass = [
    "sidebar",
    isMobile && !isOpen ? "closed" : "",
    isMobile && isOpen ? "open" : "",
    !isMobile && collapsed ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <aside className={sidebarClass} onClick={() => isMobile && onClose?.()}>

        <div className="sidebar__logo">
          <img src={Logo} alt="Logo" />
        </div>

        <div className="sidebar__content">
          <nav className="sidebar__nav">
            <ul>
              <li className="sidebar__nav-item">
                <NavLink to="/" className="sidebar__link" end>
                  <FiHome className="sidebar__icon" />
                  <span className="sidebar__label">Home</span>
                </NavLink>
              </li>
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
              <li className="sidebar__nav-item">
                <NavLink to="/notifications" className="sidebar__link">
                  <FiBell className="sidebar__icon" />
                  <span className="sidebar__label">Notifications</span>
                </NavLink>
              </li>
              <li className="sidebar__nav-item">
                <NavLink to="/balances" className="sidebar__link">
                  <FiBarChart2 className="sidebar__icon" />
                  <span className="sidebar__label">Balances</span>
                </NavLink>
              </li>
              <li className="sidebar__nav-item">
                <NavLink to="/memberships" className="sidebar__link">
                  <FaUserShield className="sidebar__icon" />
                  <span className="sidebar__label">Memberships</span>
                </NavLink>
              </li>
              <li className="sidebar__nav-item">
                <NavLink to="/payments" className="sidebar__link">
                  <FaDollarSign className="sidebar__icon" />
                  <span className="sidebar__label">Payments</span>
                </NavLink>
              </li>
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

          {/* WHOPS ONLY ON MOBILE */}
          <div className="sidebar__whops-list">
            {joinedWhops.map((whop) => (
              <button
                key={whop.slug}
                className="sidebar__whops-item"
                onClick={() => {
                  navigate(`/c/${whop.slug}?mode=member`);
                  isMobile && onClose?.();
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
        </div>

        {/* Collapse toggle button */}
        {!isMobile && (
          <button
            className="sidebar__collapse-btn"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
          >
            <FiChevronLeft
              style={{
                transform: collapsed ? "rotate(180deg)" : "none",
              }}
            />
            <span>{collapsed ? "" : "Collapse"}</span>
          </button>
        )}
      </aside>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
    </>
  );
}
