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

  // Bezpečné čísla
  const totalViews     = Number(submission.total_views  ?? 0);
  const ratePerK       = Number(campaign.reward_per_thousand ?? 0);
  const minPayout      = campaign.min_payout != null ? Number(campaign.min_payout) : null;
  const currency       = campaign.currency || "";

  // Kolik views je třeba pro minPayout
  const neededViews = minPayout !== null && ratePerK > 0
    ? Math.ceil((minPayout / ratePerK) * 1000)
    : null;

  // Hrubý výdělek z dosavadních views
  const rawPayout = (totalViews / 1000) * ratePerK;
  const payoutStr = rawPayout.toFixed(2);

  // Splněná podmínka = dostatek views
  const reachedMin = neededViews !== null
    ? totalViews >= neededViews
    : true;

  // Pending: pokud min. už splněno, nic k vyplacení; jinak ještě raw
  const pendingStr = reachedMin
    ? "0.00"
    : rawPayout.toFixed(2);

  return (
    <div className="modal-overlay detail-modal-overlay">
      <div className="modal-content submission-detail-modal">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
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
                ? `${currency}$${payoutStr}`
                : "Minimum payout not reached"}
            </span>
          </div>

          {/* Pending Payout */}
          <div className="stat-item">
            <span className="stat-label">Pending payout</span>
            <span className="stat-value">
              {currency}${pendingStr}
            </span>
          </div>
        </div>

        {/* Status boxy */}
        {submission.status === "pending" && (
          <div className="status-box pending-box">
            Submission dosud nebyla schválena. Čekejte na rozhodnutí tvůrce.
          </div>
        )}
        {submission.status === "approved" && (
          <div className="status-box approved-box">
            Approved! Výplaty budou probíhat dle intervalů až do vyčerpání budgetu.
          </div>
        )}
        {submission.status === "rejected" && (
          <>
            <div className="status-box rejected-box">
              Tato submission byla odmítnuta.
            </div>
            <div className="rejection-reason-container">
              <span className="rejection-label">Rejection reason</span>
              <textarea
                className="rejection-reason"
                readOnly
                value={submission.rejection_reason || ""}
                placeholder="(zatím žádný důvod)"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
