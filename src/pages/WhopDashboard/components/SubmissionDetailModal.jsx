// src/pages/WhopDashboard/components/SubmissionDetailModal.jsx

import React from "react";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submission-detail-modal.scss";

export default function SubmissionDetailModal({
  submission,
  campaign,
  onClose
}) {
  // YouTube embed helper
  const getYouTubeEmbedUrl = (url) => {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      let vid = "";
      if (host.includes("youtu.be")) {
        vid = u.pathname.slice(1);
      } else if (host.includes("youtube.com")) {
        vid = u.searchParams.get("v");
      }
      return vid ? `https://www.youtube.com/embed/${vid}` : null;
    } catch {
      return null;
    }
  };
  const embedUrl = getYouTubeEmbedUrl(submission.link);

  // Safe numeric values
  const totalViews     = Number(submission.total_views  ?? 0);
  const ratePerK       = Number(campaign.reward_per_thousand ?? 0);
  const minPayout      = campaign.min_payout != null ? Number(campaign.min_payout) : null;
  const currency       = campaign.currency || "";

  // Views needed to reach minimum payout
  const neededViews = minPayout !== null && ratePerK > 0
    ? Math.ceil((minPayout / ratePerK) * 1000)
    : null;

  // Gross earnings from current views
  const rawPayout = (totalViews / 1000) * ratePerK;
  const payoutStr = rawPayout.toFixed(2);

  // Whether minimum payout threshold has been reached
  const reachedMin = neededViews !== null
    ? totalViews >= neededViews
    : true;

  // Pending payout: zero if threshold met, otherwise raw payout
  const pendingStr = reachedMin
    ? "0.00"
    : rawPayout.toFixed(2);

  return (
    <div className="modal-overlay detail-modal-overlay">
      <div className="modal-content submission-detail-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
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
              Unable to play video.{" "}
              <a href={submission.link} target="_blank" rel="noopener noreferrer">
                Open link
              </a>
            </p>
          )}
        </div>

        <div className="stats-container">
          {/* Views Generated */}
          <div className="stat-item">
            <span className="stat-label">Views generated</span>
            <span className="stat-value">
              {neededViews !== null && totalViews < neededViews
                ? `${totalViews} / ${neededViews}`
                : totalViews}
            </span>
          </div>

          {/* Paid Out */}
          <div className="stat-item">
            <span className="stat-label">Paid out</span>
            <span className="stat-value">
              {reachedMin
                ? `${currency}${payoutStr}`
                : "Minimum payout not reached"}
            </span>
          </div>

          {/* Pending Payout */}
          <div className="stat-item">
            <span className="stat-label">Pending payout</span>
            <span className="stat-value">
              {currency}{pendingStr}
            </span>
          </div>
        </div>

        {/* Status boxes */}
        {submission.status === "pending" && (
          <div className="status-box pending-box">
            Submission is pending approval. Please wait for the creator’s decision.
          </div>
        )}
        {submission.status === "approved" && (
          <div className="status-box approved-box">
            Approved! Payouts will occur at the set intervals until the budget is exhausted.
          </div>
        )}
        {submission.status === "rejected" && (
          <>
            <div className="status-box rejected-box">
              This submission was rejected.
            </div>
            <div className="rejection-reason-container">
              <span className="rejection-label">Rejection reason</span>
              <textarea
                className="rejection-reason"
                readOnly
                value={submission.rejection_reason || ""}
                placeholder="(no reason provided)"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
