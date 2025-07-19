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
import handleCourseFileUpload from "./handleCourseFileUpload";
import manageFeatures from "./manageFeatures";
import manageCourse from "./manageCourse";
import handleSlugSave from "./handleSlugSave";
import handleSaveWhop from "./handleSaveWhop";
import handleDeleteWhop from "./handleDeleteWhop";
import handleBack from "./handleBack";
import handleExpireCampaign from "./handleExpireCampaign";
import fetchMembers from "./fetchMembers";
import handleCancelMember from "./handleCancelMember";
import handleRequestWaitlist from "./handleRequestWaitlist";

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

  // Overlay for subscribe/join flows
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Loading / error / whopData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whopData, setWhopData] = useState(null);

  // Owner-edit states
  const [isEditing, setIsEditing] = useState(false);
  const [showDiscordSetup, setShowDiscordSetup] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");

  // Slug-edit
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [newSlugValue, setNewSlugValue] = useState("");
  const [slugError, setSlugError] = useState("");

  // Feature-edit
  const [editFeatures, setEditFeatures] = useState([]);
  const [editPricingPlans, setEditPricingPlans] = useState([]);
  const [editCourseSteps, setEditCourseSteps] = useState([
    { id: 1, title: "", content: "", fileUrl: "", fileType: "", isUploading: false, error: "" }
  ]);
  const [editModules, setEditModules] = useState({
    chat: false,
    earn: false,
    discord_access: false,
    course: false,
    text: true,
  });
  const [editAffiliatePercent, setEditAffiliatePercent] = useState(30);
  const [editAffiliateRecurring, setEditAffiliateRecurring] = useState(false);

  // Text-edit states
  const [editLongDescription, setEditLongDescription] = useState("");
  const [editAboutBio, setEditAboutBio] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");
  const [editSocials, setEditSocials] = useState({ instagram: "", discord: "" });
  const [editWhoFor, setEditWhoFor] = useState([{ title: "", description: "" }]);
  const [editFaq, setEditFaq] = useState([{ question: "", answer: "" }]);
  const [editLandingTexts, setEditLandingTexts] = useState({
    reviews_title: "",
    features_title: "",
    about_title: "",
    faq_title: "",
  });

  // Waitlist
  const [waitlistEnabled, setWaitlistEnabled] = useState(false);
  const [waitlistQuestions, setWaitlistQuestions] = useState(["", "", "", "", ""]);

  // Campaign modal & list
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState("");

  // Member-mode tabs & loading
  const [activeTab, setActiveTab] = useState("Home");
  const [memberLoading, setMemberLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Owner “view as member”
  const [viewAsMemberMode, setViewAsMemberMode] = useState(false);

  // Bound version of fetchCampaigns
  const fetchCampaignsBound = (wid) =>
    fetchCampaigns(wid, setCampaigns, setCampaignsLoading, setCampaignsError);

  // 1️⃣ Load Whop data on mount / slug change
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
      setEditPricingPlans,
      fetchCampaignsBound,
      setWaitlistEnabled,
      setWaitlistQuestions,
      setEditCourseSteps,
      setEditLongDescription,
      setEditAboutBio,
      setEditWebsiteUrl,
      setEditSocials,
      setEditWhoFor,
      setEditFaq,
      setEditLandingTexts,
      setEditModules,
      setEditAffiliatePercent,
      setEditAffiliateRecurring
    );
  }, [initialSlug, location.pathname]);

  // 2️⃣ Initialize waitlist toggles when whopData arrives
  useEffect(() => {
    if (whopData?.is_owner) {
      setWaitlistEnabled(Boolean(whopData.waitlist_enabled));
      setWaitlistQuestions(
        Array.isArray(whopData.waitlist_questions) && whopData.waitlist_questions.length
          ? whopData.waitlist_questions
          : ["", "", "", "", ""]
      );
    }
  }, [whopData]);

  useEffect(() => {
    if (Array.isArray(whopData?.pricing_plans) && whopData.pricing_plans.length > 0) {
      setSelectedPlanId(whopData.pricing_plans[0].id);
    } else {
      setSelectedPlanId(null);
    }
  }, [whopData]);

  // 3️⃣ Fetch campaigns if owner or member
  useEffect(() => {
    if (whopData && (whopData.is_owner || whopData.is_member)) {
      fetchCampaignsBound(whopData.id);
    }
  }, [whopData]);

  // 4️⃣ Window resize for overlay
  useEffect(() => {
    const onResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 5️⃣ Subscribe / join free / leave
  const onSubscribe = async () => {
    if (!localStorage.getItem("authToken")) {
      navigate("/login");
      return;
    }
    await handleSubscribe(
      whopData,
      selectedPlanId,
      showConfirm,
      setOverlayVisible,
      setOverlayFading,
      setMemberLoading,
      windowSize,
      navigate,
      showNotification,
      fetchCampaignsBound,
      setWhopData
    );
  };
  const onJoinFree = async () => {
    if (!localStorage.getItem("authToken")) {
      navigate("/login");
      return;
    }
    await handleJoinFree(
      whopData,
      setOverlayVisible,
      setOverlayFading,
      setMemberLoading,
      windowSize,
      navigate,
      showNotification,
      fetchCampaignsBound,
      setWhopData
    );
  };
  const onLeave = async () => {
    await handleLeave(
      whopData,
      showConfirm,
      setMemberLoading,
      showNotification,
      fetchCampaignsBound,
      setWhopData,
      navigate
    );
  };

  // 6️⃣ Upload handlers
  const onBannerUpload = async (file) => {
    await handleBannerUpload(file, setEditBannerUrl, setBannerError, setIsUploadingBanner, showNotification);
  };
  const onFeatureImageUpload = async (id, file) => {
    await handleFeatureImageUpload(id, file, setEditFeatures, showNotification);
  };
  const onCourseFileUpload = async (id, file) => {
    await handleCourseFileUpload(id, file, setEditCourseSteps, showNotification);
  };

  // 7️⃣ Manage features
  const { addFeature, removeFeature, handleFeatChange } = manageFeatures(
    editFeatures,
    setEditFeatures,
    showNotification
  );

  const { addStep, removeStep, handleCourseChange } = manageCourse(
    editCourseSteps,
    setEditCourseSteps
  );

  // Manage pricing plans
  const addPlan = () => {
    const newId =
      editPricingPlans.length > 0
        ? Math.max(...editPricingPlans.map(p => p.id || 0)) + 1
        : 1;
    setEditPricingPlans(prev => [
      ...prev,
      {
        id: newId,
        plan_name: "",
        price: 0,
        billing_period:
          whopData?.is_recurring ? "7 days" : "single",
        currency: whopData?.currency || "USD",
      },
    ]);
  };

  const removePlan = id => {
    setEditPricingPlans(prev => prev.filter(p => p.id !== id));
  };

  const handlePlanChange = (id, field, value) => {
    setEditPricingPlans(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // 8️⃣ Slug save
  const onSlugSave = async () => {
    await handleSlugSave(whopData, newSlugValue, showNotification, setSlugError, navigate);
  };

  // 9️⃣ Save Whop (with waitlist)
  const onSaveWhop = async () => {
    await handleSaveWhop(
      whopData,
      editName,
      editDescription,
      editBannerUrl,
      editFeatures,
      editPricingPlans,
      showNotification,
      setError,
      setEditName,
      setEditDescription,
      setEditBannerUrl,
      setEditFeatures,
      setEditPricingPlans,
      setSlugError,
      fetchCampaignsBound,
      setWhopData,
      setEditLongDescription,
      setEditAboutBio,
      setEditWebsiteUrl,
      setEditSocials,
      setEditWhoFor,
      setEditFaq,
      setEditLandingTexts,
      setEditModules,
      setEditCourseSteps,
      setEditAffiliatePercent,
      setEditAffiliateRecurring,
      waitlistEnabled,
      waitlistQuestions,
      editLongDescription,
      editAboutBio,
      editWebsiteUrl,
      editSocials,
      editWhoFor,
      editFaq,
      editLandingTexts,
      editModules,
      editCourseSteps,
      editAffiliatePercent,
      editAffiliateRecurring
    );
  };

  // 🔟 Delete Whop
  const onDeleteWhop = async () => {
    await handleDeleteWhop(whopData, showConfirm, showNotification, navigate, setError);
  };

  // 1️⃣1️⃣ Back
  const onBack = () => handleBack(navigate);

  // 1️⃣2️⃣ Expire a campaign
  const onExpireCampaign = async (cid) => {
    await handleExpireCampaign(cid, showConfirm, showNotification, whopData, fetchCampaignsBound);
  };

  // 1️⃣3️⃣ Fetch paid members list (owner)
  const [membershipsList, setMembershipsList] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  useEffect(() => {
    if (whopData?.is_owner) {
      fetchMembers(whopData.id, setMembersLoading, setMembersError, setMembershipsList);
    }
  }, [whopData]);


  // 1️⃣4️⃣ Cancel one paid member
  const onCancelMember = async (uid) => {
    await handleCancelMember(uid, whopData, showConfirm, showNotification, fetchMembers);
  };


  // ⭐ Request waitlist
  const onRequestWaitlist = async (wid, answers) => {
    setMemberLoading(true);
    try {
      await handleRequestWaitlist(wid, answers, showNotification, navigate);
      // on success, refresh whopData
      fetchWhopData(
        whopData.slug,
        setLoading,
        setError,
        setWhopData,
        setEditName,
        setEditDescription,
      setEditBannerUrl,
      setNewSlugValue,
      setEditFeatures,
      setEditPricingPlans,
      fetchCampaignsBound,
        setWaitlistEnabled,
        setWaitlistQuestions,
        setEditCourseSteps,
        setEditLongDescription,
        setEditAboutBio,
        setEditWebsiteUrl,
        setEditSocials,
        setEditWhoFor,
        setEditFaq,
        setEditLandingTexts,
        setEditModules,
        setEditAffiliatePercent,
        setEditAffiliateRecurring
      );
    } catch {
      // handleRequestWaitlist throws errors for conflict or server error
    } finally {
      setMemberLoading(false);
    }
  };

  // ====== RENDER ======

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

  if (loading) return <LoadingOverlay loadingOnly />;
  if (error) return <ErrorView error={error} onBack={() => navigate("/onboarding")} />;
  if (!whopData) return null;

  // Owner “view as member”
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
        setWhopData={setWhopData}
        onBack={() => setViewAsMemberMode(false)}
      />
    );
  }

  // Member mode (actual member)
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
        setWhopData={setWhopData}
      />
    );
  }

  // Landing page (visitor)
  if (!whopData.is_owner && !whopData.is_member) {
    return (
      <LandingPage
        whopData={whopData}
        memberLoading={memberLoading}
        handleSubscribe={onSubscribe}
        handleRequestWaitlist={onRequestWaitlist}
        showNotification={showNotification}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
      />
    );
  }

  // Owner mode
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
      editPricingPlans={editPricingPlans}
      addPlan={addPlan}
      removePlan={removePlan}
      handlePlanChange={handlePlanChange}
      editCourseSteps={editCourseSteps}
      handleCourseChange={handleCourseChange}
      handleFileUpload={onCourseFileUpload}
      removeStep={removeStep}
      addStep={addStep}
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
      fetchCampaigns={fetchCampaignsBound}
      waitlistEnabled={waitlistEnabled}
      setWaitlistEnabled={setWaitlistEnabled}
      waitlistQuestions={waitlistQuestions}
      setWaitlistQuestions={setWaitlistQuestions}
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
      editModules={editModules}
      setEditModules={setEditModules}
      showDiscordSetup={showDiscordSetup}
      setShowDiscordSetup={setShowDiscordSetup}
    />
  );
}
