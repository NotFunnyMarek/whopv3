import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/bottombar.scss';
import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import useJoinedWhops from '../hooks/useJoinedWhops';

export default function BottomBar() {
  const { theme, setLight, setDark } = useTheme();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredX, setHoveredX] = useState(null);
  const { joinedWhops, loadingWhops } = useJoinedWhops();
  const [balance, setBalance] = useState(0);

  const iconsContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileBalance();
  }, []);

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

  const formatBalance = amount =>
    amount >= 1000 ? `${(amount / 1000).toFixed(2)}k` : amount.toFixed(2);

  const handleMenuClick = () => setDropdownOpen(prev => !prev);
  const handleThemeChange = e => (e.target.value === 'light' ? setLight() : setDark());
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
    <>
      {/* LEFT section: menu + balance */}
      <div className="bottombar-left">
        <button
          className="bottombar-left__button"
          onClick={handleMenuClick}
          aria-expanded={dropdownOpen}
          aria-controls="bottombar-menu"
        >
          <FiMenu size={20} /> Menu
        </button>

        <NavLink to="/balances" className="bottombar-left__balance">
          <img
            src="https://i.ibb.co/gFPZjybL/846174-notes-512x512.png"
            alt="Notes Icon"
          />
          <span>${formatBalance(balance)}</span>
        </NavLink>

        <div
          id="bottombar-menu"
          className={`bottombar-left__dropdown ${dropdownOpen ? 'visible' : ''}`}
          role="menu"
        >
          <div className="bottombar-left__dropdown-theme">
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

          <div className="bottombar-left__dropdown-item">
            What's New <span>06/09/2025</span>
          </div>

          <a
            className="bottombar-left__dropdown-item bottombar-left__help"
            href="https://discord.gg/SqQskHWb"
            target="_blank"
            rel="noopener noreferrer"
          >
            Need help?
          </a>

          <button
            className="bottombar-left__dropdown-item bottombar-left__logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* CENTER section: whops pill */}
      <div
        className="bottombar-center"
        ref={iconsContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {loadingWhops
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="skeleton-circle" />
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
                  className="bottombar-center__icon"
                  style={{
                    transform: hoveredX === null ? undefined : `translateY(${translateY}px)`,
                    transition: 'transform var(--transition-default)',
                  }}
                  onClick={() => navigate(`/c/${whop.slug}?mode=member`)}
                >
                  <div className="bottombar-center__tooltip">{whop.name}</div>
                  <img src={whop.banner_url} alt={whop.slug} />
                </div>
              );
            })}
      </div>
    </>
  );
}