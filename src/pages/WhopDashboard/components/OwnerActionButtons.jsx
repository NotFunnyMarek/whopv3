// src/pages/WhopDashboard/components/OwnerActionButtons.jsx

import React from "react";
import {
  FaSave,
  FaEdit,
  FaTrash,
  FaUsers,
  FaPlus,
  FaTachometerAlt,
} from "react-icons/fa"; // přidáno FaTachometerAlt
import "../../../styles/whop-dashboard/_owner.scss";

export default function OwnerActionButtons({
  isEditing,
  handleSave,
  setIsEditing,
  handleDelete,
  setViewAsMemberMode,
  setIsCampaignModalOpen,
  whopData, // potřebujeme pro ID Whopu
}) {
  const openDashboard = () => {
    // přesměrujeme na /dashboard s parametrem whop_id
    window.location.href = `/dashboard?whop_id=${encodeURIComponent(
      whopData.id
    )}`;
  };

  return (
    <div className="whop-action-btns">
      {isEditing ? (
        <>
          <button className="whop-save-btn" onClick={handleSave}>
            <FaSave /> Uložit
          </button>
          <button
            className="whop-cancel-btn"
            onClick={() => setIsEditing(false)}
          >
            Zrušit
          </button>
        </>
      ) : (
        <>
          <button className="whop-edit-btn" onClick={() => setIsEditing(true)}>
            <FaEdit /> Editovat
          </button>
          <button className="whop-delete-btn" onClick={handleDelete}>
            <FaTrash /> Smazat Whop
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
            <FaPlus /> Vytvořit kampaň
          </button>
          {/* Nové tlačítko Dashboard */}
          <button className="whop-dashboard-btn" onClick={openDashboard}>
            <FaTachometerAlt /> Dashboard
          </button>
        </>
      )}
    </div>
  );
}
