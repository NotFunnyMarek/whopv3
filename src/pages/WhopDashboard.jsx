// src/pages/WhopDashboard.jsx

import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../styles/whop-dashboard.scss';

export default function WhopDashboard() {
  const { slug } = useParams();        // Parametr z URL, např. "nazev_pri_setupu"
  const location = useLocation();
  const navigate = useNavigate();

  // Data předaná z BannerSetup.jsx: { name, slug, features, logoUrl, bannerUrl }
  const whopData = location.state?.whopData || null;

  // Pokud chybí whopData, zobrazíme chybovou obrazovku
  if (!whopData) {
    return (
      <div className="whop-dashboard-error">
        <p>Whop data not found. Please complete the setup first.</p>
        <button onClick={() => navigate('/setup')}>Go to Setup</button>
      </div>
    );
  }

  return (
    <div className="whop-dashboard-container">
      {/* Tlačítko „Zpět“ (Back) */}
      <button
        className="whop-back-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ←
      </button>

      {/* Banner */}
      <div className="whop-banner-wrapper">
        {whopData.bannerUrl ? (
          <img
            src={whopData.bannerUrl}
            alt={`${whopData.name} Banner`}
            className="whop-banner-image"
          />
        ) : (
          <div className="whop-banner-placeholder">No banner selected</div>
        )}
      </div>

      {/* Logo (je-li k dispozici) */}
      {whopData.logoUrl && (
        <div className="whop-logo-wrapper">
          <img
            src={whopData.logoUrl}
            alt={`${whopData.name} Logo`}
            className="whop-logo-image"
          />
        </div>
      )}

      {/* Název Whopu */}
      <div className="whop-name-wrapper">
        <h1 className="whop-name">{whopData.name}</h1>
      </div>

      {/* Navigační menu (Home, Chat, Earn, Learn) */}
      <nav className="whop-nav">
        <ul className="whop-nav-list">
          <li className="whop-nav-item active">Home</li>
          <li className="whop-nav-item">Chat</li>
          <li className="whop-nav-item">Earn</li>
          <li className="whop-nav-item">Learn</li>
        </ul>
      </nav>

      {/* Hlavní obsah (zde jen placeholder) */}
      <div className="whop-main-content">
        <p>Select a post or app to open it here.</p>
      </div>
    </div>
  );
}
