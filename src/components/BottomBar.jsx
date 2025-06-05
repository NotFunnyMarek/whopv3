import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bottombar.scss';
import { FiMenu, FiStar, FiHeart, FiSettings, FiUser, FiBell } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const iconComponents = [FiHeart, FiHeart, FiHeart, FiHeart, FiHeart];

const BottomBar = () => {
  const { theme, setLight, setDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredX, setHoveredX] = useState(null);
  const iconsContainerRef = useRef(null);
  const navigate = useNavigate();

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
            Whats New <span>6/4/25</span>
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

      {/* Střední část: interaktivní ikonky s “vlnivým” hover efektem */}
      <div
        className="bottombar__center-icons"
        ref={iconsContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {iconComponents.map((Icon, idx) => {
          if (hoveredX === null) {
            return (
              <div key={idx} className="bottombar__center-icon">
                <Icon size={20} />
              </div>
            );
          }
          const container = iconsContainerRef.current;
          const { left, width } = container.getBoundingClientRect();
          const segment = width / iconComponents.length;
          const iconCenterX = left + segment * (idx + 0.5);
          const dx = Math.abs(hoveredX - iconCenterX);
          const maxRadius = segment * 2;
          let t = 1 - dx / maxRadius;
          if (t < 0) t = 0;
          const translateY = -t * 12;

          return (
            <div
              key={idx}
              className="bottombar__center-icon"
              style={{
                transform: `translateY(${translateY}px)`,
                transition: 'transform var(--transition-default)',
              }}
            >
              <Icon size={20} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BottomBar;
