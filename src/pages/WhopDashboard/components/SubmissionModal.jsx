// src/pages/WhopDashboard/components/SubmissionModal.jsx

import React, { useState } from "react";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submission-modal.scss";
import LinkAccountModal from "../../../components/LinkAccountModal";
import { useNotifications } from "../../../components/NotificationProvider";

// Only needed for Instagram scraping
const SCRAPER_URL    = "https://app.byxbot.com/scrape/api/video";
const PHP_SUBMIT_URL = "https://app.byxbot.com/php/submissions.php";

export default function SubmissionModal({ campaign, onClose, onAfterSubmit }) {
  const [link, setLink]                   = useState("");
  const [error, setError]                 = useState("");
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState(null);
  const { showNotification }              = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = link.trim();
    if (!trimmed) {
      setError("Link is required.");
      return;
    }

    let urlObj;
    try {
      urlObj = new URL(trimmed);
    } catch {
      setError("Invalid URL.");
      return;
    }

    // Determine platform and owner
    const host = urlObj.hostname.toLowerCase();
    let platform = null;
    let owner = null;

    if (host.includes("tiktok.com")) {
      platform = "tiktok";
      // Extract @username from pathname: /@username/...
      const m = urlObj.pathname.match(/^\/@([^\/]+)(\/|$)/);
      if (!m) {
        setError("Unable to extract TikTok username.");
        return;
      }
      owner = m[1];
    } else if (host.includes("instagram.com")) {
      platform = "instagram";
    } else {
      setError("Supported platforms: Instagram, TikTok.");
      return;
    }

    setIsSubmitting(true);
    setPendingPlatform(platform);

    try {
      // For Instagram, fetch metadata from scraper
      if (platform === "instagram") {
        const resScr = await fetch(
          `${SCRAPER_URL}?url=${encodeURIComponent(trimmed)}`
        );
        const textScr = await resScr.text();
        let dataScr;
        try { dataScr = JSON.parse(textScr); }
        catch { throw new Error("Invalid scraper response"); }
        if (!resScr.ok) {
          throw new Error(dataScr.error || `Scraper error ${resScr.status}`);
        }
        owner = dataScr.username;
        if (!owner) throw new Error("Username not found");
      }

      // Submit to backend
      const res = await fetch(PHP_SUBMIT_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          link: trimmed,
          platform,
          owner
        })
      });

      const text = await res.text();
      let body = {};
      try { body = JSON.parse(text); }
      catch { throw new Error("Invalid server response"); }

      if (res.status === 403) {
        // Requires account linking
        setShowLinkModal(true);
        showNotification({ type: "error", message: body.message });
        return;
      }
      if (!res.ok) {
        throw new Error(body.message || `Submit error ${res.status}`);
      }

      showNotification({ type: "success", message: "Submission successfully sent." });
      onAfterSubmit();
    } catch (err) {
      console.error(err);
      const msg = err.message || "Unknown error";
      if (msg.includes("Already submitted")) {
        setError("You have already submitted this video.");
      } else {
        setError("Submission error: " + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkModalClose = (reload) => {
    setShowLinkModal(false);
    if (reload) {
      showNotification({ type: "info", message: "Account verified – please try again." });
    }
  };

  if (showLinkModal) {
    return (
      <LinkAccountModal
        mode={{ action: "create", platform: pendingPlatform }}
        onClose={handleLinkModalClose}
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content submission-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2>Create Submission</h2>
        <p>
          Paste a link to your Instagram or TikTok post.<br />
          Only posts from a linked account will be accepted.
        </p>
        <form onSubmit={handleSubmit} className="submission-form">
          <label>
            Link:
            <input
              type="text"
              value={link}
              placeholder="https://www.tiktok.com/@username/video/... or https://www.instagram.com/reel/..."
              onChange={e => setLink(e.target.value)}
              disabled={isSubmitting}
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button
            type="submit"
            className="btn-submit-modal"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
          {isSubmitting && <div className="loading-indicator">Submitting…</div>}
        </form>
      </div>
    </div>
  );
}
