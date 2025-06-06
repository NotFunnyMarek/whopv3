// src/pages/ChooseLink.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/choose-link.scss';

export default function ChooseLink() {
  // HOOKS MUSÍ BÝT NA VRCHOLU FUNKCE
  const [slug, setSlug] = useState('');
  const maxSlugLength = 30;

  const navigate = useNavigate();
  const location = useLocation();

  // Načíst předchozí data (jméno whopu) z location.state
  const prevWhopData = location.state?.whopData || null;

  // Pokud chybí, zobrazíme chybovou obrazovku
  if (!prevWhopData) {
    return (
      <div className="choose-link-error">
        <p>Whop data not found. Please complete the previous step first.</p>
        <button onClick={() => navigate('/setup')}>Go to Setup</button>
      </div>
    );
  }

  // Zpracování změny v poli slugu
  const handleChange = (e) => {
    // Pouze alfanumerické, pomlčka, podtržítko
    const value = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (value.length <= maxSlugLength) {
      setSlug(value);
    }
  };

  // Přechod na další krok setupu (FeaturesSetup)
  const handleContinue = () => {
    if (!slug.trim()) return;

    const whopData = {
      name: prevWhopData.name,
      slug: slug.trim(),
      features: [],      // doplníme až dále
      logoUrl: prevWhopData.logoUrl || '',
    };

    navigate('/setup/features', { state: { whopData } });
  };

  return (
    <div className="choose-link-container">
      <div className="choose-link-header">
        <h1 className="choose-link-title">Choose your Whop link</h1>
      </div>

      <div className="choose-link-content">
        <p className="choose-link-subtitle">
          This is the link you send to your customers.
        </p>

        <div className="choose-link-input-wrapper">
          <span className="choose-link-prefix">whop.com/</span>
          <input
            type="text"
            className="choose-link-input"
            placeholder="your-whop-slug"
            value={slug}
            onChange={handleChange}
          />
        </div>

        <div className="choose-link-charcount">
          {slug.length}/{maxSlugLength}
        </div>

        <button
          className="choose-link-button"
          onClick={handleContinue}
          disabled={slug.trim().length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
