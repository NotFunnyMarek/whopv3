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

  // Retrieve previous data either from location.state or from cookie
  const cookieData = getWhopSetupCookie();
  const prevWhopData = location.state?.whopData || cookieData || null;

  // State for banner URL, upload status, and any error
  const [bannerUrl, setBannerUrl] = useState(prevWhopData?.bannerUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Whenever bannerUrl changes, save the updated whopData in the cookie
  useEffect(() => {
    if (bannerUrl) {
      const newData = {
        ...prevWhopData,
        bannerUrl: bannerUrl,
      };
      setWhopSetupCookie(newData);
    }
  }, [bannerUrl, prevWhopData]);

  // If we have no prior data, show an error and link back to the setup start
  if (!prevWhopData) {
    return (
      <div className="banner-setup-error">
        <p>No Whop data found. Please complete the previous steps first.</p>
        <button
          className="banner-setup-error-btn"
          onClick={() => navigate("/setup")}
        >
          Go to Setup
        </button>
      </div>
    );
  }

  // Handler for uploading the banner image to Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setBannerUrl("");
      setError("");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File is too large (max 5 MB).");
      setBannerUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
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
        throw new Error(`Cloudinary upload error: ${res.status}`);
      }
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error("No secure_url returned from Cloudinary.");
      }
      setBannerUrl(data.secure_url);
    } catch (err) {
      console.error("Cloudinary banner upload error:", err);
      setError("Failed to upload banner.");
      setBannerUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  // Handler for the Back button: save to cookie and navigate back to features step
  const handleBack = () => {
    const newData = {
      ...prevWhopData,
      bannerUrl,
    };
    setWhopSetupCookie(newData);
    navigate("/setup/features", { state: { whopData: newData } });
  };

  // Handler for the Continue button: submit final Whop payload and redirect to the new Whop
  const handleContinue = async () => {
    if (!bannerUrl) return;

    const features = Array.isArray(prevWhopData.features)
      ? prevWhopData.features.map((f) => ({
          title: f.title,
          subtitle: f.subtitle,
          imageUrl: f.imageUrl,
        }))
      : [];

    const whopPayload = {
      name: prevWhopData.name,
      description: prevWhopData.description,
      slug: prevWhopData.slug,
      features,
      logoUrl: prevWhopData.logoUrl || "",
      bannerUrl,
      price: prevWhopData.price || 0.0,
      billing_period: prevWhopData.billing_period || "none",
      is_recurring: prevWhopData.is_recurring || 0,
      currency: prevWhopData.currency || "USD",
      long_description: prevWhopData.long_description || "",
      about_bio: prevWhopData.about_bio || "",
      website_url: prevWhopData.website_url || "",
      socials: prevWhopData.socials || {},
      who_for: prevWhopData.who_for || [],
      faq: prevWhopData.faq || [],
      waitlist_enabled: prevWhopData.waitlist_enabled || 0,
      waitlist_questions: prevWhopData.waitlist_questions || [],
      landing_texts: prevWhopData.landing_texts || {},
      modules: prevWhopData.modules || {},
    };

    try {
      const res = await fetch("https://app.byxbot.com/php/whop.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(whopPayload),
      });

      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        setError(json.message || "Unknown error");
        return;
      }

      // On successful save: clear the setup cookie and navigate to the new Whop
      clearWhopSetupCookie();
      const newSlug = json.data.slug;
      navigate(`/c/${newSlug}`);
    } catch (err) {
      console.error("Network/Fetch error when calling whop.php:", err);
      setError("Network error: " + err.message);
    }
  };

  return (
    <div className="banner-setup-container">
      {/* HEADER */}
      <div className="banner-setup-header">
        <h1 className="banner-setup-title">Upload Your Whop Banner</h1>
      </div>

      <div className="banner-setup-content">
        <p className="banner-setup-subtitle">
          This banner will appear at the top of your Whop page. Recommended size: 1200 × 300 px.
        </p>

        {/* Banner preview or upload state */}
        <div className="banner-input-wrapper">
          {isUploading ? (
            <div className="banner-uploading">Uploading…</div>
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

        {/* Back and Continue buttons */}
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
