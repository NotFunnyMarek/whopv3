// src/pages/WhopDashboard/components/MemberMode.jsx

import React from "react";
import MemberSidebar from "./MemberSidebar";
import MemberMain from "./MemberMain";

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
  return (
    <>
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
      />
    </>
  );
}
