import React from "react";
import "../styles/submission-card.scss";

export default function SubmissionCard({ submission, onAction }) {
  // YouTube embed or plain video
  const embedUrl = (() => {
    try {
      const u = new URL(submission.link);
      if (u.hostname.includes("youtu.be") || u.hostname.includes("youtube.com")) {
        const id = u.hostname.includes("youtu.be")
          ? u.pathname.slice(1)
          : u.searchParams.get("v");
        return `https://www.youtube.com/embed/${id}`;
      }
    } catch {}
    return null;
  })();

  return (
    <div className="submission-card">
      <div className="video">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Video"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={submission.link} controls />
        )}
      </div>
      <div className="details">
        <div className="user">
          <img src={`/avatars/${submission.username}.png`} alt="" className="avatar" />
          <span className="username">{submission.username}</span>
        </div>
        <div className="chart-placeholder">
          {/* tu vlož re-charts graf */}
          <div className="placeholder-text">Graf výkonu</div>
        </div>
        <div className="actions">
          {submission.status === "pending" && (
            <>
              <button className="btn approve" onClick={() => onAction(submission, "approve")}>
                Approve
              </button>
              <button className="btn reject" onClick={() => onAction(submission, "reject")}>
                Reject
              </button>
            </>
          )}
          {submission.status === "approved" && (
            <button className="btn reject" onClick={() => onAction(submission, "reject")}>
              Reject
            </button>
          )}
          {submission.status === "rejected" && (
            <button className="btn approve" onClick={() => onAction(submission, "approve")}>
              Undo Rejection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
