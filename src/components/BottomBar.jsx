import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bottombar.scss';
import { FiMenu, FiSettings, FiUser, FiBell } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function BottomBar() {
  const { theme, setLight, setDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredX, setHoveredX] = useState(null);
  const iconsContainerRef = useRef(null);
  const navigate = useNavigate();

  // Stav pro whopy, ke kterým je přihlášen aktuální uživatel
  const [joinedWhops, setJoinedWhops] = useState([]);

  // Načíst joined whops při mountu
  useEffect(() => {
    fetchJoinedWhops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJoinedWhops = async () => {
    try {
      const res = await fetch('https://app.byxbot.com/php/get_joined_whops.php', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Chyba ${res.status}`);
      const data = await res.json();
      // Data musí mít pole objektů: { id, slug, banner_url }
      setJoinedWhops(data);
    } catch (err) {
      console.error('Chyba při načítání připojených whopů:', err);
      setJoinedWhops([]);
    }
  };

  // Menu dropdown
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
      console.error('Chyba při odhlášení:', err);
    }
  };

  return (
    <div className="bottombar">
      {/* Levá část: Menu tlačítko + dropdown */}
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
          {/* Přepínač tématu */}
          <div className="bottombar__left-dropdown-item bottombar__left-dropdown-item-theme">
            <div>
              <input
                type="radio"
                id="theme-light"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={handleThemeChange}
              />
              <span>Světlé</span>
            </div>
            <div>
              <input
                type="radio"
                id="theme-dark"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={handleThemeChange}
              />
              <span>Tmavé</span>
            </div>
          </div>

          {/* What's New */}
          <div className="bottombar__left-dropdown-item bottombar__left-dropdown-item-whatsnew">
            Whats New <span>6/6/25</span>
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

          {/* Logout tlačítko */}
          <button
            className="bottombar__left-dropdown-item bottombar__left-dropdown-item-logout"
            onClick={handleLogout}
            type="button"
            role="menuitem"
          >
            Odhlásit
          </button>
        </div>
      </div>

      {/* Střední část: bannery whopů s animací při hoveru */}
      <div
        className="bottombar__center-icons"
        ref={iconsContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {joinedWhops.map((whop, idx) => {
          // pokud myš není nad bar: normální zobrazení
          if (hoveredX === null) {
            return (
              <div
                key={whop.id}
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

          // když je hover, počítáme výšku zvednutí podle vzdálenosti
          const container = iconsContainerRef.current;
          const { left, width } = container.getBoundingClientRect();
          const segment = width / joinedWhops.length;
          const iconCenterX = left + segment * (idx + 0.5);
          const dx = Math.abs(hoveredX - iconCenterX);
          const maxRadius = segment * 2;
          let t = 1 - dx / maxRadius;
          if (t < 0) t = 0;
          const translateY = -t * 12;

          return (
            <div
              key={whop.id}
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
