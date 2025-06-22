// src/pages/WhopDashboard/components/FeaturesSection.jsx

import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function FeaturesSection({
  whopData,
  isEditing,
  editFeatures,
  handleFeatChange,
  handleImageChange,
  removeFeature,
  addFeature,
}) {
  return (
    <div className="whop-features-section">
      <h2 className="features-section-title">Features</h2>

      {isEditing ? (
        <>
          {editFeatures.map((feat, idx) => (
            <div key={feat.id} className="feature-card-edit">
              <div className="feature-number-edit">Feature {idx + 1}</div>

              <div className="feature-field-edit">
                <label>Title *</label>
                <input
                  type="text"
                  className="feature-input-edit"
                  value={feat.title}
                  onChange={(e) =>
                    handleFeatChange(feat.id, "title", e.target.value)
                  }
                  placeholder="Feature title"
                />
              </div>

              <div className="feature-field-edit">
                <label>Subtitle (optional)</label>
                <textarea
                  className="feature-textarea-edit"
                  rows="1"
                  value={feat.subtitle}
                  onChange={(e) =>
                    handleFeatChange(feat.id, "subtitle", e.target.value)
                  }
                  placeholder="Short description"
                />
              </div>

              <div className="feature-field-edit">
                <label>Image *</label>
                <div className="feature-image-wrapper-edit">
                  {feat.isUploading ? (
                    <div className="feature-image-uploading">Uploading…</div>
                  ) : feat.imageUrl ? (
                    <img
                      src={feat.imageUrl}
                      alt={`Feature ${idx + 1}`}
                      className="feature-image-preview-edit"
                    />
                  ) : (
                    <div className="feature-image-placeholder-edit">
                      No image
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="feature-image-input-edit"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleImageChange(feat.id, file);
                    }}
                  />

                  {feat.error && (
                    <div className="feature-image-error-edit">{feat.error}</div>
                  )}
                </div>
              </div>

              {editFeatures.length > 2 && (
                <button
                  className="feature-remove-btn-edit"
                  onClick={() => removeFeature(feat.id)}
                >
                  <FaTrash /> Remove
                </button>
              )}
            </div>
          ))}

          {editFeatures.length < 6 && (
            <button className="feature-add-btn-edit" onClick={addFeature}>
              <FaPlus /> Add Feature
            </button>
          )}
        </>
      ) : (
        <div className="whop-features-grid">
          {whopData.features.map((feat, idx) => (
            <div key={idx} className="whop-feature-card">
              {feat.image_url ? (
                <img
                  src={feat.image_url}
                  alt={feat.title}
                  className="whop-feature-image"
                />
              ) : (
                <div className="whop-feature-image-placeholder" />
              )}
              <div className="whop-feature-text">
                <h3 className="whop-feature-title">{feat.title}</h3>
                {feat.subtitle && (
                  <p className="whop-feature-subtitle">{feat.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
