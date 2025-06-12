// src/pages/WhopDashboard/components/SubmissionPanel.jsx

import React, { useState, useEffect } from "react";
import SubmissionModal from "./SubmissionModal";
import SubmissionsList from "./SubmissionsList";
import SubmissionDetailModal from "./SubmissionDetailModal";
import "../../../styles/whop-dashboard/_member.scss";
import "./_submission.scss";

export default function SubmissionPanel({ whopData, campaign, onBack }) {
  const [activeTab, setActiveTab] = useState("Rewards");
  const [modalOpen, setModalOpen] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [errorSubs, setErrorSubs] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Load submissions for this user + campaign
  const fetchMySubmissions = async () => {
    setLoadingSubs(true);
    setErrorSubs("");
    try {
      const res = await fetch(
        `https://app.byxbot.com/php/submissions.php?campaign_id=${campaign.id}`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      // Always read as text first, then try JSON.parse
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Neplatná odpověď od serveru");
      }

      if (!res.ok) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }
      if (json.status !== "success" || !Array.isArray(json.data)) {
        throw new Error(json.message || "Neplatná struktura dat");
      }
      setMySubmissions(json.data);
    } catch (err) {
      setErrorSubs("Nelze načíst vaše submissiony: " + err.message);
    } finally {
      setLoadingSubs(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchMySubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh when switching to "My Submissions"
  useEffect(() => {
    if (activeTab === "My Submissions") {
      fetchMySubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // after a new submission, reload list and switch tab
  const handleAfterSubmit = async () => {
    await fetchMySubmissions();
    setActiveTab("My Submissions");
    setModalOpen(false);
  };

  const handleRowClick = (submission) => {
    setSelectedSubmission(submission);
  };
  const closeDetailModal = () => {
    setSelectedSubmission(null);
  };

  const isExpired = campaign.is_active === 0;

  return (
    <div className="submission-panel">
      <div className="submission-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div className="submission-tabs">
          <button
            className={activeTab === "Rewards" ? "tab active" : "tab"}
            onClick={() => setActiveTab("Rewards")}
          >
            Rewards
          </button>
          <button
            className={
              activeTab === "My Submissions" ? "tab active" : "tab"
            }
            onClick={() => setActiveTab("My Submissions")}
          >
            My Submissions ({mySubmissions.length})
          </button>
        </div>
      </div>

      {activeTab === "Rewards" && (
        <div className="submission-rewards">
          {/* Banner */}
          <div className="submission-banner">
            {whopData.banner_url ? (
              <img
                src={whopData.banner_url}
                alt="Whop Banner"
                className="submission-banner-img"
              />
            ) : (
              <div className="submission-banner-placeholder">
                Žádný banner
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="submission-submit-section">
            <button
              className="btn-open-modal"
              onClick={() => setModalOpen(true)}
              disabled={isExpired}
            >
              Submit
            </button>
          </div>

          {/* Paid progress bar */}
          <div className="submission-paid-bar">
            <div className="paid-info">
              {campaign.currency}
              {campaign.paid_out.toFixed(2)} / {campaign.currency}
              {campaign.total_paid_out.toFixed(2)} paid out
            </div>
            <div className="progress-container">
              <div
                className="progress-fill"
                style={{
                  width: isExpired
                    ? "100%"
                    : `${campaign.paid_percent}%`,
                }}
              />
            </div>
            <div className="percent-text">
              {isExpired ? "100%" : `${campaign.paid_percent}%`}
            </div>
          </div>

          {/* Details */}
          <div className="submission-details">
            <p>
              <strong>Reward Rate:</strong> {campaign.currency}
              {campaign.reward_per_thousand.toFixed(2)} / 1K
            </p>
            {campaign.min_payout !== null && (
              <p>
                <strong>Min Payout:</strong> {campaign.currency}
                {parseFloat(campaign.min_payout).toFixed(2)}
              </p>
            )}
            <p>
              <strong>Category:</strong> {campaign.category}
            </p>
            <p>
              <strong>Platforms:</strong>{" "}
              {campaign.platforms.map((p, i) => (
                <span key={i} className="platform-pill">
                  {p}
                </span>
              ))}
            </p>
          </div>

          {/* Requirements */}
          <div className="submission-requirements">
            <h4>Requirements:</h4>
            {campaign.requirements && campaign.requirements.length > 0 ? (
              <ul>
                {campaign.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            ) : (
              <p>Žádné specifické požadavky.</p>
            )}
          </div>

          {/* Assets */}
          <div className="submission-assets">
            <h4>Assets:</h4>
            {campaign.content_links && campaign.content_links.length > 0 ? (
              <ul>
                {campaign.content_links.map((url, idx) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Žádné assety.</p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="submission-disclaimer">
            <p>
              <strong>Disclaimer:</strong>
            </p>
            <p>
              Creators may reject submissions that don't meet
              requirements. By submitting, you grant full usage rights
              and agree to follow the FTC guidelines and the Content
              Rewards Terms.
            </p>
          </div>

          {modalOpen && (
            <SubmissionModal
              campaign={campaign}
              onClose={() => setModalOpen(false)}
              onAfterSubmit={handleAfterSubmit}
            />
          )}
        </div>
      )}

      {activeTab === "My Submissions" && (
        <div className="submission-my-list">
          {loadingSubs ? (
            <div className="spinner spinner-small"></div>
          ) : errorSubs ? (
            <p className="error-text">{errorSubs}</p>
          ) : (
            <SubmissionsList
              submissions={mySubmissions}
              onRowClick={handleRowClick}
              campaign={campaign}
            />
          )}
        </div>
      )}

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          campaign={campaign}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
}
