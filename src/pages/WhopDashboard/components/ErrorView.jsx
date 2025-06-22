// src/pages/WhopDashboard/components/ErrorView.jsx

import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../../../styles/whop-dashboard/_error.scss";

export default function ErrorView({ error, onBack }) {
  return (
    <div className="whop-error">
      <p className="whop-error-text">{error}</p>
      <button className="whop-back-button" onClick={onBack}>
        <FaArrowLeft /> ← Back
      </button>
    </div>
  );
}
