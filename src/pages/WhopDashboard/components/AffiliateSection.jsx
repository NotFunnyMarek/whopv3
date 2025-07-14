// src/pages/WhopDashboard/components/AffiliateSection.jsx
import React from "react";
import "../../../styles/whop-dashboard/_owner.scss";

export default function AffiliateSection({
  links,
  loading,
  error,
  onChangePercent,
  onDelete,
}) {
  return (
    <div className="whop-affiliate-section">
      <h2 className="affiliate-section-title">Affiliates</h2>
      {loading ? (
        <p className="members-loading">Loading…</p>
      ) : error ? (
        <p className="members-error">{error}</p>
      ) : links.length === 0 ? (
        <p className="members-empty">No affiliates</p>
      ) : (
        <table className="members-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Clicks</th>
              <th>Signups</th>
              <th>Payout %</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id}>
                <td>{l.username}</td>
                <td>{l.clicks}</td>
                <td>{l.signups}</td>
                <td>
                  <input
                    type="number"
                    value={l.payout_percent}
                    min="0"
                    max="100"
                    step="0.1"
                    onChange={(e) => onChangePercent(l.id, e.target.value)}
                  />
                </td>
                <td>
                  <button
                    className="member-cancel-btn"
                    onClick={() => onDelete(l.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
