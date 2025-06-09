import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../styles/card.scss';
import '../styles/activeUsers.scss';              // import pro ActiveUsersIndicator
import ActiveUsersIndicator from './ActiveUsersIndicator';
import { FiPlusCircle, FiTrash2 } from 'react-icons/fi';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

export default function Card() {
  // ==== Stavové proměnné ====
  const [cardsData, setCardsData]       = useState([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [errorMsg, setErrorMsg]         = useState('');

  // Pole pro formulář (vytváříme novou kampaň)
  const [campaignName, setCampaignName]         = useState('');
  const [category, setCategory]                 = useState('');
  const [budget, setBudget]                     = useState('');
  const [currency, setCurrency]                 = useState('USD');
  const [rewardPerThousand, setRewardPerThousand] = useState('');
  const [minPayout, setMinPayout]               = useState('');
  const [maxPayout, setMaxPayout]               = useState('');
  const [platforms, setPlatforms]               = useState({
    instagram: false,
    tiktok:    false,
    youtube:   false,
  });
  const [thumbnailUrl, setThumbnailUrl]         = useState('');
  const [newContentLink, setNewContentLink]     = useState('');
  const [contentLinks, setContentLinks]         = useState([]);
  const [newRequirement, setNewRequirement]     = useState('');
  const [requirements, setRequirements]         = useState([]);

  // ==== 1) Načtení všech kampaní po mountu ====
  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        throw new Error(`Chyba ${res.status}`);
      }
      const data = await res.json();
      // Normalizace: převod stringů na čísla
      const normalized = data.map((camp) => ({
        ...camp,
        id:                  Number(camp.id),
        user_id:             Number(camp.user_id),
        username:            camp.username,
        campaign_name:       camp.campaign_name,
        category:            camp.category,
        budget:              Number(camp.budget),
        currency:            camp.currency,
        reward_per_thousand: Number(camp.reward_per_thousand),
        min_payout:          camp.min_payout   !== null ? Number(camp.min_payout)   : null,
        max_payout:          camp.max_payout   !== null ? Number(camp.max_payout)   : null,
        platforms:           Array.isArray(camp.platforms)     ? camp.platforms     : [],
        thumbnail_url:       camp.thumbnail_url,
        content_links:       Array.isArray(camp.content_links) ? camp.content_links : [],
        requirements:        Array.isArray(camp.requirements)  ? camp.requirements  : [],
        paid_out:            Number(camp.paid_out),
        total_paid_out:      Number(camp.total_paid_out),
        paid_percent:        Number(camp.paid_percent),
        created_at:          camp.created_at,
        is_active:           Number(camp.is_active),
      }));
      setCardsData(normalized);
    } catch (error) {
      setErrorMsg('Nelze načíst kampaně: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Pomocná funkce: znovu načte všechny kampaně
  const refreshCampaigns = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Chyba ${res.status}`);
      const data = await res.json();
      const normalized = data.map((camp) => ({
        ...camp,
        id:                  Number(camp.id),
        user_id:             Number(camp.user_id),
        username:            camp.username,
        campaign_name:       camp.campaign_name,
        category:            camp.category,
        budget:              Number(camp.budget),
        currency:            camp.currency,
        reward_per_thousand: Number(camp.reward_per_thousand),
        min_payout:          camp.min_payout   !== null ? Number(camp.min_payout)   : null,
        max_payout:          camp.max_payout   !== null ? Number(camp.max_payout)   : null,
        platforms:           Array.isArray(camp.platforms)     ? camp.platforms     : [],
        thumbnail_url:       camp.thumbnail_url,
        content_links:       Array.isArray(camp.content_links) ? camp.content_links : [],
        requirements:        Array.isArray(camp.requirements)  ? camp.requirements  : [],
        paid_out:            Number(camp.paid_out),
        total_paid_out:      Number(camp.total_paid_out),
        paid_percent:        Number(camp.paid_percent),
        created_at:          camp.created_at,
        is_active:           Number(camp.is_active),
      }));
      setCardsData(normalized);
    } catch (e) {
      console.error('refreshCampaigns error:', e);
    }
  };

  // ==== 2) Odeslání formuláře (POST) ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !campaignName.trim() ||
      !category.trim() ||
      !budget ||
      !rewardPerThousand
    ) {
      setErrorMsg('Vyplňte všechna povinná pole (*)!');
      return;
    }

    const payload = {
      campaign_name:       campaignName,
      category:            category,
      budget:              parseFloat(budget),
      currency:            currency,
      reward_per_thousand: parseFloat(rewardPerThousand),
      min_payout:          minPayout ? parseFloat(minPayout) : null,
      max_payout:          maxPayout ? parseFloat(maxPayout) : null,
      platforms:           Object.keys(platforms).filter((k) => platforms[k]),
      thumbnail_url:       thumbnailUrl.trim(),
      content_links:       contentLinks,
      requirements:        requirements
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setErrorMsg('Nejste přihlášen. Přihlaste se prosím.');
        return;
      }
      if (res.status === 201) {
        // Úspěšně vytvořeno
        setCampaignName('');
        setCategory('');
        setBudget('');
        setCurrency('USD');
        setRewardPerThousand('');
        setMinPayout('');
        setMaxPayout('');
        setPlatforms({ instagram: false, tiktok: false, youtube: false });
        setThumbnailUrl('');
        setNewContentLink('');
        setContentLinks([]);
        setNewRequirement('');
        setRequirements([]);
        setIsModalOpen(false);
        refreshCampaigns();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || `Chyba ${res.status}`);
      }
    } catch (e) {
      setErrorMsg('Síťová chyba: ' + e.message);
    }
  };

  // ==== 3) Správa seznamu content_links ====
  const addContentLink = () => {
    const url = newContentLink.trim();
    if (!url) return;
    setContentLinks((prev) => [...prev, url]);
    setNewContentLink('');
  };
  const removeContentLink = (i) => {
    setContentLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ==== 4) Správa seznamu requirements ====
  const addRequirement = () => {
    const txt = newRequirement.trim();
    if (!txt) return;
    setRequirements((prev) => [...prev, txt]);
    setNewRequirement('');
  };
  const removeRequirement = (i) => {
    setRequirements((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ==== 5) Checkbox platform ====
  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setPlatforms((prev) => ({ ...prev, [name]: checked }));
  };

  // ==== RENDER ====
  return (
    <div className="card-container">
      {errorMsg && <div className="card-error">{errorMsg}</div>}

      {/* Tlačítko „Create“ */}
      <button
        className="card-create-btn"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        <FiPlusCircle /> Create
      </button>

      {/* ====== MODAL S FORMULÁŘEM ===== */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Create Campaign</h2>
        <form onSubmit={handleSubmit} className="card-form">
          {/* Campaign name */}
          <div className="form-group">
            <label>
              Campaign name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value)}
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
              Campaign budget ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </div>

          {/* Currency */}
          <div className="form-group">
            <label>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          {/* Reward rate */}
          <div className="form-group">
            <label>
              Reward rate ($ / 1000 views) <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rewardPerThousand}
              onChange={(e) => setRewardPerThousand(e.target.value)}
              required
            />
          </div>

          {/* Min & Max payout */}
          <div className="form-group-grouped">
            <div>
              <label>Minimum payout ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
              />
            </div>
            <div>
              <label>Maximum payout ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={maxPayout}
                onChange={(e) => setMaxPayout(e.target.value)}
              />
            </div>
          </div>

          {/* Platforms */}
          <fieldset className="form-group cf-fieldset">
            <legend>Platforms</legend>
            <div className="cf-platforms-row">
              {['instagram', 'tiktok', 'youtube'].map((name) => (
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
              onChange={(e) => setThumbnailUrl(e.target.value)}
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
                onChange={(e) => setNewContentLink(e.target.value)}
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
                onChange={(e) => setNewRequirement(e.target.value)}
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
              {requirements.map((item, idx) => (
                <li key={idx} className="list-item cf-list-item">
                  <span>{item}</span>
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

      {/* ===== Grid s kampaněmi ===== */}
      <div className="cards-grid">
        {loading && (
          <>
            {/* 4 skeleton karty */}
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="card-item card-skeleton" />
            ))}
          </>
        )}
        {!loading && cardsData.length === 0 && (
          <div className="card-empty">Žádné kampaně k zobrazení.</div>
        )}
        {!loading &&
          cardsData.length > 0 &&
          cardsData.map((camp) => (
            <div key={camp.id} className="card-item">
              <div className="card-header">
                <div className="card-icon">
                  {camp.thumbnail_url ? (
                    <img src={camp.thumbnail_url} alt="Thumb" />
                  ) : (
                    camp.username.charAt(0).toUpperCase()
                  )}
                </div>
                <h3>{camp.campaign_name}</h3>
                <span className="card-tag">
                  {camp.currency}
                  {camp.reward_per_thousand.toFixed(2)} / 1K
                </span>
                {/* Zde přidáme ActiveUsersIndicator */}
                <ActiveUsersIndicator campaignId={camp.id} />
              </div>

              <div className="card-body">
                <div className="card-author">
                  <strong>Author:</strong> {camp.username}
                </div>
                <div className="card-line">
                  {camp.currency}
                  {camp.paid_out.toFixed(2)} of {camp.currency}
                  {camp.total_paid_out.toFixed(2)} paid out
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
