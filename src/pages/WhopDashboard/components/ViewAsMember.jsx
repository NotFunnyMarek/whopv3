// src/pages/WhopDashboard/components/ViewAsMember.jsx

import React from "react";
import MemberSidebar from "./MemberSidebar";
import MemberMain from "./MemberMain";

/**
 * props:
 *   whopData: object with Whop details (banner_url, members_count, etc.)
 *   campaigns: array of campaigns
 *   campaignsLoading: boolean
 *   campaignsError: string
 *   activeTab: "Home" | "Chat" | "Earn" | "Tools"
 *   setActiveTab: function
 *   memberLoading: boolean
 *   handleLeave: function
 *   onBack: function to return from View As Member mode
 */
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
  setWhopData
}) {
  return (
    <>
      <button
        className="whop-back-button view-as-member-back"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>
      <MemberSidebar
        whopData={whopData}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignsError={campaignsError}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberLoading={memberLoading}
        handleLeave={handleLeave}
      />
      <MemberMain
        whopData={whopData}
        activeTab={activeTab}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignsError={campaignsError}
        setWhopData={setWhopData}
      />
    </>
  );
}
