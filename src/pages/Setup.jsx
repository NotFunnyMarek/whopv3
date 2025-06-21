// src/pages/Setup.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/setup.scss";
import { getWhopSetupCookie, setWhopSetupCookie } from "../utils/cookieUtils";

export default function Setup() {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  // Načteme z cookie, pokud existuje
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

  // isRecurring = 1 pokud billingPeriod není "none" a není "single"
  const isRecurring = billingPeriod !== "none" && billingPeriod !== "single" ? 1 : 0;

  // Uložíme do cookie vždy, když se změní některá z položek
  useEffect(() => {
    const newData = {
      ...(cookieData || {}),
      name:                  whopName,
      description:           description,
      logoUrl:               logoUrl,
      price:                 parseFloat(price),
      billing_period:        billingPeriod,
      is_recurring:          isRecurring,
      currency:              "USD",
      waitlist_enabled:      waitlistEnabled,
      waitlist_questions:    waitlistEnabled
                              ? waitlistQuestions.filter(q => q.trim() !== "")
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
    setWaitlistEnabled(e.target.checked);
    // Pokud vypínáme waitlist, vymažeme otázky
    if (!e.target.checked) {
      setWaitlistQuestions(["", "", "", "", ""]);
    }
  };

  const handleQuestionChange = (index, value) => {
    const qs = [...waitlistQuestions];
    qs[index] = value;
    setWaitlistQuestions(qs);
  };

  const pricingInvalid = () => {
    if (billingPeriod === "none") {
      return false;
    }
    const numeric = parseFloat(price);
    if (isNaN(numeric) || numeric <= 0) {
      return true;
    }
    return false;
  };

  const waitlistInvalid = () => {
    if (!waitlistEnabled) return false;
    // Pokud je zapnutý waitlist, alespoň jedna otázka musí být vyplněná
    return waitlistQuestions.every(q => q.trim() === "");
  };

  const handleContinue = () => {
    if (
      !whopName.trim() ||
      !description.trim() ||
      pricingInvalid() ||
      waitlistInvalid()
    ) {
      showNotification({
        type: "error",
        message: "Prosím vyplňte všechny požadované položky správně."
      });
      return;
    }

    const whopData = {
      name:                whopName.trim(),
      description:         description.trim(),
      slug:                cookieData?.slug || "",
      features:            cookieData?.features || [],
      logoUrl:             logoUrl.trim(),
      price:               parseFloat(price),
      billing_period:      billingPeriod,
      is_recurring:        isRecurring,
      currency:            "USD",
      waitlist_enabled:    waitlistEnabled,
      waitlist_questions:  waitlistEnabled
                             ? waitlistQuestions.filter(q => q.trim() !== "")
                             : [],
    };

    setWhopSetupCookie(whopData);
    showNotification({ type: "success", message: "Údaje uloženy. Pokračujeme..." });
    navigate("/setup/link", { state: { whopData } });
  };

  const handleBack = () => {
    navigate("/onboarding");
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h1 className="setup-title">Name your whop</h1>
      </div>

      <div className="setup-content">
        <p className="setup-subtitle">
          Zadej název a základní popis svého Whopu. Popis se zobrazí návštěvníkům.
        </p>

        {/* Input pro jméno */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Enter your whop name"
            value={whopName}
            onChange={handleNameChange}
          />
          <div className="char-count">
            {whopName.length}/{maxNameLength}
          </div>
        </div>

        {/* Textarea pro popis */}
        <div className="setup-input-wrapper">
          <textarea
            className="setup-textarea"
            placeholder="Enter your whop description"
            value={description}
            onChange={handleDescChange}
            rows="3"
          />
          <div className="char-count">
            {description.length}/{maxDescLength}
          </div>
        </div>

        {/* Input pro logo URL */}
        <div className="setup-input-wrapper">
          <input
            type="text"
            className="setup-input"
            placeholder="Logo URL (volitelně)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        {/* Část pro pricing */}
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

        {/* Výběr typu platby */}
        <div className="setup-input-wrapper">
          <label htmlFor="billing-select">Payment Type *</label>
          <select
            id="billing-select"
            className="setup-input"
            value={billingPeriod}
            onChange={handleBillingChange}
          >
            <option value="none">Free (ZDARMA)</option>
            <option value="single">Single Payment</option>
            <option value="1min">Recurring: 1 minute</option>
            <option value="7days">Recurring: 7 days</option>
            <option value="14days">Recurring: 14 days</option>
            <option value="30days">Recurring: 30 days</option>
            <option value="1year">Recurring: 1 year</option>
          </select>
          {billingPeriod !== "none" && billingPeriod !== "single" && (
            <p className="setup-note">
              Toto nastavení znamená opakovanou platbu. Systém automaticky strhne uvedenou částku v zvoleném intervalu.
            </p>
          )}
        </div>

        {/* Volba Waitlist */}
        <div className="setup-input-wrapper">
          <label htmlFor="waitlist-checkbox">
            <input
              id="waitlist-checkbox"
              type="checkbox"
              checked={waitlistEnabled}
              onChange={handleWaitlistToggle}
            />
            Enable waitlist
          </label>
          <p className="setup-note">
            Pokud zapnete, uživatelé se nejprve přihlásí do waitlistu a majitel je schválí nebo odmítne.
          </p>
        </div>

        {/* Otázky pro waitlist */}
        {waitlistEnabled && (
          <div className="setup-input-wrapper">
            <p className="setup-subtitle">
              Přidejte až 5 kontrolních otázek pro žádost o waitlist:
            </p>
            {waitlistQuestions.map((q, idx) => (
              <div key={idx} className="setup-input-wrapper">
                <input
                  type="text"
                  className="setup-input"
                  placeholder={`Question ${idx + 1} (volitelně)`}
                  value={q}
                  onChange={(e) => handleQuestionChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tlačítka Back a Continue */}
        <div className="setup-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="setup-button"
            onClick={handleContinue}
            disabled={
              whopName.trim().length === 0 ||
              description.trim().length === 0 ||
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
