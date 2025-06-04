// src/components/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/sidebar.scss';
import { FiHome, FiSearch, FiMessageSquare, FiBell, FiUser } from 'react-icons/fi';
import Logo from '../assets/logo.png';

const Sidebar = () => (
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
          <NavLink to="/chat" className="sidebar__link">
            <FiMessageSquare className="sidebar__icon" />
          </NavLink>
        </li>
        <li className="sidebar__nav-item">
          <NavLink to="/notifications" className="sidebar__link">
            <FiBell className="sidebar__icon" />
          </NavLink>
        </li>
        <li className="sidebar__nav-item">
          <NavLink to="/profile" className="sidebar__link">
            <FiUser className="sidebar__icon" />
          </NavLink>
        </li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
