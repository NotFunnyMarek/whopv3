// src/pages/FeaturesSetup.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import '../styles/features-setup.scss';

export default function FeaturesSetup() {
  const navigate = useNavigate();

  // Stav pro všechny features (každá má id, title, subtitle, imageFile, imagePreview)
  const [features, setFeatures] = useState([
    { id: 1, title: '', subtitle: '', imageFile: null, imagePreview: null },
    { id: 2, title: '', subtitle: '', imageFile: null, imagePreview: null },
  ]);

  // Přidání nové feature (max. 6)
  const addFeature = () => {
    if (features.length >= 6) return;
    const newId = features.length > 0
      ? Math.max(...features.map((f) => f.id)) + 1
      : 1;
    setFeatures([
      ...features,
      { id: newId, title: '', subtitle: '', imageFile: null, imagePreview: null },
    ]);
  };

  // Odebrání feature (alespoň 2 musí zůstat)
  const removeFeature = (id) => {
    if (features.length <= 2) return;
    setFeatures(features.filter((f) => f.id !== id));
  };

  // Změna názvu nebo podnadpisu u feature
  const handleChange = (id, field, value) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, [field]: value }
          : f
      )
    );
  };

  // Zpracování nahrání obrázku (imageFile + náhled)
  const handleImageChange = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, imageFile: file, imagePreview: reader.result }
            : f
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // Validace: spočítáme, kolik feature má title i imageFile vyplněné
  const validCount = features.reduce((count, f) => {
    return count + (f.title.trim() && f.imageFile ? 1 : 0);
  }, 0);
  const isContinueEnabled = validCount >= 2;

  // Po kliknutí na Continue: přesměrujeme na /setup/banner
  const handleContinue = () => {
    if (!isContinueEnabled) return;
    console.log('Zadané features:', features);
    navigate('/setup/banner');
  };

  return (
    <div className="features-setup-container">
      {/* HLAVIČKA */}
      <div className="features-setup-header">
        <h1 className="features-setup-title">Add Your Whop Features</h1>
      </div>

      {/* OBSAH */}
      <div className="features-setup-content">
        <p className="features-setup-subtitle">
          Define at least 2 and up to 6 features. Each feature can have a title, an optional subtitle, and a square image.
        </p>

        {/* Jednotlivé karty pro každou feature */}
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
                onChange={(e) =>
                  handleChange(feature.id, 'title', e.target.value)
                }
              />
            </div>

            <div className="feature-field">
              <label htmlFor={`feature-subtitle-${feature.id}`}>Subtitle (Optional)</label>
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

        {/* Tlačítko "Add Feature" (pokud je méně než 6) */}
        {features.length < 6 && (
          <button
            type="button"
            className="feature-add-btn"
            onClick={addFeature}
          >
            <FaPlus className="icon-plus" /> Add Feature
          </button>
        )}

        {/* Tlačítko "Continue" */}
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
