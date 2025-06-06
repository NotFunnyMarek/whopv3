// src/pages/WhopDashboard.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaSave,
  FaEdit,
  FaArrowLeft,
  FaUserPlus,
} from "react-icons/fa";
import "../styles/whop-dashboard.scss";

export default function WhopDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Stav pro data whopu (včetně is_owner)
  const [whopData, setWhopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stav, zda jsme v edit módu
  const [isEditing, setIsEditing] = useState(false);

  // Lokální editační stavy
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");

  const [editFeatures, setEditFeatures] = useState([
    /* Každý prvek: 
       { id: číslo, title: string, subtitle: string, imageUrl: string, isUploading: boolean, error: string }
    */
  ]);

  // Po načtení komponenty stáhneme data z get_whop.php
  useEffect(() => {
    const fetchWhop = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(slug)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (parseErr) {
          console.error("Neplatný JSON z get_whop.php:", text);
          setError("Chyba při zpracování odpovědi serveru.");
          setLoading(false);
          return;
        }
        if (!res.ok || json.status !== "success") {
          const msg = json.message || "Nepodařilo se načíst data";
          setError(msg);
          setLoading(false);
          return;
        }

        // Uložíme data do stavu
        setWhopData(json.data);

        // Naplníme editační stavy
        setEditName(json.data.name);
        setEditDescription(json.data.description);
        setEditBannerUrl(json.data.banner_url || "");

        // Převedeme features do lokální podoby
        const featArr = json.data.features.map((f, idx) => ({
          id: idx + 1,
          title: f.title,
          subtitle: f.subtitle,
          imageUrl: f.image_url,
          isUploading: false,
          error: "",
        }));
        setEditFeatures(featArr);
      } catch (err) {
        console.error("Chyba při fetch get_whop.php:", err);
        setError("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWhop();
  }, [slug]);

  // ===== Handler pro tlačítko Back (v editačním módu) =====
  const handleBack = () => {
    navigate("/onboarding");
  };

  // ===== Přepnutí do edit módu =====
  const handleEditToggle = () => {
    setIsEditing(true);
    setError("");
    setBannerError("");
  };

  // ===== Handler pro uložení změn (banner, name, description, features) =====
  const handleSave = async () => {
    // Validace: name a description nesmí být prázdné
    if (!editName.trim() || !editDescription.trim()) {
      setError("Název a popis nesmí být prázdné.");
      return;
    }
    // Validace: alespoň 2 platné features (title + imageUrl)
    const validFeats = editFeatures.filter(
      (f) => f.title.trim() && f.imageUrl
    );
    if (validFeats.length < 2) {
      setError("Musíš mít alespoň 2 platné features (title + obrázek).");
      return;
    }

    // Sestavíme payload pro update_whop.php
    const payload = {
      slug: slug,
      name: editName.trim(),
      description: editDescription.trim(),
      bannerUrl: editBannerUrl.trim(), // banner_url se pošle sem
      features: validFeats.map((f) => ({
        title: f.title.trim(),
        subtitle: f.subtitle.trim(),
        imageUrl: f.imageUrl,
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
      } catch (parseErr) {
        console.error("Nepodařilo se rozparsovat JSON z update_whop.php:", text);
        setError("Chyba při zpracování odpovědi serveru.");
        return;
      }
      if (!res.ok || json.status !== "success") {
        setError(json.message || "Chyba při ukládání.");
        return;
      }

      // Po úspěšném uložení přepneme do view módu
      setIsEditing(false);

      // Znovu načteme data, aby se zobrazily aktualizované hodnoty
      const refreshRes = await fetch(
        `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(slug)}`,
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
    } catch (err) {
      console.error("Network/Fetch error při update_whop.php:", err);
      setError("Network error: " + err.message);
    }
  };

  // ===== Nahrávání banneru (Cloudinary) =====
  const handleBannerUpload = async (file) => {
    if (!file) return;
    // Validace: max 5 MB + musí být image/*
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

    const CLOUDINARY_CLOUD_NAME = "dv6igcvz8";
    const CLOUDINARY_UPLOAD_PRESET = "unsigned_profile_avatars";
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

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

  // ===== Nahrávání obrázku pro features (Cloudinary) =====
  const handleImageChange = async (id, file) => {
    if (!file) return;

    // Validace: max 5 MB + musí být image/*
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
      prev.map((f) =>
        f.id === id
          ? { ...f, isUploading: true, error: "" }
          : f
      )
    );

    const CLOUDINARY_CLOUD_NAME = "dv6igcvz8";
    const CLOUDINARY_UPLOAD_PRESET = "unsigned_profile_avatars";
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

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

  // ===== Přidání nové prázdné feature (max 6) =====
  const addFeature = () => {
    if (editFeatures.length >= 6) return;
    const newId = editFeatures.length > 0 ? Math.max(...editFeatures.map((f) => f.id)) + 1 : 1;
    setEditFeatures((prev) => [
      ...prev,
      { id: newId, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
    ]);
    setError("");
  };

  // ===== Odstranění feature (minimálně 2 musí zůstat) =====
  const removeFeature = (id) => {
    if (editFeatures.length <= 2) return;
    setEditFeatures((prev) => prev.filter((f) => f.id !== id));
    setError("");
  };

  // ===== Změna title/subtitle =====
  const handleFeatChange = (id, field, value) => {
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              [field]: value,
            }
          : f
      )
    );
  };

  // ===== Pokud stále načítáme =====
  if (loading) {
    return (
      <div className="whop-loading">
        <span>Načítám…</span>
      </div>
    );
  }

  // ===== Pokud je chyba =====
  if (error) {
    return (
      <div className="whop-error">
        <p>{error}</p>
        <button onClick={() => navigate("/onboarding")}>← Back</button>
      </div>
    );
  }

  // ===== Pokud data nejsou načtena =====
  if (!whopData) {
    return null;
  }

  return (
    <div className="whop-container">
      {/* Tlačítko Back – viditelné jen v editačním módu */}
      {isEditing && (
        <button className="whop-back-btn" onClick={handleBack} aria-label="Go back">
          <FaArrowLeft /> Back
        </button>
      )}

      {/* Banner – view vs edit */}
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
            {bannerError && (
              <div className="whop-banner-error-edit">{bannerError}</div>
            )}
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

      {/* Hlavní obsah */}
      <div className="whop-content">
        {/* Název a popis (view vs edit) */}
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
            <>
              <h1 className="whop-title">{whopData.name}</h1>
              <p className="whop-description">{whopData.description}</p>
            </>
          )}
        </div>

        {/* Tlačítko Edit (owner) / Join (ostatní) nebo Save (pokud je edit mód) */}
        <div className="whop-action-btns">
          {isEditing ? (
            <button className="whop-save-btn" onClick={handleSave}>
              <FaSave /> Save
            </button>
          ) : whopData.is_owner ? (
            <button className="whop-edit-btn" onClick={handleEditToggle}>
              <FaEdit /> Edit
            </button>
          ) : (
            <button className="whop-join-btn" onClick={() => { /* TODO: Join logic */ }}>
              <FaUserPlus /> Join
            </button>
          )}
        </div>

        {/* Seznam features (view vs edit) */}
        <div className="whop-features-section">
          <h2 className="features-section-title">Features</h2>

          {isEditing ? (
            <>
              {/* Karty pro editaci features */}
              {editFeatures.map((feat, idx) => (
                <div key={feat.id} className="feature-card-edit">
                  <div className="feature-number-edit">Feature {idx + 1}</div>
                  <div className="feature-field-edit">
                    <label>Title *</label>
                    <input
                      type="text"
                      className="feature-input-edit"
                      value={feat.title}
                      onChange={(e) =>
                        handleFeatChange(feat.id, "title", e.target.value)
                      }
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

              {/* Tlačítko pro přidání nové feature */}
              {editFeatures.length < 6 && (
                <button className="feature-add-btn-edit" onClick={addFeature}>
                  <FaPlus /> Add Feature
                </button>
              )}
            </>
          ) : (
            <>
              {/* Zobrazení features (view only) */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
