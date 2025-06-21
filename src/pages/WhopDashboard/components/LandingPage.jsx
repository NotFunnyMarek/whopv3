// src/pages/WhopDashboard/components/LandingPage.jsx

import React, { useState, useEffect } from "react";
import { FaUsers, FaUserPlus, FaClock } from "react-icons/fa";
import "../../../styles/whop-dashboard/whop-dashboard.scss";

export default function LandingPage({
  whopData,
  memberLoading,
  handleSubscribe,
  handleRequestWaitlist,
  showNotification,
}) {
  const [showForm, setShowForm] = useState(false);
  const [requested, setRequested] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Update requested state when user’s waitlist status changes
  useEffect(() => {
    if (!whopData) return;
    setRequested(!!(whopData.is_pending_waitlist || whopData.is_accepted_waitlist));
  }, [whopData?.is_pending_waitlist, whopData?.is_accepted_waitlist]);

  // Initialize answers array whenever questions change
  useEffect(() => {
    if (!whopData) return;
    setAnswers(whopData.waitlist_questions.map(() => ""));
  }, [whopData?.waitlist_questions]);

  if (!whopData) return null;

  const {
    id,
    name,
    description,
    banner_url,
    members_count,
    features,
    price,
    currency,
    is_recurring,
    billing_period,
    waitlist_enabled,
    waitlist_questions,
    user_balance,
    is_member,
  } = whopData;

  // Start waitlist request flow
  const onStartRequest = () => {
    // If paid but insufficient balance, refuse immediately
    if (price > 0 && user_balance < price) {
      showNotification({
        type: "error",
        message: "Nemáte dostatek prostředků k podání žádosti o přístup.",
      });
      return;
    }
    setShowForm(true);
  };

  // Handle answer change
  const onChangeAnswer = (idx, e) => {
    const a = [...answers];
    a[idx] = e.target.value;
    setAnswers(a);
  };

  // Submit waitlist request
  const onSubmitRequest = async () => {
    try {
      await handleRequestWaitlist(id, answers);
      showNotification({ type: "success", message: "Žádost o přístup odeslána." });
      setRequested(true);
      setShowForm(false);
    } catch (err) {
      showNotification({ type: "error", message: err.message || "Chyba při odeslání." });
    }
  };

  // Připrav text s cenou a periodou
  const priceLabel = price > 0
    ? `${currency}${price.toFixed(2)}${is_recurring ? ` (opak. každých ${billing_period})` : " (jednorázově)"}`
    : "zdarma";

  // Determine what action to show
  let actionArea;
  if (is_member) {
    actionArea = null;
  } else if (requested) {
    // Po odeslání žádosti: zobrazíme cenu, která se strhne po schválení
    actionArea = (
      <button className="whop-landing-join-btn waitlist-pending" disabled>
        <FaClock /> Žádost odeslána — po schválení se strhne {priceLabel}
      </button>
    );
  } else if (showForm) {
    // Formulář + info o ceně
    actionArea = (
      <div className="waitlist-form">
        <div className="price-field price-info">
          <strong>Po schválení bude strženo:</strong> {priceLabel}
        </div>
        {waitlist_questions.map((q, idx) =>
          q ? (
            <div key={idx} className="price-field">
              <label>{`Otázka ${idx + 1}: ${q}`}</label>
              <input
                type="text"
                value={answers[idx]}
                onChange={(e) => onChangeAnswer(idx, e)}
              />
            </div>
          ) : null
        )}
        <button
          className="whop-landing-join-btn"
          onClick={onSubmitRequest}
          disabled={memberLoading}
        >
          {memberLoading ? "Odesílám…" : <><FaClock /> Odeslat žádost</>}
        </button>
      </div>
    );
  } else if (waitlist_enabled) {
    // Výzva k žádosti + cena
    actionArea = (
      <button
        className="whop-landing-join-btn"
        onClick={onStartRequest}
        disabled={memberLoading}
      >
        {memberLoading
          ? "Načítám…"
          : <><FaClock /> Žádat o přístup — po schválení se strhne {priceLabel}</>}
      </button>
    );
  } else {
    // Klasické předplatné
    actionArea = (
      <button
        className="whop-landing-join-btn"
        onClick={handleSubscribe}
        disabled={memberLoading}
      >
        {memberLoading
          ? "Načítám…"
          : (
            <>
              <FaUserPlus />{" "}
              {price > 0
                ? `${currency}${price.toFixed(2)}${is_recurring ? ` (opak. každých ${billing_period})` : ""}`
                : "Připojit se zdarma"}
            </>
          )}
      </button>
    );
  }

  return (
    <div className="whop-landing">
      <div className="whop-landing-banner">
        {banner_url ? (
          <img src={banner_url} alt="Banner" className="whop-landing-banner-img" />
        ) : (
          <div className="whop-landing-banner-placeholder">Žádný banner</div>
        )}
      </div>

      <div className="whop-landing-content">
        <h1 className="whop-landing-title">{name}</h1>
        <div className="whop-members-count"><FaUsers /> {members_count} členů</div>
        <p className="whop-landing-description">{description}</p>

        {/* Price display for paid flows */}
        {!waitlist_enabled && price > 0 && (
          <div className="price-info">
            Cena: {currency}{price.toFixed(2)}{" "}
            {is_recurring ? `(opak. každých ${billing_period})` : "(jednorázově)"}
          </div>
        )}

        {actionArea}

        <h2 className="features-section-title">Features</h2>
        <div className="whop-features-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="whop-feature-card">
              {feat.image_url ? (
                <img src={feat.image_url} alt={feat.title} className="whop-feature-image" />
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
