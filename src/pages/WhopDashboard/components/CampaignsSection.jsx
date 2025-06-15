// src/pages/WhopDashboard/components/CampaignsSection.jsx

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/whop-dashboard/_owner.scss";

export default function CampaignsSection({
  whopData,
  campaigns,
  campaignsLoading,
  campaignsError,
  handleExpire,       // funkce „Refund & Expire“
}) {
  const navigate = useNavigate();
  // Ref pro sledování již zpracovaných automatických expirací
  const expiredProcessed = useRef(new Set());

  useEffect(() => {
    if (!campaigns || !campaigns.length) return;

    campaigns.forEach((camp) => {
      // Parsování expiration_datetime → JS Date
      const now = new Date();
      const expDate = new Date(camp.expiration_datetime.replace(" ", "T"));

      // Kampaň expired časem
      const byTime = expDate <= now;
      // Kampaň expired vyčerpáním budgetu
      const byBudget = parseFloat(camp.paid_out) >= parseFloat(camp.total_paid_out);
      // Kampaň stále aktivní v DB?
      const stillActive = camp.is_active === 1;

      if (stillActive && (byTime || byBudget)) {
        // Pokud jsme ji už neoznačili, zavoláme handleExpire
        if (!expiredProcessed.current.has(camp.id)) {
          expiredProcessed.current.add(camp.id);
          handleExpire(camp.id);
        }
      }
    });
  }, [campaigns, handleExpire]);

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
            const now = new Date();
            const expDate = new Date(camp.expiration_datetime.replace(" ", "T"));
            const byTime = expDate <= now;
            const byBudget = parseFloat(camp.paid_out) >= parseFloat(camp.total_paid_out);
            const isExpired = camp.is_active === 0 || byTime || byBudget;

            let timeInfo;
            if (isExpired) {
              timeInfo = "EXPIRED";
            } else {
              const diffMs = expDate.getTime() - now.getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor(
                (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );
              timeInfo = `Ending in: ${diffDays}d ${diffHours}h`;
            }

            return (
              <div
                key={camp.id}
                className="whop-campaign-item"
                onClick={() => navigate(`/dashboard/submissions/${camp.id}`)}
                style={{ cursor: "pointer" }}
              >
                <h3 className="campaign-item-title">
                  {camp.campaign_name}
                </h3>

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
                <p className="campaign-item-detail">
                  <strong>Status:</strong>{" "}
                  {isExpired ? (
                    <span className="expired-label">EXPIRED</span>
                  ) : (
                    <span className="active-label">ACTIVE</span>
                  )}
                </p>
                <p className="campaign-item-detail">
                  <strong>Expires:</strong>{" "}
                  <span className={isExpired ? "expired-text" : "active-text"}>
                    {timeInfo}
                  </span>
                </p>

                <div className="campaign-status-row">
                  {!isExpired && (
                    <button
                      className="expire-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpire(camp.id);
                      }}
                    >
                      Refund &amp; Expire
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
