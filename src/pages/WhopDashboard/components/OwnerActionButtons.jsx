// src/pages/WhopDashboard/components/OwnerActionButtons.jsx

import React from "react";
import {
  FaSave,
  FaEdit,
  FaTrash,
  FaUsers,
  FaPlus,
  FaTachometerAlt,
  FaDiscord,
} from "react-icons/fa";
import "../../../styles/whop-dashboard/_owner.scss";

export default function OwnerActionButtons({
  isEditing,
  handleSave,
  setIsEditing,
  handleDelete,
  setViewAsMemberMode,
  setIsCampaignModalOpen,
  whopData, // needed for Whop ID
  showDiscordSetup,
  setShowDiscordSetup,
}) {
  const openDashboard = () => {
    // redirect to /dashboard with whop_id parameter
    window.location.href = `/dashboard?whop_id=${encodeURIComponent(
      whopData.id
    )}`;
  };

  return (
    <div className="whop-action-btns">
      {isEditing ? (
        <>
          <button className="whop-save-btn" onClick={handleSave}>
            <FaSave /> Save
          </button>
          <button
            className="whop-cancel-btn"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
          {Boolean(whopData.modules?.discord_access) && (
            <button
              className="whop-discord-btn"
              onClick={() => setShowDiscordSetup(true)}
            >
              <FaDiscord /> Discord Setup
            </button>
          )}
        </>
      ) : (
        <>
          <button className="whop-edit-btn" onClick={() => setIsEditing(true)}>
            <FaEdit /> Edit
          </button>
          <button className="whop-delete-btn" onClick={handleDelete}>
            <FaTrash /> Delete Whop
          </button>
          <button
            className="whop-view-member-btn"
            onClick={() => setViewAsMemberMode(true)}
          >
            <FaUsers /> View as Member
          </button>
          <button
            className="whop-create-camp-btn"
            onClick={() => setIsCampaignModalOpen(true)}
          >
            <FaPlus /> Create Campaign
          </button>
          {/* New Dashboard button */}
          <button className="whop-dashboard-btn" onClick={openDashboard}>
            <FaTachometerAlt /> Dashboard
          </button>
          {Boolean(whopData.modules?.discord_access) && (
            <button
              className="whop-discord-btn"
              onClick={() => setShowDiscordSetup(true)}
            >
              <FaDiscord /> Discord Setup
            </button>
          )}
        </>
      )}
    </div>
  );
}
