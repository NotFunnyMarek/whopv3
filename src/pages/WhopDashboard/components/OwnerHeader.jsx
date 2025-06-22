// src/pages/WhopDashboard/components/OwnerHeader.jsx

import React from "react";
import { FaUsers } from "react-icons/fa";
import "../../../styles/whop-dashboard/_owner.scss";

export default function OwnerHeader({
  whopData,
  isEditing,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editBannerUrl,
  isUploadingBanner,
  bannerError,
  handleBannerUpload,
}) {
  return (
    <>
      <div className="whop-banner">
        {isEditing ? (
          <div className="whop-banner-edit-wrapper">
            {isUploadingBanner ? (
              <div className="banner-uploading">Uploading banner…</div>
            ) : editBannerUrl ? (
              <img
                src={editBannerUrl}
                alt="Banner Preview"
                className="whop-banner-image-edit"
              />
            ) : (
              <div className="whop-banner-placeholder-edit">No banner</div>
            )}
            <input
              type="file"
              accept="image/*"
              className="whop-banner-input-edit"
              onChange={(e) => {
                const file = e.target.files[0];
                handleBannerUpload(file);
              }}
            />
            {bannerError && (
              <div className="whop-banner-error-edit">{bannerError}</div>
            )}
          </div>
        ) : whopData.banner_url ? (
          <img
            src={whopData.banner_url}
            alt={`${whopData.name} Banner`}
            className="whop-banner-image"
          />
        ) : (
          <div className="whop-banner-placeholder">No banner</div>
        )}
      </div>

      <div className="whop-header">
        {isEditing ? (
          <>
            <input
              type="text"
              className="whop-input-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Whop Name"
            />
            <textarea
              className="whop-input-description"
              rows="2"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Brief description"
            />
          </>
        ) : (
          <div className="whop-header-view">
            <h1 className="whop-title">{whopData.name}</h1>
            <div className="whop-members-count">
              <FaUsers /> {whopData.members_count} members
            </div>
            <p className="whop-description">{whopData.description}</p>
          </div>
        )}
      </div>
    </>
  );
}
