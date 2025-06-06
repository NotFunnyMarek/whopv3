// src/pages/BannerSetup.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/banner-setup.scss';

export default function BannerSetup() {
  // === HOOKS vždy na vrcholu komponenty ===
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [error, setError] = useState('');

  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  const navigate = useNavigate();
  const location = useLocation();

  // Načteme whopData (name, slug, features, logoUrl) z předchozího kroku (FeaturesSetup)
  const prevWhopData = location.state?.whopData || null;

  // Pokud chybí data, vrátíme chybovou obrazovku s odkazem zpět na začátek setupu
  if (!prevWhopData) {
    return (
      <div className="banner-setup-error">
        <p>Whop data not found. Please complete the previous steps first.</p>
        <button
          className="banner-setup-error-btn"
          onClick={() => navigate('/setup')}
        >
          Go to Setup
        </button>
      </div>
    );
  }

  // === Handler pro nahrání bannerového obrázku ===
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setBannerFile(null);
      setBannerPreview(null);
      setError('');
      return;
    }

    // Validace velikosti souboru
    if (file.size > maxFileSize) {
      setError('Soubor je příliš velký (max 5 MB).');
      setBannerFile(null);
      setBannerPreview(null);
      return;
    }

    // Validace typu: musí začínat image/
    if (!file.type.startsWith('image/')) {
      setError('Vyberte prosím platný obrázek.');
      setBannerFile(null);
      setBannerPreview(null);
      return;
    }

    // Vytvoříme Base64 náhled přes FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
      setBannerFile(file);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // === Handler pro Continue – sestavíme finální whopData a navigujeme na "/:slug" ===
  const handleContinue = () => {
    if (!bannerFile) return;

    const slug = prevWhopData.slug;

    // Sestavíme nový objekt whopData včetně bannerUrl
    const newWhopData = {
      name: prevWhopData.name,
      slug: slug,
      features: prevWhopData.features,
      logoUrl: prevWhopData.logoUrl || '',
      bannerUrl: bannerPreview,
    };

    // Přesměrujeme na URL ve tvaru "/<slug>" a předáme whopData jako state
    navigate(`/${slug}`, { state: { whopData: newWhopData } });
  };

  return (
    <div className="banner-setup-container">
      {/* HLAVIČKA */}
      <div className="banner-setup-header">
        <h1 className="banner-setup-title">Upload Your Whop Banner</h1>
      </div>

      {/* PODNADPIS */}
      <div className="banner-setup-content">
        <p className="banner-setup-subtitle">
          This banner will appear at the top of your dashboard. Recommended size: 1200 × 300 px.
        </p>

        {/* Wrapper pro výběr souboru a náhled */}
        <div className="banner-input-wrapper">
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Banner Preview"
              className="banner-preview-image"
            />
          ) : (
            <div className="banner-placeholder">No banner selected</div>
          )}
          <input
            type="file"
            accept="image/*"
            className="banner-file-input"
            onChange={handleFileChange}
          />
        </div>

        {/* Chybová hláška */}
        {error && <div className="banner-error">{error}</div>}

        {/* Tlačítko Continue */}
        <button
          className="banner-continue-button"
          onClick={handleContinue}
          disabled={!bannerFile}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
