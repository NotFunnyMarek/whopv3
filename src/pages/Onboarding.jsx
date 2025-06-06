// src/pages/Onboarding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGlobe, FaPlus, FaCheckCircle } from 'react-icons/fa';
import '../styles/onboarding.scss';

export default function Onboarding() {
  const navigate = useNavigate();

  // Stav pro právě vybranou možnost ("new" nebo id existujícího dashboardu)
  const [selectedOption, setSelectedOption] = useState('');

  // Dummy data – později budeš tahat z DB
  const existingDashboards = [
    { id: 'jacobs-store', name: "Jacob’s store", isPublic: true },
    { id: 'jacobs-store4', name: "Jacob’s store4", isPublic: true },
    // Další dashboardy sem přijdeš natahovat z back-endu
  ];

  // Pokud uživatel vybral "Create new dashboard"
  const handleSelectNew = () => {
    setSelectedOption('new');
  };

  // Pokud uživatel vybral některý existující dashboard
  const handleSelectExisting = (id) => {
    setSelectedOption(id);
  };

  // Po kliknutí na Continue
  const handleContinue = () => {
    if (!selectedOption) return;

    if (selectedOption === 'new') {
      // Přesměrujeme na stránku, kde se bude nastavovat nový dashboard
      navigate('/setup');
    } else {
      // Pro existující dashboard – přesměrujeme třeba na detail / správu vybraného dashboardu
      navigate(`/dashboard/${selectedOption}`);
    }
  };

  return (
    <div className="onboarding-container">
      {/* ====== HLAVIČKA ====== */}
      <div className="onboarding-header">
        <h1 className="onboarding-title">Onboarding</h1>
      </div>

      {/* ====== OBSAH ====== */}
      <div className="onboarding-content">
        <h2 className="onboarding-question">
          Which dashboard would you like to create your whop in?
        </h2>
        <p className="onboarding-subtitle">
          We only recommend creating a new dashboard if you are starting a different business with a separate team or bank account.
        </p>

        {/* ====== MOŽNOSTI (karty s výběrem) ====== */}
        <div className="onboarding-options">
          {/* 1) „Create new dashboard“ */}
          <div
            className={
              selectedOption === 'new' ? 'option-card selected' : 'option-card'
            }
            onClick={handleSelectNew}
          >
            <div className="option-radio">
              {selectedOption === 'new' ? (
                <FaCheckCircle className="radio-icon checked" />
              ) : (
                <div className="radio-icon unchecked" />
              )}
            </div>
            <div className="option-icon">
              <FaPlus className="icon-plus" />
            </div>
            <div className="option-text">+ Create new dashboard</div>
          </div>

          {/* 2) Existující dashboardy */}
          {existingDashboards.map((dash) => (
            <div
              key={dash.id}
              className={
                selectedOption === dash.id ? 'option-card selected' : 'option-card'
              }
              onClick={() => handleSelectExisting(dash.id)}
            >
              <div className="option-radio">
                {selectedOption === dash.id ? (
                  <FaCheckCircle className="radio-icon checked" />
                ) : (
                  <div className="radio-icon unchecked" />
                )}
              </div>
              <div className="option-icon">
                <FaGlobe className="icon-globe" />
              </div>
              <div className="option-text">{dash.name}</div>
            </div>
          ))}
        </div>

        {/* ====== TLAČÍTKO „Continue“ ====== */}
        <button
          className="onboarding-button"
          onClick={handleContinue}
          disabled={!selectedOption}  /* deaktivováno, dokud není něco vybrané */
        >
          Continue
        </button>
      </div>
    </div>
  );
}
