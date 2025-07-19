// src/pages/WhopDashboard/components/MemberMode.jsx

import React, { useState, useRef } from "react";
import { FaChevronRight } from "react-icons/fa";
import MemberSidebar from "./MemberSidebar";
import MemberMain from "./MemberMain";
import SubmissionPanel from "./SubmissionPanel";

export default function MemberMode({
  whopData,
  campaigns,
  campaignsLoading,
  campaignsError,
  activeTab,
  setActiveTab,
  memberLoading,
  handleLeave,
  setWhopData,
}) {
  // State for the selected campaign (when the user clicks in the "Earn" tab)
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const containerRef = useRef(null);

  // Callback to return from the submission panel
  const handleBackFromSubmission = () => {
    setSelectedCampaign(null);
  };

  // If a campaign is selected, render the SubmissionPanel
  if (selectedCampaign) {
    return (
      <div className={`member-container${mobileSidebarOpen ? ' sidebar-open' : ''}`} ref={containerRef}>
        <MemberSidebar
          whopData={whopData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          memberLoading={memberLoading}
          handleLeave={handleLeave}
          showBackButton={true}
          onBack={handleBackFromSubmission}
          isMobileOpen={mobileSidebarOpen}
        />
        <SubmissionPanel
          whopData={whopData}
          campaign={selectedCampaign}
          onBack={handleBackFromSubmission}
        />
        <button
          className="sidebar-toggle"
          onClick={() => setMobileSidebarOpen((o) => !o)}
          aria-label="Toggle sidebar"
          type="button"
        >
          <FaChevronRight />
        </button>
        <div
          className={`sidebar-overlay${mobileSidebarOpen ? ' visible' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />
      </div>
    );
  }

  // Otherwise, render the standard mode: Sidebar + Main content
  return (
    <div className={`member-container${mobileSidebarOpen ? ' sidebar-open' : ''}`} ref={containerRef}>
      <MemberSidebar
        whopData={whopData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberLoading={memberLoading}
        handleLeave={handleLeave}
        showBackButton={false}
        isMobileOpen={mobileSidebarOpen}
      />
      <MemberMain
        whopData={whopData}
        activeTab={activeTab}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignsError={campaignsError}
        onSelectCampaign={setSelectedCampaign}
        setWhopData={setWhopData}
      />
      <button
        className="sidebar-toggle"
        onClick={() => setMobileSidebarOpen((o) => !o)}
        aria-label="Toggle sidebar"
        type="button"
      >
        <FaChevronRight />
      </button>
      <div
        className={`sidebar-overlay${mobileSidebarOpen ? ' visible' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
    </div>
  );
}
