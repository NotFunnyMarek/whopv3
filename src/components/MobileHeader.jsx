import React from 'react';
import { FiMenu } from 'react-icons/fi';
import '../styles/mobile-header.scss';

export default function MobileHeader({ onMenu }) {
  return (
    <header className="mobile-header">
      <button
        className="mobile-header__menu"
        onClick={onMenu}
        type="button"
        aria-label="Open menu"
      >
        <FiMenu />
      </button>
    </header>
  );
}
