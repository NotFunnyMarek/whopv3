// src/pages/WhopDashboard/components/SubmissionDetailModal.jsx

import React from "react";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submission-detail-modal.scss";

export default function SubmissionDetailModal({
  submission,
  campaign,
  onClose
}) {
  // Extrahuje YouTube video ID z URL, pokud existuje
  const getYouTubeEmbedUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      ) {
        let videoId = "";
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get("v");
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(submission.link);

  // Views a rate
  const views = submission.total_views || 0;
  const ratePerThousand = campaign.reward_per_thousand || 0;
  const currency = campaign.currency || "";

  // Výpočet základního payoutu podle views
  const rawPayout = (views / 1000) * ratePerThousand;

  // Minimální hranice pro payout
  const minPayout = campaign.min_payout !== null ? parseFloat(campaign.min_payout) : 0;

  // Pending (pro approved lze např. dosadit stejnou hodnotu jako raw, případně 0 pokud není schváleno)
  const pendingPayout =
    submission.status === "approved" && rawPayout >= minPayout
      ? rawPayout.toFixed(2)
      : "0.00";

  // Formátované hodnoty
  const formattedRaw = rawPayout.toFixed(2);

  // Zda už uživatel dosáhl minPayout
  const reachedMin = rawPayout >= minPayout;

  return (
    <div className="modal-overlay detail-modal-overlay">
      <div className="modal-content submission-detail-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="submission-detail-title">{campaign.campaign_name}</h2>

        <div className="video-container">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <p className="no-video-msg">
              Nelze přehrát video.{" "}
              <a href={submission.link} target="_blank" rel="noopener noreferrer">
                Otevřít odkaz
              </a>
            </p>
          )}
        </div>

        <div className="stats-container">
          {/* Views Generated */}
          <div className="stat-item">
            <span className="stat-label">Views generated</span>
            <span className="stat-value">{views}</span>
          </div>

          {/* Paid Out nebo upozornění na minimum */}
          <div className="stat-item">
            <span className="stat-label">Paid out</span>
            <span className="stat-value">
              {reachedMin
                ? `${currency}$${formattedRaw}`
                : "Minimum payout not reached"}
            </span>
          </div>

          {/* Pending payout (pouze pokud schváleno a min dosaženo) */}
          <div className="stat-item">
            <span className="stat-label">Pending payout</span>
            <span className="stat-value">
              {reachedMin
                ? `${currency}$${pendingPayout}`
                : `${currency}$0.00`}
            </span>
          </div>
        </div>

        {/* Status boxy */}
        {submission.status === "pending" && (
          <div className="status-box pending-box">
            Tato submission dosud nebyla schválena. Jakmile tvůrce rozhodne,
            výplaty začnou nebo bude submission odmítnuta.
          </div>
        )}
        {submission.status === "approved" && (
          <div className="status-box approved-box">
            Approved! Jakmile váš odhadovaný payout překročí min. hranici,
            budete pravidelně dostávat výplaty za zhlédnutí až do vyčerpání budgetu
            nebo expirace kampaně.
          </div>
        )}
        {submission.status === "rejected" && (
          <div className="status-box rejected-box">
            This submission has been rejected.
          </div>
        )}

        {submission.status === "rejected" && (
          <div className="rejection-reason-container">
            <span className="rejection-label">Rejection reason</span>
            <textarea
              className="rejection-reason"
              value={submission.rejection_reason || ""}
              readOnly
              placeholder="(zatím žádný důvod)"
            />
          </div>
        )}
      </div>
    </div>
  );
}
