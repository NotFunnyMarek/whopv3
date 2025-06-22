// src/pages/ChooseLink.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/choose-link.scss";
import { getWhopSetupCookie, setWhopSetupCookie } from "../utils/cookieUtils";

export default function ChooseLink() {
  const [slug, setSlug] = useState("");
  const maxSlugLength = 30;

  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve previous Whop data from location state or from cookie
  const cookieData = getWhopSetupCookie();
  const prevWhopData = location.state?.whopData || cookieData || null;

  // Initialize the slug input with existing data if available
  useEffect(() => {
    if (prevWhopData?.slug) {
      setSlug(prevWhopData.slug);
    }
  }, [prevWhopData]);

  // If no previous data is found, show an error and a link back to start
  if (!prevWhopData) {
    return (
      <div className="choose-link-error">
        <p>Whop data not found. Please complete the previous step first.</p>
        <button onClick={() => navigate("/setup")}>Go to Setup</button>
      </div>
    );
  }

  // Handle changes to the slug input, allowing only alphanumeric, hyphens, and underscores
  const handleChange = (e) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, "");
    if (sanitized.length <= maxSlugLength) {
      setSlug(sanitized);
    }
  };

  // Go back to the initial setup step, saving the slug in the cookie
  const handleBack = () => {
    const newData = {
      ...prevWhopData,
      slug,
    };
    setWhopSetupCookie(newData);
    navigate("/setup", { state: { whopData: newData } });
  };

  // Continue to the features setup step, saving the slug in the cookie
  const handleContinue = () => {
    if (!slug.trim()) return;

    const whopData = {
      name: prevWhopData.name,
      description: prevWhopData.description,
      slug: slug.trim(),
      features: prevWhopData.features || [],
      logoUrl: prevWhopData.logoUrl || "",
      price: prevWhopData.price || 0.0,
      billing_period: prevWhopData.billing_period || "none",
      is_recurring: prevWhopData.is_recurring || 0,
      currency: prevWhopData.currency || "USD",
    };

    setWhopSetupCookie(whopData);
    navigate("/setup/features", { state: { whopData } });
  };

  return (
    <div className="choose-link-container">
      {/* Header */}
      <div className="choose-link-header">
        <h1 className="choose-link-title">Choose Your Whop URL</h1>
      </div>

      <div className="choose-link-content">
        <p className="choose-link-subtitle">
          This will be the URL you share with your followers.
        </p>

        {/* URL input with prefix */}
        <div className="choose-link-input-wrapper">
          <span className="choose-link-prefix">wrax.com/c/</span>
          <input
            type="text"
            className="choose-link-input"
            placeholder="your-whop-slug"
            value={slug}
            onChange={handleChange}
          />
        </div>

        {/* Character counter */}
        <div className="choose-link-charcount">
          {slug.length}/{maxSlugLength}
        </div>

        {/* Navigation buttons */}
        <div className="choose-link-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="choose-link-button"
            onClick={handleContinue}
            disabled={slug.trim().length === 0}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
