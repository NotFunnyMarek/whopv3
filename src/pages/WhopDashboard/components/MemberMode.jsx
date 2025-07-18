// src/pages/WhopDashboard/components/MemberMode.jsx

import React, { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.innerWidth > 768) return;
    let startX = null;
    const start = (e) => {
      startX = e.touches[0].clientX;
    };
    const end = (e) => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (!mobileSidebarOpen && diff > 50) {
        setMobileSidebarOpen(true);
        window.navigator.vibrate?.(20);
      } else if (mobileSidebarOpen && diff < -50) {
        setMobileSidebarOpen(false);
        window.navigator.vibrate?.(20);
      }
      startX = null;
    };
    container.addEventListener('touchstart', start);
    container.addEventListener('touchend', end);
    return () => {
      container.removeEventListener('touchstart', start);
      container.removeEventListener('touchend', end);
    };
  }, [mobileSidebarOpen]);

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
      <div
        className={`sidebar-overlay${mobileSidebarOpen ? ' visible' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
    </div>
  );
}
