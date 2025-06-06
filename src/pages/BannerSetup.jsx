// src/pages/BannerSetup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/banner-setup.scss';

export default function BannerSetup() {
  const navigate = useNavigate();

  // Stav pro vybraný bannerový soubor a náhled
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [error, setError] = useState('');

  // Maximální velikost (volitelné) – např. 5 MB
  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  // Handler pro nahrání souboru
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setBannerFile(null);
      setBannerPreview(null);
      setError('');
      return;
    }

    // Kontrola velikosti
    if (file.size > maxFileSize) {
      setError('Soubor je příliš velký (max 5 MB).');
      setBannerFile(null);
      setBannerPreview(null);
      return;
    }

    // Kontrola typu obrázku
    if (!file.type.startsWith('image/')) {
      setError('Vyberte prosím platný obrázek.');
      setBannerFile(null);
      setBannerPreview(null);
      return;
    }

    // Vytvoření náhledu přes FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
      setBannerFile(file);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Po kliknutí Continue
  const handleContinue = () => {
    if (!bannerFile) return;
    console.log('Vybraný bannerový soubor:', bannerFile);
    // Zde by se banner odeslal na server a pokračovalo by se dál
    // Např. navigate('/setup/finish');
    navigate('/setup/finish');
  };

  return (
    <div className="banner-setup-container">
      {/* HLAVIČKA */}
      <div className="banner-setup-header">
        <h1 className="banner-setup-title">Upload Your Whop Banner</h1>
      </div>

      {/* OBSAH */}
      <div className="banner-setup-content">
        <p className="banner-setup-subtitle">
          This banner will appear at the top of your dashboard. Recommended size: 1200 × 300 px.
        </p>

        <div className="banner-input-wrapper">
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Banner Preview"
              className="banner-preview-image"
            />
          ) : (
            <div className="banner-placeholder">
              No banner selected
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="banner-file-input"
            onChange={handleFileChange}
          />
        </div>

        {error && <div className="banner-error">{error}</div>}

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
