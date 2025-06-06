// src/pages/Setup.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/setup.scss';

export default function Setup() {
  const navigate = useNavigate();

  // Jestli jsme sem přišli z jiného kroku (např. chci umožnit „zpět“), 
  // mohli bychom z location.state načíst nějaká data. Pro jednoduchost teď nezačínáme se žádným state.
  // Tu definujeme čistě nový stav.
  const [whopName, setWhopName] = useState('');
  const maxLength = 30;

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setWhopName(value);
    }
  };

  const handleContinue = () => {
    if (!whopName.trim()) return;

    // Vytvoříme částečný objekt whopData s tím, co jsme doposud zadali
    const whopData = {
      name: whopName.trim(),
      slug: '',         // slug zatím neznáme, vyplní se v dalším kroku
      features: [],     // features teprve přijdou v dalším kroku
      logoUrl: '',      // logo zatím nepřidáváme
    };

    navigate('/setup/link', { state: { whopData } });
  };

  return (
    <div className="setup-container">
      {/* HLAVIČKA */}
      <div className="setup-header">
        <h1 className="setup-title">Name your whop</h1>
      </div>

      {/* PODNADPIS */}
      <div className="setup-content">
        <p className="setup-subtitle">
          This is the name of your social business. Don’t worry, you can change this later.
        </p>

        {/* INPUT + počítadlo znaků */}
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

        {/* CONTINUE */}
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
