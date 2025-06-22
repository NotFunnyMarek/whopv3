// src/pages/Setup.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/setup.scss";
import { getWhopSetupCookie, setWhopSetupCookie } from "../utils/cookieUtils";

export default function Setup() {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  // Load existing data from cookie if available
  const cookieData = getWhopSetupCookie();
  const initialName       = cookieData?.name        || "";
  const initialDesc       = cookieData?.description || "";
  const initialLogo       = cookieData?.logoUrl     || "";
  const initialPrice      = cookieData?.price?.toString() || "0.00";
  const initialBilling    = cookieData?.billing_period || "none";
  const initialWaitlist   = cookieData?.waitlist_enabled || false;
  const initialQuestions  = cookieData?.waitlist_questions || ["", "", "", "", ""];

  const [whopName, setWhopName]             = useState(initialName);
  const [description, setDescription]       = useState(initialDesc);
  const [logoUrl, setLogoUrl]               = useState(initialLogo);
  const [price, setPrice]                   = useState(initialPrice);
  const [billingPeriod, setBillingPeriod]   = useState(initialBilling);
  const [waitlistEnabled, setWaitlistEnabled]     = useState(initialWaitlist);
  const [waitlistQuestions, setWaitlistQuestions] = useState(initialQuestions);

  const maxNameLength = 30;
  const maxDescLength = 200;

  // Determine if this is a recurring payment
  const isRecurring = billingPeriod !== "none" && billingPeriod !== "single" ? 1 : 0;

  // Save to cookie whenever any setup field changes
  useEffect(() => {
    const newData = {
      ...(cookieData || {}),
      name:               whopName,
      description:        description,
      logoUrl:            logoUrl,
      price:              parseFloat(price),
      billing_period:     billingPeriod,
      is_recurring:       isRecurring,
      currency:           "USD",
      waitlist_enabled:   waitlistEnabled,
      waitlist_questions: waitlistEnabled
                             ? waitlistQuestions.filter((q) => q.trim() !== "")
                             : [],
    };
    setWhopSetupCookie(newData);
  }, [
    whopName,
    description,
    logoUrl,
    price,
    billingPeriod,
    isRecurring,
    waitlistEnabled,
    waitlistQuestions,
    cookieData,
  ]);

  // Handlers for inputs
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxNameLength) {
      setWhopName(value);
    }
  };

  const handleDescChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxDescLength) {
      setDescription(value);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setPrice(value);
    }
  };

  const handleBillingChange = (e) => {
    setBillingPeriod(e.target.value);
  };

  const handleWaitlistToggle = (e) => {
    const enabled = e.target.checked;
    setWaitlistEnabled(enabled);
    if (!enabled) {
      setWaitlistQuestions(["", "", "", "", ""]);
    }
  };

  const handleQuestionChange = (index, value) => {
    const qs = [...waitlistQuestions];
    qs[index] = value;
    setWaitlistQuestions(qs);
  };

  // Validation helpers
  const pricingInvalid = () => {
    if (billingPeriod === "none") {
      return false;
    }
    const numeric = parseFloat(price);
    return isNaN(numeric) || numeric <= 0;
  };

  const waitlistInvalid = () => {
    if (!waitlistEnabled) return false;
    return waitlistQuestions.every((q) => q.trim() === "");
  };

  // Continue to next step
  const handleContinue = () => {
    if (
      !whopName.trim() ||
      !description.trim() ||
      pricingInvalid() ||
      waitlistInvalid()
    ) {
      showNotification({
        type: "error",
        message: "Please fill out all required fields correctly.",
      });
      return;
    }

    const whopData = {
      name:               whopName.trim(),
      description:        description.trim(),
      slug:               cookieData?.slug || "",
      features:           cookieData?.features || [],
      logoUrl:            logoUrl.trim(),
      price:              parseFloat(price),
      billing_period:     billingPeriod,
      is_recurring:       isRecurring,
      currency:           "USD",
      waitlist_enabled:   waitlistEnabled,
      waitlist_questions: waitlistEnabled
                             ? waitlistQuestions.filter((q) => q.trim() !== "")
                             : [],
    };

    setWhopSetupCookie(whopData);
    showNotification({ type: "success", message: "Settings saved. Continuing..." });
    navigate("/setup/link", { state: { whopData } });
  };

  const handleBack = () => {
    navigate("/onboarding");
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h1 className="setup-title">Name Your Whop</h1>
      </div>

      <div className="setup-content">
        <p className="setup-subtitle">
          Enter a name and description for your Whop. This description will be visible to visitors.
        </p>

        {/* Whop name input */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Enter your Whop name"
            value={whopName}
            onChange={handleNameChange}
          />
          <div className="char-count">
            {whopName.length}/{maxNameLength}
          </div>
        </div>

        {/* Description textarea */}
        <div className="setup-input-wrapper">
          <textarea
            className="setup-textarea"
            placeholder="Enter your Whop description"
            value={description}
            onChange={handleDescChange}
            rows="3"
          />
          <div className="char-count">
            {description.length}/{maxDescLength}
          </div>
        </div>

        {/* Logo URL input */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Logo URL (optional)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        {/* Price input */}
        <div className="setup-input-wrapper">
          <label htmlFor="price-input">Price (USD) *</label>
          <input
            id="price-input"
            type="text"
            className="setup-input"
            placeholder="0.00"
            value={price}
            onChange={handlePriceChange}
          />
        </div>

        {/* Billing period selector */}
        <div className="setup-input-wrapper">
          <label htmlFor="billing-select">Payment Type *</label>
          <select
            id="billing-select"
            className="setup-input"
            value={billingPeriod}
            onChange={handleBillingChange}
          >
            <option value="none">Free</option>
            <option value="single">Single Payment</option>
            <option value="1min">Recurring: every 1 minute</option>
            <option value="7days">Recurring: every 7 days</option>
            <option value="14days">Recurring: every 14 days</option>
            <option value="30days">Recurring: every 30 days</option>
            <option value="1year">Recurring: every 1 year</option>
          </select>
          {billingPeriod !== "none" && billingPeriod !== "single" && (
            <p className="setup-note">
              This setting will charge the specified amount automatically at the selected interval.
            </p>
          )}
        </div>

        {/* Waitlist toggle */}
        <div className="setup-input-wrapper">
          <label htmlFor="waitlist-checkbox">
            <input
              id="waitlist-checkbox"
              type="checkbox"
              checked={waitlistEnabled}
              onChange={handleWaitlistToggle}
            />
            Enable Waitlist
          </label>
          <p className="setup-note">
            If enabled, users will join a waitlist and you can approve or reject their requests.
          </p>
        </div>

        {/* Waitlist questions */}
        {waitlistEnabled && (
          <div className="setup-input-wrapper">
            <p className="setup-subtitle">
              Add up to 5 screening questions for the waitlist:
            </p>
            {waitlistQuestions.map((q, idx) => (
              <div key={idx} className="setup-input-wrapper">
                <input
                  type="text"
                  className="setup-input"
                  placeholder={`Question ${idx + 1} (optional)`}
                  value={q}
                  onChange={(e) => handleQuestionChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="setup-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="setup-button"
            onClick={handleContinue}
            disabled={
              !whopName.trim() ||
              !description.trim() ||
              pricingInvalid() ||
              waitlistInvalid()
            }
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
