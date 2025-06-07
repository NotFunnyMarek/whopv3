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
  FaLink,
} from "react-icons/fa";
import Confetti from "react-confetti";

import Modal from "../components/Modal";
import CardForm from "../components/CardForm";
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

  // Stav pro fullscreen overlay
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whopData, setWhopData] = useState(null);

  // Owner stavy
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [editFeatures, setEditFeatures] = useState([]);

  // Slug edit
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [newSlugValue, setNewSlugValue] = useState("");
  const [slugError, setSlugError] = useState("");

  // Campaign modal
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Campaigny
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState("");

  // Member režim
  const [activeTab, setActiveTab] = useState("Home");
  const [memberLoading, setMemberLoading] = useState(false);

  // Režim “View as Member”
  const [viewAsMemberMode, setViewAsMemberMode] = useState(false);

  // —————————————————————
  // 1) Načtení Whopu
  // —————————————————————
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
        setWhopData(json.data);

        // Pokud owner, připravíme stavy pro edit
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
              error: "",
            }))
          );
          await fetchCampaigns(json.data.id);
        }

        // Pokud member (ale ne owner), načteme kampaně
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

  // —————————————————————
  // 2) Fetch kampaní
  // —————————————————————
  const fetchCampaigns = async (whopId) => {
    setCampaignsLoading(true);
    setCampaignsError("");
    try {
      const res = await fetch(`${CAMPAIGN_API_URL}?whop_id=${whopId}`, {
        method: "GET",
        credentials: "include",
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

  // —————————————————————
  // 3) Join Whop (member) – s fullscreen loading + confetti + odložený fade‐out
  // —————————————————————
  const handleJoin = async () => {
    if (!whopData) return;

    // 1) Okamžitě zobrazíme overlay (bez fade)
    setOverlayVisible(true);
    setOverlayFading(false);
    setMemberLoading(true);

    // Přidáme listener pro případné změny velikosti okna
    const resizeListener = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resizeListener);

    try {
      const res = await fetch("https://app.byxbot.com/php/join_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ whop_id: whopData.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Nepodařilo se připojit.");
        // 2) Pokud se nepodařilo, odložíme fade‐out o 2 sekundy:
        setTimeout(() => {
          setOverlayFading(true);
        }, 3500);

        setMemberLoading(false);
        window.removeEventListener("resize", resizeListener);
        return;
      }

      // 3) Po úspěšném joinu načteme data a kampaně
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      // 4) Spustíme fade‐out rovněž po 2 sekundách:
      setTimeout(() => {
        setOverlayFading(true);
      }, 2000);

      setMemberLoading(false);
      window.removeEventListener("resize", resizeListener);
    }
  };

  // —————————————————————
  // 4) Leave Whop (member)
  // —————————————————————
  const handleLeave = async () => {
    if (!whopData) return;
    setMemberLoading(true);
    try {
      const res = await fetch("https://app.byxbot.com/php/leave_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ whop_id: whopData.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Nepodařilo se opustit.");
        setMemberLoading(false);
        return;
      }
      // Načteme Whop bez členství
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMemberLoading(false);
    }
  };

  // —————————————————————
  // 5) Upload banner (owner)
  // —————————————————————
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
        body: formData,
      });
      if (!res.ok) throw new Error(`Cloudinary chybička: ${res.status}`);
      const data = await res.json();
      if (!data.secure_url) throw new Error("Chyba URL.");
      setEditBannerUrl(data.secure_url);
      setBannerError("");
    } catch (err) {
      console.error(err);
      setBannerError("Nepodařilo se nahrát banner.");
      setEditBannerUrl("");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // —————————————————————
  // 6) Upload feature image (owner)
  // —————————————————————
  const handleImageChange = async (id, file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, error: "Max 5 MB.", isUploading: false }
            : f
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
      prev.map((f) => (f.id === id ? { ...f, isUploading: true, error: "" } : f))
    );
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
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
    } catch (err) {
      console.error(err);
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageUrl: "", isUploading: false, error: "Nepodařilo se." }
            : f
        )
      );
    }
  };

  // —————————————————————
  // 7) Přidání feature
  // —————————————————————
  const addFeature = () => {
    if (editFeatures.length >= 6) return;
    const newId =
      editFeatures.length > 0
        ? Math.max(...editFeatures.map((f) => f.id)) + 1
        : 1;
    setEditFeatures((prev) => [
      ...prev,
      { id: newId, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
    ]);
  };

  // —————————————————————
  // 8) Odebrání feature
  // —————————————————————
  const removeFeature = (id) => {
    if (editFeatures.length <= 2) return;
    setEditFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  // —————————————————————
  // 9) Změna field ve feature
  // —————————————————————
  const handleFeatChange = (id, field, value) => {
    setEditFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // —————————————————————
  // 10) Uložení slug (owner)
  // —————————————————————
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
        body: JSON.stringify(payload),
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
      navigate(`/c/${trimmed}`);
    } catch (err) {
      console.error(err);
      setSlugError("Síťová chyba.");
    }
  };

  // —————————————————————
  // 11) Uložení změn Whopu (owner)
  // —————————————————————
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
    const payload = {
      slug: whopData.slug,
      name: editName.trim(),
      description: editDescription.trim(),
      bannerUrl: editBannerUrl.trim(),
      features: validFeats.map((f) => ({
        title: f.title.trim(),
        subtitle: f.subtitle.trim(),
        image_url: f.imageUrl,
      })),
    };
    try {
      const res = await fetch("https://app.byxbot.com/php/update_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
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
      setIsEditing(false);
      // Refresh Whop
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
        setWhopData(refreshJson.data);
        setEditName(refreshJson.data.name);
        setEditDescription(refreshJson.data.description);
        setEditBannerUrl(refreshJson.data.banner_url || "");
        const newFeatArr = refreshJson.data.features.map((f, idx) => ({
          id: idx + 1,
          title: f.title,
          subtitle: f.subtitle,
          imageUrl: f.image_url,
          isUploading: false,
          error: "",
        }));
        setEditFeatures(newFeatArr);
        setError("");
        setBannerError("");
        setSlugError("");
      }
    } catch (err) {
      console.error(err);
      setError("Síťová chyba.");
    }
  };

  // —————————————————————
  // 12) Smazání Whopu (owner)
  // —————————————————————
  const handleDelete = async () => {
    if (!window.confirm("Opravdu smazat Whop?")) return;
    try {
      const payload = { slug: whopData.slug };
      const res = await fetch("https://app.byxbot.com/php/delete_whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
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
        setError(json.message || "Nepovedlo se smazat.");
        return;
      }
      navigate("/onboarding");
    } catch (err) {
      console.error(err);
      setError("Síťová chyba.");
    }
  };

  // —————————————————————
  // 13) Back button (owner)
  // —————————————————————
  const handleBack = () => {
    navigate("/onboarding");
  };

  // —————————————————————
  // 14) Expirace kampaně (owner)
  // —————————————————————
  const handleExpire = async (campaignId) => {
    if (!window.confirm("Označit kampaň jako EXPIRY?")) return;
    try {
      const res = await fetch(EXPIRE_CAMPAIGN_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Nepodařilo se");
        return;
      }
      if (whopData) {
        await fetchCampaigns(whopData.id);
      }
    } catch (err) {
      console.error(err);
      alert("Síťová chyba.");
    }
  };

  // —————————————————————
  // Udržování velikosti okna pro confetti
  // —————————————————————
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // —————————————————————
  // RENDER
  // —————————————————————

  // Fullscreen overlay s confetti a fade‐out
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

  // Pokud načítání Whopu
  if (loading) {
    return (
      <div className="whop-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Pokud chyba načtení
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

  // —————————————————————
  // REŽIM „View as Member“ (majitel se dívá jako člen)
  // —————————————————————
  if (viewAsMemberMode) {
    return (
      <div className="member-container">
        {/* Back to Dashboard tlačítko */}
        <button
          className="whop-back-button view-as-member-back"
          onClick={() => setViewAsMemberMode(false)}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* LEVÝ SIDEBAR */}
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

        {/* HLAVNÍ OBSAH */}
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
                                  : `${camp.paid_percent}%`,
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

  // —————————————————————
  // Member režim (skutečný člen, ne owner)
  // —————————————————————
  if (whopData.is_member && !whopData.is_owner) {
    return (
      <div className="member-container">
        {/* LEVÝ SIDEBAR */}
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

        {/* HLAVNÍ OBSAH */}
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
                                  : `${camp.paid_percent}%`,
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

  // —————————————————————
  // Nepřipojený uživatel (landing page)
  // —————————————————————
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
          <button
            className="whop-landing-join-btn"
            onClick={handleJoin}
            disabled={memberLoading}
          >
            {memberLoading ? "Načítám…" : (
              <>
                <FaUserPlus /> Připojit se
              </>
            )}
          </button>

          {/* Zobrazit Features i na landing page */}
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

  // —————————————————————
  // Owner režim
  // —————————————————————
  return (
    <div className="whop-container">
      {isEditing && (
        <button className="whop-back-button" onClick={handleBack} aria-label="Zpět">
          <FaArrowLeft /> Zpět
        </button>
      )}

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

      <div className="whop-content">
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
                          maximumFractionDigits: 2,
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
      </div>

      {isCampaignModalOpen && (
        <Modal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)}>
          <CardForm
            whopId={whopData.id}
            onClose={() => setIsCampaignModalOpen(false)}
            onRefresh={() => fetchCampaigns(whopData.id)}
          />
        </Modal>
      )}
    </div>
  );
}
