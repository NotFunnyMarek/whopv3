// src/pages/WhopDashboard.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaSave,
  FaEdit,
  FaArrowLeft,
  FaUserPlus,
  FaSignOutAlt,
  FaUsers,
  FaHome,
  FaComments,
  FaDollarSign,
  FaTools,
  FaLink
} from "react-icons/fa";
import Confetti from "react-confetti";

import Modal from "../components/Modal";
import CardForm from "../components/CardForm";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/whop-dashboard.scss";

const CLOUDINARY_CLOUD_NAME = "dv6igcvz8";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_profile_avatars";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

const CAMPAIGN_API_URL = "https://app.byxbot.com/php/campaign.php";
const EXPIRE_CAMPAIGN_URL = "https://app.byxbot.com/php/expire_campaign.php";

export default function WhopDashboard() {
  const { slug: initialSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification, showConfirm } = useNotifications();

  // Pro fullscreen overlay animaci
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Globální stav: whopData, loading, error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whopData, setWhopData] = useState(null);

  // --- Stav pro owner‐editaci
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");

  // Slug edit
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [newSlugValue, setNewSlugValue] = useState("");
  const [slugError, setSlugError] = useState("");

  // Edit features
  const [editFeatures, setEditFeatures] = useState([]);
  const [editPricingPlans, setEditPricingPlans] = useState([]);

  // Campaign modal
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState("");

  // Member mode
  const [activeTab, setActiveTab] = useState("Home");
  const [memberLoading, setMemberLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // “View as Member” mode
  const [viewAsMemberMode, setViewAsMemberMode] = useState(false);

  // — Fetch whopData on mount or slug change —
  useEffect(() => {
    const slugToFetch = location.pathname.startsWith("/c/")
      ? location.pathname.split("/c/")[1].split("?")[0]
      : initialSlug;

    const fetchWhop = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
            slugToFetch
          )}`,
          { method: "GET", credentials: "include" }
        );
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          setError("Chyba: neplatný JSON.");
          setLoading(false);
          return;
        }
        if (!res.ok || json.status !== "success") {
          setError(json.message || "Nepodařilo se načíst Whop.");
          setLoading(false);
          return;
        }
        const incoming = { ...json.data };
        if (Array.isArray(incoming.pricing_plans) && incoming.pricing_plans.length > 0) {
          incoming.price = incoming.pricing_plans[0].price;
          incoming.currency = incoming.pricing_plans[0].currency;
          incoming.billing_period = incoming.pricing_plans[0].billing_period;
          setSelectedPlanId(incoming.pricing_plans[0].id);
        }
        setWhopData(incoming);

        // If owner, prepare editing state
        if (json.data.is_owner) {
          setEditName(json.data.name);
          setEditDescription(json.data.description);
          setEditBannerUrl(json.data.banner_url || "");
          setNewSlugValue(json.data.slug);
          setEditFeatures(
            json.data.features.map((f, idx) => ({
              id: idx + 1,
              title: f.title,
              subtitle: f.subtitle,
              imageUrl: f.image_url,
              isUploading: false,
              error: ""
            }))
          );
          setEditPricingPlans(
            (json.data.pricing_plans || []).map((p) => ({
              id: p.id,
              plan_name: p.plan_name || "",
              price: p.price,
              billing_period: p.billing_period,
              currency: p.currency || json.data.currency,
            }))
          );
          await fetchCampaigns(json.data.id);
        }

        // If member (but not owner), load campaigns
        if (json.data.is_member && !json.data.is_owner) {
          await fetchCampaigns(json.data.id);
        }
      } catch (err) {
        setError("Síťová chyba: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWhop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, location.pathname]);

  // — Fetch Campaigns for a given whopId —
  const fetchCampaigns = async (whopId) => {
    setCampaignsLoading(true);
    setCampaignsError("");
    try {
      const res = await fetch(`${CAMPAIGN_API_URL}?whop_id=${whopId}`, {
        method: "GET",
        credentials: "include"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      setCampaignsError("Nelze načíst kampaně: " + err.message);
    } finally {
      setCampaignsLoading(false);
    }
  };

  // — Confetti overlay resize listener —
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ----------------------------------------
  // 1) HANDLE SUBSCRIBE (Free vs Paid)
  // ----------------------------------------
  const handleSubscribe = async () => {
    if (!whopData) return;

    // Pokud je zdarma (price ≤ 0)
    if (!whopData.price || parseFloat(whopData.price) <= 0) {
      handleJoinFree();
      return;
    }

    // Paid whop: potvrzení přes custom confirm modal
    let plan = null;
    if (Array.isArray(whopData.pricing_plans) && selectedPlanId) {
      plan = whopData.pricing_plans.find((p) => p.id === selectedPlanId);
    }
    const priceVal = plan ? plan.price : whopData.price;
    const billPeriod = plan ? plan.billing_period : whopData.billing_period;
    const price = parseFloat(priceVal).toFixed(2);
    const period = whopData.is_recurring
      ? `opakuje se každých ${billPeriod}`
      : "jednorázově";
    const currency = plan ? plan.currency || whopData.currency : whopData.currency;
    const confirmMessage = `Tento Whop stojí ${currency}${price} ${period}.\nChcete pokračovat?`;

    try {
      await showConfirm(confirmMessage);
    } catch {
      // uživatel zrušil → return
      return;
    }

    // Ukážeme fullscreen overlay
    setOverlayVisible(true);
    setOverlayFading(false);
    setMemberLoading(true);
    const resizeListener = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resizeListener);

    try {
      const payload = { whop_id: whopData.id };
      if (selectedPlanId) payload.plan_id = selectedPlanId;
      const res = await fetch("https://app.byxbot.com/php/subscribe_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        showNotification({ type: "error", message: json.message || "Nepodařilo se přihlásit." });
      } else {
        // On success: re‐fetch whopData & campaigns
        const refresh = await fetch(
          `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
            whopData.slug
          )}`,
          { method: "GET", credentials: "include" }
        );
        const refreshed = await refresh.json();
        if (refresh.ok && refreshed.status === "success") {
          setWhopData(refreshed.data);
          await fetchCampaigns(refreshed.data.id);
          showNotification({ type: "success", message: "Úspěšně přihlášeno." });
        }
      }
    } catch (err) {
      console.error("Chyba při subscribe:", err);
      showNotification({ type: "error", message: "Síťová chyba při přihlašování." });
    } finally {
      // Fade‐out overlay po 2 s
      setTimeout(() => {
        setOverlayFading(true);
      }, 2000);
      setMemberLoading(false);
      window.removeEventListener("resize", resizeListener);
    }
  };

  // ----------------------------------------
  // 2) JOIN FREE (price ≤ 0)
  // ----------------------------------------
  const handleJoinFree = async () => {
    if (!whopData) return;

    setOverlayVisible(true);
    setOverlayFading(false);
    setMemberLoading(true);

    const resizeListener = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resizeListener);

    try {
      const res = await fetch("https://app.byxbot.com/php/join_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ whop_id: whopData.id })
      });
      const json = await res.json();
      if (!res.ok) {
        showNotification({ type: "error", message: json.message || "Nepodařilo se připojit." });
      } else {
        // On success: re‐fetch whopData & campaigns
        const refresh = await fetch(
          `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
            whopData.slug
          )}`,
          { method: "GET", credentials: "include" }
        );
        const refreshed = await refresh.json();
        if (refresh.ok && refreshed.status === "success") {
          setWhopData(refreshed.data);
          await fetchCampaigns(refreshed.data.id);
          showNotification({ type: "success", message: "Úspěšně připojeno zdarma." });
        }
      }
    } catch (err) {
      console.error("Chyba při join free:", err);
      showNotification({ type: "error", message: "Síťová chyba při připojování zdarma." });
    } finally {
      setTimeout(() => {
        setOverlayFading(true);
      }, 2000);
      setMemberLoading(false);
      window.removeEventListener("resize", resizeListener);
    }
  };

  // ----------------------------------------
  // 3) LEAVE (if paid → cancel_membership, if free → leave_whop)
  // ----------------------------------------
  const handleLeave = async () => {
    if (!whopData) return;

    // Potvrzení přes custom confirm modal
    try {
      await showConfirm("Chcete okamžitě opustit tento Whop a ztratit přístup?");
    } catch {
      return;
    }

    setMemberLoading(true);

    // Pokud je placený (price > 0)
    if (whopData.price && parseFloat(whopData.price) > 0) {
      try {
        const payload = { whop_id: whopData.id };
        const res = await fetch("https://app.byxbot.com/php/cancel_membership.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) {
          showNotification({ type: "error", message: json.message || "Nepodařilo se zrušit předplatné." });
        } else {
          // On success: re‐fetch whopData (uživatel ztratí přístup)
          const refresh = await fetch(
            `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
              whopData.slug
            )}`,
            { method: "GET", credentials: "include" }
          );
          const refreshed = await refresh.json();
          if (refresh.ok && refreshed.status === "success") {
            setWhopData(refreshed.data);
            setCampaigns([]); // membership vymazané
            showNotification({ type: "success", message: "Úspěšně odebráno předplatné." });
          }
        }
      } catch (err) {
        console.error("Chyba při cancel membership:", err);
        showNotification({ type: "error", message: "Síťová chyba při rušení předplatného." });
      } finally {
        setMemberLoading(false);
      }
      return;
    }

    // Jinak: free whop
    try {
      const res = await fetch("https://app.byxbot.com/php/leave_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ whop_id: whopData.id })
      });
      const json = await res.json();
      if (!res.ok) {
        showNotification({ type: "error", message: json.message || "Nepodařilo se opustit." });
      } else {
        // On success: re‐fetch whopData
        const refresh = await fetch(
          `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
            whopData.slug
          )}`,
          { method: "GET", credentials: "include" }
        );
        const refreshed = await refresh.json();
        if (refresh.ok && refreshed.status === "success") {
          setWhopData(refreshed.data);
          setCampaigns([]);
          showNotification({ type: "success", message: "Úspěšně opuštěno." });
        }
      }
    } catch (err) {
      console.error("Chyba při leave free:", err);
      showNotification({ type: "error", message: "Síťová chyba při opuštění." });
    } finally {
      setMemberLoading(false);
    }
  };

  // ----------------------------------------
  // 4) Upload banner (owner)
  // ----------------------------------------
  const handleBannerUpload = async (file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setBannerError("Max 5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setBannerError("Vyberte obrázek.");
      return;
    }
    setIsUploadingBanner(true);
    setBannerError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error(`Cloudinary chybička: ${res.status}`);
      const data = await res.json();
      if (!data.secure_url) throw new Error("Chyba URL.");
      setEditBannerUrl(data.secure_url);
      setBannerError("");
      showNotification({ type: "success", message: "Banner úspěšně nahrán." });
    } catch (err) {
      console.error(err);
      setBannerError("Nepodařilo se nahrát banner.");
      setEditBannerUrl("");
      showNotification({ type: "error", message: "Nepodařilo se nahrát banner." });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // ----------------------------------------
  // 5) Upload feature image (owner)
  // ----------------------------------------
  const handleImageChange = async (id, file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, error: "Max 5 MB.", isUploading: false } : f
        )
      );
      return;
    }
    if (!file.type.startsWith("image/")) {
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, error: "Vyberte obrázek.", isUploading: false } : f
        )
      );
      return;
    }
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, isUploading: true, error: "" } : f
      )
    );
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error(`Cloudinary: ${res.status}`);
      const data = await res.json();
      if (!data.secure_url) throw new Error("Žádné secure_url.");
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageUrl: data.secure_url, isUploading: false, error: "" }
            : f
        )
      );
      showNotification({ type: "success", message: "Feature obrázek nahrán." });
    } catch (err) {
      console.error(err);
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageUrl: "", isUploading: false, error: "Nepodařilo se." }
            : f
        )
      );
      showNotification({ type: "error", message: "Nepodařilo se nahrát obrázek feature." });
    }
  };

  // ----------------------------------------
  // 6) Add feature (owner)
  // ----------------------------------------
  const addFeature = () => {
    if (editFeatures.length >= 6) return;
    const newId =
      editFeatures.length > 0
        ? Math.max(...editFeatures.map((f) => f.id)) + 1
        : 1;
    setEditFeatures((prev) => [
      ...prev,
      { id: newId, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" }
    ]);
    showNotification({ type: "info", message: "Přidána nová feature (vyplňte údaje)." });
  };

  // ----------------------------------------
  // 7) Remove feature (owner)
  // ----------------------------------------
  const removeFeature = (id) => {
    if (editFeatures.length <= 2) {
      showNotification({ type: "error", message: "Minimálně 2 features musí zůstat." });
      return;
    }
    setEditFeatures((prev) => prev.filter((f) => f.id !== id));
    showNotification({ type: "info", message: "Feature odstraněna." });
  };

  // ----------------------------------------
  // 8) Change field on feature (owner)
  // ----------------------------------------
  const handleFeatChange = (id, field, value) => {
    setEditFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const addPlan = () => {
    const newId = editPricingPlans.length > 0 ? Math.max(...editPricingPlans.map((p) => p.id || 0)) + 1 : 1;
    setEditPricingPlans((prev) => [
      ...prev,
      { id: newId, plan_name: "", price: 0, billing_period: "7 days", currency: whopData.currency || "USD" }
    ]);
  };

  const removePlan = (id) => {
    setEditPricingPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePlanChange = (id, field, value) => {
    setEditPricingPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // ----------------------------------------
  // 9) Save slug (owner)
  // ----------------------------------------
  const handleSlugSave = async () => {
    setSlugError("");
    const trimmed = newSlugValue.trim();
    if (!trimmed) {
      setSlugError("Slug nesmí být prázdný.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setSlugError("Pouze písmena, čísla, pomlčky, podtržítka.");
      return;
    }
    try {
      const payload = { oldSlug: whopData.slug, newSlug: trimmed };
      const res = await fetch("https://app.byxbot.com/php/update_whop_slug.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        setSlugError("Chyba při parsování.");
        return;
      }
      if (!res.ok || json.status !== "success") {
        setSlugError(json.message || "Nepovedlo se.");
        return;
      }
      showNotification({ type: "success", message: "Slug úspěšně změněn." });
      navigate(`/c/${trimmed}`);
    } catch (err) {
      console.error(err);
      setSlugError("Síťová chyba.");
    }
  };

  // ----------------------------------------
  // 10) Save Whop (owner)
  // ----------------------------------------
  const handleSave = async () => {
    if (!editName.trim() || !editDescription.trim()) {
      setError("Název i popis nesmí být prázdné.");
      return;
    }
    const validFeats = editFeatures.filter((f) => f.title.trim() && f.imageUrl);
    if (validFeats.length < 2) {
      setError("Minimálně 2 platné features.");
      return;
    }

    // Build payload (including price/recurring)
    const basePrice =
      editPricingPlans.length > 0
        ? parseFloat(editPricingPlans[0].price) || 0
        : parseFloat(whopData.price) || 0;
    const baseCurr =
      editPricingPlans.length > 0
        ? editPricingPlans[0].currency || whopData.currency || "USD"
        : whopData.currency || "USD";
    const basePeriod =
      editPricingPlans.length > 0
        ? editPricingPlans[0].billing_period
        : whopData.billing_period || "";

    const payload = {
      slug: whopData.slug,
      name: editName.trim(),
      description: editDescription.trim(),
      bannerUrl: editBannerUrl.trim(),
      price: basePrice,
      currency: baseCurr,
      is_recurring: whopData.is_recurring || 0,
      billing_period: basePeriod,
      features: validFeats.map((f) => ({
        title: f.title.trim(),
        subtitle: f.subtitle.trim(),
        imageUrl: f.imageUrl
      })),
      pricing_plans: editPricingPlans.map((p, idx) => ({
        id: p.id,
        plan_name: p.plan_name,
        price: parseFloat(p.price) || 0,
        currency: p.currency || whopData.currency,
        billing_period: p.billing_period,
        sort_order: idx
      }))
    };

    try {
      const res = await fetch("https://app.byxbot.com/php/update_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        setError("Chyba serveru.");
        return;
      }
      if (!res.ok || json.status !== "success") {
        setError(json.message || "Nepovedlo se uložit.");
        return;
      }

      showNotification({ type: "success", message: "Whop úspěšně uložen." });

      // On success: turn off editing and re‐fetch whopData
      setIsEditing(false);
      const refreshRes = await fetch(
        `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
          whopData.slug
        )}`,
        { method: "GET", credentials: "include" }
      );
      const refreshText = await refreshRes.text();
      let refreshJson;
      try {
        refreshJson = JSON.parse(refreshText);
      } catch {
        return;
      }
      if (refreshRes.ok && refreshJson.status === "success") {
        const incoming = { ...refreshJson.data };
        if (Array.isArray(incoming.pricing_plans) && incoming.pricing_plans.length > 0) {
          incoming.price = incoming.pricing_plans[0].price;
          incoming.currency = incoming.pricing_plans[0].currency;
          incoming.billing_period = incoming.pricing_plans[0].billing_period;
        }
        setWhopData(incoming);
        // Update local states
        setEditName(refreshJson.data.name);
        setEditDescription(refreshJson.data.description);
        setEditBannerUrl(refreshJson.data.banner_url || "");
        const newFeatArr = refreshJson.data.features.map((f, idx) => ({
          id: idx + 1,
          title: f.title,
          subtitle: f.subtitle,
          imageUrl: f.image_url,
          isUploading: false,
          error: ""
        }));
        setEditFeatures(newFeatArr);
        setEditPricingPlans(
          (refreshJson.data.pricing_plans || []).map((p) => ({
            id: p.id,
            plan_name: p.plan_name || "",
            price: p.price,
            billing_period: p.billing_period,
            currency: p.currency || refreshJson.data.currency
          }))
        );
        setError("");
        setBannerError("");
        setSlugError("");
      }
    } catch (err) {
      console.error(err);
      setError("Síťová chyba.");
      showNotification({ type: "error", message: "Síťová chyba při ukládání Whopu." });
    }
  };

  // ----------------------------------------
  // 11) Delete Whop (owner)
  // ----------------------------------------
  const handleDelete = async () => {
    try {
      await showConfirm("Opravdu smazat Whop?");
    } catch {
      return;
    }

    try {
      const payload = { slug: whopData.slug };
      const res = await fetch("https://app.byxbot.com/php/delete_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        setError("Chyba mazání.");
        return;
      }
      if (!res.ok || json.status !== "success") {
        setError(json.message || "Nepodařilo se smazat.");
        showNotification({ type: "error", message: json.message || "Nepodařilo se smazat." });
        return;
      }
      showNotification({ type: "success", message: "Whop smazán." });
      navigate("/onboarding");
    } catch (err) {
      console.error(err);
      setError("Síťová chyba.");
      showNotification({ type: "error", message: "Síťová chyba při mazání Whopu." });
    }
  };

  // ----------------------------------------
  // 12) Back button (owner)
  // ----------------------------------------
  const handleBack = () => {
    navigate("/onboarding");
  };

  // ----------------------------------------
  // 13) Expire a campaign (owner)
  // ----------------------------------------
  const handleExpire = async (campaignId) => {
    try {
      await showConfirm("Označit kampaň jako EXPIRY?");
    } catch {
      return;
    }
    try {
      const res = await fetch(EXPIRE_CAMPAIGN_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification({ type: "error", message: data.error || "Nepodařilo se" });
        return;
      }
      if (whopData) {
        await fetchCampaigns(whopData.id);
      }
      showNotification({ type: "success", message: "Kampaň označena jako EXPIRED." });
    } catch (err) {
      console.error(err);
      showNotification({ type: "error", message: "Síťová chyba při expirování kampaně." });
    }
  };

  // ----------------------------------------
  // 14) Fetch paid members (owner)
  // ----------------------------------------
  const [membershipsList, setMembershipsList] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  const fetchWhopMembers = async () => {
    if (!whopData || !whopData.is_owner) return;
    setMembersLoading(true);
    setMembersError("");
    try {
      const res = await fetch(
        `https://app.byxbot.com/php/get_whop_members.php?whop_id=${whopData.id}`,
        { method: "GET", credentials: "include" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMembershipsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Chyba při načítání členů Whopu:", err);
      setMembersError("Nepodařilo se načíst členy Whopu.");
      setMembershipsList([]);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchWhopMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whopData]);

  // ----------------------------------------
  // 15) Render Fullscreen overlay + Confetti
  // ----------------------------------------
  if (overlayVisible || overlayFading) {
    return (
      <div
        className={`join-loading-overlay ${overlayFading ? "fade-out" : ""}`}
        onTransitionEnd={() => {
          if (overlayFading) {
            setOverlayVisible(false);
            setOverlayFading(false);
          }
        }}
      >
        <div className="spinner"></div>
        <h1>Připojuji se…</h1>
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      </div>
    );
  }

  // ----------------------------------------
  // 16) While loading whopData
  // ----------------------------------------
  if (loading) {
    return (
      <div className="whop-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // ----------------------------------------
  // 17) Error loading whopData
  // ----------------------------------------
  if (error) {
    return (
      <div className="whop-error">
        <p className="whop-error-text">{error}</p>
        <button className="whop-back-button" onClick={() => navigate("/onboarding")}>
          ← Zpět
        </button>
      </div>
    );
  }

  if (!whopData) return null;

  // ----------------------------------------
  // 18) “View as Member” (owner viewing own whop as a member)
  // ----------------------------------------
  if (viewAsMemberMode) {
    return (
      <div className="member-container">
        {/* Back to Dashboard button */}
        <button
          className="whop-back-button view-as-member-back"
          onClick={() => setViewAsMemberMode(false)}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* MEMBER SIDEBAR */}
        <div className="member-sidebar">
          <div className="member-banner">
            {whopData.banner_url ? (
              <img
                src={whopData.banner_url}
                alt="Banner"
                className="member-banner-img"
              />
            ) : (
              <div className="member-banner-placeholder">Žádný banner</div>
            )}
          </div>
          <div className="member-info">
            <h2 className="member-title">{whopData.name}</h2>
            <div className="member-members-count">
              <FaUsers /> {whopData.members_count} členů
            </div>
          </div>
          <nav className="member-nav">
            <button
              className={`nav-button ${activeTab === "Home" ? "active" : ""}`}
              onClick={() => setActiveTab("Home")}
            >
              <FaHome /> Home
            </button>
            <button
              className={`nav-button ${activeTab === "Chat" ? "active" : ""}`}
              onClick={() => setActiveTab("Chat")}
            >
              <FaComments /> Chat
            </button>
            <button
              className={`nav-button ${activeTab === "Earn" ? "active" : ""}`}
              onClick={() => setActiveTab("Earn")}
            >
              <FaDollarSign /> Earn
            </button>
            <button
              className={`nav-button ${activeTab === "Tools" ? "active" : ""}`}
              onClick={() => setActiveTab("Tools")}
            >
              <FaTools /> Tools
            </button>
          </nav>
          <div className="member-actions">
            {memberLoading ? (
              <div className="spinner spinner-small"></div>
            ) : (
              <button className="leave-button" onClick={handleLeave}>
                <FaSignOutAlt /> Opustit
              </button>
            )}
          </div>
        </div>

        {/* MEMBER MAIN CONTENT */}
        <div className="member-main">
          {activeTab === "Home" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">{whopData.name}</h3>
              <div className="whop-features-grid">
                {whopData.features.map((feat, idx) => (
                  <div key={idx} className="whop-feature-card">
                    {feat.image_url ? (
                      <img
                        src={feat.image_url}
                        alt={feat.title}
                        className="whop-feature-image"
                      />
                    ) : (
                      <div className="whop-feature-image-placeholder" />
                    )}
                    <div className="whop-feature-text">
                      <h3 className="whop-feature-title">{feat.title}</h3>
                      {feat.subtitle && (
                        <p className="whop-feature-subtitle">{feat.subtitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "Chat" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">Chat</h3>
              <p className="member-text">
                Chatovací sekce se připravuje nebo tam může být vložen widget.
              </p>
            </div>
          )}
          {activeTab === "Earn" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">Earn</h3>
              {campaignsLoading ? (
                <div className="spinner spinner-small"></div>
              ) : campaignsError ? (
                <p className="member-error">{campaignsError}</p>
              ) : campaigns.length === 0 ? (
                <div className="no-campaign-msg">Žádné kampaně</div>
              ) : (
                <ul className="member-campaign-list">
                  {campaigns.map((camp) => {
                    const isExpired = camp.is_active === 0;
                    return (
                      <li
                        key={camp.id}
                        className={`member-campaign-card ${
                          isExpired ? "expired" : "active"
                        }`}
                      >
                        <div className="camp-header">
                          <span className="camp-title">{camp.campaign_name}</span>
                          {isExpired ? (
                            <span className="expired-label">EXPIRED</span>
                          ) : (
                            <span className="reward-label">
                              {camp.currency}
                              {camp.reward_per_thousand.toFixed(2)} / 1K
                            </span>
                          )}
                        </div>
                        <p className="author">
                          Autor: <span className="author-name">{camp.username}</span>
                        </p>
                        <div className="paid-bar">
                          <div className="paid-info">
                            {camp.currency}
                            {camp.paid_out.toFixed(2)} z {camp.currency}
                            {camp.total_paid_out.toFixed(2)} vyplaceno
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-fill"
                              style={{
                                width: isExpired
                                  ? "100%"
                                  : `${camp.paid_percent}%`
                              }}
                            />
                          </div>
                          <div className="percent-text">
                            {isExpired ? "100%" : `${camp.paid_percent}%`}
                          </div>
                        </div>
                        <ul className="camp-details">
                          <li>
                            <strong>Typ:</strong> {camp.type}
                          </li>
                          <li>
                            <strong>Kategorie:</strong> {camp.category}
                          </li>
                          <li>
                            <strong>Platformy:</strong>
                            {camp.platforms.map((p, i) => (
                              <span key={i} className="platform-pill">
                                {p}
                              </span>
                            ))}
                          </li>
                          <li>
                            <strong>Zhlédnutí:</strong>{" "}
                            {camp.reward_per_thousand > 0
                              ? Math.round(
                                  (camp.paid_out / camp.reward_per_thousand) * 1000
                                )
                              : 0}
                          </li>
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
          {activeTab === "Tools" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">Tools</h3>
              <p className="member-text">
                Tools sekce se připravuje nebo tam mohou být doplňkové nástroje.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // 19) MEMBER MODE (actually connected, not owner)
  // ----------------------------------------
  if (whopData.is_member && !whopData.is_owner) {
    return (
      <div className="member-container">
        {/* MEMBER SIDEBAR */}
        <div className="member-sidebar">
          <div className="member-banner">
            {whopData.banner_url ? (
              <img
                src={whopData.banner_url}
                alt="Banner"
                className="member-banner-img"
              />
            ) : (
              <div className="member-banner-placeholder">Žádný banner</div>
            )}
          </div>
          <div className="member-info">
            <h2 className="member-title">{whopData.name}</h2>
            <div className="member-members-count">
              <FaUsers /> {whopData.members_count} členů
            </div>
          </div>
          <nav className="member-nav">
            <button
              className={`nav-button ${activeTab === "Home" ? "active" : ""}`}
              onClick={() => setActiveTab("Home")}
            >
              <FaHome /> Home
            </button>
            <button
              className={`nav-button ${activeTab === "Chat" ? "active" : ""}`}
              onClick={() => setActiveTab("Chat")}
            >
              <FaComments /> Chat
            </button>
            <button
              className={`nav-button ${activeTab === "Earn" ? "active" : ""}`}
              onClick={() => setActiveTab("Earn")}
            >
              <FaDollarSign /> Earn
            </button>
            <button
              className={`nav-button ${activeTab === "Tools" ? "active" : ""}`}
              onClick={() => setActiveTab("Tools")}
            >
              <FaTools /> Tools
            </button>
          </nav>
          <div className="member-actions">
            {memberLoading ? (
              <div className="spinner spinner-small"></div>
            ) : (
              <button className="leave-button" onClick={handleLeave}>
                <FaSignOutAlt /> Opustit
              </button>
            )}
          </div>
        </div>

        {/* MEMBER MAIN CONTENT */}
        <div className="member-main">
          {activeTab === "Home" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">{whopData.name}</h3>
              <div className="whop-features-grid">
                {whopData.features.map((feat, idx) => (
                  <div key={idx} className="whop-feature-card">
                    {feat.image_url ? (
                      <img
                        src={feat.image_url}
                        alt={feat.title}
                        className="whop-feature-image"
                      />
                    ) : (
                      <div className="whop-feature-image-placeholder" />
                    )}
                    <div className="whop-feature-text">
                      <h3 className="whop-feature-title">{feat.title}</h3>
                      {feat.subtitle && (
                        <p className="whop-feature-subtitle">{feat.subtitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "Chat" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">Chat</h3>
              <p className="member-text">
                Chatovací sekce se připravuje nebo tam může být vložen widget.
              </p>
            </div>
          )}
          {activeTab === "Earn" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">Earn</h3>
              {campaignsLoading ? (
                <div className="spinner spinner-small"></div>
              ) : campaignsError ? (
                <p className="member-error">{campaignsError}</p>
              ) : campaigns.length === 0 ? (
                <div className="no-campaign-msg">Žádné kampaně</div>
              ) : (
                <ul className="member-campaign-list">
                  {campaigns.map((camp) => {
                    const isExpired = camp.is_active === 0;
                    return (
                      <li
                        key={camp.id}
                        className={`member-campaign-card ${
                          isExpired ? "expired" : "active"
                        }`}
                      >
                        <div className="camp-header">
                          <span className="camp-title">{camp.campaign_name}</span>
                          {isExpired ? (
                            <span className="expired-label">EXPIRED</span>
                          ) : (
                            <span className="reward-label">
                              {camp.currency}
                              {camp.reward_per_thousand.toFixed(2)} / 1K
                            </span>
                          )}
                        </div>
                        <p className="author">
                          Autor: <span className="author-name">{camp.username}</span>
                        </p>
                        <div className="paid-bar">
                          <div className="paid-info">
                            {camp.currency}
                            {camp.paid_out.toFixed(2)} z {camp.currency}
                            {camp.total_paid_out.toFixed(2)} vyplaceno
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-fill"
                              style={{
                                width: isExpired
                                  ? "100%"
                                  : `${camp.paid_percent}%`
                              }}
                            />
                          </div>
                          <div className="percent-text">
                            {isExpired ? "100%" : `${camp.paid_percent}%`}
                          </div>
                        </div>
                        <ul className="camp-details">
                          <li>
                            <strong>Typ:</strong> {camp.type}
                          </li>
                          <li>
                            <strong>Kategorie:</strong> {camp.category}
                          </li>
                          <li>
                            <strong>Platformy:</strong>
                            {camp.platforms.map((p, i) => (
                              <span key={i} className="platform-pill">
                                {p}
                              </span>
                            ))}
                          </li>
                          <li>
                            <strong>Zhlédnutí:</strong>{" "}
                            {camp.reward_per_thousand > 0
                              ? Math.round(
                                  (camp.paid_out / camp.reward_per_thousand) * 1000
                                )
                              : 0}
                          </li>
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
          {activeTab === "Tools" && (
            <div className="member-tab-content">
              <h3 className="member-subtitle">Tools</h3>
              <p className="member-text">
                Tools sekce se připravuje nebo tam mohou být doplňkové nástroje.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // 20) LANDING PAGE (visitor, not owner or member)
  // ----------------------------------------
  if (!whopData.is_owner && !whopData.is_member) {
    return (
      <div className="whop-landing">
        <div className="whop-landing-banner">
          {whopData.banner_url ? (
            <img
              src={whopData.banner_url}
              alt="Banner"
              className="whop-landing-banner-img"
            />
          ) : (
            <div className="whop-landing-banner-placeholder">Žádný banner</div>
          )}
        </div>
        <div className="whop-landing-content">
          <h1 className="whop-landing-title">{whopData.name}</h1>
          <div className="whop-members-count">
            <FaUsers /> {whopData.members_count} členů
          </div>
          <p className="whop-landing-description">{whopData.description}</p>

          {Array.isArray(whopData.pricing_plans) && whopData.pricing_plans.length > 0 && (
            <select
              className="plan-select"
              value={selectedPlanId || whopData.pricing_plans[0].id}
              onChange={(e) => setSelectedPlanId(parseInt(e.target.value, 10))}
            >
              {whopData.pricing_plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plan_name || `${p.price}/${p.billing_period}`}
                </option>
              ))}
            </select>
          )}

          <button
            className="whop-landing-join-btn"
            onClick={handleSubscribe}
            disabled={memberLoading}
          >
            {memberLoading ? (
              "Načítám…"
            ) : (
              <>
                <FaUserPlus />{" "}
                {(() => {
                  const plan = Array.isArray(whopData.pricing_plans) && selectedPlanId
                    ? whopData.pricing_plans.find((p) => p.id === selectedPlanId)
                    : null;
                  const price = plan ? plan.price : whopData.price;
                  const currency = plan ? plan.currency || whopData.currency : whopData.currency;
                  return price && parseFloat(price) > 0
                    ? `${currency}${parseFloat(price).toFixed(2)}`
                    : "Připojit se zdarma";
                })()}
              </>
            )}
          </button>

          <h2 className="features-section-title">Features</h2>
          <div className="whop-features-grid">
            {whopData.features.map((feat, idx) => (
              <div key={idx} className="whop-feature-card">
                {feat.image_url ? (
                  <img
                    src={feat.image_url}
                    alt={feat.title}
                    className="whop-feature-image"
                  />
                ) : (
                  <div className="whop-feature-image-placeholder" />
                )}
                <div className="whop-feature-text">
                  <h3 className="whop-feature-title">{feat.title}</h3>
                  {feat.subtitle && (
                    <p className="whop-feature-subtitle">{feat.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // 21) OWNER MODE
  // ----------------------------------------
  return (
    <div className="whop-container">
      {isEditing && (
        <button className="whop-back-button" onClick={handleBack} aria-label="Zpět">
          <FaArrowLeft /> Zpět
        </button>
      )}

      {/* BANNER */}
      <div className="whop-banner">
        {isEditing ? (
          <div className="whop-banner-edit-wrapper">
            {isUploadingBanner ? (
              <div className="banner-uploading">Nahrávám banner…</div>
            ) : editBannerUrl ? (
              <img
                src={editBannerUrl}
                alt="Banner Preview"
                className="whop-banner-image-edit"
              />
            ) : (
              <div className="whop-banner-placeholder-edit">Žádný banner</div>
            )}
            <input
              type="file"
              accept="image/*"
              className="whop-banner-input-edit"
              onChange={(e) => {
                const file = e.target.files[0];
                handleBannerUpload(file);
              }}
            />
            {bannerError && <div className="whop-banner-error-edit">{bannerError}</div>}
          </div>
        ) : whopData.banner_url ? (
          <img
            src={whopData.banner_url}
            alt={`${whopData.name} Banner`}
            className="whop-banner-image"
          />
        ) : (
          <div className="whop-banner-placeholder">Žádný banner</div>
        )}
      </div>

      {/* HLAVNÍ OBSAH (owner) */}
      <div className="whop-content">
        {/* HLAVIČKA: název, popis */}
        <div className="whop-header">
          {isEditing ? (
            <>
              <input
                type="text"
                className="whop-input-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Název Whopu"
              />
              <textarea
                className="whop-input-description"
                rows="2"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Stručný popis"
              />
            </>
          ) : (
            <div className="whop-header-view">
              <h1 className="whop-title">{whopData.name}</h1>
              <div className="whop-members-count">
                <FaUsers /> {whopData.members_count} členů
              </div>
              <p className="whop-description">{whopData.description}</p>
            </div>
          )}
        </div>

        {/* SLUG & Price/Period */}
        <div className="whop-slug-section">
          {(isEditing || isSlugEditing) && (
            <div className="whop-slug-edit-wrapper">
              <label className="whop-slug-label">Změň link:</label>
              <div className="whop-slug-input-wrapper">
                <span className="whop-slug-prefix">wrax.com/c/</span>
                <input
                  type="text"
                  className="whop-slug-input"
                  value={newSlugValue}
                  onChange={(e) => setNewSlugValue(e.target.value)}
                  disabled={!isSlugEditing}
                />
              </div>
              {slugError && <div className="whop-slug-error">{slugError}</div>}
              {isSlugEditing ? (
                <button className="whop-slug-save-btn" onClick={handleSlugSave}>
                  <FaSave /> Uložit link
                </button>
              ) : (
                <button
                  className="whop-slug-edit-btn"
                  onClick={() => {
                    setIsSlugEditing(true);
                    setIsEditing(false);
                    setSlugError("");
                  }}
                >
                  <FaLink /> Změnit link
                </button>
              )}
            </div>
          )}
        </div>

        {/* PRICE / PERIOD (owner edit) */}
        <div className="whop-price-section">
          {isEditing ? (
            <div className="price-edit-wrapper">
              {editPricingPlans.length === 0 && (
                <>
                  <div className="price-field">
                    <label>Cena (např. 10.00)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={whopData.price ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWhopData((prev) => ({
                          ...prev,
                          price: val !== "" ? parseFloat(val) : 0
                        }));
                      }}
                    />
                  </div>
                  <div className="price-field">
                    <label>Měna</label>
                    <input
                      type="text"
                      value={whopData.currency || "USD"}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setWhopData((prev) => ({ ...prev, currency: val }));
                      }}
                    />
                  </div>
                  <div className="price-field">
                    <label>Předplatné</label>
                    <select
                      value={whopData.is_recurring ? "1" : "0"}
                      onChange={(e) => {
                        const rec = parseInt(e.target.value, 10);
                        setWhopData((prev) => ({ ...prev, is_recurring: rec }));
                      }}
                    >
                      <option value="0">Jednorázově</option>
                      <option value="1">Opakované</option>
                    </select>
                  </div>
                  {whopData.is_recurring ? (
                    <div className="price-field">
                      <label>Perioda</label>
                      <select
                        value={whopData.billing_period || ""}
                        onChange={(e) => {
                          const period = e.target.value;
                          setWhopData((prev) => ({ ...prev, billing_period: period }));
                        }}
                      >
                        <option value="1 minute">1 minute</option>
                        <option value="7 days">7 days</option>
                        <option value="14 days">14 days</option>
                        <option value="30 days">30 days</option>
                        <option value="1 year">1 year</option>
                      </select>
                    </div>
                  ) : null}
                </>
              )}

              {editPricingPlans.map((p, idx) => (
                <div key={p.id} className="price-field plan-field">
                  <label>Plan {idx + 1}</label>
                  <input
                    type="text"
                    value={p.plan_name}
                    onChange={(e) => handlePlanChange(p.id, "plan_name", e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={p.price}
                    onChange={(e) => handlePlanChange(p.id, "price", e.target.value)}
                  />
                  <input
                    type="text"
                    value={p.currency}
                    onChange={(e) => handlePlanChange(p.id, "currency", e.target.value.toUpperCase())}
                    className="plan-currency"
                  />
                  <select
                    value={p.billing_period}
                    onChange={(e) => handlePlanChange(p.id, "billing_period", e.target.value)}
                  >
                    <option value="7 days">7 days</option>
                    <option value="14 days">14 days</option>
                    <option value="30 days">30 days</option>
                    <option value="1 year">1 year</option>
                  </select>
                  <button onClick={() => removePlan(p.id)}>-</button>
                </div>
              ))}
              <button className="add-plan-btn" onClick={addPlan}>Add Plan</button>
            </div>
          ) : (
            <div className="price-view-wrapper">
              {(!whopData.price || parseFloat(whopData.price) <= 0) ? (
                <span className="price-free">Cost: Free</span>
              ) : (
                <span className="price-info">
                  {whopData.currency}
                  {parseFloat(whopData.price).toFixed(2)}{" "}
                  {whopData.is_recurring
                    ? `(Opakuje se každých ${whopData.billing_period})`
                    : `(Jednorázově)`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="whop-action-btns">
          {isEditing ? (
            <>
              <button className="whop-save-btn" onClick={handleSave}>
                <FaSave /> Uložit
              </button>
              <button className="whop-cancel-btn" onClick={() => setIsEditing(false)}>
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
            </>
          )}
        </div>

        {/* FEATURES SECTION */}
        <div className="whop-features-section">
          <h2 className="features-section-title">Features</h2>
          {isEditing ? (
            <>
              {editFeatures.map((feat, idx) => (
                <div key={feat.id} className="feature-card-edit">
                  <div className="feature-number-edit">Feature {idx + 1}</div>
                  <div className="feature-field-edit">
                    <label>Title *</label>
                    <input
                      type="text"
                      className="feature-input-edit"
                      value={feat.title}
                      onChange={(e) => handleFeatChange(feat.id, "title", e.target.value)}
                      placeholder="Název funkce"
                    />
                  </div>
                  <div className="feature-field-edit">
                    <label>Subtitle (volitelně)</label>
                    <textarea
                      className="feature-textarea-edit"
                      rows="1"
                      value={feat.subtitle}
                      onChange={(e) =>
                        handleFeatChange(feat.id, "subtitle", e.target.value)
                      }
                      placeholder="Krátký popisek"
                    />
                  </div>
                  <div className="feature-field-edit">
                    <label>Image *</label>
                    <div className="feature-image-wrapper-edit">
                      {feat.isUploading ? (
                        <div className="feature-image-uploading">Nahrávám…</div>
                      ) : feat.imageUrl ? (
                        <img
                          src={feat.imageUrl}
                          alt={`Feature ${idx + 1}`}
                          className="feature-image-preview-edit"
                        />
                      ) : (
                        <div className="feature-image-placeholder-edit">
                          Žádný obrázek
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="feature-image-input-edit"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          handleImageChange(feat.id, file);
                        }}
                      />
                      {feat.error && (
                        <div className="feature-image-error-edit">{feat.error}</div>
                      )}
                    </div>
                  </div>
                  {editFeatures.length > 2 && (
                    <button
                      className="feature-remove-btn-edit"
                      onClick={() => removeFeature(feat.id)}
                    >
                      <FaTrash /> Odebrat
                    </button>
                  )}
                </div>
              ))}
              {editFeatures.length < 6 && (
                <button className="feature-add-btn-edit" onClick={addFeature}>
                  <FaPlus /> Přidat Feature
                </button>
              )}
            </>
          ) : (
            <div className="whop-features-grid">
              {whopData.features.map((feat, idx) => (
                <div key={idx} className="whop-feature-card">
                  {feat.image_url ? (
                    <img
                      src={feat.image_url}
                      alt={feat.title}
                      className="whop-feature-image"
                    />
                  ) : (
                    <div className="whop-feature-image-placeholder" />
                  )}
                  <div className="whop-feature-text">
                    <h3 className="whop-feature-title">{feat.title}</h3>
                    {feat.subtitle && (
                      <p className="whop-feature-subtitle">{feat.subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OWNER: Campaigns Section */}
        {whopData.is_owner && (
          <div className="whop-campaigns-section">
            <h2 className="campaigns-section-title">Kampaně</h2>
            {campaignsLoading ? (
              <p className="campaigns-loading">Načítám kampaně…</p>
            ) : campaignsError ? (
              <p className="campaigns-error">{campaignsError}</p>
            ) : campaigns.length === 0 ? (
              <p className="campaigns-empty">Žádné kampaně k zobrazení.</p>
            ) : (
              <div className="whop-campaigns-list">
                {campaigns.map((camp) => {
                  const isExpired = camp.is_active === 0;
                  return (
                    <div key={camp.id} className="whop-campaign-item">
                      <h3 className="campaign-item-title">{camp.campaign_name}</h3>
                      <p className="campaign-item-detail">
                        <strong>Kategorie:</strong> {camp.category}
                      </p>
                      <p className="campaign-item-detail">
                        <strong>Budget:</strong> {camp.currency}
                        {camp.budget.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                      <p className="campaign-item-detail">
                        <strong>Typ:</strong> {camp.type}
                      </p>
                      <div className="campaign-status-row">
                        {isExpired ? (
                          <span className="expired-label">EXPIRED</span>
                        ) : (
                          <span className="active-label">ACTIVE</span>
                        )}
                        {!isExpired && (
                          <button
                            className="expire-btn"
                            onClick={() => handleExpire(camp.id)}
                          >
                            Expire
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OWNER: Members / Subscriptions Section */}
        {whopData.is_owner && (
          <div className="whop-members-section">
            <h2 className="members-section-title">Členové (placené Whopy)</h2>
            {membersLoading ? (
              <p className="members-loading">Načítám členy…</p>
            ) : membersError ? (
              <p className="members-error">{membersError}</p>
            ) : membershipsList.length === 0 ? (
              <p className="members-empty">Žádní členové (placené Whopy)</p>
            ) : (
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Uživatel</th>
                    <th>Cena</th>
                    <th>Perioda</th>
                    <th>Začátek</th>
                    <th>Další platba</th>
                    <th>Stav</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {membershipsList.map((m) => {
                    const start = new Date(m.start_at).toLocaleString();
                    const nextPay = m.next_payment_at
                      ? new Date(m.next_payment_at).toLocaleString()
                      : "-";
                    const periodText = m.is_recurring
                      ? m.billing_period
                      : "Jednorázově";
                    return (
                      <tr key={m.user_id}>
                        <td>{m.username}</td>
                        <td>
                          {m.currency}
                          {parseFloat(m.price).toFixed(2)}
                        </td>
                        <td>{periodText}</td>
                        <td>{start}</td>
                        <td>{nextPay}</td>
                        <td>{m.status}</td>
                        <td>
                          {m.status === "active" ? (
                            <button
                              className="member-cancel-btn"
                              onClick={() => handleCancelMember(m.user_id)}
                            >
                              Zrušit
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal for creating a campaign */}
      {isCampaignModalOpen && (
        <Modal
          isOpen={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
        >
          <CardForm
            whopId={whopData.id}
            onClose={() => setIsCampaignModalOpen(false)}
            onRefresh={() => fetchCampaigns(whopData.id)}
          />
        </Modal>
      )}
    </div>
  );

  // ----------------------------------------
  // 22) Helper: Cancel a paid member (owner)
  // ----------------------------------------
  async function handleCancelMember(memberUserId) {
    try {
      await showConfirm("Opravdu zrušit toto předplatné?");
    } catch {
      return;
    }
    try {
      const payload = { whop_id: whopData.id, user_id: memberUserId };
      const res = await fetch("https://app.byxbot.com/php/cancel_membership.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        showNotification({ type: "error", message: json.message || "Nepodařilo se zrušit předplatné." });
      } else {
        showNotification({ type: "success", message: "Předplatné zrušeno." });
        fetchWhopMembers();
      }
    } catch (err) {
      console.error("Chyba při rušení členství:", err);
      showNotification({ type: "error", message: "Chyba při rušení členství." });
    }
  }
}
