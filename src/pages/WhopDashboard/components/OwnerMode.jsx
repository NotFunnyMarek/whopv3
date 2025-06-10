// src/pages/WhopDashboard/components/OwnerMode.jsx

import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../../../styles/whop-dashboard/_owner.scss";

import OwnerHeader from "./OwnerHeader";
import OwnerSlugPrice from "./OwnerSlugPrice";
import OwnerActionButtons from "./OwnerActionButtons";
import FeaturesSection from "./FeaturesSection";
import CampaignsSection from "./CampaignsSection";
import MembersSection from "./MembersSection";
import CampaignModal from "./CampaignModal";

export default function OwnerMode({
  whopData,
  setWhopData,
  isEditing,
  setIsEditing,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editBannerUrl,
  isUploadingBanner,
  bannerError,
  handleBannerUpload,
  isSlugEditing,
  setIsSlugEditing,
  newSlugValue,
  setNewSlugValue,
  slugError,
  handleSlugSave,
  handleSave,
  handleDelete,
  setViewAsMemberMode,
  setIsCampaignModalOpen,
  editFeatures,
  handleFeatChange,
  handleImageChange,
  removeFeature,
  addFeature,
  campaigns,
  campaignsLoading,
  campaignsError,
  handleExpire,
  membershipsList,
  membersLoading,
  membersError,
  handleCancelMember,
  handleBack,
  isCampaignModalOpen,
  fetchCampaigns,
}) {
  if (!whopData) return null;

  return (
    <div className="whop-container">
      {/* Zobrazení tlačítka “Zpět” pouze v režimu editace */}
      {isEditing && (
        <button
          className="whop-back-button"
          onClick={handleBack}
          aria-label="Zpět"
        >
          <FaArrowLeft /> Zpět
        </button>
      )}

      {/* Hlavička (názvu, popisu a banneru) */}
      <OwnerHeader
        whopData={whopData}
        isEditing={isEditing}
        editName={editName}
        setEditName={setEditName}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editBannerUrl={editBannerUrl}
        isUploadingBanner={isUploadingBanner}
        bannerError={bannerError}
        handleBannerUpload={handleBannerUpload}
      />

      <div className="whop-content">
        {/* Sekce pro úpravu slug a ceny */}
        <OwnerSlugPrice
          whopData={whopData}
          setWhopData={setWhopData}
          isEditing={isEditing}
          isSlugEditing={isSlugEditing}
          setIsSlugEditing={setIsSlugEditing}
          newSlugValue={newSlugValue}
          setNewSlugValue={setNewSlugValue}
          slugError={slugError}
          handleSlugSave={handleSlugSave}
        />

        {/* Akční tlačítka majitele */}
        <OwnerActionButtons
          whopData={whopData}
          isEditing={isEditing}
          handleSave={handleSave}
          setIsEditing={setIsEditing}
          handleDelete={handleDelete}
          setViewAsMemberMode={setViewAsMemberMode}
          setIsCampaignModalOpen={setIsCampaignModalOpen}
        />

        {/* Sekce vlastních funkcí (Features) */}
        <FeaturesSection
          whopData={whopData}
          isEditing={isEditing}
          editFeatures={editFeatures}
          handleFeatChange={handleFeatChange}
          handleImageChange={handleImageChange}
          removeFeature={removeFeature}
          addFeature={addFeature}
        />

        {/* Sekce kampaní (pouze pokud je uživatel vlastníkem) */}
        {whopData.is_owner && (
          <CampaignsSection
            whopData={whopData}
            campaigns={campaigns}
            campaignsLoading={campaignsLoading}
            campaignsError={campaignsError}
            handleExpire={handleExpire}
          />
        )}

        {/* Sekce členů (pouze pokud je uživatel vlastníkem) */}
        {whopData.is_owner && (
          <MembersSection
            membersLoading={membersLoading}
            membersError={membersError}
            membershipsList={membershipsList}
            handleCancelMember={handleCancelMember}
          />
        )}
      </div>

      {/* Modal pro vytvoření nové kampaně */}
      {isCampaignModalOpen && (
        <CampaignModal
          isOpen={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
          whopId={whopData.id}
          fetchCampaigns={fetchCampaigns}
        />
      )}
    </div>
  );
}
