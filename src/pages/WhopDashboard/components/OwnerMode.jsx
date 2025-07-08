// src/pages/WhopDashboard/components/OwnerMode.jsx

import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../../../styles/whop-dashboard/_owner.scss";

import OwnerHeader from "./OwnerHeader";
import OwnerSlugPrice from "./OwnerSlugPrice";
import OwnerActionButtons from "./OwnerActionButtons";
import FeaturesSection from "./FeaturesSection";
import CourseSection from "./CourseSection";
import DiscordSetupSection from "./DiscordSetupSection";
import CampaignsSection from "./CampaignsSection";
import MembersSection from "./MembersSection";
import CampaignModal from "./CampaignModal";
import OwnerTextMenu from "./OwnerTextMenu";
import OwnerModules from "./OwnerModules";

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
  editCourseSteps,
  handleCourseChange,
  handleFileUpload,
  removeStep,
  addStep,
  campaigns,
  campaignsLoading,
  campaignsError,
  handleExpire,          // This function now performs "Refund & Expire"
  membershipsList,
  membersLoading,
  membersError,
  handleCancelMember,
  handleBack,
  isCampaignModalOpen,
  fetchCampaigns,
  editLongDescription,
  setEditLongDescription,
  editAboutBio,
  setEditAboutBio,
  editWebsiteUrl,
  setEditWebsiteUrl,
  editSocials,
  setEditSocials,
  editWhoFor,
  setEditWhoFor,
  editFaq,
  setEditFaq,
  editLandingTexts,
  setEditLandingTexts,
  editModules,
  setEditModules,
}) {
  if (!whopData) return null;

  return (
    <div className="whop-container">
      {/* Show "Back" button only in edit mode */}
      {isEditing && (
        <button
          className="whop-back-button"
          onClick={handleBack}
          aria-label="Back"
        >
          <FaArrowLeft /> Back
        </button>
      )}

      {/* Header section (name, description, banner) */}
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

      {isEditing && (
        <OwnerTextMenu
          editLongDescription={editLongDescription}
          setEditLongDescription={setEditLongDescription}
          editAboutBio={editAboutBio}
          setEditAboutBio={setEditAboutBio}
          editWebsiteUrl={editWebsiteUrl}
          setEditWebsiteUrl={setEditWebsiteUrl}
          editSocials={editSocials}
          setEditSocials={setEditSocials}
          editWhoFor={editWhoFor}
          setEditWhoFor={setEditWhoFor}
          editFaq={editFaq}
          setEditFaq={setEditFaq}
          editLandingTexts={editLandingTexts}
          setEditLandingTexts={setEditLandingTexts}
        />
      )}

      <div className="whop-content">
        {/* Slug and price editing section */}
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

        {/* Owner action buttons */}
        <OwnerActionButtons
          whopData={whopData}
          isEditing={isEditing}
          handleSave={handleSave}
          setIsEditing={setIsEditing}
          handleDelete={handleDelete}
          setViewAsMemberMode={setViewAsMemberMode}
          setIsCampaignModalOpen={setIsCampaignModalOpen}
        />

        {/* Modules section */}
        <OwnerModules
          editModules={editModules}
          setEditModules={setEditModules}
          isEditing={isEditing}
        />

        {/* Features section */}
        {editModules.text && (
          <FeaturesSection
            whopData={whopData}
            isEditing={isEditing}
            editFeatures={editFeatures}
            handleFeatChange={handleFeatChange}
            handleImageChange={handleImageChange}
            removeFeature={removeFeature}
            addFeature={addFeature}
          />
        )}

        {editModules.discord_access && (
          <DiscordSetupSection isEditing={isEditing} whopId={whopData.id} />
        )}

        {editModules.course && (
          <CourseSection
            isEditing={isEditing}
            courseSteps={editCourseSteps}
            handleCourseChange={handleCourseChange}
            handleFileUpload={handleFileUpload}
            removeStep={removeStep}
            addStep={addStep}
          />
        )}

        {/* Campaigns section (only for owners) */}
        {whopData.is_owner && (
          <CampaignsSection
            whopData={whopData}
            campaigns={campaigns}
            campaignsLoading={campaignsLoading}
            campaignsError={campaignsError}
            handleExpire={handleExpire}
          />
        )}

        {/* Members section (only for owners) */}
        {whopData.is_owner && (
          <MembersSection
            membersLoading={membersLoading}
            membersError={membersError}
            membershipsList={membershipsList}
            handleCancelMember={handleCancelMember}
          />
        )}
      </div>

      {/* Modal for creating a new campaign */}
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
