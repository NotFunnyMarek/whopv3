import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bottombar.scss';
import { FiMenu, FiStar, FiHeart, FiSettings, FiUser, FiBell } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const iconComponents = [FiStar, FiHeart, FiSettings, FiUser, FiBell];

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

  // NOVĚ: funkce pro odhlášení (logout)
  const handleLogout = async () => {
    try {
      const res = await fetch('https://app.byxbot.com/php/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      if (res.ok) {
        // Vyčistíme localStorage (authToken) a přesměrujeme na /login
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
        <button className="bottombar__left-button" onClick={handleMenuClick}>
          <FiMenu size={20} /> Menu
        </button>

        <div className={`bottombar__left-dropdown ${dropdownOpen ? 'visible' : ''}`}>
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
              <label htmlFor="theme-light">Světlé</label>
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
              <label htmlFor="theme-dark">Tmavé</label>
            </div>
          </div>

          {/* Whats New */}
          <div className="bottombar__left-dropdown-item bottombar__left-dropdown-item-whatsnew">
            Whats New <span>6/4/25</span>
          </div>

          {/* Need help? */}
          <a
            className="bottombar__left-dropdown-item bottombar__left-dropdown-item-help"
            href="https://discord.gg/SqQskHWb"
            target="_blank"
            rel="noopener noreferrer"
          >
            Need help?
          </a>

          {/* NOVĚ: Logout tlačítko */}
          <button
            className="bottombar__left-dropdown-item bottombar__left-dropdown-item-logout"
            onClick={handleLogout}
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
            // Pokud není hover, všechny ikony jsou dole
            return (
              <div key={idx} className="bottombar__center-icon">
                <Icon size={20} />
              </div>
            );
          }
          // Vypočítáme, jak moc se každá ikona zvedne podle vzdálenosti od hladiny kurzoru
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
                transition: 'transform 0.2s ease',
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
