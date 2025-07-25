// src/pages/WhopDashboard/components/MemberMain.jsx

import React, { useEffect, useState } from "react";
import "../../../styles/whop-dashboard/_member.scss";
import ChatWindow from "../../../components/Chat/ChatWindow";
import ReviewSection from "../../../components/ReviewSection";
import CourseViewer from "../../../components/CourseViewer";
import fetchAffiliateCode from "../fetchAffiliateCode";

export default function MemberMain({
  whopData,
  activeTab,
  campaigns,
  campaignsLoading,
  campaignsError,
  onSelectCampaign,
  setWhopData,
}) {
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordMember, setDiscordMember] = useState(false);
  const [guildId, setGuildId] = useState("");
  const [affiliateData, setAffiliateData] = useState(null);
  const [affiliateError, setAffiliateError] = useState("");

  const loadAffiliate = async () => {
    await fetchAffiliateCode(whopData.id, setAffiliateData, setAffiliateError);
  };

  useEffect(() => {
    if (activeTab !== "Affiliate") {
      setAffiliateData(null);
      setAffiliateError("");
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Affiliate" && !affiliateData && !affiliateError) {
      loadAffiliate();
    }
  }, [activeTab]);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("https://app.byxbot.com/php/link_account.php", {
          credentials: "include",
        });
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          const found = json.data.find(
            (acc) => acc.platform === "discord" && acc.is_verified
          );
          setDiscordLinked(Boolean(found));
        }
      } catch {}

      try {
        const res = await fetch(
          `https://app.byxbot.com/php/discord_link.php?whop_id=${whopData.id}`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        if (json.status === "success") {
          if (json.data?.guild_id) {
            setGuildId(json.data.guild_id);
          }
          if (typeof json.data?.is_member === "boolean") {
            setDiscordMember(json.data.is_member);
          }
        }
      } catch {}
    }
    fetchStatus();
  }, []);
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
          <ReviewSection
            whopId={whopData.id}
            title={whopData.landing_texts?.reviews_title || "See what other people are saying"}
          />
        </div>
      )}

      {/* CHAT */}
      {activeTab === "Chat" && whopData.modules?.chat && (
        <div className="member-tab-content member-chat-tab">
          <ChatWindow
            whopId={whopData.id}
            whopName={whopData.name}
            whopLogo={whopData.logo_url}
          />
        </div>
      )}

      {/* EARN */}
      {activeTab === "Earn" && whopData.modules?.earn && (
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

      {/* AFFILIATE */}
      {activeTab === "Affiliate" && whopData.modules?.affiliate && (
        <div className="member-tab-content">
          <h3 className="member-subtitle">Affiliate Link</h3>
          {affiliateError ? (
            <p className="member-error">{affiliateError}</p>
          ) : affiliateData ? (
            <div className="affiliate-info">
              <p>
                Your link:
                <code>{`${window.location.origin}/?af=${affiliateData.code}`}</code>
              </p>
              <p>Clicks: {affiliateData.clicks}</p>
              <p>Signups: {affiliateData.signups}</p>
              <p>Payout: {affiliateData.payout_percent}%</p>
            </div>
          ) : (
            <button className="primary-btn" onClick={loadAffiliate}>
              Generate Link
            </button>
          )}
        </div>
      )}

      {/* DISCORD */}
      {activeTab === "Discord" && whopData.modules?.discord_access === true && (
        <div className="member-tab-content">
          <h3 className="member-subtitle">Discord Access</h3>
          <p className="member-text">
            {discordLinked && discordMember
              ? "Discord access active."
              : "Link your Discord account to join the server."}
          </p>
          {discordLinked && discordMember ? (
            <a
              className="primary-btn"
              href={`/discord-access?whop_id=${whopData.id}`}
            >
              Join Server
            </a>
          ) : (
            <a
              className="primary-btn"
              href={`/discord-access?whop_id=${whopData.id}`}
            >
              Get Access
            </a>
          )}
        </div>
      )}

      {/* COURSE */}
      {activeTab === "Course" && whopData.modules?.course && (
        <div className="member-tab-content">
          <h3 className="member-subtitle">Course</h3>
          <CourseViewer
            steps={whopData.course_steps || []}
            initialCompleted={whopData.course_progress || []}
            whopId={whopData.id}
            onProgressChange={(arr) =>
              typeof setWhopData === "function" &&
              setWhopData((prev) => ({ ...prev, course_progress: arr }))
            }
          />
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
