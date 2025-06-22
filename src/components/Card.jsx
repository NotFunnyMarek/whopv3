// src/components/Card.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../styles/card.scss';
import '../styles/activeUsers.scss'; // import for ActiveUsersIndicator
import ActiveUsersIndicator from './ActiveUsersIndicator';
import { FiPlusCircle, FiTrash2 } from 'react-icons/fi';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

export default function Card() {
  // ==== State variables ====
  const [campaigns, setCampaigns]           = useState([]);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [errorMessage, setErrorMessage]     = useState('');

  // Form fields for creating a new campaign
  const [name, setName]                     = useState('');
  const [category, setCategory]             = useState('');
  const [budget, setBudget]                 = useState('');
  const [currency, setCurrency]             = useState('USD');
  const [rewardPerThousand, setRewardPerThousand] = useState('');
  const [minPayout, setMinPayout]           = useState('');
  const [maxPayout, setMaxPayout]           = useState('');
  const [platforms, setPlatforms]           = useState({
    instagram: false,
    tiktok:    false,
  });
  const [thumbnailUrl, setThumbnailUrl]     = useState('');
  const [newContentLink, setNewContentLink] = useState('');
  const [contentLinks, setContentLinks]     = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [requirements, setRequirements]     = useState([]);

  // ==== 1) Load all campaigns on mount ====
  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      // Normalize: convert numeric strings to numbers
      const normalized = data.map(c => ({
        ...c,
        id:                   Number(c.id),
        user_id:              Number(c.user_id),
        username:             c.username,
        campaign_name:        c.campaign_name,
        category:             c.category,
        budget:               Number(c.budget),
        currency:             c.currency,
        reward_per_thousand:  Number(c.reward_per_thousand),
        min_payout:           c.min_payout   !== null ? Number(c.min_payout)   : null,
        max_payout:           c.max_payout   !== null ? Number(c.max_payout)   : null,
        platforms:            Array.isArray(c.platforms)     ? c.platforms     : [],
        thumbnail_url:        c.thumbnail_url,
        content_links:        Array.isArray(c.content_links) ? c.content_links : [],
        requirements:         Array.isArray(c.requirements)  ? c.requirements  : [],
        paid_out:             Number(c.paid_out),
        total_paid_out:       Number(c.total_paid_out),
        paid_percent:         Number(c.paid_percent),
        created_at:           c.created_at,
        is_active:            Number(c.is_active),
      }));
      setCampaigns(normalized);
    } catch (err) {
      setErrorMessage('Unable to load campaigns: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to refresh campaigns after creating a new one
  const refreshCampaigns = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      const normalized = data.map(c => ({
        ...c,
        id:                   Number(c.id),
        user_id:              Number(c.user_id),
        username:             c.username,
        campaign_name:        c.campaign_name,
        category:             c.category,
        budget:               Number(c.budget),
        currency:             c.currency,
        reward_per_thousand:  Number(c.reward_per_thousand),
        min_payout:           c.min_payout   !== null ? Number(c.min_payout)   : null,
        max_payout:           c.max_payout   !== null ? Number(c.max_payout)   : null,
        platforms:            Array.isArray(c.platforms)     ? c.platforms     : [],
        thumbnail_url:        c.thumbnail_url,
        content_links:        Array.isArray(c.content_links) ? c.content_links : [],
        requirements:         Array.isArray(c.requirements)  ? c.requirements  : [],
        paid_out:             Number(c.paid_out),
        total_paid_out:       Number(c.total_paid_out),
        paid_percent:         Number(c.paid_percent),
        created_at:           c.created_at,
        is_active:            Number(c.is_active),
      }));
      setCampaigns(normalized);
    } catch (e) {
      console.error('refreshCampaigns error:', e);
    }
  };

  // ==== 2) Handle form submission (POST) ====
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !category.trim() || !budget || !rewardPerThousand) {
      setErrorMessage('Please fill in all required fields (*)!');
      return;
    }

    const payload = {
      campaign_name:       name,
      category:            category,
      budget:              parseFloat(budget),
      currency:            currency,
      reward_per_thousand: parseFloat(rewardPerThousand),
      min_payout:          minPayout ? parseFloat(minPayout) : null,
      max_payout:          maxPayout ? parseFloat(maxPayout) : null,
      platforms:           Object.keys(platforms).filter(k => platforms[k]),
      thumbnail_url:       thumbnailUrl.trim(),
      content_links:       contentLinks,
      requirements:        requirements,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setErrorMessage('You are not logged in. Please log in.');
        return;
      }
      if (response.status === 201) {
        // Successfully created
        setName('');
        setCategory('');
        setBudget('');
        setCurrency('USD');
        setRewardPerThousand('');
        setMinPayout('');
        setMaxPayout('');
        setPlatforms({ instagram: false, tiktok: false });
        setThumbnailUrl('');
        setNewContentLink('');
        setContentLinks([]);
        setNewRequirement('');
        setRequirements([]);
        setIsModalOpen(false);
        refreshCampaigns();
      } else {
        const data = await response.json();
        setErrorMessage(data.error || `Error ${response.status}`);
      }
    } catch (e) {
      setErrorMessage('Network error: ' + e.message);
    }
  };

  // ==== 3) Manage list of content links ====
  const addContentLink = () => {
    const url = newContentLink.trim();
    if (!url) return;
    setContentLinks(prev => [...prev, url]);
    setNewContentLink('');
  };
  const removeContentLink = index => {
    setContentLinks(prev => prev.filter((_, i) => i !== index));
  };

  // ==== 4) Manage list of requirements ====
  const addRequirement = () => {
    const text = newRequirement.trim();
    if (!text) return;
    setRequirements(prev => [...prev, text]);
    setNewRequirement('');
  };
  const removeRequirement = index => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  // ==== 5) Platform checkbox handler ====
  const handlePlatformChange = e => {
    const { name, checked } = e.target;
    setPlatforms(prev => ({ ...prev, [name]: checked }));
  };

  // ==== RENDER ====
  return (
    <div className="card-container">
      {errorMessage && <div className="card-error">{errorMessage}</div>}

      {/* "Create" button */}
      <button
        className="card-create-btn"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        <FiPlusCircle /> Create
      </button>

      {/* ======= MODAL WITH FORM ======= */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Create Campaign</h2>
        <form onSubmit={handleSubmit} className="card-form">
          {/* Campaign Name */}
          <div className="form-group">
            <label>
              Campaign Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>
              Category <span className="required">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">— Select Category —</option>
              <option value="Personal brand">Personal brand</option>
              <option value="Product review">Product review</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          {/* Budget */}
          <div className="form-group">
            <label>
              Campaign Budget ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
            />
          </div>

          {/* Currency */}
          <div className="form-group">
            <label>Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          {/* Reward Rate */}
          <div className="form-group">
            <label>
              Reward Rate ($ / 1000 views) <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rewardPerThousand}
              onChange={e => setRewardPerThousand(e.target.value)}
              required
            />
          </div>

          {/* Min & Max Payout */}
          <div className="form-group-grouped">
            <div>
              <label>Minimum Payout ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minPayout}
                onChange={e => setMinPayout(e.target.value)}
              />
            </div>
            <div>
              <label>Maximum Payout ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={maxPayout}
                onChange={e => setMaxPayout(e.target.value)}
              />
            </div>
          </div>

          {/* Platforms */}
          <fieldset className="form-group cf-fieldset">
            <legend>Platforms</legend>
            <div className="cf-platforms-row">
              {['instagram', 'tiktok'].map(name => (
                <label key={name} className="cf-platform-label">
                  <input
                    type="checkbox"
                    name={name}
                    checked={platforms[name]}
                    onChange={handlePlatformChange}
                  />
                  <span className="cf-platform-text">{name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Thumbnail URL */}
          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="text"
              placeholder="https://example.com/thumb.jpg"
              value={thumbnailUrl}
              onChange={e => setThumbnailUrl(e.target.value)}
            />
          </div>

          {/* Available Content (URL) */}
          <div className="form-group">
            <label>Available Content (URL)</label>
            <div className="list-input-row cf-list-input-row">
              <input
                type="text"
                placeholder="https://drive.google.com/..."
                value={newContentLink}
                onChange={e => setNewContentLink(e.target.value)}
              />
              <button
                type="button"
                className="list-add-btn cf-list-add-btn"
                onClick={addContentLink}
              >
                <FiPlusCircle />
              </button>
            </div>
            <ul className="list-container cf-list-container">
              {contentLinks.map((link, idx) => (
                <li key={idx} className="list-item cf-list-item">
                  <a
                    href={/^https?:\/\//.test(link) ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    className="list-delete-btn cf-list-delete-btn"
                    onClick={() => removeContentLink(idx)}
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Requirements */}
          <div className="form-group">
            <label>Content Requirements</label>
            <div className="list-input-row cf-list-input-row">
              <input
                type="text"
                placeholder="e.g. Must tag @whop"
                value={newRequirement}
                onChange={e => setNewRequirement(e.target.value)}
              />
              <button
                type="button"
                className="list-add-btn cf-list-add-btn"
                onClick={addRequirement}
              >
                <FiPlusCircle />
              </button>
            </div>
            <ul className="list-container cf-list-container">
              {requirements.map((req, idx) => (
                <li key={idx} className="list-item cf-list-item">
                  <span>{req}</span>
                  <button
                    type="button"
                    className="list-delete-btn cf-list-delete-btn"
                    onClick={() => removeRequirement(idx)}
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <button type="submit" className="form-submit-btn">
            Save Campaign
          </button>
        </form>
      </Modal>

      {/* ===== Campaign Cards Grid ===== */}
      <div className="cards-grid">
        {isLoading && (
          <>
            {/* 4 skeleton cards */}
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="card-item card-skeleton" />
            ))}
          </>
        )}
        {!isLoading && campaigns.length === 0 && (
          <div className="card-empty">No campaigns to display.</div>
        )}
        {!isLoading && campaigns.length > 0 && campaigns.map(camp => (
          <div key={camp.id} className="card-item">
            <div className="card-header">
              <div className="card-icon">
                {camp.thumbnail_url ? (
                  <img src={camp.thumbnail_url} alt="Thumbnail" />
                ) : (
                  camp.username.charAt(0).toUpperCase()
                )}
              </div>
              <h3>{camp.campaign_name}</h3>
              <span className="card-tag">
                {camp.currency}{camp.reward_per_thousand.toFixed(2)} / 1K
              </span>
              {/* Add ActiveUsersIndicator here */}
              <ActiveUsersIndicator campaignId={camp.id} />
            </div>

            <div className="card-body">
              <div className="card-author">
                <strong>Author:</strong> {camp.username}
              </div>
              <div className="card-line">
                {camp.currency}{camp.paid_out.toFixed(2)} of {camp.currency}{camp.total_paid_out.toFixed(2)} paid out
                <span className="card-percent">{camp.paid_percent}%</span>
              </div>
              <div className="card-progress-bar">
                <div
                  className="card-progress-fill"
                  style={{ width: `${camp.paid_percent}%` }}
                />
              </div>
              <ul className="card-info-list">
                <li><strong>Type:</strong> {camp.type}</li>
                <li><strong>Category:</strong> {camp.category}</li>
                <li>
                  <strong>Platforms:</strong>{' '}
                  {camp.platforms.map((p, i) => (
                    <span key={i} className="platform-pill">{p}</span>
                  ))}
                </li>
                <li>
                  <strong>Views:</strong>{' '}
                  {camp.reward_per_thousand > 0
                    ? Math.round((camp.paid_out / camp.reward_per_thousand) * 1000)
                    : 0}
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
