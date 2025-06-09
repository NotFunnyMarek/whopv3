// src/pages/WhopDashboard/components/LandingPage.jsx

import React from "react";
import { FaUsers, FaUserPlus } from "react-icons/fa";
import "../../../styles/whop-dashboard/whop-dashboard.scss";

export default function LandingPage({
  whopData,
  memberLoading,
  handleSubscribe,
}) {
  if (!whopData) return null;

  return (
    <div className="whop-landing">
      <div className="whop-landing-banner">
        {whopData.banner_url ? (
          <img
            src={whopData.banner_url}
            alt="Banner"
            className="whop-landing-banner-img"
          />
        ) : (
          <div className="whop-landing-banner-placeholder">Žádný banner</div>
        )}
      </div>

      <div className="whop-landing-content">
        <h1 className="whop-landing-title">{whopData.name}</h1>
        <div className="whop-members-count">
          <FaUsers /> {whopData.members_count} členů
        </div>
        <p className="whop-landing-description">{whopData.description}</p>

        <button
          className="whop-landing-join-btn"
          onClick={() => handleSubscribe()}
          disabled={memberLoading}
        >
          {memberLoading ? (
            "Načítám…"
          ) : (
            <>
              <FaUserPlus />{" "}
              {whopData.price && parseFloat(whopData.price) > 0
                ? `${whopData.currency}${parseFloat(whopData.price).toFixed(2)}`
                : "Připojit se zdarma"}
            </>
          )}
        </button>

        <h2 className="features-section-title">Features</h2>
        <div className="whop-features-grid">
          {whopData.features.map((feat, idx) => (
            <div key={idx} className="whop-feature-card">
              {feat.image_url ? (
                <img
                  src={feat.image_url}
                  alt={feat.title}
                  className="whop-feature-image"
                />
              ) : (
                <div className="whop-feature-image-placeholder" />
              )}
              <div className="whop-feature-text">
                <h3 className="whop-feature-title">{feat.title}</h3>
                {feat.subtitle && (
                  <p className="whop-feature-subtitle">{feat.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
