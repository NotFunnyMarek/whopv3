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
          <div className="member-banner-placeholder">No banner</div>
        )}
      </div>
      <div className="member-info">
        <h2 className="member-title">{whopData.name}</h2>
        <div className="member-members-count">
          <FaUsers /> {whopData.members_count} members
        </div>
      </div>
      <nav className="member-nav">
        <button
          className={`nav-button ${activeTab === "Home" ? "active" : ""}`}
          onClick={() => setActiveTab("Home")}
        >
          <FaHome /> Home
        </button>
        {whopData.modules?.chat && (
          <button
            className={`nav-button ${activeTab === "Chat" ? "active" : ""}`}
            onClick={() => setActiveTab("Chat")}
          >
            <FaComments /> Chat
          </button>
        )}
        {whopData.modules?.earn && (
          <button
            className={`nav-button ${activeTab === "Earn" ? "active" : ""}`}
            onClick={() => setActiveTab("Earn")}
          >
            <FaDollarSign /> Earn
          </button>
        )}
        {whopData.modules?.course && (
          <button
            className={`nav-button ${activeTab === "Course" ? "active" : ""}`}
            onClick={() => setActiveTab("Course")}
          >
            <FaTools /> Course
          </button>
        )}
        <button
          className={`nav-button ${activeTab === "Tools" ? "active" : ""}`}
          onClick={() => setActiveTab("Tools")}
        >
          <FaTools /> Tools
        </button>
      </nav>
      <div className="member-actions">
        {memberLoading ? (
          <div className="spinner spinner-small" />
        ) : (
          <button className="leave-button" onClick={handleLeave}>
            <FaSignOutAlt /> Leave
          </button>
        )}
      </div>
    </div>
  );
}
