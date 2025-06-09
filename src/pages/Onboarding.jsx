// src/pages/Onboarding.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGlobe, FaPlus, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/onboarding.scss";

export default function Onboarding() {
  const navigate = useNavigate();
  const { showNotification, showConfirm } = useNotifications();

  const [selectedOption, setSelectedOption] = useState("");
  const [userWhops, setUserWhops] = useState([]);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    const fetchUserWhops = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://app.byxbot.com/php/get_user_whops.php", {
          method: "GET",
          credentials: "include",
        });
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          showNotification({ type: "error", message: "Chyba při zpracování odpovědi serveru." });
          setLoading(false);
          return;
        }
        if (!res.ok || json.status !== "success") {
          showNotification({ type: "error", message: json.message || "Nepodařilo se načíst tvoje whopy." });
          setLoading(false);
          return;
        }
        setUserWhops(json.data);
        showNotification({ type: "success", message: "Seznam whopů načten." });
      } catch (err) {
        console.error("Network error get_user_whops:", err);
        showNotification({ type: "error", message: "Network error: " + err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchUserWhops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectNew = () => setSelectedOption("new");
  const handleSelectExisting = (slug) => setSelectedOption(slug);

  const handleContinue = async () => {
    if (!selectedOption) {
      showNotification({ type: "error", message: "Prosím vyberte možnost." });
      return;
    }
    if (selectedOption === "new") {
      navigate("/setup");
    } else {
      navigate(`/c/${selectedOption}`);
    }
  };

  const handleBack = async () => {
    try {
      await showConfirm("Opravdu se chcete vrátit na domovskou stránku?");
      navigate("/");
    } catch {
      return;
    }
  };

  if (loading) {
    return (
      <div className="onboarding-loading">
        <span>Načítám seznam tvých whopů…</span>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1 className="onboarding-title">Onboarding</h1>
      </div>

      <div className="onboarding-content">
        <h2 className="onboarding-question">
          Který dashboard chcete použít?
        </h2>
        <p className="onboarding-subtitle">
          Pokud chcete vytvořit nový Whop, vyberte „+ Create new whop“. Pokud máte existující Whop, vyberte jej a budete přesměrováni na jeho Dashboard.
        </p>

        <div className="onboarding-options">
          {/* 1) + Create new whop */}
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

        <div className="onboarding-buttons">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft /> Back
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
