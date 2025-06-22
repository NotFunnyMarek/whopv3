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
    return <p className="no-submissions-msg">No submissions yet.</p>;
  }

  // Campaign constants (fallback to 0)
  const rate      = Number(campaign.reward_per_thousand ?? 0);
  const budget    = Number(campaign.total_paid_out     ?? 0);
  const minPayout = campaign.min_payout != null
                      ? Number(campaign.min_payout)
                      : null;
  const currency  = campaign.currency || "";

  // Views required for minimum payout (rounded up)
  const neededViews = minPayout !== null && rate > 0
    ? Math.ceil((minPayout / rate) * 1000)
    : null;

  return (
    <table className="submissions-table fullwidth">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Views</th>
          <th>Submission</th>
          <th>Rate</th>
          <th>Paid Out</th>
          <th>Pending</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((sub) => {
          const totalViews     = Number(sub.total_views    ?? 0);
          const processedViews = Number(sub.processed_views ?? 0);

          // Raw payout from all views
          const rawPayout = (totalViews / 1000) * rate;

          // Whether the minimum has been reached
          const reachedMin = neededViews !== null
            ? totalViews >= neededViews
            : true;

          // Display for paid-out amount
          const paidOutDisplay = reachedMin
            ? `${currency}$${rawPayout.toFixed(2)}`
            : "Minimum payout not reached";

          // Pending payout: zero once minimum reached, otherwise raw payout
          const pendingDisplay = reachedMin
            ? `${currency}$0.00`
            : `${currency}$${rawPayout.toFixed(2)}`;

          // Platform icon
          let icon = <span className="link-text">Link</span>;
          const l = (sub.link || "").toLowerCase();
          if (l.includes("instagram.com")) {
            icon = (
              <img
                src="https://i.ibb.co/C5LwBvpj/visualhunter-a8ec508b37.png"
                alt="Instagram"
                className="icon-img"
              />
            );
          } else if (l.includes("tiktok.com")) {
            icon = (
              <img
                src="https://i.ibb.co/WWMNJRBJ/visualhunter-9f70954296.png"
                alt="TikTok"
                className="icon-img"
              />
            );
          } else if (l.includes("youtube.com")) {
            icon = (
              <img
                src="https://i.ibb.co/G3PQrFcM/kisspng-youtube-play-button-computer-icons-youtube-red-cli-youtube-logo-play-icon-png-5ab1be26ea2d46.png"
                alt="YouTube"
                className="icon-img"
              />
            );
          }

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
              <td data-label="Views">
                {neededViews && totalViews < neededViews
                  ? `${totalViews} / ${neededViews}`
                  : totalViews}
              </td>
              <td data-label="Submission">{icon}</td>
              <td data-label="Rate">{currency}${rate.toFixed(2)}/1K</td>
              <td data-label="Paid Out" className="paid-cell">
                {paidOutDisplay}
              </td>
              <td data-label="Pending" className="pending-cell">
                {pendingDisplay}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
