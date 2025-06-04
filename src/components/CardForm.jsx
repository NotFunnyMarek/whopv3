import React, { useState, useEffect } from 'react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaQuestionCircle,
  FaGoogleDrive,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import '../styles/card-form.scss';

export default function CardForm({ onAddCard, onClose }) {
  // Základní stavy formuláře
  const [campaignName, setCampaignName] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Jediné pole: $ za 1000 views
  const [rewardPerThousand, setRewardPerThousand] = useState('');

  const [minPayout, setMinPayout] = useState('');
  const [maxPayout, setMaxPayout] = useState('');

  // Checkboxy pro platformy
  const [platforms, setPlatforms] = useState({
    instagram: false,
    tiktok: false,
    youtube: false,
  });

  // Thumbnail upload a preview
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // Stavy pro AVAILABLE CONTENT (více URL)
  const [newContentLink, setNewContentLink] = useState('');
  const [contentLinks, setContentLinks] = useState([]);

  // Stavy pro CONTENT REQUIREMENTS (víc pravidel)
  const [newRequirement, setNewRequirement] = useState('');
  const [requirements, setRequirements] = useState([]);

  // Preview: paid out bar
  const [paidOut, setPaidOut] = useState(0);
  const [totalPaidOut, setTotalPaidOut] = useState(() => parseFloat(budget) || 0);
  const [paidPercent, setPaidPercent] = useState(0);

  useEffect(() => {
    setTotalPaidOut(parseFloat(budget) || 0);
  }, [budget]);

  useEffect(() => {
    if (totalPaidOut > 0) {
      setPaidPercent(Math.min(100, Math.round((paidOut / totalPaidOut) * 100)));
    } else {
      setPaidPercent(0);
    }
  }, [paidOut, totalPaidOut]);

  // Upload thumbnail
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0] || null;
    setThumbnailFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview('');
    }
  };

  // Checkboxy platform
  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setPlatforms((prev) => ({ ...prev, [name]: checked }));
  };

  // Přidání jedné URL do seznamu contentLinks
  const addContentLink = () => {
    const url = newContentLink.trim();
    if (!url) return;
    setContentLinks((prev) => [...prev, url]);
    setNewContentLink('');
  };

  // Smazání URL podle indexu
  const removeContentLink = (idx) => {
    setContentLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  // Přidání nové content requirement
  const addRequirement = () => {
    const text = newRequirement.trim();
    if (!text) return;
    setRequirements((prev) => [...prev, text]);
    setNewRequirement('');
  };

  // Smazání requirement podle indexu
  const removeRequirement = (idx) => {
    setRequirements((prev) => prev.filter((_, i) => i !== idx));
  };

  // Odeslání formuláře
  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedPlatforms = Object.keys(platforms).filter((k) => platforms[k]);

    const newCard = {
      campaignName,
      category,
      budget,
      currency,
      rewardPerThousand,
      minPayout,
      maxPayout,
      platforms: selectedPlatforms,
      thumbnailFile,
      contentLinks,
      requirements,
      paidOut,
      totalPaidOut,
      paidPercent,
    };

    onAddCard(newCard);

    // Reset po odeslání
    setCampaignName('');
    setCategory('');
    setBudget('');
    setCurrency('USD');
    setRewardPerThousand('');
    setMinPayout('');
    setMaxPayout('');
    setPlatforms({ instagram: false, tiktok: false, youtube: false });
    setThumbnailFile(null);
    setThumbnailPreview('');
    setNewContentLink('');
    setContentLinks([]);
    setNewRequirement('');
    setRequirements([]);
    setPaidOut(0);
    setTotalPaidOut(0);
    setPaidPercent(0);
    onClose();
  };

  // Rendeříme ikonku platformy v preview
  const renderPlatformIcon = (name, idx) => {
    const size = 20;
    switch (name) {
      case 'instagram':
        return <FaInstagram key={idx} size={size} className="pm-icon-instagram" />;
      case 'tiktok':
        return <FaTiktok key={idx} size={size} className="pm-icon-tiktok" />;
      case 'youtube':
        return <FaYoutube key={idx} size={size} className="pm-icon-youtube" />;
      default:
        return null;
    }
  };

  return (
    <div className="pm-overlay">
      <div className="pm-modal-container">
        {/** ====== NOVÉ místečko pro tlačítko zavřít: absolutně vpravo nahoře kreůdítka */}
        <button
          type="button"
          onClick={onClose}
          className="pm-global-close-button"
          aria-label="Close popup"
        >
          ✕
        </button>

        {/** ====== LEVÝ SLOUPEC: FORMULÁŘ ====== **/}
        <form onSubmit={handleSubmit} className="pm-form">
          {/* Záhlaví (bez křížku) */}
          <div className="pm-form-header">
            <h2>Content Reward setup</h2>
          </div>

          {/* Campaign name */}
          <div className="pm-input-group">
            <label>
              Campaign name <span className="pm-required">*</span>
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>

          {/* Category */}
          <div className="pm-input-group">
            <label>
              Category <span className="pm-required">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">— Select Category —</option>
              <option value="Personal brand">Personal brand</option>
              <option value="Product review">Product review</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          {/* Campaign budget */}
          <div className="pm-input-group">
            <label>
              Campaign budget <span className="pm-required">*</span>{' '}
              <FaQuestionCircle title="Total budget to allocate over time." />
            </label>
            <div className="pm-currency-row">
              <span className="pm-currency-symbol">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                required
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Reward rate ($ za 1000 views) */}
          <div className="pm-input-group">
            <label>
              Reward rate <span className="pm-required">*</span>{' '}
              <FaQuestionCircle title="$ amount per 1000 views" />
            </label>
            <div className="pm-reward-single">
              <span className="pm-currency-symbol">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rewardPerThousand}
                onChange={(e) => setRewardPerThousand(e.target.value)}
                placeholder="0.00"
                required
              />
              <span className="pm-text-views">/ 1000 views</span>
            </div>
          </div>

          {/* Minimum & Maximum payout */}
          <div className="pm-grid-two-cols">
            <div className="pm-input-group">
              <label>
                Minimum payout{' '}
                <FaQuestionCircle title="Minimum the influencer will get, regardless of views." />
              </label>
              <div className="pm-currency-row">
                <span className="pm-currency-symbol">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {minPayout && rewardPerThousand && (
                <p className="pm-hint">
                  ${parseFloat(minPayout).toFixed(2)} = min{' '}
                  {Math.round(
                    (parseFloat(minPayout) / (parseFloat(rewardPerThousand) || 1)) *
                      1000
                  )}{' '}
                  views
                </p>
              )}
            </div>
            <div className="pm-input-group">
              <label>
                Maximum payout{' '}
                <FaQuestionCircle title="Maximum the influencer can earn." />
              </label>
              <div className="pm-currency-row">
                <span className="pm-currency-symbol">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxPayout}
                  onChange={(e) => setMaxPayout(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Platforms */}
          <fieldset className="pm-input-group pm-fieldset">
            <legend>
              Platforms <span className="pm-required">*</span>{' '}
              <FaQuestionCircle title="Select social media platforms." />
            </legend>
            <div className="pm-platforms-row">
              {['instagram', 'tiktok', 'youtube'].map((name) => (
                <label key={name} className="pm-platform-label">
                  <input
                    type="checkbox"
                    name={name}
                    checked={platforms[name]}
                    onChange={handlePlatformChange}
                  />
                  {name === 'instagram' && (
                    <FaInstagram className="pm-icon-instagram" />
                  )}
                  {name === 'tiktok' && <FaTiktok className="pm-icon-tiktok" />}
                  {name === 'youtube' && (
                    <FaYoutube className="pm-icon-youtube" />
                  )}
                  <span className="pm-platform-text">{name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Upload thumbnail */}
          <div className="pm-input-group">
            <label>
              Upload thumbnail{' '}
              <FaQuestionCircle title="Recommended 1:1 square, max 5 MB." />
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="pm-file-input"
            />
            <div className="pm-thumb-preview">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="pm-thumb-img"
                />
              ) : (
                <span>Upload thumbnail</span>
              )}
            </div>
          </div>

          {/* ---------- AVAILABLE CONTENT ---------- */}
          <div className="pm-input-group">
            <h4 className="pm-subtitle">Available Content</h4>
            <label className="pm-small-note">
              We recommend you add guides and raw footage here:
            </label>
            <div className="pm-list-input-row">
              <input
                type="text"
                value={newContentLink}
                onChange={(e) => setNewContentLink(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
              <button
                type="button"
                onClick={addContentLink}
                className="pm-list-add-button"
              >
                <FaPlus />
              </button>
            </div>
            {/* Seznam přidaných odkazů */}
            <ul className="pm-list-container">
              {contentLinks.map((link, idx) => (
                <li key={idx} className="pm-list-item">
                  <FaGoogleDrive className="pm-list-icon" />
                  <a
                    href={/^https?:\/\//.test(link) ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pm-list-text"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeContentLink(idx)}
                    className="pm-list-delete-button"
                    aria-label="Remove link"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- CONTENT REQUIREMENTS ---------- */}
          <div className="pm-input-group">
            <h4 className="pm-subtitle">Content Requirements</h4>
            <label className="pm-small-note">
              Add content guidelines for users to follow:
            </label>
            <div className="pm-list-input-row">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="e.g. Must tag @whop in the description"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="pm-list-add-button"
              >
                <FaPlus />
              </button>
            </div>
            {/* Seznam přidaných požadavků */}
            <ul className="pm-list-container">
              {requirements.map((item, idx) => (
                <li key={idx} className="pm-list-item">
                  <span className="pm-list-text">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="pm-list-delete-button"
                    aria-label="Remove requirement"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tlačítko Continue */}
          <button type="submit" className="pm-submit-button">
            Continue
          </button>
        </form>

        {/** ====== PRAVÝ SLOUPEC: PREVIEW ====== **/}
        <div className="pm-preview">
          <div className="pm-preview-card">
            {/* Název a logo */}
            <div className="pm-preview-header">
              <div className="pm-logo-placeholder"></div>
              <h3 className="pm-preview-title">
                {campaignName || 'Campaign Name'}
              </h3>
            </div>

            {/* Thumbnail */}
            <div className="pm-preview-thumb-area">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumb"
                  className="pm-preview-thumb-img"
                />
              ) : (
                <span>Upload thumbnail</span>
              )}
            </div>

            {/* Paid out bar */}
            <div className="pm-paid-row">
              <span className="pm-paid-text">
                ${paidOut.toFixed(2)} of ${totalPaidOut.toFixed(2)} paid out
              </span>
              <span className="pm-paid-percent">{paidPercent}%</span>
            </div>
            <div className="pm-paid-bar">
              <div
                className="pm-paid-fill"
                style={{ width: paidPercent + '%' }}
              ></div>
            </div>

            {/* Info grid */}
            <div className="pm-info-grid">
              {/* Reward */}
              <div className="pm-info-row">
                <div className="pm-info-label">REWARD</div>
                <div className="pm-info-value">
                  ${rewardPerThousand || '0.00'} / 1000 views
                </div>
              </div>
              {/* Category */}
              <div className="pm-info-row">
                <div className="pm-info-label">CATEGORY</div>
                <div className="pm-info-pill">{category || '—'}</div>
              </div>
              {/* Minimum payout */}
              <div className="pm-info-row">
                <div className="pm-info-label">MINIMUM PAYOUT</div>
                <div className="pm-info-pill">${minPayout || '0.00'}</div>
              </div>
              {/* Maximum payout */}
              <div className="pm-info-row">
                <div className="pm-info-label">MAXIMUM PAYOUT</div>
                <div className="pm-info-pill">${maxPayout || '0.00'}</div>
              </div>
              {/* Platforms */}
              <div className="pm-info-row pm-col-span-2">
                <div className="pm-info-label">PLATFORMS</div>
                <div className="pm-platform-icons">
                  {Object.entries(platforms)
                    .filter(([, val]) => val)
                    .map(([name], idx) => renderPlatformIcon(name, idx))}
                </div>
              </div>
            </div>

            {/* Available Content (preview) */}
            <div className="pm-extra-section">
              <h4 className="pm-subtitle">Available Content</h4>
              {contentLinks.length === 0 && (
                <span className="pm-list-empty">No links added yet.</span>
              )}
              {contentLinks.map((link, idx) => (
                <div key={idx} className="pm-preview-link-row">
                  <FaGoogleDrive className="pm-list-icon" />
                  <a
                    href={/^https?:\/\//.test(link) ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pm-list-text"
                  >
                    {link}
                  </a>
                </div>
              ))}
            </div>

            {/* Content Requirements (preview) */}
            <div className="pm-extra-section">
              <h4 className="pm-subtitle">Content Requirements</h4>
              {requirements.length === 0 && (
                <span className="pm-list-empty">No requirements added yet.</span>
              )}
              <div className="pm-requirements-preview-container">
                {requirements.map((item, idx) => (
                  <span key={idx} className="pm-info-pill pm-requirement-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
