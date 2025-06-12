import React, { useState } from "react";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submission-modal.scss";
import LinkAccountModal from "../../../components/LinkAccountModal";
import { useNotifications } from "../../../components/NotificationProvider";

// Produkční URL
const SCRAPER_URL    = "https://app.byxbot.com/scrape/api/video";
const PHP_SUBMIT_URL = "https://app.byxbot.com/php/submissions.php";

export default function SubmissionModal({ campaign, onClose, onAfterSubmit }) {
  const [link, setLink]               = useState("");
  const [error, setError]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
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
    try { urlObj = new URL(trimmed); }
    catch {
      setError("Neplatná URL adresa.");
      return;
    }
    if (!urlObj.hostname.includes("instagram.com")) {
      setError("Link musí být z Instagramu.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) Scraper
      const resScr = await fetch(`${SCRAPER_URL}?url=${encodeURIComponent(trimmed)}`, {
        credentials: "omit"
      });
      const textScr = await resScr.text();
      let dataScr;
      try { dataScr = JSON.parse(textScr); }
      catch { throw new Error("Unexpected scraper response: " + textScr.slice(0,100)); }
      if (!resScr.ok) throw new Error(dataScr.error || `Scraper error ${resScr.status}`);
      const owner = dataScr.username;
      if (!owner) throw new Error("Username not returned");

      // 2) PHP submit
      const res = await fetch(PHP_SUBMIT_URL, {
        method: "POST",
        credentials: "include",  // posílat cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaign.id, link: trimmed })
      });
      const text = await res.text();
      let body = {};
      try { body = JSON.parse(text); }
      catch { throw new Error("Invalid server response: " + text.slice(0,100)); }

      if (res.status === 403) {
        // Otevřít modal pro propojení účtu
        setShowLinkModal(true);
        showNotification({ type: "error", message: body.message });
        return;
      }
      if (!res.ok) {
        throw new Error(body.message || `Submit error ${res.status}`);
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
      showNotification({ type: "info", message: "Účet ověřen – zkuste odeslat znovu." });
    }
  };

  if (showLinkModal) {
    return <LinkAccountModal mode={{ action: "create" }} onClose={handleLinkModalClose} />;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content submission-modal">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Vytvořit Submission</h2>
        <p>Vložte odkaz na svůj Instagram příspěvek (post nebo reel). Pouze ověřené účty budou přijaty.</p>
        <form onSubmit={handleSubmit} className="submission-form">
          <label>
            Odkaz:
            <input
              type="text"
              value={link}
              placeholder="https://www.instagram.com/reel/…"
              onChange={e => setLink(e.target.value)}
              disabled={isSubmitting}
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-submit-modal" disabled={isSubmitting}>
            {isSubmitting ? "Odesílá se…" : "Odeslat"}
          </button>
          {isSubmitting && <div className="loading-indicator">Probíhá odesílání…</div>}
        </form>
      </div>
    </div>
  );
}
