// src/pages/SubmissionsOverview.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SubmissionCard from "../components/SubmissionCard";
import RejectModal from "../components/RejectModal";
import ApproveModal from "../components/ApproveModal";
import SubmissionsSkeleton from "../components/SubmissionsSkeleton";
import "../styles/submissions-overview.scss";

export default function SubmissionsOverview() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("pending");
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const fetchSubs = () => {
    setLoading(true);
    setError("");
    fetch(
      `https://app.byxbot.com/php/fetch_submissions_by_campaign.php?campaign_id=${campaignId}&status=${status}`,
      { credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!Array.isArray(json.data)) throw new Error("Invalid data");
        setSubs(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubs();
  }, [campaignId, status]);

  const openModal = (sub, type) => {
    setSelected(sub);
    setModalType(type);
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
  };

  if (loading) return <SubmissionsSkeleton />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="submissions-overview">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="tabs">
        {["pending", "approved", "rejected", "flagged"].map((s) => (
          <button
            key={s}
            className={s === status ? "tab active" : "tab"}
            onClick={() => setStatus(s)}
          >
            {s.toUpperCase()} ({subs.filter((x) => x.status === s).length})
          </button>
        ))}
      </div>

      <div className="list">
        {subs.length === 0 && <div className="empty">No submissions</div>}
        {subs.map((sub) => (
          <SubmissionCard
            key={sub.id}
            submission={sub}
            onAction={openModal}
          />
        ))}
      </div>

      {modalType === "reject" && selected && (
        <RejectModal
          submission={selected}
          whopId={Number(campaignId)}
          onClose={closeModal}
          onDone={() => {
            fetchSubs();
          }}
        />
      )}

      {modalType === "approve" && selected && (
        <ApproveModal
          submission={selected}
          whopId={Number(campaignId)}
          onClose={closeModal}
          onDone={() => {
            fetchSubs();
          }}
        />
      )}
    </div>
  );
}
