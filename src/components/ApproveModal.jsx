import React, { useState } from "react";
import "../styles/approve-modal.scss";

export default function ApproveModal({ submission, onClose, onDone }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://app.byxbot.com/php/moderate_submission.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submission_id: submission.id,
            action: "approve",
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onDone();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error approving submission: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal approve-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>Approve submission by {submission.username}?</h3>
        <p className="modal-text">
          Approving this submission enables hourly auto payouts once it meets the minimum payout. Payouts will not exceed your campaign budget.
        </p>
        <div className="actions">
          <button className="btn cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn approve" onClick={handleApprove} disabled={loading}>
            {loading ? "Approving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
