// src/pages/Onboarding.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGlobe, FaPlus, FaCheckCircle } from "react-icons/fa";
import "../styles/onboarding.scss";

export default function Onboarding() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [userWhops, setUserWhops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserWhops = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("https://app.byxbot.com/php/get_user_whops.php", {
          method: "GET",
          credentials: "include",
        });
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (parseErr) {
          console.error("Get user whops JSON parse error:", text);
          setError("Chyba při zpracování odpovědi serveru.");
          setLoading(false);
          return;
        }
        if (!res.ok || json.status !== "success") {
          const msg = json.message || "Nepodařilo se načíst tvoje whopy";
          setError(msg);
          setLoading(false);
          return;
        }
        setUserWhops(json.data);
      } catch (err) {
        console.error("Network error get_user_whops:", err);
        setError("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserWhops();
  }, []);

  const handleSelectNew = () => setSelectedOption("new");
  const handleSelectExisting = (slug) => setSelectedOption(slug);

  const handleContinue = () => {
    if (!selectedOption) return;
    if (selectedOption === "new") {
      navigate("/setup");
    } else {
      navigate(`/${selectedOption}`);
    }
  };

  const handleBack = () => {
    // Např. na přihlášení nebo homepage
    navigate("/"); // nebo "/"
  };

  if (loading) {
    return (
      <div className="onboarding-loading">
        <span>Načítám seznam tvých whopů…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="onboarding-error">
        <p>{error}</p>
        <button onClick={handleBack}>← Back</button>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      {/* HLAVIČKA */}
      <div className="onboarding-header">
        <h1 className="onboarding-title">Onboarding</h1>
      </div>

      {/* OBSAH */}
      <div className="onboarding-content">
        <h2 className="onboarding-question">
          Which dashboard would you like to create your whop in?
        </h2>
        <p className="onboarding-subtitle">
          We only recommend creating a new dashboard if you are starting a different
          business with a separate team or bank account.
        </p>

        {/* MOŽNOSTI */}
        <div className="onboarding-options">
          {/* 1) Vytvořit nový whop */}
          <div
            className={selectedOption === "new" ? "option-card selected" : "option-card"}
            onClick={handleSelectNew}
          >
            <div className="option-radio">
              {selectedOption === "new" ? (
                <FaCheckCircle className="radio-icon checked" />
              ) : (
                <div className="radio-icon unchecked" />
              )}
            </div>
            <div className="option-icon">
              <FaPlus className="icon-plus" />
            </div>
            <div className="option-text">+ Create new whop</div>
          </div>

          {/* 2) Seznam existujících whopů */}
          {userWhops.map((whop) => (
            <div
              key={whop.slug}
              className={
                selectedOption === whop.slug ? "option-card selected" : "option-card"
              }
              onClick={() => handleSelectExisting(whop.slug)}
            >
              <div className="option-radio">
                {selectedOption === whop.slug ? (
                  <FaCheckCircle className="radio-icon checked" />
                ) : (
                  <div className="radio-icon unchecked" />
                )}
              </div>
              <div className="option-icon">
                <FaGlobe className="icon-globe" />
              </div>
              <div className="option-text">{whop.name}</div>
            </div>
          ))}
        </div>

        {/* Tlačítka Back a Continue */}
        <div className="onboarding-buttons">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="onboarding-button"
            onClick={handleContinue}
            disabled={!selectedOption}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
