// src/pages/WhopDashboard/components/MemberMode.jsx

import React, { useState } from "react";
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

  // Callback to return from the submission panel
  const handleBackFromSubmission = () => {
    setSelectedCampaign(null);
  };

  // If a campaign is selected, render the SubmissionPanel
  if (selectedCampaign) {
    return (
      <div className="member-container">
        <MemberSidebar
          whopData={whopData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          memberLoading={memberLoading}
          handleLeave={handleLeave}
          showBackButton={true}
          onBack={handleBackFromSubmission}
        />
        <SubmissionPanel
          whopData={whopData}
          campaign={selectedCampaign}
          onBack={handleBackFromSubmission}
        />
      </div>
    );
  }

  // Otherwise, render the standard mode: Sidebar + Main content
  return (
    <div className="member-container">
      <MemberSidebar
        whopData={whopData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberLoading={memberLoading}
        handleLeave={handleLeave}
        showBackButton={false}
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
    </div>
  );
}
