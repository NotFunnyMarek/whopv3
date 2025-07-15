import React from "react";
import "../../../styles/whop-dashboard/_owner.scss";

export default function AffiliateDefaultsSection({
  isEditing,
  defaultPercent,
  setDefaultPercent,
  recurring,
  setRecurring,
}) {
  if (!isEditing) return null;
  return (
    <div className="affiliate-defaults-section">
      <h2 className="affiliate-section-title">Affiliate Settings</h2>
      <div className="affiliate-defaults-fields">
        <label>
          Default payout %
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={defaultPercent}
            onChange={(e) => setDefaultPercent(e.target.value)}
          />
        </label>
        <label>
          Payout mode
          <select
            value={recurring ? "1" : "0"}
            onChange={(e) => setRecurring(e.target.value === "1")}
          >
            <option value="0">First payment only</option>
            <option value="1">Every payment</option>
          </select>
        </label>
      </div>
    </div>
  );
}
