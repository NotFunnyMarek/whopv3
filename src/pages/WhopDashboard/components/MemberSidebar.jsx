// src/pages/WhopDashboard/components/MemberSidebar.jsx

import React from "react";
import {
  FaUsers,
  FaHome,
  FaComments,
  FaDollarSign,
  FaTools,
  FaSignOutAlt
} from "react-icons/fa";
import "../../../styles/whop-dashboard/_member.scss";

export default function MemberSidebar({
  whopData,
  activeTab,
  setActiveTab,
  memberLoading,
  handleLeave
}) {
  return (
    <div className="member-sidebar">
      <div className="member-banner">
        {whopData.banner_url ? (
          <img
            src={whopData.banner_url}
            alt="Banner"
            className="member-banner-img"
          />
        ) : (
          <div className="member-banner-placeholder">Žádný banner</div>
        )}
      </div>
      <div className="member-info">
        <h2 className="member-title">{whopData.name}</h2>
        <div className="member-members-count">
          <FaUsers /> {whopData.members_count} členů
        </div>
      </div>
      <nav className="member-nav">
        <button
          className={`nav-button ${activeTab === "Home" ? "active" : ""}`}
          onClick={() => setActiveTab("Home")}
        >
          <FaHome /> Home
        </button>
        <button
          className={`nav-button ${activeTab === "Chat" ? "active" : ""}`}
          onClick={() => setActiveTab("Chat")}
        >
          <FaComments /> Chat
        </button>
        <button
          className={`nav-button ${activeTab === "Earn" ? "active" : ""}`}
          onClick={() => setActiveTab("Earn")}
        >
          <FaDollarSign /> Earn
        </button>
        <button
          className={`nav-button ${activeTab === "Tools" ? "active" : ""}`}
          onClick={() => setActiveTab("Tools")}
        >
          <FaTools /> Tools
        </button>
      </nav>
      <div className="member-actions">
        {memberLoading ? (
          <div className="spinner spinner-small"></div>
        ) : (
          <button className="leave-button" onClick={handleLeave}>
            <FaSignOutAlt /> Opustit
          </button>
        )}
      </div>
    </div>
  );
}
