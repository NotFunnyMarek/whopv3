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
import Modal from "../components/Modal";
import CardForm from "../components/CardForm";
import "../styles/whop-dashboard.scss";

// Konstanty pro Cloudinary
const CLOUDINARY_CLOUD_NAME = "dv6igcvz8";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_profile_avatars";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

// API URL pro kampaně a expiraci
const CAMPAIGN_API_URL = "https://app.byxbot.com/php/campaign.php";
const EXPIRE_CAMPAIGN_URL = "https://app.byxbot.com/php/expire_campaign.php";

export default function WhopDashboard() {
  const { slug: initialSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Stav načítání / chyby
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data o whopu (z get_whop.php)
  const [whopData, setWhopData] = useState(null);

  // Pro úpravy (owner)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [editFeatures, setEditFeatures] = useState([]);

  // Pro úpravu slug
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [newSlugValue, setNewSlugValue] = useState("");
  const [slugError, setSlugError] = useState("");

  // Modal pro vytvoření kampaně (owner)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Kampaně pro daný whop (owner i member)
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState("");

  // Pro členy (member) – aktivní záložka
  const [activeTab, setActiveTab] = useState("Earn");
  const [memberLoading, setMemberLoading] = useState(false);

  // 1) On mount / změna URL – načteme whop
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
          {
            method: "GET",
            credentials: "include",
          }
        );
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          setError("Chyba při zpracování odpovědi serveru.");
          setLoading(false);
          return;
        }
        if (!res.ok || json.status !== "success") {
          setError(json.message || "Nepodařilo se načíst data Whopu.");
          setLoading(false);
          return;
        }

        setWhopData(json.data);

        // Pokud je owner, připravíme stavy pro edit a načteme kampaně
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

        // Pokud je člen (member) (a není zároveň owner), načteme kampaně pro Earn
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

  // 2) Fetch kampaní pro owner i member
  const fetchCampaigns = async (whopId) => {
    setCampaignsLoading(true);
    setCampaignsError("");
    try {
      const res = await fetch(`${CAMPAIGN_API_URL}?whop_id=${whopId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Chyba ${res.status}`);
      }
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      setCampaignsError("Nelze načíst kampaně: " + err.message);
    } finally {
      setCampaignsLoading(false);
    }
  };

  // 3) Join Whop (pro členy)
  const handleJoin = async () => {
    if (!whopData) return;
    setMemberLoading(true);
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
        setMemberLoading(false);
        return;
      }
      // Po úspěchu refresh whopu i kampaní
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
      setMemberLoading(false);
    }
  };

  // 4) Leave Whop (pro členy)
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
      // Po úspěchu refresh whopu (už není člen)
      const refresh = await fetch(
        `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
          whopData.slug
        )}`,
        { method: "GET", credentials: "include" }
      );
      const refreshed = await refresh.json();
      if (refresh.ok && refreshed.status === "success") {
        setWhopData(refreshed.data);
        setCampaigns([]); // vyprázdníme seznam kampaní
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMemberLoading(false);
    }
  };

  // 5) Upload banner pro owner
  const handleBannerUpload = async (file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setBannerError("Banner je příliš velký (max 5 MB).");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setBannerError("Vyberte platný obrázek pro banner.");
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
      if (!res.ok) {
        throw new Error(`Chyba při nahrávání na Cloudinary: ${res.status}`);
      }
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error("Nepodařilo se získat secure_url z Cloudinary.");
      }
      setEditBannerUrl(data.secure_url);
      setBannerError("");
    } catch (err) {
      console.error("Cloudinary banner upload error:", err);
      setBannerError("Chyba při nahrávání banneru.");
      setEditBannerUrl("");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // 6) Upload obrázku pro feature pro owner
  const handleImageChange = async (id, file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, error: "Obrázek je příliš velký (max 5 MB).", isUploading: false }
            : f
        )
      );
      return;
    }
    if (!file.type.startsWith("image/")) {
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, error: "Vyberte platný obrázek.", isUploading: false }
            : f
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
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Chyba při nahrávání na Cloudinary: ${res.status}`);
      }
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error("Nepodařilo se získat secure_url z Cloudinary.");
      }
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageUrl: data.secure_url, isUploading: false, error: "" }
            : f
        )
      );
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setEditFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageUrl: "", isUploading: false, error: "Chyba při nahrávání obrázku." }
            : f
        )
      );
    }
  };

  // 7) Přidání nové feature (owner)
  const addFeature = () => {
    if (editFeatures.length >= 6) return;
    const newId =
      editFeatures.length > 0 ? Math.max(...editFeatures.map((f) => f.id)) + 1 : 1;
    setEditFeatures((prev) => [
      ...prev,
      { id: newId, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
    ]);
  };

  // 8) Odebrání feature (owner)
  const removeFeature = (id) => {
    if (editFeatures.length <= 2) return;
    setEditFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  // 9) Změna title/subtitle ve features (owner)
  const handleFeatChange = (id, field, value) => {
    setEditFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // 10) Uložení nového slugu (owner)
  const handleSlugSave = async () => {
    setSlugError("");
    const trimmed = newSlugValue.trim();
    if (!trimmed) {
      setSlugError("Slug nesmí být prázdný.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setSlugError("Slug může obsahovat pouze písmena, čísla, pomlčky a podtržítka.");
      return;
    }
    try {
      const payload = {
        oldSlug: whopData.slug,
        newSlug: trimmed,
      };
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
        setSlugError("Chyba při zpracování odpovědi serveru.");
        return;
      }
      if (!res.ok || json.status !== "success") {
        setSlugError(json.message || "Chyba při aktualizaci slug.");
        return;
      }
      // Přesměrujeme na nový slug
      navigate(`/c/${trimmed}`);
    } catch (err) {
      console.error("Network error update_whop_slug.php:", err);
      setSlugError("Síťová chyba: " + err.message);
    }
  };

  // 11) Uložení změn Whopu (name, description, banner, features) (owner)
  const handleSave = async () => {
    if (!editName.trim() || !editDescription.trim()) {
      setError("Název a popis nesmí být prázdné.");
      return;
    }
    const validFeats = editFeatures.filter((f) => f.title.trim() && f.imageUrl);
    if (validFeats.length < 2) {
      setError("Musíš mít alespoň 2 platné features (title + obrázek).");
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
        setError("Chyba při zpracování odpovědi serveru.");
        return;
      }
      if (!res.ok || json.status !== "success") {
        setError(json.message || "Chyba při ukládání.");
        return;
      }

      // Po úspěšném uložení přepneme z edit módu a načteme aktualizovaná data
      setIsEditing(false);
      const refreshRes = await fetch(
        `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
          whopData.slug
        )}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const refreshText = await refreshRes.text();
      let refreshJson;
      try {
        refreshJson = JSON.parse(refreshText);
      } catch {
        return;
      }
      if (!refreshRes.ok || refreshJson.status !== "success") {
        return;
      }
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
    } catch (err) {
      console.error("Network error při update_whop.php:", err);
      setError("Síťová chyba: " + err.message);
    }
  };

  // 12) Smazání Whopu (owner)
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Opravdu chcete smazat celý tento Whop? Tato akce je nevratná."
      )
    ) {
      return;
    }
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
        setError("Chyba při mazání: neplatná odpověď serveru.");
        return;
      }
      if (!res.ok || json.status !== "success") {
        setError(json.message || "Chyba při mazání Whopu.");
        return;
      }
      navigate("/onboarding");
    } catch (err) {
      console.error("Network error delete_whop.php:", err);
      setError("Síťová chyba: " + err.message);
    }
  };

  // 13) Back do Onboardingu (v edit módu) (owner)
  const handleBack = () => {
    navigate("/onboarding");
  };

  // 14) Expirace kampaně (owner) – volá PHP endpoint
  const handleExpire = async (campaignId) => {
    if (!window.confirm("Opravdu chcete tuto kampaň označit jako EXPIRED?")) {
      return;
    }
    try {
      const res = await fetch(EXPIRE_CAMPAIGN_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Chyba ${res.status}`);
        return;
      }
      // Po úspěchu přenačteme kampaně
      if (whopData) {
        await fetchCampaigns(whopData.id);
      }
    } catch (err) {
      console.error(err);
      alert("Síťová chyba: " + err.message);
    }
  };

  // Pokud se načítá, zobrazíme spinner
  if (loading) {
    return (
      <div className="whop-loading">
        <div className="spinner" />
      </div>
    );
  }

  // Pokud chyba
  if (error) {
    return (
      <div className="whop-error">
        <p>{error}</p>
        <button onClick={() => navigate("/onboarding")}>← Back</button>
      </div>
    );
  }

  // Pokud nemáme data
  if (!whopData) {
    return null;
  }

  // 15) Režim: ČLEN (is_member === true, ale není owner)
  if (whopData.is_member && !whopData.is_owner) {
    return (
      <div className="member-container">
        {/* Levý sidebar s bannerem, názvem, počtem členů, nav, leave */}
        <div className="member-sidebar">
          <div className="member-banner">
            {whopData.banner_url ? (
              <img src={whopData.banner_url} alt="Banner" />
            ) : (
              <div className="member-banner-placeholder">No Banner</div>
            )}
          </div>
          <div className="member-info">
            <h2 className="member-title">{whopData.name}</h2>
            <div className="member-members-count">
              <FaUsers /> {whopData.members_count} připojených uživatelů
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
              <div className="spinner-small" />
            ) : (
              <button className="leave-button" onClick={handleLeave}>
                <FaSignOutAlt /> Leave
              </button>
            )}
          </div>
        </div>

        {/* Hlavní obsah */}
        <div className="member-main">
          {activeTab === "Home" && (
            <div className="member-tab-content">
              <h3>Home</h3>
              <p>
                Vítejte v Home sekci. Zde můžete zobrazit uvítací zprávu nebo
                další informace.
              </p>
            </div>
          )}
          {activeTab === "Chat" && (
            <div className="member-tab-content">
              <h3>Chat</h3>
              <p>
                Chatovací sekce je zatím prázdná nebo zde můžete integrovat
                chatovací widget.
              </p>
            </div>
          )}
          {activeTab === "Earn" && (
            <div className="member-tab-content">
              <h3>Earn</h3>
              {campaignsLoading ? (
                <div className="spinner-small" />
              ) : campaignsError ? (
                <p className="member-error">{campaignsError}</p>
              ) : campaigns.length === 0 ? (
                <div className="no-campaign-msg">No Campaign</div>
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
                          Author: <span className="author-name">{camp.username}</span>
                        </p>
                        <div className="paid-bar">
                          <div className="paid-info">
                            {camp.currency}
                            {camp.paid_out.toFixed(2)} of{" "}
                            {camp.currency}
                            {camp.total_paid_out.toFixed(2)} paid out
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-fill"
                              style={{
                                width: isExpired ? "100%" : `${camp.paid_percent}%`,
                              }}
                            ></div>
                          </div>
                          <div className="percent-text">
                            {isExpired ? "100%" : `${camp.paid_percent}%`}
                          </div>
                        </div>
                        <ul className="camp-details">
                          <li>
                            <strong>Type:</strong> {camp.type}
                          </li>
                          <li>
                            <strong>Category:</strong> {camp.category}
                          </li>
                          <li>
                            <strong>Platforms:</strong>
                            {camp.platforms.map((p, i) => (
                              <span key={i} className="platform-pill">
                                {p}
                              </span>
                            ))}
                          </li>
                          <li>
                            <strong>Views:</strong>{" "}
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
              <h3>Tools</h3>
              <p>
                Tools sekce je zatím prázdná nebo zde můžete přidat doplňkové
                nástroje.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 16) Režim: VLASTNÍK nebo nikdo není připojený
  return (
    <div className="whop-container">
      {/* Back button (pouze v edit módu Whopu) */}
      {isEditing && (
        <button className="whop-back-btn" onClick={handleBack} aria-label="Go back">
          <FaArrowLeft /> Back
        </button>
      )}

      {/* ======== BANNER ======== */}
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
              <div className="whop-banner-placeholder-edit">
                <span>No banner selected</span>
              </div>
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
          <div className="whop-banner-placeholder">
            <span>No banner selected</span>
          </div>
        )}
      </div>

      {/* ======== OBSAH POD BANNEREM ======== */}
      <div className="whop-content">
        {/* --- Název a popis Whopu --- */}
        <div className="whop-header">
          {isEditing ? (
            <>
              <input
                type="text"
                className="whop-input-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <textarea
                className="whop-input-description"
                rows="2"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </>
          ) : (
            <div className="whop-header-view">
              <h1 className="whop-title">{whopData.name}</h1>
              <div className="whop-members-count">
                <FaUsers /> {whopData.members_count} připojených uživatelů
              </div>
              <p className="whop-description">{whopData.description}</p>
            </div>
          )}
        </div>

        {/* --- Slug / Link Whopu --- */}
        <div className="whop-slug-section">
          {isEditing || isSlugEditing ? (
            <div className="whop-slug-edit-wrapper">
              <label>Změň link:</label>
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
                  <FaSave /> Save Link
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
                  <FaLink /> Change Link
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* --- Akční tlačítka: Edit / Delete / Create Campaign / Join (pro owner/nepřipojené) --- */}
        <div className="whop-action-btns">
          {isEditing ? (
            <>
              <button className="whop-save-btn" onClick={handleSave}>
                <FaSave /> Save
              </button>
              <button className="whop-cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : whopData.is_owner ? (
            <>
              <button className="whop-edit-btn" onClick={() => setIsEditing(true)}>
                <FaEdit /> Edit
              </button>
              <button className="whop-delete-btn" onClick={handleDelete}>
                <FaTrash /> Delete
              </button>
              <button
                className="whop-create-camp-btn"
                onClick={() => setIsCampaignModalOpen(true)}
              >
                <FaPlus /> Create Campaign
              </button>
            </>
          ) : !whopData.is_member ? (
            <button className="whop-join-btn" onClick={handleJoin}>
              <FaUserPlus /> Join
            </button>
          ) : null}
        </div>

        {/* --- Sekce Features --- */}
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
                    />
                  </div>
                  <div className="feature-field-edit">
                    <label>Subtitle (optional)</label>
                    <textarea
                      className="feature-textarea-edit"
                      rows="1"
                      value={feat.subtitle}
                      onChange={(e) =>
                        handleFeatChange(feat.id, "subtitle", e.target.value)
                      }
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
                          No image selected
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
                      <FaTrash /> Remove
                    </button>
                  )}
                </div>
              ))}
              {editFeatures.length < 6 && (
                <button className="feature-add-btn-edit" onClick={addFeature}>
                  <FaPlus /> Add Feature
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

        {/* ===== Sekce s existujícími kampaněmi (pro owner) ===== */}
        {whopData.is_owner && (
          <div className="whop-campaigns-section">
            <h2 className="campaigns-section-title">Kampaně</h2>
            {campaignsLoading ? (
              <p>Načítám kampaně…</p>
            ) : campaignsError ? (
              <p className="campaigns-error">{campaignsError}</p>
            ) : campaigns.length === 0 ? (
              <p>Žádné kampaně k zobrazení.</p>
            ) : (
              <div className="whop-campaigns-list">
                {campaigns.map((camp) => {
                  const isExpired = camp.is_active === 0;
                  return (
                    <div key={camp.id} className="whop-campaign-item">
                      <h3>{camp.campaign_name}</h3>
                      <p>Category: {camp.category}</p>
                      <p>
                        Budget: {camp.currency}
                        {camp.budget.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p>Type: {camp.type}</p>
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

      {/* ===== Modal pro vytváření kampaně (pro owner) ===== */}
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
    </div>
  );
}
