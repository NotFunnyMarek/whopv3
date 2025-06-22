import React, { useState, useEffect } from 'react';
import {
  FaInstagram,
  FaTiktok,
  FaQuestionCircle,
  FaGoogleDrive,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import '../styles/card-form.scss';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

export default function CardForm({ whopId, onClose, onRefresh }) {
  const [campaignName, setCampaignName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('Clipping');
  const [budget, setBudget] = useState('');
  const [rewardPerThousand, setRewardPerThousand] = useState('');
  const [minPayout, setMinPayout] = useState('');
  const [maxPayout, setMaxPayout] = useState('');
  const [platforms, setPlatforms] = useState({
    instagram: false,
    tiktok: false,
  });
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [contentLinks, setContentLinks] = useState([]);
  const [newContentLink, setNewContentLink] = useState('');
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [expirationDateTime, setExpirationDateTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Clamp rewardPerThousand whenever budget changes
  useEffect(() => {
    const b = parseFloat(budget) || 0;
    if (parseFloat(rewardPerThousand) > b) {
      setRewardPerThousand(b.toString());
    }
  }, [budget, rewardPerThousand]);

  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setPlatforms((prev) => ({ ...prev, [name]: checked }));
  };

  const addContentLink = () => {
    const url = newContentLink.trim();
    if (!url) return;
    setContentLinks((prev) => [...prev, url]);
    setNewContentLink('');
  };
  const removeContentLink = (idx) => {
    setContentLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRequirement = () => {
    const txt = newRequirement.trim();
    if (!txt) return;
    setRequirements((prev) => [...prev, txt]);
    setNewRequirement('');
  };
  const removeRequirement = (idx) => {
    setRequirements((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !type ||
      !campaignName.trim() ||
      !category ||
      !budget ||
      !rewardPerThousand ||
      !expirationDateTime
    ) {
      setErrorMsg('Please fill out all required fields * and expiration date/time.');
      return;
    }

    let expFormatted = expirationDateTime.replace('T', ' ');
    if (expFormatted.length === 16) expFormatted += ':00';

    const payload = {
      whop_id: whopId,
      campaign_name: campaignName.trim(),
      category,
      type,
      budget: parseFloat(budget),
      currency: 'USD',
      reward_per_thousand: parseFloat(rewardPerThousand),
      min_payout: minPayout ? parseFloat(minPayout) : null,
      max_payout: maxPayout ? parseFloat(maxPayout) : null,
      platforms: Object.keys(platforms).filter((k) => platforms[k]),
      thumbnail_url: thumbnailUrl.trim() || null,
      content_links: contentLinks,
      requirements,
      expiration_datetime: expFormatted,
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setErrorMsg('Unauthorized. Please log in.');
        return;
      }
      if (res.status === 201) {
        onRefresh();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || `Error ${res.status}`);
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    }
  };

  const renderTypeSelect = () => (
    <div className="cf-input-group">
      <label>
        Campaign Type <span className="cf-required">*</span>
      </label>
      <select value={type} onChange={(e) => setType(e.target.value)} required>
        <option value="">— Select type —</option>
        <option value="Clipping">Clipping</option>
        <option value="UGC">UGC</option>
      </select>
    </div>
  );

  const renderPlatformIcon = (name) => {
    const size = 20;
    if (name === 'instagram') return <FaInstagram size={size} />;
    if (name === 'tiktok') return <FaTiktok size={size} />;
    return null;
  };

  return (
    <div className="cf-form-container">
      <h2>Create Campaign</h2>
      {errorMsg && <div className="cf-error">{errorMsg}</div>}
      <form onSubmit={handleSubmit} className="cf-form">
        <div className="cf-input-group">
          <label>
            Campaign Name <span className="cf-required">*</span>
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Enter campaign name"
            required
          />
        </div>

        {renderTypeSelect()}

        <div className="cf-input-group">
          <label>
            Category <span className="cf-required">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">— Select category —</option>
            <option value="Personal brand">Personal brand</option>
            <option value="Product review">Product review</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>

        <div className="cf-input-group">
          <label>
            Total Budget (USD) <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="Total budget for the campaign" />
          </label>
          <div className="cf-currency-row">
            <span className="cf-currency-symbol">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="cf-input-group">
          <label>
            Reward per 1000 Views <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="USD per 1000 views" />
          </label>
          <div className="cf-reward-row">
            <span className="cf-currency-symbol">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rewardPerThousand}
              onChange={(e) => {
                let val = parseFloat(e.target.value) || '';
                const b = parseFloat(budget) || 0;
                if (val > b) val = b;
                setRewardPerThousand(val.toString());
              }}
              placeholder="0.00"
              required
            />
            <span className="cf-text-views">/ 1000 views</span>
          </div>
        </div>

        <div className="cf-grid-two-cols">
          <div className="cf-input-group">
            <label>
              Minimum Payout (USD){' '}
              <FaQuestionCircle title="Minimum amount the influencer will receive" />
            </label>
            <div className="cf-currency-row">
              <span className="cf-currency-symbol">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="cf-input-group">
            <label>
              Maximum Payout (USD){' '}
              <FaQuestionCircle title="Maximum amount the influencer can earn" />
            </label>
            <div className="cf-currency-row">
              <span className="cf-currency-symbol">$</span>
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

        <fieldset className="cf-fieldset">
          <legend>
            Platforms <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="Select social platforms for the campaign" />
          </legend>
          <div className="cf-platforms-row">
            {['instagram', 'tiktok'].map((name) => (
              <label key={name} className="cf-platform-label">
                <input
                  type="checkbox"
                  name={name}
                  checked={platforms[name]}
                  onChange={handlePlatformChange}
                />
                {renderPlatformIcon(name)} {name.charAt(0).toUpperCase() + name.slice(1)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="cf-input-group">
          <label>Thumbnail URL</label>
          <input
            type="text"
            placeholder="https://example.com/thumb.jpg"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        <div className="cf-input-group">
          <h4 className="cf-subtitle">Available Content Links</h4>
          <label className="cf-small-note">Add links (e.g. Google Drive, YouTube):</label>
          <div className="cf-list-input-row">
            <input
              type="text"
              value={newContentLink}
              onChange={(e) => setNewContentLink(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <button type="button" onClick={addContentLink} className="cf-list-add-button">
              <FaPlus />
            </button>
          </div>
          <ul className="cf-list-container">
            {contentLinks.map((link, idx) => (
              <li key={idx} className="cf-list-item">
                <FaGoogleDrive className="cf-list-icon" />
                <a
                  href={/^https?:\/\//.test(link) ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cf-list-text"
                >
                  {link}
                </a>
                <button
                  type="button"
                  onClick={() => removeContentLink(idx)}
                  className="cf-list-delete-button"
                  aria-label="Remove link"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="cf-input-group">
          <h4 className="cf-subtitle">Content Requirements</h4>
          <label className="cf-small-note">Add rules creators must follow:</label>
          <div className="cf-list-input-row">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="e.g. Must tag @whop in caption"
            />
            <button type="button" onClick={addRequirement} className="cf-list-add-button">
              <FaPlus />
            </button>
          </div>
          <ul className="cf-list-container">
            {requirements.map((item, idx) => (
              <li key={idx} className="cf-list-item">
                <span className="cf-list-text">{item}</span>
                <button
                  type="button"
                  onClick={() => removeRequirement(idx)}
                  className="cf-list-delete-button"
                  aria-label="Remove requirement"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="cf-input-group">
          <label>
            Expiration Date/Time <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="Date and time when campaign expires" />
          </label>
          <input
            type="datetime-local"
            value={expirationDateTime}
            onChange={(e) => setExpirationDateTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="cf-submit-button">
          Save Campaign
        </button>
      </form>
    </div>
  );
}
