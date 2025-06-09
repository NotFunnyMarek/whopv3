// src/pages/WhopDashboard/WhopDashboard.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { useNotifications } from "../../components/NotificationProvider";

import fetchWhopData from "./fetchWhopData";
import fetchCampaigns from "./fetchCampaigns";
import handleSubscribe from "./handleSubscribe";
import handleJoinFree from "./handleJoinFree";
import handleLeave from "./handleLeave";
import handleBannerUpload from "./handleBannerUpload";
import handleFeatureImageUpload from "./handleFeatureImageUpload";
import manageFeatures from "./manageFeatures";
import handleSlugSave from "./handleSlugSave";
import handleSaveWhop from "./handleSaveWhop";
import handleDeleteWhop from "./handleDeleteWhop";
import handleBack from "./handleBack";
import handleExpireCampaign from "./handleExpireCampaign";
import fetchMembers from "./fetchMembers";
import handleCancelMember from "./handleCancelMember";

import LoadingOverlay from "./components/LoadingOverlay";
import ErrorView from "./components/ErrorView";
import ViewAsMember from "./components/ViewAsMember";
import MemberMode from "./components/MemberMode";
import LandingPage from "./components/LandingPage";
import OwnerMode from "./components/OwnerMode";

import "../../styles/whop-dashboard/whop-dashboard.scss";

export default function WhopDashboard() {
  const { slug: initialSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification, showConfirm } = useNotifications();

  // Overlay pro placené/free subscriby
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Stav načítání whopData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whopData, setWhopData] = useState(null);

  // Stav pro owner‐editaci
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");

  // Změna slugu
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [newSlugValue, setNewSlugValue] = useState("");
  const [slugError, setSlugError] = useState("");

  // Editace features (owner)
  const [editFeatures, setEditFeatures] = useState([]);

  // Kampaňový modal (owner vytváří novou)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Stav pro kampaně (owner + member)
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState("");

  // Členský režim (taby + stav „leave“)
  const [activeTab, setActiveTab] = useState("Home");
  const [memberLoading, setMemberLoading] = useState(false);

  // View‐as‐Member mód (owner vidí vlastně jako člen)
  const [viewAsMemberMode, setViewAsMemberMode] = useState(false);

  // “Bound” verze fetchCampaigns, která předá všechny čtyři parametry najednou
  const fetchCampaignsBound = (whopId) => {
    return fetchCampaigns(
      whopId,
      setCampaigns,
      setCampaignsLoading,
      setCampaignsError
    );
  };

  // 10) Načtení whopData na mount / slug change
  useEffect(() => {
    const slugToFetch = location.pathname.startsWith("/c/")
      ? location.pathname.split("/c/")[1].split("?")[0]
      : initialSlug;

    fetchWhopData(
      slugToFetch,
      setLoading,
      setError,
      setWhopData,
      setEditName,
      setEditDescription,
      setEditBannerUrl,
      setNewSlugValue,
      setEditFeatures,
      fetchCampaignsBound // předáme bound verzi
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, location.pathname]);

  // 11) Načtení kampaní
  useEffect(() => {
    if (whopData && (whopData.is_owner || whopData.is_member)) {
      fetchCampaignsBound(whopData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whopData]);

  // 12) Resize listener pro konfety
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 13) HANDLE SUBSCRIBE (platba nebo free)
  const onSubscribe = async () => {
    await handleSubscribe(
      whopData,
      showConfirm,
      setOverlayVisible,
      setOverlayFading,
      setMemberLoading,
      windowSize,
      navigate,
      showNotification,
      fetchCampaignsBound, // bound verze
      setWhopData
    );
  };

  // 14) JOIN FREE
  const onJoinFree = async () => {
    await handleJoinFree(
      whopData,
      setOverlayVisible,
      setOverlayFading,
      setMemberLoading,
      windowSize,
      navigate,
      showNotification,
      fetchCampaignsBound, // bound verze
      setWhopData
    );
  };

  // 15) LEAVE
  const onLeave = async () => {
    await handleLeave(
      whopData,
      showConfirm,
      setMemberLoading,
      showNotification,
      fetchCampaignsBound, // bound verze
      setWhopData,
      navigate
    );
  };

  // 16) Upload banner (owner)
  const onBannerUpload = async (file) => {
    await handleBannerUpload(
      file,
      setEditBannerUrl,
      setBannerError,
      setIsUploadingBanner,
      showNotification
    );
  };

  // 17) Upload feature image (owner)
  const onFeatureImageUpload = async (id, file) => {
    await handleFeatureImageUpload(
      id,
      file,
      setEditFeatures,
      showNotification
    );
  };

  // 18) Add / Remove / Change Feature (owner)
  const {
    addFeature,
    removeFeature,
    handleFeatChange,
  } = manageFeatures(editFeatures, setEditFeatures, showNotification);

  // 19) Save new slug (owner)
  const onSlugSave = async () => {
    await handleSlugSave(
      whopData,
      newSlugValue,
      showNotification,
      setSlugError,
      navigate
    );
  };

  // 20) Save Whop (owner)
  const onSaveWhop = async () => {
    await handleSaveWhop(
      whopData,
      editName,
      editDescription,
      editBannerUrl,
      editFeatures,
      showNotification,
      setError,
      setEditName,
      setEditDescription,
      setEditBannerUrl,
      setEditFeatures,
      setSlugError,
      fetchCampaignsBound, // bound verze
      setWhopData
    );
  };

  // 21) Delete Whop (owner)
  const onDeleteWhop = async () => {
    await handleDeleteWhop(
      whopData,
      showConfirm,
      showNotification,
      navigate,
      setError
    );
  };

  // 22) Back (owner)
  const onBack = () => {
    handleBack(navigate);
  };

  // 23) Expire Campaign (owner)
  const onExpireCampaign = async (campaignId) => {
    await handleExpireCampaign(
      campaignId,
      showConfirm,
      showNotification,
      whopData,
      fetchCampaignsBound // bound verze
    );
  };

  // 24) Fetch paid members list (owner)
  const [membershipsList, setMembershipsList] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  useEffect(() => {
    if (whopData?.is_owner) {
      fetchMembers(
        whopData.id,
        setMembersLoading,
        setMembersError,
        setMembershipsList
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whopData]);

  // 25) Cancel one paid member (owner helper)
  const onCancelMember = async (memberUserId) => {
    await handleCancelMember(
      memberUserId,
      whopData,
      showConfirm,
      showNotification,
      fetchMembers
    );
  };

  // **RENDER**
  if (overlayVisible || overlayFading) {
    return (
      <LoadingOverlay
        overlayVisible={overlayVisible}
        overlayFading={overlayFading}
        windowSize={windowSize}
        onTransitionEnd={() => {
          if (overlayFading) {
            setOverlayVisible(false);
            setOverlayFading(false);
          }
        }}
      />
    );
  }

  if (loading) {
    return <LoadingOverlay loadingOnly />;
  }

  if (error) {
    return <ErrorView error={error} onBack={() => navigate("/onboarding")} />;
  }

  if (!whopData) return null;

  // “View as Member” (owner)
  if (viewAsMemberMode) {
    return (
      <ViewAsMember
        whopData={whopData}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignsError={campaignsError}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberLoading={memberLoading}
        handleLeave={onLeave}
        onBack={() => setViewAsMemberMode(false)}
      />
    );
  }

  // MEMBER MODE (skutečný člen)
  if (whopData.is_member && !whopData.is_owner) {
    return (
      <MemberMode
        whopData={whopData}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignsError={campaignsError}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberLoading={memberLoading}
        handleLeave={onLeave}
      />
    );
  }

  // LANDING PAGE (návštěvník)
  if (!whopData.is_owner && !whopData.is_member) {
    return (
      <LandingPage
        whopData={whopData}
        memberLoading={memberLoading}
        handleSubscribe={onSubscribe}
      />
    );
  }

  // OWNER MODE
  return (
    <OwnerMode
      whopData={whopData}
      setWhopData={setWhopData}                                           
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editName={editName}
      setEditName={setEditName}
      editDescription={editDescription}
      setEditDescription={setEditDescription}
      editBannerUrl={editBannerUrl}
      isUploadingBanner={isUploadingBanner}
      bannerError={bannerError}
      handleBannerUpload={onBannerUpload}
      isSlugEditing={isSlugEditing}
      setIsSlugEditing={setIsSlugEditing}
      newSlugValue={newSlugValue}
      setNewSlugValue={setNewSlugValue}
      slugError={slugError}
      handleSlugSave={onSlugSave}
      handleSave={onSaveWhop}
      handleDelete={onDeleteWhop}
      setViewAsMemberMode={setViewAsMemberMode}
      setIsCampaignModalOpen={setIsCampaignModalOpen}
      editFeatures={editFeatures}
      handleFeatChange={handleFeatChange}
      handleImageChange={onFeatureImageUpload}
      removeFeature={removeFeature}
      addFeature={addFeature}
      campaigns={campaigns}
      campaignsLoading={campaignsLoading}
      campaignsError={campaignsError}
      handleExpire={onExpireCampaign}
      membershipsList={membershipsList}
      membersLoading={membersLoading}
      membersError={membersError}
      handleCancelMember={onCancelMember}
      handleBack={onBack}
      isCampaignModalOpen={isCampaignModalOpen}
      fetchCampaigns={fetchCampaignsBound} // bound verze
    />
  );
}
