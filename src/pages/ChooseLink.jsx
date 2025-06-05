// src/pages/ChooseLink.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/choose-link.scss';

export default function ChooseLink() {
  const navigate = useNavigate();

  // Prefix, který se nedá editovat
  const prefix = 'whop.com/';

  // Stav pro vlastní část odkazu (slug)
  const [slug, setSlug] = useState('');
  // Maximální délka slugu
  const maxSlugLength = 30;

  // Zpracování změny v inputu
  const handleChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (value.length <= maxSlugLength) {
      setSlug(value);
    }
  };

  // Po kliknutí na Continue: přesměrujeme uživatele na FeaturesSetup
  const handleContinue = () => {
    if (!slug.trim()) return;
    console.log('Vybraný slug:', slug);
    navigate('/setup/features');
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
          <span className="choose-link-prefix">{prefix}</span>
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
