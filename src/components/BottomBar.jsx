// src/pages/BottomBar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bottombar.scss';
import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function BottomBar() {
  const { theme, setLight, setDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredX, setHoveredX] = useState(null);
  const [joinedWhops, setJoinedWhops] = useState([]);
  const [loadingWhops, setLoadingWhops] = useState(true);
  const iconsContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJoinedWhops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJoinedWhops = async () => {
    setLoadingWhops(true);
    try {
      // 1) Načteme Whopy, kde je uživatel členem
      const resMembers = await fetch('https://app.byxbot.com/php/get_joined_whops.php', {
        method: 'GET',
        credentials: 'include',
      });
      if (!resMembers.ok) throw new Error(`Chyba ${resMembers.status}`);
      const membersData = await resMembers.json(); // očekáváme pole objektů { id, slug, banner_url, ... }

      // 2) Načteme Whopy, kde je uživatel vlastníkem
      const resOwned = await fetch('https://app.byxbot.com/php/get_whop.php?owner=me', {
        method: 'GET',
        credentials: 'include',
      });
      if (!resOwned.ok) throw new Error(`Chyba ${resOwned.status}`);
      const ownedJson = await resOwned.json();
      if (ownedJson.status !== 'success') throw new Error('Nepodařilo se načíst vlastněné Whopy');
      const ownedData = ownedJson.data; // očekáváme pole objektů s poli: { id, slug, banner_url, ... }

      // 3) Spojíme obě množiny bez duplicit (rozdílné podle id nebo slug)
      const mapBySlug = new Map();

      // Přidáme nejdřív jednotlivé členy
      for (const w of membersData) {
        // předpokládáme strukturu: { id, whop_id, slug, banner_url, ... } nebo něco podobného
        // pokud JSON vrací jiná pole, upravte odpovídající klíče
        mapBySlug.set(w.slug, {
          id: w.whop_id ?? w.id,
          slug: w.slug,
          banner_url: w.banner_url,
        });
      }

      // Přidáme vlastní Whopy
      for (const w of ownedData) {
        // v get_whop?owner=me dostáváme objekty: { id, name, slug, description, logo_url, banner_url, ... }
        mapBySlug.set(w.slug, {
          id: w.id,
          slug: w.slug,
          banner_url: w.banner_url,
        });
      }

      // Výsledné pole
      const combined = Array.from(mapBySlug.values());
      setJoinedWhops(combined);
    } catch (err) {
      console.error('Error loading joined/owned whops:', err);
      setJoinedWhops([]);
    } finally {
      setLoadingWhops(false);
    }
  };

  const handleMenuClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleThemeChange = (e) => {
    e.target.value === 'light' ? setLight() : setDark();
  };

  const handleMouseMove = (e) => {
    setHoveredX(e.clientX);
  };

  const handleMouseLeave = () => {
    setHoveredX(null);
  };

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
      {/* Levá část: Menu + dropdown */}
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

        <div
          id="bottombar-menu"
          className={`bottombar__left-dropdown ${dropdownOpen ? 'visible' : ''}`}
          role="menu"
        >
          {/* Theme toggle */}
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

      {/* Střední část: bannery Whopů */}
      <div
        className="bottombar__center-icons"
        ref={iconsContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {loadingWhops
          ? // Skeleton placeholder: 5 kruhů
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="bottombar__center-icon skeleton-circle" />
            ))
          : joinedWhops.map((whop, idx) => {
              if (hoveredX === null) {
                return (
                  <div
                    key={whop.slug}
                    className="bottombar__center-icon"
                    onClick={() => navigate(`/c/${whop.slug}?mode=member`)}
                  >
                    <img
                      src={whop.banner_url}
                      alt={`Banner ${whop.slug}`}
                      className="bottombar__center-img"
                    />
                  </div>
                );
              }
              // interaktivní „fidgety“ efekt při najetí myší
              const container = iconsContainerRef.current;
              const { left, width } = container.getBoundingClientRect();
              const segment = width / (joinedWhops.length || 1);
              const iconCenterX = left + segment * (idx + 0.5);
              const dx = Math.abs(hoveredX - iconCenterX);
              const maxRadius = segment * 2;
              let t = 1 - dx / maxRadius;
              if (t < 0) t = 0;
              const translateY = -t * 12;

              return (
                <div
                  key={whop.slug}
                  className="bottombar__center-icon"
                  style={{
                    transform: `translateY(${translateY}px)`,
                    transition: 'transform var(--transition-default)',
                  }}
                  onClick={() => navigate(`/c/${whop.slug}?mode=member`)}
                >
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
