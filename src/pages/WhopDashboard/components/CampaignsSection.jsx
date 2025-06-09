// src/pages/WhopDashboard/components/CampaignsSection.jsx

import React from "react";
import "../../../styles/whop-dashboard/_owner.scss";

export default function CampaignsSection({
  whopData,
  campaigns,
  campaignsLoading,
  campaignsError,
  handleExpire,
}) {
  return (
    <div className="whop-campaigns-section">
      <h2 className="campaigns-section-title">Kampaně</h2>
      {campaignsLoading ? (
        <p className="campaigns-loading">Načítám kampaně…</p>
      ) : campaignsError ? (
        <p className="campaigns-error">{campaignsError}</p>
      ) : campaigns.length === 0 ? (
        <p className="campaigns-empty">Žádné kampaně k zobrazení.</p>
      ) : (
        <div className="whop-campaigns-list">
          {campaigns.map((camp) => {
            const isExpired = camp.is_active === 0;
            return (
              <div key={camp.id} className="whop-campaign-item">
                <h3 className="campaign-item-title">{camp.campaign_name}</h3>
                <p className="campaign-item-detail">
                  <strong>Kategorie:</strong> {camp.category}
                </p>
                <p className="campaign-item-detail">
                  <strong>Budget:</strong> {camp.currency}
                  {camp.budget.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="campaign-item-detail">
                  <strong>Typ:</strong> {camp.type}
                </p>
                <div className="campaign-status-row">
                  {isExpired ? (
                    <span className="expired-label">EXPIRED</span>
                  ) : (
                    <span className="active-label">ACTIVE</span>
                  )}
                  {!isExpired && (
                    <button
                      className="expire-btn"
                      onClick={() => handleExpire(camp.id)}
                    >
                      Expire
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
