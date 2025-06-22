// src/pages/WhopDashboard/components/MemberMain.jsx

import React from "react";
import "../../../styles/whop-dashboard/_member.scss";
import ChatWindow from "../../../components/Chat/ChatWindow";

export default function MemberMain({
  whopData,
  activeTab,
  campaigns,
  campaignsLoading,
  campaignsError,
  onSelectCampaign,
}) {
  return (
    <div className="member-main">
      {/* HOME */}
      {activeTab === "Home" && (
        <div className="member-tab-content">
          <h3 className="member-subtitle">{whopData.name}</h3>
          <div className="whop-features-grid">
            {whopData.features.map((feat, idx) => (
              <div key={idx} className="whop-feature-card">
                {feat.image_url ? (
                  <img
                    src={feat.image_url}
                    alt={feat.title}
                    className="whop-feature-image"
                  />
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
      )}

      {/* CHAT */}
      {activeTab === "Chat" && (
        <div className="member-tab-content member-chat-tab">
          <ChatWindow
            whopId={whopData.id}
            whopName={whopData.name}
            whopLogo={whopData.logo_url}
          />
        </div>
      )}

      {/* EARN */}
      {activeTab === "Earn" && (
        <div className="member-tab-content">
          <h3 className="member-subtitle">Earn</h3>
          {campaignsLoading ? (
            <div className="spinner spinner-small" />
          ) : campaignsError ? (
            <p className="member-error">{campaignsError}</p>
          ) : campaigns.length === 0 ? (
            <div className="no-campaign-msg">No campaigns</div>
          ) : (
            <ul className="member-campaign-list">
              {campaigns.map((camp) => {
                const now = new Date();
                const expDate = new Date(
                  camp.expiration_datetime.replace(" ", "T")
                );
                const timeDiff = expDate - now;
                const expiredByTime = timeDiff <= 0;
                const expiredByBudget = camp.paid_out >= camp.total_paid_out;
                const isExpired =
                  camp.is_active === 0 || expiredByTime || expiredByBudget;

                let timeInfo;
                if (isExpired) {
                  timeInfo = "EXPIRED";
                } else {
                  const days = Math.floor(timeDiff / 86400000);
                  const hours = Math.floor(
                    (timeDiff % 86400000) / 3600000
                  );
                  const mins = Math.floor(
                    (timeDiff % 3600000) / 60000
                  );
                  timeInfo = `Ending in: ${days}d ${hours}h ${mins}m`;
                }

                const paidOut = Math.min(
                  camp.paid_out,
                  camp.total_paid_out
                );
                const percent = Math.min(
                  Math.round((paidOut / camp.total_paid_out) * 100),
                  100
                );

                return (
                  <li
                    key={camp.id}
                    className={`member-campaign-card ${
                      isExpired ? "expired" : "active"
                    }`}
                    onClick={() => onSelectCampaign(camp)}
                  >
                    <div className="camp-header">
                      <span className="camp-title">
                        {camp.campaign_name}
                      </span>
                      {isExpired ? (
                        <span className="expired-label">EXPIRED</span>
                      ) : (
                        <span className="reward-label">
                          {camp.currency}
                          {camp.reward_per_thousand.toFixed(2)} / 1K
                        </span>
                      )}
                    </div>
                    <p className="author">
                      Author: <span className="author-name">{camp.username}</span>
                    </p>
                    <p
                      className={`countdown ${
                        isExpired ? "expired-text" : "active-text"
                      }`}
                    >
                      {timeInfo}
                    </p>
                    <div className="paid-bar">
                      <div className="paid-info">
                        {camp.currency}
                        {paidOut.toFixed(2)} of{" "}
                        {camp.currency}
                        {camp.total_paid_out.toFixed(2)} paid out
                      </div>
                      <div className="progress-container">
                        <div
                          className="progress-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="percent-text">{percent}%</div>
                    </div>
                    <ul className="camp-details">
                      <li>
                        <strong>Type:</strong> {camp.type}
                      </li>
                      <li>
                        <strong>Category:</strong> {camp.category}
                      </li>
                      <li>
                        <strong>Platforms:</strong>{" "}
                        {camp.platforms.map((p, i) => (
                          <span key={i} className="platform-pill">
                            {p}
                          </span>
                        ))}
                      </li>
                      <li>
                        <strong>Views:</strong>{" "}
                        {camp.reward_per_thousand > 0
                          ? Math.round(
                              (paidOut / camp.reward_per_thousand) * 1000
                            )
                          : 0}
                      </li>
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* TOOLS */}
      {activeTab === "Tools" && (
        <div className="member-tab-content">
          <h3 className="member-subtitle">Tools</h3>
          <p className="member-text">
            Tools section is under construction or may include additional tools.
          </p>
        </div>
      )}
    </div>
  );
}
