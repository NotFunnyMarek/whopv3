// src/pages/WhopDashboard/components/CampaignsSection.jsx

import React from "react";
import "../../../styles/whop-dashboard/_owner.scss";

export default function CampaignsSection({
  whopData,
  campaigns,
  campaignsLoading,
  campaignsError,
  handleExpire,       // funkce „Refund & Expire“ (manuálně volaná ownerem)
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
            // 1) Parsujeme expiration_datetime (např. "2025-06-10 15:30:00")
            //    (nahrazujeme mezeru písmenem 'T', aby JS Date korektně pochopil)
            const now = new Date();
            const expDate = new Date(camp.expiration_datetime.replace(" ", "T"));

            // 2) Kampaň považujeme za expired, pokud is_active === 0 nebo expDate <= now
            const isExpired = camp.is_active === 0 || expDate <= now;

            // 3) Když kampaň ještě neexpiruje, vypočítáme, kolik zbývá do konce (dny/hodiny)
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

                {/* 4) Zobrazení aktuálního stavu (ACTIVE / EXPIRED) */}
                <p className="campaign-item-detail">
                  <strong>Status:</strong>{" "}
                  {isExpired ? (
                    <span className="expired-label">EXPIRED</span>
                  ) : (
                    <span className="active-label">ACTIVE</span>
                  )}
                </p>

                {/* 5) Zobrazení zbývajícího času nebo „EXPIRED“ */}
                <p className="campaign-item-detail">
                  <strong>Expires:</strong>{" "}
                  <span className={isExpired ? "expired-text" : "active-text"}>
                    {timeInfo}
                  </span>
                </p>

                <div className="campaign-status-row">
                  {/* 6) Owner může manuálně „Refund & Expire“ (pouze pokud ještě neexpiruje) */}
                  {!isExpired && (
                    <button
                      className="expire-btn"
                      onClick={() => handleExpire(camp.id)}
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
