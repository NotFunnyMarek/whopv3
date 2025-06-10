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

  return (
    <table className="submissions-table fullwidth">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Total Views</th>
          <th>Submission</th>
          <th>Reward Rate</th>
          <th>Paid Out</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((sub) => {
          let iconUrl = null;
          const linkLower = sub.link.toLowerCase();
          if (linkLower.includes("instagram.com")) {
            iconUrl =
              "https://i.ibb.co/C5LwBvpj/visualhunter-a8ec508b37.png";
          } else if (linkLower.includes("tiktok.com")) {
            iconUrl = "https://i.ibb.co/WWMNJRBJ/visualhunter-9f70954296.png";
          } else if (linkLower.includes("youtube.com")) {
            iconUrl =
              "https://i.ibb.co/G3PQrFcM/kisspng-youtube-play-button-computer-icons-youtube-red-cli-youtube-logo-play-icon-png-5ab1be26ea2d46.png";
          }

          const isExpired = sub.status !== "approved"; // pouze pro styl

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
              <td data-label="Total Views">{sub.total_views}</td>
              <td data-label="Submission">
                {iconUrl ? (
                  <img src={iconUrl} alt="Platform Icon" className="icon-img" />
                ) : (
                  <span className="link-text">Link</span>
                )}
              </td>
              <td data-label="Reward Rate">
                {campaign.currency}${campaign.reward_per_thousand.toFixed(2)}/1K
              </td>
              <td data-label="Paid Out">
                {campaign.currency}${((sub.total_views / 1000) * campaign.reward_per_thousand).toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
