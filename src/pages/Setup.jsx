// src/pages/Setup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/setup.scss';

export default function Setup() {
  const navigate = useNavigate();

  // Stav pro jméno whopu
  const [whopName, setWhopName] = useState('');
  // Maximální délka jména
  const maxLength = 30;

  // Změna v inputu
  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setWhopName(value);
    }
  };

  // Po kliknutí na Continue: přejede na /setup/link
  const handleContinue = () => {
    if (!whopName.trim()) return;
    console.log('Zadané jméno whopu:', whopName);
    // Teď navigujeme na druhý krok setupu: ChooseLink
    navigate('/setup/link');
  };

  return (
    <div className="setup-container">
      {/* HLAVIČKA */}
      <div className="setup-header">
        <h1 className="setup-title">Name your whop</h1>
      </div>

      {/* OBSAH */}
      <div className="setup-content">
        <p className="setup-subtitle">
          This is the name of your social business. Don’t worry, you can change this later.
        </p>

        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Enter your whop name"
            value={whopName}
            onChange={handleChange}
          />
          <div className="char-count">
            {whopName.length}/{maxLength}
          </div>
        </div>

        <button
          className="setup-button"
          onClick={handleContinue}
          disabled={whopName.trim().length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
