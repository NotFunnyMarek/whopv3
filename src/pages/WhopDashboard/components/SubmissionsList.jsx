// src/pages/WhopDashboard/components/SubmissionsList.jsx

import React from "react";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submissions-list.scss";

export default function SubmissionsList({
  submissions,
  onRowClick,
  campaign
}) {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return <p className="no-submissions-msg">Zatím žádné submissiony.</p>;
  }

  // Campaign parameters
  const budget = campaign.total_paid_out;
  const rate = campaign.reward_per_thousand;
  const minPayout = campaign.min_payout || 0;
  const currency = campaign.currency;

  // Minimum views required to unlock any payout
  const minViewsForPayout = Math.ceil((minPayout / rate) * 1000);

  return (
    <table className="submissions-table fullwidth">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Views</th>
          <th>Submission</th>
          <th>Reward Rate</th>
          <th>Paid Out</th>
          <th>Pending Payout</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map(sub => {
          const views = sub.total_views || 0;
          // Raw payout based on current views
          const rawPayout = (views / 1000) * rate;
          // Already‐paid stored in sub.paid_out (clamped to campaign budget)
          const paidOut = Math.min(sub.paid_out || 0, budget);
          // Pending payout: only if raw >= minPayout, and clamp to remaining budget
          const pending =
            rawPayout < minPayout
              ? 0
              : Math.min(rawPayout - paidOut, budget - paidOut);

          return (
            <tr
              key={sub.id}
              className="submission-row"
              onClick={() => onRowClick(sub)}
            >
              <td data-label="Title">{sub.campaign_name}</td>
              <td data-label="Status">
                <span className={`status ${sub.status}`}>
                  {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                </span>
              </td>
              <td data-label="Views (gen/needed)">
                {views}
              </td>
              <td data-label="Submission">
                {(() => {
                  const linkLower = sub.link.toLowerCase();
                  if (linkLower.includes("instagram.com")) {
                    return (
                      <img
                        src="https://i.ibb.co/C5LwBvpj/visualhunter-a8ec508b37.png"
                        alt="Instagram"
                        className="icon-img"
                      />
                    );
                  }
                  if (linkLower.includes("tiktok.com")) {
                    return (
                      <img
                        src="https://i.ibb.co/WWMNJRBJ/visualhunter-9f70954296.png"
                        alt="TikTok"
                        className="icon-img"
                      />
                    );
                  }
                  if (linkLower.includes("youtube.com")) {
                    return (
                      <img
                        src="https://i.ibb.co/G3PQrFcM/kisspng-youtube-play-button-computer-icons-youtube-red-cli-youtube-logo-play-icon-png-5ab1be26ea2d46.png"
                        alt="YouTube"
                        className="icon-img"
                      />
                    );
                  }
                  return <span className="link-text">Link</span>;
                })()}
              </td>
              <td data-label="Reward Rate">
                {currency}${rate.toFixed(2)}/1K
              </td>
              <td data-label="Paid Out" className="paid-cell">
                {currency}${paidOut.toFixed(2)}
              </td>
              <td data-label="Pending Payout" className="pending-cell">
                {currency}${pending.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
