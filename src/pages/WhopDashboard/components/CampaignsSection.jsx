// src/pages/WhopDashboard/components/CampaignsSection.jsx

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/whop-dashboard/_owner.scss";

export default function CampaignsSection({
  whopData,
  campaigns,
  campaignsLoading,
  campaignsError,
  handleExpire,       // function to refund and expire a campaign
}) {
  const navigate = useNavigate();
  // Track which campaigns have already been automatically expired
  const expiredProcessed = useRef(new Set());

  useEffect(() => {
    if (!campaigns || !campaigns.length) return;

    campaigns.forEach((camp) => {
      // Parse expiration_datetime into a JS Date
      const now = new Date();
      const expDate = new Date(camp.expiration_datetime.replace(" ", "T"));

      // Determine if the campaign has expired by time
      const expiredByTime = expDate <= now;
      // Determine if the campaign has expired by budget exhaustion
      const expiredByBudget = parseFloat(camp.paid_out) >= parseFloat(camp.total_paid_out);
      // Check if the campaign is still marked active in the database
      const stillActive = camp.is_active === 1;

      if (stillActive && (expiredByTime || expiredByBudget)) {
        // If not yet processed, call handleExpire
        if (!expiredProcessed.current.has(camp.id)) {
          expiredProcessed.current.add(camp.id);
          handleExpire(camp.id);
        }
      }
    });
  }, [campaigns, handleExpire]);

  return (
    <div className="whop-campaigns-section">
      <h2 className="campaigns-section-title">Campaigns</h2>

      {campaignsLoading ? (
        <p className="campaigns-loading">Loading campaigns…</p>
      ) : campaignsError ? (
        <p className="campaigns-error">{campaignsError}</p>
      ) : campaigns.length === 0 ? (
        <p className="campaigns-empty">No campaigns to display.</p>
      ) : (
        <div className="whop-campaigns-list">
          {campaigns.map((camp) => {
            const now = new Date();
            const expDate = new Date(camp.expiration_datetime.replace(" ", "T"));
            const expiredByTime = expDate <= now;
            const expiredByBudget = parseFloat(camp.paid_out) >= parseFloat(camp.total_paid_out);
            const isExpired = camp.is_active === 0 || expiredByTime || expiredByBudget;

            // Compute time remaining or show "EXPIRED"
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
                  <strong>Category:</strong> {camp.category}
                </p>
                <p className="campaign-item-detail">
                  <strong>Budget:</strong> {camp.currency}
                  {camp.budget.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="campaign-item-detail">
                  <strong>Type:</strong> {camp.type}
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
