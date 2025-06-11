// src/pages/WhopDashboard/components/ViewAsMember.jsx

import React from "react";
import MemberSidebar from "./MemberSidebar";
import MemberMain from "./MemberMain";

/**
 * props:
 *   whopData: objekt s údaji o whopu (banner_url, members_count, ...)
 *   campaigns: pole kampaní
 *   campaignsLoading: boolean
 *   campaignsError: string
 *   activeTab: "Home"| "Chat"| "Earn"| "Tools"
 *   setActiveTab: funkce
 *   memberLoading: boolean
 *   handleLeave: funkce
 *   onBack: funkce pro návrat z režimu ViewAsMember
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
  onBack
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
      />
    </>
  );
}
