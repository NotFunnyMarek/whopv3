// src/pages/WhopDashboard/components/OwnerSlugPrice.jsx

import React from "react";

export default function OwnerSlugPrice({
  whopData,
  setWhopData,
  isEditing,
  isSlugEditing,
  setIsSlugEditing,
  newSlugValue,
  setNewSlugValue,
  slugError,
  handleSlugSave,
}) {
  if (!whopData) return null;

  // Pomocná funkce pro aktualizaci jakéhokoli pole v objektu whopData
  function updateField(field, value) {
    setWhopData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="whop-slug-section">
      {/* SLUG */}
      {(isEditing || isSlugEditing) && (
        <div className="whop-slug-edit-wrapper">
          <label className="whop-slug-label">Změň link:</label>
          <div className="whop-slug-input-wrapper">
            <span className="whop-slug-prefix">wrax.com/c/</span>
            <input
              type="text"
              className="whop-slug-input"
              value={newSlugValue}
              onChange={(e) => setNewSlugValue(e.target.value)}
              disabled={!isSlugEditing}
            />
          </div>
          {slugError && <div className="whop-slug-error">{slugError}</div>}
          {isSlugEditing ? (
            <button className="whop-slug-save-btn" onClick={handleSlugSave}>
              Uložit link
            </button>
          ) : (
            <button
              className="whop-slug-edit-btn"
              onClick={() => {
                setIsSlugEditing(true);
              }}
            >
              Změnit link
            </button>
          )}
        </div>
      )}

      {/* PRICE / PERIOD */}
      <div className="whop-price-section">
        {isEditing ? (
          <div className="price-edit-wrapper">
            {/* Cena */}
            <div className="price-field">
              <label>Cena (např. 10.00)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={whopData.price ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField("price", val !== "" ? parseFloat(val) : 0);
                }}
              />
            </div>

            {/* Měna */}
            <div className="price-field">
              <label>Měna</label>
              <input
                type="text"
                value={whopData.currency || "USD"}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  updateField("currency", val);
                }}
              />
            </div>

            {/* Předplatné */}
            <div className="price-field">
              <label>Předplatné</label>
              <select
                value={whopData.is_recurring ? "1" : "0"}
                onChange={(e) => {
                  const rec = parseInt(e.target.value, 10);
                  updateField("is_recurring", rec);
                }}
              >
                <option value="0">Jednorázově</option>
                <option value="1">Opakované</option>
              </select>
            </div>

            {/* Perioda – jen pokud se opakuje */}
            {whopData.is_recurring ? (
              <div className="price-field">
                <label>Perioda</label>
                <select
                  value={whopData.billing_period || ""}
                  onChange={(e) => {
                    const period = e.target.value;
                    updateField("billing_period", period);
                  }}
                >
                  <option value="1 minute">1 minute</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="1 year">1 year</option>
                </select>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="price-view-wrapper">
            {(!whopData.price || parseFloat(whopData.price) <= 0) ? (
              <span className="price-free">Cost: Free</span>
            ) : (
              <span className="price-info">
                {whopData.currency}
                {parseFloat(whopData.price).toFixed(2)}{" "}
                {whopData.is_recurring
                  ? `(Opakuje se každých ${whopData.billing_period})`
                  : `(Jednorázově)`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
