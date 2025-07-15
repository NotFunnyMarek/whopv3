// src/components/BottomBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/bottombar.scss';
import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function BottomBar() {
  const { theme, setLight, setDark } = useTheme();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredX, setHoveredX] = useState(null);
  const [joinedWhops, setJoinedWhops] = useState([]);
  const [loadingWhops, setLoadingWhops] = useState(true);
  const [balance, setBalance] = useState(0);

  const iconsContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJoinedWhops();
    fetchProfileBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user balance from profile.php
  const fetchProfileBalance = async () => {
    try {
      const res = await fetch('https://app.byxbot.com/php/profile.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.status === 401) return;
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (data?.status === 'success') {
        setBalance(parseFloat(data.data.balance) || 0);
      }
    } catch (err) {
      console.error('Error loading balance (BottomBar):', err);
    }
  };

  // Format e.g. 1013.5 → "1.01k"
  const formatBalance = amount =>
    amount >= 1000 ? `${(amount / 1000).toFixed(2)}k` : amount.toFixed(2);

  // Load Whops where the user is a member or owner
  const fetchJoinedWhops = async () => {
    setLoadingWhops(true);
    try {
      // 1) Whops where the user is a member
      const resMembers = await fetch('https://app.byxbot.com/php/get_joined_whops.php', {
        method: 'GET',
        credentials: 'include',
      });
      if (!resMembers.ok) throw new Error(`Members HTTP ${resMembers.status}`);
      const membersJson = await resMembers.json();
      // pokud API vrací { status, data: [...] }
      let membersData = Array.isArray(membersJson)
        ? membersJson
        : Array.isArray(membersJson.data)
        ? membersJson.data
        : [];
      
      // 2) Whops where the user is the owner
      const resOwned = await fetch('https://app.byxbot.com/php/get_whop.php?owner=me', {
        method: 'GET',
        credentials: 'include',
      });
      if (!resOwned.ok) throw new Error(`Owned HTTP ${resOwned.status}`);
      const ownedJson = await resOwned.json();
      if (ownedJson.status !== 'success' || !Array.isArray(ownedJson.data)) {
        throw new Error('Failed to load owned Whops');
      }
      const ownedData = ownedJson.data;

      // 3) Sloučení obou seznamů bez duplicit (klíč slug)
      const mapBySlug = new Map();
      membersData.forEach(w => {
        if (w?.slug) {
          mapBySlug.set(w.slug, {
            id: w.whop_id ?? w.id,
            slug: w.slug,
            banner_url: w.banner_url,
            name: w.name ?? w.slug,
          });
        }
      });
      ownedData.forEach(w => {
        if (w?.slug) {
          mapBySlug.set(w.slug, {
            id: w.id,
            slug: w.slug,
            banner_url: w.banner_url,
            name: w.name ?? w.slug,
          });
        }
      });

      setJoinedWhops(Array.from(mapBySlug.values()));
    } catch (err) {
      console.error('Error loading joined/owned Whops:', err);
      setJoinedWhops([]);
    } finally {
      setLoadingWhops(false);
    }
  };

  const handleMenuClick = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleThemeChange = e =>
    e.target.value === 'light' ? setLight() : setDark();

  const handleMouseMove = e => setHoveredX(e.clientX);
  const handleMouseLeave = () => setHoveredX(null);

  const handleLogout = async () => {
    try {
      const res = await fetch('https://app.byxbot.com/php/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (res.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        logout();
        navigate('/login');
      } else {
        console.error(`Logout failed (HTTP ${res.status})`);
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <div className="bottombar">
      {/* Levá sekce: Menu, zůstatek, dropdown */}
      <div className="bottombar__left">
        <button
          className="bottombar__left-button"
          onClick={handleMenuClick}
          aria-expanded={dropdownOpen}
          aria-controls="bottombar-menu"
          type="button"
        >
          <FiMenu size={20} /> Menu
        </button>

        <NavLink to="/balances" className="bottombar__balance-link">
          <img
            src="https://i.ibb.co/gFPZjybL/846174-notes-512x512.png"
            alt="Notes Icon"
            className="bottombar__note-icon"
          />
          <span className="bottombar__balance-text">
            ${formatBalance(balance)}
          </span>
        </NavLink>

        <div
          id="bottombar-menu"
          className={`bottombar__left-dropdown ${dropdownOpen ? 'visible' : ''}`}
          role="menu"
        >
          {/* Přepínač motivu */}
          <div className="bottombar__left-dropdown-item bottombar__left-dropdown-item-theme">
            <label>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={handleThemeChange}
              />
              <FiSun /> Light
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={handleThemeChange}
              />
              <FiMoon /> Dark
            </label>
          </div>

          {/* What's New */}
          <div className="bottombar__left-dropdown-item bottombar__left-dropdown-item-whatsnew">
            What's New <span>06/09/2025</span>
          </div>

          {/* Need help? */}
          <a
            className="bottombar__left-dropdown-item bottombar__left-dropdown-item-help"
            href="https://discord.gg/SqQskHWb"
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
          >
            Need help?
          </a>

          {/* Logout */}
          <button
            className="bottombar__left-dropdown-item bottombar__left-dropdown-item-logout"
            onClick={handleLogout}
            type="button"
            role="menuitem"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Střední sekce: bannery Whops */}
      <div
        className="bottombar__center-icons"
        ref={iconsContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {loadingWhops
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="bottombar__center-icon skeleton-circle" />
            ))
          : joinedWhops.map((whop, idx) => {
              const container = iconsContainerRef.current;
              const { left = 0, width = 0 } = container?.getBoundingClientRect() || {};
              const segment = width / (joinedWhops.length || 1);
              const iconCenterX = left + segment * (idx + 0.5);
              const dx = hoveredX !== null ? Math.abs(hoveredX - iconCenterX) : Infinity;
              const maxRadius = segment * 2;
              let t = 1 - dx / maxRadius;
              if (t < 0) t = 0;
              const translateY = -t * 12;

              return (
                <div
                  key={whop.slug}
                  className="bottombar__center-icon"
                  style={{
                    transform:
                      hoveredX === null ? undefined : `translateY(${translateY}px)`,
                    transition: 'transform var(--transition-default)',
                  }}
                  onClick={() => navigate(`/c/${whop.slug}?mode=member`)}
                >
                  <div className="bottombar__tooltip">{whop.name}</div>
                  <img
                    src={whop.banner_url}
                    alt={`Banner ${whop.slug}`}
                    className="bottombar__center-img"
                  />
                </div>
              );
            })}
      </div>
    </div>
  );
}
