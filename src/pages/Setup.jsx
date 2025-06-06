// src/pages/Setup.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/setup.scss";
import { getWhopSetupCookie, setWhopSetupCookie } from "../utils/cookieUtils";

export default function Setup() {
  const navigate = useNavigate();

  // Načteme z cookie, pokud existuje
  const cookieData = getWhopSetupCookie();
  const initialName = cookieData?.name || "";
  const initialDesc = cookieData?.description || "";

  const [whopName, setWhopName] = useState(initialName);
  const [description, setDescription] = useState(initialDesc);
  const maxNameLength = 30;
  const maxDescLength = 200;

  useEffect(() => {
    // Upravíme cookie, když se whopName nebo description změní
    const newData = {
      ...(cookieData || {}),
      name: whopName,
      description: description,
    };
    setWhopSetupCookie(newData);
  }, [whopName, description]);

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

  const handleContinue = () => {
    if (!whopName.trim() || !description.trim()) return;

    const whopData = {
      name: whopName.trim(),
      description: description.trim(),
      slug: cookieData?.slug || "",
      features: cookieData?.features || [],
      logoUrl: cookieData?.logoUrl || "",
    };

    setWhopSetupCookie(whopData);
    navigate("/setup/link", { state: { whopData } });
  };

  const handleBack = () => {
    // Není předchozí krok – můžeme jít zpět třeba na onboarding
    navigate("/onboarding");
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h1 className="setup-title">Name your whop</h1>
      </div>

      <div className="setup-content">
        <p className="setup-subtitle">
          Zadej název a základní popis svého whopu. Popis se zobrazí návštěvníkům.
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

        {/* Tlačítka Back a Continue */}
        <div className="setup-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="setup-button"
            onClick={handleContinue}
            disabled={whopName.trim().length === 0 || description.trim().length === 0}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
