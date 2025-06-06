// src/pages/FeaturesSetup.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import '../styles/features-setup.scss';

export default function FeaturesSetup() {
  // HOOKS vždy na vrcholu
  const [features, setFeatures] = useState([
    { id: 1, title: '', subtitle: '', imageFile: null, imagePreview: null },
    { id: 2, title: '', subtitle: '', imageFile: null, imagePreview: null },
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  // Načtení předchozích dat: očekáváme { name, slug, logoUrl } z ChooseLink.jsx
  const prevWhopData = location.state?.whopData || null;

  // Když chybí whopData, vrátíme chybovou obrazovku
  if (!prevWhopData) {
    return (
      <div className="features-setup-error">
        <p>Whop data not found. Please complete the previous steps first.</p>
        <button onClick={() => navigate('/setup')}>Go to Setup</button>
      </div>
    );
  }

  // Přidání nové feature
  const addFeature = () => {
    if (features.length >= 6) return;
    const newId =
      features.length > 0 ? Math.max(...features.map((f) => f.id)) + 1 : 1;
    setFeatures([
      ...features,
      { id: newId, title: '', subtitle: '', imageFile: null, imagePreview: null },
    ]);
  };

  // Odebrání feature (musí zůstat minimálně 2)
  const removeFeature = (id) => {
    if (features.length <= 2) return;
    setFeatures(features.filter((f) => f.id !== id));
  };

  // Změna názvu / podnadpisu
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

  // Nahrání obrázku a generování náhledu
  const handleImageChange = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                imageFile: file,
                imagePreview: reader.result,
              }
            : f
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // Validace: kolik features má title i imageFile
  const validCount = features.reduce((count, f) => {
    return count + (f.title.trim() && f.imageFile ? 1 : 0);
  }, 0);
  const isContinueEnabled = validCount >= 2;

  // Po kliknutí Continue: sestavíme whopData s features a pokračujeme na BannerSetup
  const handleContinue = () => {
    if (!isContinueEnabled) return;

    const whopData = {
      name: prevWhopData.name,
      slug: prevWhopData.slug,
      features: features.map((f) => ({
        title: f.title.trim(),
        subtitle: f.subtitle.trim(),
        imageUrl: f.imagePreview,
      })),
      logoUrl: prevWhopData.logoUrl || '',
    };

    navigate('/setup/banner', { state: { whopData } });
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
                onChange={(e) => handleChange(feature.id, 'title', e.target.value)}
              />
            </div>

            <div className="feature-field">
              <label htmlFor={`feature-subtitle-${feature.id}`}>Subtitle
                (Optional)</label>
              <textarea
                id={`feature-subtitle-${feature.id}`}
                className="feature-textarea"
                placeholder="Enter feature subtitle"
                value={feature.subtitle}
                onChange={(e) =>
                  handleChange(feature.id, 'subtitle', e.target.value)
                }
                rows="2"
              />
            </div>

            <div className="feature-field">
              <label>Image (1:1) *</label>
              <div className="feature-image-wrapper">
                {feature.imagePreview ? (
                  <img
                    src={feature.imagePreview}
                    alt={`Feature ${index + 1}`}
                    className="feature-image-preview"
                  />
                ) : (
                  <div className="feature-image-placeholder">
                    No image selected
                  </div>
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
              </div>
            </div>
          </div>
        ))}

        {features.length < 6 && (
          <button
            type="button"
            className="feature-add-btn"
            onClick={addFeature}
          >
            <FaPlus className="icon-plus" /> Add Feature
          </button>
        )}

        <button
          className="features-continue-btn"
          onClick={handleContinue}
          disabled={!isContinueEnabled}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
