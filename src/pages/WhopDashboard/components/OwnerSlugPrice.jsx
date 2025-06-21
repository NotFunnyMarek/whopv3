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

  function updateField(field, value) {
    setWhopData(prev => ({ ...prev, [field]: value }));
  }

  function updateQuestion(idx, text) {
    const qs = Array.isArray(whopData.waitlist_questions)
      ? [...whopData.waitlist_questions]
      : [];
    while (qs.length < 5) qs.push("");
    qs[idx] = text;
    updateField("waitlist_questions", qs);
  }

  return (
    <div className="whop-slug-section">
      {(isEditing || isSlugEditing) && (
        <div className="whop-slug-edit-wrapper">
          <label className="whop-slug-label">Změň link:</label>
          <div className="whop-slug-input-wrapper">
            <span className="whop-slug-prefix">wrax.com/c/</span>
            <input
              type="text"
              className="whop-slug-input"
              value={newSlugValue}
              onChange={e => setNewSlugValue(e.target.value)}
              disabled={!isSlugEditing}
            />
          </div>
          {slugError && <div className="whop-slug-error">{slugError}</div>}
          {isSlugEditing ? (
            <button className="whop-slug-save-btn" onClick={handleSlugSave}>Uložit link</button>
          ) : (
            <button className="whop-slug-edit-btn" onClick={() => setIsSlugEditing(true)}>Změnit link</button>
          )}
        </div>
      )}

      <div className="whop-price-section">
        {isEditing ? (
          <div className="price-edit-wrapper">
            <div className="price-field">
              <label>Cena (např. 10.00)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={whopData.price ?? ""}
                onChange={e => {
                  const val = e.target.value;
                  updateField("price", val !== "" ? parseFloat(val) : 0);
                }}
              />
            </div>
            <div className="price-field">
              <label>Měna</label>
              <input
                type="text"
                value={whopData.currency || "USD"}
                onChange={e => updateField("currency", e.target.value.toUpperCase())}
              />
            </div>
            <div className="price-field">
              <label>Předplatné</label>
              <select
                value={whopData.is_recurring ? "1" : "0"}
                onChange={e => updateField("is_recurring", parseInt(e.target.value,10))}
              >
                <option value="0">Jednorázově</option>
                <option value="1">Opakované</option>
              </select>
            </div>
            {whopData.is_recurring && (
              <div className="price-field">
                <label>Perioda</label>
                <select
                  value={whopData.billing_period || ""}
                  onChange={e => updateField("billing_period", e.target.value)}
                >
                  <option value="1 minute">1 minute</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="1 year">1 year</option>
                </select>
              </div>
            )}

            {/* Waitlist toggle */}
            <div className="price-field">
              <label>
                <input
                  type="checkbox"
                  checked={!!whopData.waitlist_enabled}
                  onChange={e => updateField("waitlist_enabled", e.target.checked ? 1 : 0)}
                /> Enable waitlist
              </label>
            </div>

            {whopData.waitlist_enabled && (
              <div className="waitlist-questions-wrapper">
                <p>Přidejte až 5 otázek pro žádost o waitlist:</p>
                {[0,1,2,3,4].map(idx => (
                  <div key={idx} className="price-field">
                    <input
                      type="text"
                      placeholder={`Otázka ${idx+1} (volitelně)`}
                      value={(whopData.waitlist_questions?.[idx] || "")}
                      onChange={e => updateQuestion(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="price-view-wrapper">
            {(!whopData.price || parseFloat(whopData.price) <= 0) ? (
              <span className="price-free">Cost: Free</span>
            ) : (
              <span className="price-info">
                {whopData.currency}{parseFloat(whopData.price).toFixed(2)}{" "}
                {whopData.is_recurring
                  ? `(Opakuje se každých ${whopData.billing_period})`
                  : `(Jednorázově)`}
              </span>
            )}
            <div className="waitlist-status">
              <em>Waitlist {whopData.waitlist_enabled ? "enabled" : "disabled"}</em>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
