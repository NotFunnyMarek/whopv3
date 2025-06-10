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
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
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

  // Spočítáme odhadované výplaty
  const views = submission.total_views || 0;
  const ratePerThousand = campaign.reward_per_thousand || 0;
  const paidOut = ((views / 1000) * ratePerThousand).toFixed(2);
  const pendingPayout = submission.status === "pending"
    ? paidOut
    : submission.status === "approved"
    ? paidOut
    : "0.00";

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
            ></iframe>
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
          <div className="stat-item">
            <span className="stat-label">Views generated</span>
            <span className="stat-value">{views}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Paid out</span>
            <span className="stat-value">
              {campaign.currency}${paidOut}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending payout</span>
            <span className="stat-value">
              {campaign.currency}${pendingPayout}
            </span>
          </div>
        </div>

        {submission.status === "pending" && (
          <div className="status-box pending-box">
            This submission has not yet been reviewed by the creator. Once the
            creator makes a decision, your submission will either begin
            receiving payouts or be rejected due to their content guidelines.
          </div>
        )}
        {submission.status === "approved" && (
          <div className="status-box approved-box">
            Approved! Once your estimated payout exceeds 50¢, you'll get paid
            out hourly for the views generated up to the Content Reward budget
            or until the Content Reward expires.
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
