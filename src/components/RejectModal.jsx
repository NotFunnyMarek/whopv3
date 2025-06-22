// src/components/RejectModal.jsx

import React, { useState } from "react";
import "../styles/reject-modal.scss";

export default function RejectModal({ submission, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [ban, setBan] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return;
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
            action: "reject",
            reason: reason.trim(),
            ban, // include ban flag in the same request
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onDone();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal reject-modal">
        <button
          className="modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          &times;
        </button>
        <h3>Reject submission by {submission.username}?</h3>
        <p className="modal-desc">
          Enter the reason for rejection and optionally ban the user.
        </p>
        <textarea
          className="reason-input"
          placeholder="Reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          disabled={loading}
        />
        <label className="ban-checkbox">
          <input
            type="checkbox"
            checked={ban}
            onChange={(e) => setBan(e.target.checked)}
            disabled={loading}
          />
          Ban this user
        </label>
        <div className="actions">
          <button className="btn cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn reject"
            onClick={handleReject}
            disabled={!reason.trim() || loading}
          >
            {loading ? "Processing…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
