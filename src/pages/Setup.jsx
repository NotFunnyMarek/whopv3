// src/pages/Setup.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/setup.scss";
import { getWhopSetupCookie, setWhopSetupCookie } from "../utils/cookieUtils";

export default function Setup() {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  // Load from cookie
  const cookieData = getWhopSetupCookie() || {};

  // State variables
  const [whopName, setWhopName] = useState(cookieData.name || "");
  const [description, setDescription] = useState(cookieData.description || "");
  const [longDescription, setLongDescription] = useState(
    cookieData.long_description || ""
  );
  const [logoUrl, setLogoUrl] = useState(cookieData.logoUrl || "");
  const [price, setPrice] = useState(
    cookieData.price != null ? cookieData.price.toString() : "0.00"
  );
  const [billingPeriod, setBillingPeriod] = useState(
    cookieData.billing_period || "none"
  );
  const [waitlistEnabled, setWaitlistEnabled] = useState(
    Boolean(cookieData.waitlist_enabled)
  );
  const [waitlistQuestions, setWaitlistQuestions] = useState(
    Array.isArray(cookieData.waitlist_questions)
      ? cookieData.waitlist_questions
      : ["", "", "", "", ""]
  );
  const [aboutBio, setAboutBio] = useState(cookieData.about_bio || "");
  const [websiteUrl, setWebsiteUrl] = useState(cookieData.website_url || "");
  const [socials, setSocials] = useState({
    instagram: cookieData.socials?.instagram || "",
    discord: cookieData.socials?.discord || "",
  });
  const [whoFor, setWhoFor] = useState(
    Array.isArray(cookieData.who_for) && cookieData.who_for.length > 0
      ? cookieData.who_for
      : [{ title: "", description: "" }]
  );
  const [faq, setFaq] = useState(
    Array.isArray(cookieData.faq) && cookieData.faq.length > 0
      ? cookieData.faq
      : [{ question: "", answer: "" }]
  );
  const [modules, setModules] = useState(
    cookieData.modules || {
      chat: false,
      earn: false,
      discord: false,
      discord_access: false,
      course: false,
      text: true,
    }
  );
  const [landingTexts, setLandingTexts] = useState(
    cookieData.landing_texts || {
      reviews_title: "See what other people are saying",
      features_title: "Here\u2019s what you\u2019ll get",
      about_title: "Learn about me",
      faq_title: "Frequently asked questions",
    }
  );

  // Constants
  const maxNameLength = 30;
  const maxDescLength = 200;
  const isRecurring =
    billingPeriod !== "none" && billingPeriod !== "single" ? 1 : 0;

  // Persist to cookie
  useEffect(() => {
    setWhopSetupCookie({
      name: whopName,
      description,
      long_description: longDescription,
      logoUrl,
      price: parseFloat(price) || 0,
      billing_period: billingPeriod,
      is_recurring: isRecurring,
      currency: "USD",
      waitlist_enabled: waitlistEnabled,
      waitlist_questions: waitlistEnabled
        ? waitlistQuestions.filter((q) => q.trim() !== "")
        : [],
      about_bio: aboutBio,
      website_url: websiteUrl,
      socials,
      who_for: whoFor,
      faq,
      landing_texts: landingTexts,
      modules,
    });
  }, [
    whopName,
    description,
    longDescription,
    logoUrl,
    price,
    billingPeriod,
    isRecurring,
    waitlistEnabled,
    waitlistQuestions,
    aboutBio,
    websiteUrl,
    socials,
    whoFor,
    faq,
    landingTexts,
    modules,
  ]);

  // Handlers
  const handleNameChange = (e) => {
    if (e.target.value.length <= maxNameLength) {
      setWhopName(e.target.value);
    }
  };
  const handleDescChange = (e) => {
    if (e.target.value.length <= maxDescLength) {
      setDescription(e.target.value);
    }
  };
  const handleLongDescChange = (e) => setLongDescription(e.target.value);
  const handlePriceChange = (e) => {
    if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
      setPrice(e.target.value);
    }
  };
  const handleBillingChange = (e) => setBillingPeriod(e.target.value);
  const handleWaitlistToggle = (e) => {
    const enabled = e.target.checked;
    setWaitlistEnabled(enabled);
    if (!enabled) {
      setWaitlistQuestions(["", "", "", "", ""]);
    }
  };
  const handleQuestionChange = (i, v) => {
    const arr = [...waitlistQuestions];
    arr[i] = v;
    setWaitlistQuestions(arr);
  };
  const handleModuleToggle = (key) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleBioChange = (e) => setAboutBio(e.target.value);
  const handleWebsiteChange = (e) => setWebsiteUrl(e.target.value);
  const handleSocialChange = (key, v) =>
    setSocials((prev) => ({ ...prev, [key]: v }));
  const addWhoFor = () =>
    setWhoFor((prev) => [...prev, { title: "", description: "" }]);
  const removeWhoFor = (i) => {
    if (whoFor.length <= 1) return;
    setWhoFor((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleWhoForChange = (i, field, v) => {
    setWhoFor((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: v } : item))
    );
  };
  const addFaq = () => setFaq((prev) => [...prev, { question: "", answer: "" }]);
  const removeFaq = (i) => {
    if (faq.length <= 1) return;
    setFaq((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleFaqChange = (i, field, v) => {
    setFaq((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: v } : item))
    );
  };
  const handleLandingTextChange = (field, value) => {
    setLandingTexts((prev) => ({ ...prev, [field]: value }));
  };

  // Validation
  const pricingInvalid =
    billingPeriod !== "none" && (isNaN(parseFloat(price)) || parseFloat(price) <= 0);
  const waitlistInvalid =
    waitlistEnabled && waitlistQuestions.every((q) => !q.trim());

  // Decide if Continue enabled
  const continueEnabled =
    whopName.trim() &&
    description.trim() &&
    !pricingInvalid &&
    !waitlistInvalid;

  // Navigation
  const handleContinue = () => {
    if (!continueEnabled) {
      showNotification({
        type: "error",
        message: "Please fill out all required fields correctly.",
      });
      return;
    }
    const whopData = getWhopSetupCookie();
    navigate("/setup/link", { state: { whopData } });
  };
  const handleBack = () => navigate("/onboarding");

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h1 className="setup-title">Configure Your Whop</h1>
      </div>

      <div className="setup-content">
        {/* Name */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Whop name"
            value={whopName}
            onChange={handleNameChange}
          />
          <div className="char-count">
            {whopName.length}/{maxNameLength}
          </div>
        </div>

        {/* Description */}
        <div className="setup-input-wrapper">
          <textarea
            className="setup-textarea"
            placeholder="Description"
            value={description}
            onChange={handleDescChange}
            rows="3"
          />
          <div className="char-count">
            {description.length}/{maxDescLength}
          </div>
        </div>

        {/* Long Description */}
        <div className="setup-input-wrapper">
          <textarea
            className="setup-textarea"
            placeholder="Long description about your Whop"
            value={longDescription}
            onChange={handleLongDescChange}
            rows="5"
          />
        </div>

        {/* Logo URL */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Logo URL (optional)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="setup-input-wrapper">
          <label>Price (USD) *</label>
          <input
            type="text"
            className="setup-input"
            value={price}
            onChange={handlePriceChange}
          />
        </div>

        {/* Billing */}
        <div className="setup-input-wrapper">
          <label>Payment Type *</label>
          <select
            className="setup-input"
            value={billingPeriod}
            onChange={handleBillingChange}
          >
            <option value="none">Free</option>
            <option value="single">Single Payment</option>
            <option value="1min">Every 1 minute</option>
            <option value="7days">Every 7 days</option>
            <option value="14days">Every 14 days</option>
            <option value="30days">Every 30 days</option>
            <option value="1year">Every 1 year</option>
          </select>
        </div>

        {/* Waitlist */}
        <div className="setup-input-wrapper">
          <label>
            <input
              type="checkbox"
              checked={waitlistEnabled}
              onChange={handleWaitlistToggle}
            />{" "}
            Enable Waitlist
          </label>
        </div>
        {waitlistEnabled && (
          <div className="setup-input-wrapper">
            {waitlistQuestions.map((q, i) => (
              <input
                key={i}
                type="text"
                className="setup-input"
                placeholder={`Question ${i + 1}`}
                value={q}
                onChange={(e) => handleQuestionChange(i, e.target.value)}
              />
            ))}
          </div>
        )}

        {/* About Bio */}
        <div className="setup-input-wrapper">
          <textarea
            className="setup-textarea"
            placeholder="About me"
            value={aboutBio}
            onChange={handleBioChange}
            rows="3"
          />
        </div>

        {/* Website URL */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Website URL (optional)"
            value={websiteUrl}
            onChange={handleWebsiteChange}
          />
        </div>

        {/* Socials */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Instagram URL"
            value={socials.instagram}
            onChange={(e) => handleSocialChange("instagram", e.target.value)}
          />
        </div>
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Discord URL"
            value={socials.discord}
            onChange={(e) => handleSocialChange("discord", e.target.value)}
          />
        </div>

        {/* Modules */}
        <div className="setup-section">
          <h2>Enable Modules</h2>
          {[
          ["chat", "Chat"],
          ["earn", "Earn"],
          ["discord", "Discord"],
          ["discord_access", "Discord Access"],
          ["course", "Course"],
          ["text", "Text Features"],
          ].map(([key, label]) => (
            <label key={key} className="setup-checkbox-label">
              <input
                type="checkbox"
                checked={modules[key]}
                onChange={() => handleModuleToggle(key)}
              />
              {` Enable ${label}`}
            </label>
          ))}
        </div>

        {/* Who This Is For */}
        <div className="setup-section">
          <h2>Who This Is For</h2>
          {whoFor.map((item, i) => (
            <div key={i} className="setup-subgroup">
              <input
                type="text"
                className="setup-input"
                placeholder="Title"
                value={item.title}
                onChange={(e) => handleWhoForChange(i, "title", e.target.value)}
              />
              <textarea
                className="setup-textarea"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleWhoForChange(i, "description", e.target.value)
                }
                rows="2"
              />
              {whoFor.length > 1 && (
                <button
                  className="remove-btn"
                  onClick={() => removeWhoFor(i)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className="add-btn" onClick={addWhoFor}>
            + Add Who For
          </button>
        </div>

        {/* FAQ */}
        <div className="setup-section">
          <h2>FAQ</h2>
          {faq.map((item, i) => (
            <div key={i} className="setup-subgroup">
              <input
                type="text"
                className="setup-input"
                placeholder="Question"
                value={item.question}
                onChange={(e) => handleFaqChange(i, "question", e.target.value)}
              />
              <textarea
                className="setup-textarea"
                placeholder="Answer"
                value={item.answer}
                onChange={(e) => handleFaqChange(i, "answer", e.target.value)}
                rows="2"
              />
              {faq.length > 1 && (
                <button className="remove-btn" onClick={() => removeFaq(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        <button className="add-btn" onClick={addFaq}>
          + Add FAQ
        </button>
      </div>

      {/* Landing Page Texts */}
      <div className="setup-section">
        <h2>Landing Page Texts</h2>
        <input
          type="text"
          className="setup-input"
          placeholder="Reviews section title"
          value={landingTexts.reviews_title}
          onChange={(e) => handleLandingTextChange("reviews_title", e.target.value)}
        />
        <input
          type="text"
          className="setup-input"
          placeholder="Features section title"
          value={landingTexts.features_title}
          onChange={(e) => handleLandingTextChange("features_title", e.target.value)}
        />
        <input
          type="text"
          className="setup-input"
          placeholder="About section title"
          value={landingTexts.about_title}
          onChange={(e) => handleLandingTextChange("about_title", e.target.value)}
        />
        <input
          type="text"
          className="setup-input"
          placeholder="FAQ section title"
          value={landingTexts.faq_title}
          onChange={(e) => handleLandingTextChange("faq_title", e.target.value)}
        />
      </div>

        {/* Navigation */}
        <div className="setup-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="setup-button"
            onClick={handleContinue}
            disabled={!continueEnabled}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
