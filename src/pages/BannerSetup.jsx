// src/pages/BannerSetup.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/banner-setup.scss";
import {
  getWhopSetupCookie,
  setWhopSetupCookie,
  clearWhopSetupCookie,
} from "../utils/cookieUtils";

const CLOUDINARY_CLOUD_NAME = "dv6igcvz8";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_profile_avatars";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

export default function BannerSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  // Získáme předchozí data buď z location.state, nebo z cookie
  const cookieData = getWhopSetupCookie();
  const prevWhopData = location.state?.whopData || cookieData || null;

  // Stav pro URL banneru, stav uploadu a případné chyby
  const [bannerUrl, setBannerUrl] = useState(prevWhopData?.bannerUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Pokaždé, kdy se bannerUrl změní, uložíme nové whopData do cookie
  useEffect(() => {
    if (bannerUrl) {
      const newData = {
        ...prevWhopData,
        bannerUrl: bannerUrl,
      };
      setWhopSetupCookie(newData);
    }
  }, [bannerUrl]);

  // Pokud nemáme žádná předchozí data, zobrazíme chybovou hlášku
  if (!prevWhopData) {
    return (
      <div className="banner-setup-error">
        <p>Whop data not found. Please complete the previous steps first.</p>
        <button
          className="banner-setup-error-btn"
          onClick={() => navigate("/setup")}
        >
          Go to Setup
        </button>
      </div>
    );
  }

  // Handler pro nahrání bannerového obrázku na Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setBannerUrl("");
      setError("");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Soubor je příliš velký (max 5 MB).");
      setBannerUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Vyberte prosím platný obrázek.");
      setBannerUrl("");
      return;
    }

    setError("");
    setIsUploading(true);

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
      setBannerUrl(data.secure_url);
    } catch (err) {
      console.error("Cloudinary banner upload error:", err);
      setError("Chyba při nahrávání banneru.");
      setBannerUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  // Handler pro tlačítko Back: vracíme se do FeaturesSetup a ukládáme do cookie
  const handleBack = () => {
    const newData = {
      ...prevWhopData,
      bannerUrl: bannerUrl,
    };
    setWhopSetupCookie(newData);
    navigate("/setup/features", { state: { whopData: newData } });
  };

  // Handler pro tlačítko Continue: odeslání finálního Whop payloadu a přesměrování
  const handleContinue = async () => {
    if (!bannerUrl) return;

    // Sestavíme objekt, který pošleme na backend (whop.php)
    const whopPayload = {
      name: prevWhopData.name,
      description: prevWhopData.description,
      slug: prevWhopData.slug,
      features: prevWhopData.features.map((f) => ({
        title: f.title,
        subtitle: f.subtitle,
        imageUrl: f.imageUrl,
      })),
      logoUrl: prevWhopData.logoUrl || "",
      bannerUrl: bannerUrl,
    };

    console.log("=== WHOP PAYLOAD PŘED ODESLÁNÍM ===");
    console.log(whopPayload);
    console.log("====================================");

    try {
      const res = await fetch("https://app.byxbot.com/php/whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(whopPayload),
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.error("Nepodařilo se rozparsovat JSON z whop.php:", text);
        setError("Chyba při zpracování odpovědi serveru.");
        return;
      }

      if (!res.ok || json.status !== "success") {
        setError(json.message || "Unknown error");
        return;
      }

      // Úspěšné uložení – vymazání cookie a navigace na /c/:slug
      clearWhopSetupCookie();
      navigate(`/c/${json.slug}`);
    } catch (err) {
      console.error("Network/Fetch error při volání whop.php:", err);
      setError("Network error: " + err.message);
    }
  };

  return (
    <div className="banner-setup-container">
      {/* HLAVIČKA */}
      <div className="banner-setup-header">
        <h1 className="banner-setup-title">Upload Your Whop Banner</h1>
      </div>

      <div className="banner-setup-content">
        <p className="banner-setup-subtitle">
          Toto bude banner, který se zobrazí v horní části tvého whopu. Doporučená velikost: 1200 × 300 px.
        </p>

        {/* Náhled bytebanneru nebo stav uploadu */}
        <div className="banner-input-wrapper">
          {isUploading ? (
            <div className="banner-uploading">Nahrávám…</div>
          ) : bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Banner Preview"
              className="banner-preview-image"
            />
          ) : (
            <div className="banner-placeholder">No banner selected</div>
          )}
          <input
            type="file"
            accept="image/*"
            className="banner-file-input"
            onChange={handleFileChange}
          />
        </div>

        {error && <div className="banner-error">{error}</div>}

        {/* Tlačítka Back a Continue */}
        <div className="banner-setup-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="banner-continue-button"
            onClick={handleContinue}
            disabled={!bannerUrl || isUploading}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
