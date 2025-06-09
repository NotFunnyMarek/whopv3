// src/pages/WhopDashboard/components/LoadingOverlay.jsx

import React from "react";
import Confetti from "react-confetti";
import "../../../styles/whop-dashboard/_loading.scss";

export default function LoadingOverlay({
  overlayVisible,
  overlayFading,
  windowSize,
  onTransitionEnd,
  loadingOnly = false,
}) {
  if (loadingOnly) {
    return (
      <div className="whop-loading">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div
      className={`join-loading-overlay ${overlayFading ? "fade-out" : ""}`}
      onTransitionEnd={onTransitionEnd}
    >
      <div className="spinner"></div>
      <h1>Připojuji se…</h1>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
      />
    </div>
  );
}
