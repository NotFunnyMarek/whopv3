import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/choose-link.scss";
import { getWhopSetupCookie, setWhopSetupCookie } from "../utils/cookieUtils";

export default function ChooseLink() {
  const [slug, setSlug] = useState("");
  const maxSlugLength = 30;

  const navigate = useNavigate();
  const location = useLocation();

  // Pokud existuje state z location, použijeme ho; jinak z cookie
  const cookieData = getWhopSetupCookie();
  const prevWhopData = location.state?.whopData || cookieData || null;

  useEffect(() => {
    if (prevWhopData?.slug) {
      setSlug(prevWhopData.slug);
    }
  }, [prevWhopData]);

  if (!prevWhopData) {
    return (
      <div className="choose-link-error">
        <p>Whop data not found. Please complete the previous step first.</p>
        <button onClick={() => navigate("/setup")}>Go to Setup</button>
      </div>
    );
  }

  const handleChange = (e) => {
    // Pouze alfanumerické + pomlčka/podtržítko
    const value = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, "");
    if (value.length <= maxSlugLength) {
      setSlug(value);
    }
  };

  const handleBack = () => {
    // Uložíme state do cookie a vrátíme se na /setup
    const newData = {
      ...prevWhopData,
      slug: slug,
    };
    setWhopSetupCookie(newData);
    navigate("/setup", { state: { whopData: newData } });
  };

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
      <div className="choose-link-header">
        <h1 className="choose-link-title">Choose your Whop link</h1>
      </div>

      <div className="choose-link-content">
        <p className="choose-link-subtitle">
          This is the link you send to your customers.
        </p>

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

        <div className="choose-link-charcount">
          {slug.length}/{maxSlugLength}
        </div>

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
