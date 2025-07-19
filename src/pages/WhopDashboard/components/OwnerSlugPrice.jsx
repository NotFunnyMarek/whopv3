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
  editPricingPlans,
  addPlan,
  removePlan,
  handlePlanChange,
}) {
  if (!whopData) return null;

  function updateField(field, value) {
    setWhopData(prev => ({ ...prev, [field]: value }));
  }

  function updateQuestion(idx, text) {
    const qs = Array.isArray(whopData.waitlist_questions)
      ? [...whopData.waitlist_questions]
      : [];
    // Ensure array has at least 5 entries
    while (qs.length < 5) qs.push("");
    qs[idx] = text;
    updateField("waitlist_questions", qs);
  }

  return (
    <div className="whop-slug-section">
      {(isEditing || isSlugEditing) && (
        <div className="whop-slug-edit-wrapper">
          <label className="whop-slug-label">Change link:</label>
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
            <button className="whop-slug-save-btn" onClick={handleSlugSave}>
              Save link
            </button>
          ) : (
            <button
              className="whop-slug-edit-btn"
              onClick={() => setIsSlugEditing(true)}
            >
              Edit link
            </button>
          )}
        </div>
      )}

      <div className="whop-price-section">
        {isEditing ? (
          <div className="price-edit-wrapper">
            <div className="price-field">
              <label>Subscription</label>
              <select
                value={whopData.is_recurring ? "1" : "0"}
                onChange={e =>
                  updateField("is_recurring", parseInt(e.target.value, 10))
                }
              >
                <option value="0">One-time / Free</option>
                <option value="1">Recurring</option>
              </select>
            </div>
            {editPricingPlans.length === 0 && (
              <>
                <div className="price-field">
                  <label>Price (e.g. 10.00)</label>
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
                  <label>Currency</label>
                  <input
                    type="text"
                    value={whopData.currency || "USD"}
                    onChange={e =>
                      updateField("currency", e.target.value.toUpperCase())
                    }
                  />
                </div>
                {whopData.is_recurring && (
                  <div className="price-field">
                    <label>Billing period</label>
                    <select
                      value={whopData.billing_period || ""}
                      onChange={e =>
                        updateField("billing_period", e.target.value)
                      }
                    >
                      <option value="1 minute">1 minute</option>
                      <option value="7 days">7 days</option>
                      <option value="14 days">14 days</option>
                      <option value="30 days">30 days</option>
                      <option value="1 year">1 year</option>
                    </select>
                  </div>
                )}
              </>
            )}

            {editPricingPlans.map((p, idx) => (
              <div key={p.id} className="price-field plan-field">
                <label>Plan {idx + 1}</label>
                <input
                  type="text"
                  value={p.plan_name}
                  onChange={e => handlePlanChange(p.id, "plan_name", e.target.value)}
                  placeholder="Name"
                />
                <input
                  type="number"
                  step="0.01"
                  value={p.price}
                  onChange={e => handlePlanChange(p.id, "price", e.target.value)}
                />
                <input
                  type="text"
                  value={p.currency}
                  onChange={e => handlePlanChange(p.id, "currency", e.target.value.toUpperCase())}
                  className="plan-currency"
                />
                <select
                  value={p.billing_period}
                  onChange={e => handlePlanChange(p.id, "billing_period", e.target.value)}
                >
                  <option value="none">Free</option>
                  <option value="single">Single Payment</option>
                  <option value="1min">1 minute</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="1 year">1 year</option>
                </select>
                <button onClick={() => removePlan(p.id)}>-</button>
              </div>
            ))}
            <button className="add-plan-btn" onClick={addPlan}>Add Plan</button>

            {/* Waitlist toggle */}
            <div className="price-field">
              <label>
                <input
                  type="checkbox"
                  checked={!!whopData.waitlist_enabled}
                  onChange={e =>
                    updateField("waitlist_enabled", e.target.checked ? 1 : 0)
                  }
                />{" "}
                Enable waitlist
              </label>
            </div>

            {whopData.waitlist_enabled && (
              <div className="waitlist-questions-wrapper">
                <p>Add up to 5 waitlist request questions:</p>
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className="price-field">
                    <input
                      type="text"
                      placeholder={`Question ${idx + 1} (optional)`}
                      value={whopData.waitlist_questions?.[idx] || ""}
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
                {whopData.currency}
                {parseFloat(whopData.price).toFixed(2)}{" "}
                {whopData.is_recurring
                  ? `(Recurring every ${whopData.billing_period})`
                  : `(One-time)`}
              </span>
            )}
            <div className="waitlist-status">
              <em>
                Waitlist {whopData.waitlist_enabled ? "enabled" : "disabled"}
              </em>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
