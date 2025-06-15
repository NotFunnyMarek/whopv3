// src/pages/WhopDashboard/components/SubmissionModal.jsx

import React, { useState } from "react";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submission-modal.scss";
import LinkAccountModal from "../../../components/LinkAccountModal";
import { useNotifications } from "../../../components/NotificationProvider";

// Only needed for Instagram
const SCRAPER_URL    = "https://app.byxbot.com/scrape/api/video";
const PHP_SUBMIT_URL = "https://app.byxbot.com/php/submissions.php";

export default function SubmissionModal({ campaign, onClose, onAfterSubmit }) {
  const [link, setLink]               = useState("");
  const [error, setError]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState(null);
  const { showNotification }           = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = link.trim();
    if (!trimmed) {
      setError("Link je povinný.");
      return;
    }

    let urlObj;
    try {
      urlObj = new URL(trimmed);
    } catch {
      setError("Neplatná URL adresa.");
      return;
    }

    // Determine platform
    const host = urlObj.hostname.toLowerCase();
    let platform = null;
    let owner = null;

    if (host.includes("tiktok.com")) {
      platform = "tiktok";
      // extract @username from pathname: /@username/...
      const m = urlObj.pathname.match(/^\/@([^\/]+)(\/|$)/);
      if (!m) {
        setError("Nelze extrahovat TikTok uživatele.");
        return;
      }
      owner = m[1];
    }
    else if (host.includes("instagram.com")) {
      platform = "instagram";
    }
    else {
      setError("Podporované platformy: Instagram, TikTok.");
      return;
    }

    setIsSubmitting(true);
    setPendingPlatform(platform);

    try {
      // For Instagram, fetch scraper
      if (platform === "instagram") {
        const resScr = await fetch(
          `${SCRAPER_URL}?url=${encodeURIComponent(trimmed)}`
        );
        const textScr = await resScr.text();
        let dataScr;
        try { dataScr = JSON.parse(textScr); }
        catch { throw new Error("Neplatná odpověď scraperu"); }
        if (!resScr.ok) {
          throw new Error(dataScr.error || `Scraper ${resScr.status}`);
        }
        owner = dataScr.username;
        if (!owner) throw new Error("Username nenalezen");
      }

      // 2) Submit to PHP, include platform + owner
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
      catch { throw new Error("Neplatná odpověď serveru"); }

      if (res.status === 403) {
        setShowLinkModal(true);
        showNotification({ type: "error", message: body.message });
        return;
      }
      if (!res.ok) {
        throw new Error(body.message || `Submit ${res.status}`);
      }

      showNotification({ type: "success", message: "Submission úspěšně odeslána." });
      onAfterSubmit();
    } catch (err) {
      console.error(err);
      const msg = err.message || "Neznámá chyba";
      if (msg.includes("Already submitted")) {
        setError("Toto video jste již odeslali.");
      } else {
        setError("Chyba při odesílání: " + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkModalClose = (reload) => {
    setShowLinkModal(false);
    if (reload) {
      showNotification({ type: "info", message: "Účet ověřen – zkuste to znovu." });
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
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Vytvořit Submission</h2>
        <p>
          Vložte odkaz na svůj Instagram nebo TikTok.  
          Pouze příspěvky z ověřeného účtu budou přijaty.
        </p>
        <form onSubmit={handleSubmit} className="submission-form">
          <label>
            Odkaz:
            <input
              type="text"
              value={link}
              placeholder="https://www.tiktok.com/@username/video/... nebo https://www.instagram.com/reel/..."
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
            {isSubmitting ? "Odesílá se…" : "Odeslat"}
          </button>
          {isSubmitting && <div className="loading-indicator">Probíhá odesílání…</div>}
        </form>
      </div>
    </div>
  );
}
