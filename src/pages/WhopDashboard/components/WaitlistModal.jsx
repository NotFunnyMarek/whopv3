import React, { useState } from "react";
import "./_waitlist-modal.scss";

export default function WaitlistModal({ questions = [], onSubmit, onClose, submitting }) {
  const [answers, setAnswers] = useState(questions.map(() => ""));
  const [error, setError] = useState("");

  const handleChange = (i, val) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length && answers.some((a) => a.trim() === "")) {
      setError("Please answer all questions.");
      return;
    }
    setError("");
    await onSubmit(answers);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content waitlist-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2>Request Access</h2>
        <form onSubmit={handleSubmit} className="waitlist-form">
          {questions.map((q, i) => (
            <label key={i}>
              {q}
              <input
                type="text"
                value={answers[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                disabled={submitting}
              />
            </label>
          ))}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-submit-modal" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
