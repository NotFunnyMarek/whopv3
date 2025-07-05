import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import "../styles/features-setup.scss";
import { getWhopSetupCookie, setWhopSetupCookie } from "../utils/cookieUtils";

export default function FeaturesSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load data from cookie (if any) before any hooks
  const cookieData = getWhopSetupCookie();
  // We may get whopData either from location.state or from cookie
  const prevWhopData = location.state?.whopData || cookieData || null;
  const textEnabled = prevWhopData?.modules?.text !== false;

  // Function returning initial features array state
  const getInitialFeatures = () => {
    if (
      prevWhopData &&
      Array.isArray(prevWhopData.features) &&
      prevWhopData.features.length > 0
    ) {
      // If features already saved in prevWhopData, use them:
      return prevWhopData.features.map((f, idx) => ({
        id: idx + 1,
        title: f.title || "",
        subtitle: f.subtitle || "",
        imageUrl: f.imageUrl || "",
        isUploading: false,
        error: "",
      }));
    }
    // Otherwise start with two empty feature cards
    return [
      { id: 1, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
      { id: 2, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
    ];
  };

  const [features, setFeatures] = useState(getInitialFeatures());

  // Save to cookie whenever features change
  useEffect(() => {
    if (!prevWhopData) return;
    const newData = {
      ...prevWhopData,
      features: features.map((f) => ({
        title: f.title,
        subtitle: f.subtitle,
        imageUrl: f.imageUrl,
      })),
    };
    setWhopSetupCookie(newData);
  }, [features, prevWhopData]);

  // If no previous whopData, show error screen
  if (!prevWhopData) {
    return (
      <div className="features-setup-error">
        <p>Whop data not found. Please complete the previous steps first.</p>
        <button onClick={() => navigate("/setup")}>Go to Setup</button>
      </div>
    );
  }

  if (!textEnabled) {
    const handleContinue = () => {
      const newData = { ...prevWhopData };
      setWhopSetupCookie(newData);
      navigate("/setup/banner", { state: { whopData: newData } });
    };
    return (
      <div className="features-setup-disabled">
        <p>Text features are disabled. You can enable them in setup later.</p>
        <button className="feature-add-btn" onClick={handleContinue}>
          Continue
        </button>
      </div>
    );
  }

  // Add a new feature (up to 6 total)
  const addFeature = () => {
    if (features.length >= 6) return;
    const newId = features.length > 0 ? Math.max(...features.map((f) => f.id)) + 1 : 1;
    setFeatures((prev) => [
      ...prev,
      { id: newId, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
    ]);
  };

  // Remove a feature ( keep at least 2 )
  const removeFeature = (id) => {
    if (features.length <= 2) return;
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  // Handle title / subtitle changes
  const handleChange = (id, field, value) => {
    setFeatures((prev) =>
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

  // Upload image to Cloudinary and generate preview
  const handleImageChange = async (id, file) => {
    if (!file) return;

    // File size validation
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, error: "Image is too large (max 5 MB).", isUploading: false }
            : f
        )
      );
      return;
    }

    // File type validation
    if (!file.type.startsWith("image/")) {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, error: "Please select a valid image file.", isUploading: false }
            : f
        )
      );
      return;
    }

    // Mark as uploading
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isUploading: true, error: "" } : f))
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
        throw new Error(`Cloudinary upload error: ${res.status}`);
      }
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error("Failed to retrieve secure_url from Cloudinary.");
      }
      // Save imageUrl and stop uploading state
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageUrl: data.secure_url, isUploading: false, error: "" }
            : f
        )
      );
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageUrl: "", isUploading: false, error: "Error uploading image." }
            : f
        )
      );
    }
  };

  // Count valid features (must have non-empty title and imageUrl)
  const validCount = features.reduce(
    (count, f) => count + (f.title.trim() && f.imageUrl ? 1 : 0),
    0
  );
  const isContinueEnabled = validCount >= 2;

  // Handler for "Back" button
  const handleBack = () => {
    const newData = {
      ...prevWhopData,
      features: features.map((f) => ({
        title: f.title,
        subtitle: f.subtitle,
        imageUrl: f.imageUrl,
      })),
    };
    setWhopSetupCookie(newData);
    navigate("/setup/link", { state: { whopData: newData } });
  };

  // Handler for "Continue" button
  const handleContinue = () => {
    if (!isContinueEnabled) return;

    const whopData = {
      ...prevWhopData,
      features: features.map((f) => ({
        title: f.title.trim(),
        subtitle: f.subtitle.trim(),
        imageUrl: f.imageUrl,
      })),
    };

    setWhopSetupCookie(whopData);
    navigate("/setup/banner", { state: { whopData } });
  };

  return (
    <div className="features-setup-container">
      <div className="features-setup-header">
        <h1 className="features-setup-title">Add Your Whop Features</h1>
      </div>

      <div className="features-setup-content">
        <p className="features-setup-subtitle">
          Define at least 2 and up to 6 features. Each feature can have a title, an
          optional subtitle, and a square image.
        </p>

        {features.map((feature, index) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-card-header">
              <span className="feature-number">Feature {index + 1}</span>
              {features.length > 2 && (
                <button
                  type="button"
                  className="feature-remove-btn"
                  onClick={() => removeFeature(feature.id)}
                  title="Remove this feature"
                >
                  <FaTrash />
                </button>
              )}
            </div>

            <div className="feature-field">
              <label htmlFor={`feature-title-${feature.id}`}>Title *</label>
              <input
                id={`feature-title-${feature.id}`}
                type="text"
                className="feature-input"
                placeholder="Enter feature title"
                value={feature.title}
                onChange={(e) => handleChange(feature.id, "title", e.target.value)}
              />
            </div>

            <div className="feature-field">
              <label htmlFor={`feature-subtitle-${feature.id}`}>Subtitle (Optional)</label>
              <textarea
                id={`feature-subtitle-${feature.id}`}
                className="feature-textarea"
                placeholder="Enter feature subtitle"
                value={feature.subtitle}
                onChange={(e) => handleChange(feature.id, "subtitle", e.target.value)}
                rows="2"
              />
            </div>

            <div className="feature-field">
              <label>Image (1:1) *</label>
              <div className="feature-image-wrapper">
                {feature.isUploading ? (
                  <div className="feature-image-uploading">Uploading…</div>
                ) : feature.imageUrl ? (
                  <img
                    src={feature.imageUrl}
                    alt={`Feature ${index + 1}`}
                    className="feature-image-preview"
                  />
                ) : (
                  <div className="feature-image-placeholder">No image selected</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="feature-image-input"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    handleImageChange(feature.id, file);
                  }}
                />
                {feature.error && (
                  <div className="feature-image-error">{feature.error}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {features.length < 6 && (
          <button type="button" className="feature-add-btn" onClick={addFeature}>
            <FaPlus className="icon-plus" /> Add Feature
          </button>
        )}

        <div className="features-setup-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="features-continue-btn"
            onClick={handleContinue}
            disabled={!isContinueEnabled}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
