// src/pages/WhopDashboard/components/ViewAsMember.jsx

import React from "react";
import MemberSidebar from "./MemberSidebar";
import MemberMain from "./MemberMain";

export default function ViewAsMember({
  whopData,
  campaigns,
  campaignsLoading,
  campaignsError,
  activeTab,
  setActiveTab,
  memberLoading,
  handleLeave,
  onBack,
}) {
  return (
    <>
      <MemberSidebar
        whopData={whopData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberLoading={memberLoading}
        handleLeave={handleLeave}
        showBackButton={true}
        onBack={onBack}
      />
      <MemberMain
        whopData={whopData}
        activeTab={activeTab}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignsError={campaignsError}
      />
    </>
  );
}
