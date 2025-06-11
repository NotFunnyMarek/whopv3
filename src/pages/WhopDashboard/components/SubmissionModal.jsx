// src/pages/WhopDashboard/components/SubmissionModal.jsx

import React, { useState } from "react";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submission-modal.scss";

export default function SubmissionModal({ campaign, onClose, onAfterSubmit }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateLink = (url) => {
    const urlLower = url.toLowerCase();
    for (let plat of campaign.platforms) {
      if (urlLower.includes(plat.toLowerCase())) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!link.trim()) {
      setError("Link je povinný.");
      return;
    }
    if (!validateLink(link.trim())) {
      setError("Link neodpovídá povolené platformě kampaně.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        campaign_id: campaign.id,
        link: link.trim()
      };

      const res = await fetch("https://app.byxbot.com/php/submissions.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.message) {
            errMsg = errJson.message;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(errMsg);
      }

      // při úspěšném odeslání
      onAfterSubmit();
    } catch (err) {
      // specifická hláška pro duplicitní odeslání (PHP vrátí 409)
      if (err.message.includes("409") || err.message.includes("Toto video")) {
        setError("Toto video jste již pro tuto kampaň odeslali.");
      } else {
        setError("Chyba při odesílání: " + err.message);
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content submission-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Create Submission</h2>
        <p>
          Only views after you submit count towards payout. Submit as soon as
          you post to get paid for all of your views.
        </p>
        <p>
          Submit your social media post. Share your post's link below. Once
          approved, you'll start earning rewards based on the views your
          content generates.
        </p>
        <form onSubmit={handleSubmit} className="submission-form">
          <label>
            Provide Link:
            <input
              type="text"
              value={link}
              placeholder="Zadejte link (např. Instagram Reels…)"
              onChange={(e) => setLink(e.target.value)}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn-submit-modal"
            disabled={isSubmitting || !link.trim()}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
