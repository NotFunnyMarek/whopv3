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
}) {
  // Stav pro vybranou kampaň (pokud uživatel klikne v záložce "Earn")
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Callback pro návrat zpět z submission panelu
  const handleBackFromSubmission = () => {
    setSelectedCampaign(null);
  };

  // Pokud je vybraná kampaň, vykreslíme SubmissionPanel
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

  // Jinak standardní režim: Sidebar + Main
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
        // funkce, která se zavolá, když uživatel klikne na kartu kampaně
      />
    </div>
  );
}
