// src/components/Card.jsx

import React, { useState, useEffect } from 'react';
import '../styles/card.scss';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

export default function Card() {
  const [cardsData, setCardsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // ===== Stavy pro formulář =====
  const [campaignName, setCampaignName] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [rewardPerThousand, setRewardPerThousand] = useState('');
  const [minPayout, setMinPayout] = useState('');
  const [maxPayout, setMaxPayout] = useState('');
  const [platforms, setPlatforms] = useState({
    instagram: false,
    tiktok: false,
    youtube: false,
  });
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [newContentLink, setNewContentLink] = useState('');
  const [contentLinks, setContentLinks] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [requirements, setRequirements] = useState([]);

  // 1) Po načtení komponenty: načteme seznam kampaní z PHP
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(API_URL, {
          method: 'GET',
          credentials: 'include', // Posíláme PHPSESSID
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status === 401) {
          setErrorMsg('Nejste přihlášen. Přihlaste se, prosím.');
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`Chyba ${res.status}`);
        const data = await res.json();
        setCardsData(data);
      } catch (e) {
        setErrorMsg('Nelze načíst kampaně: ' + e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  // Pomocná funkce: opětovné načtení po vložení nové kampaně
  const refreshCampaigns = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setCardsData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2) Odeslání formuláře: POST do PHP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!campaignName.trim() || !category.trim() || !budget || !rewardPerThousand) {
      setErrorMsg('Vyplňte všechna povinná pole označená „*“');
      return;
    }

    const payload = {
      campaign_name: campaignName,
      category: category,
      budget: parseFloat(budget),
      currency: currency,
      reward_per_thousand: parseFloat(rewardPerThousand),
      min_payout: minPayout ? parseFloat(minPayout) : null,
      max_payout: maxPayout ? parseFloat(maxPayout) : null,
      platforms: Object.keys(platforms).filter((k) => platforms[k]),
      thumbnail_url: thumbnailUrl.trim(),
      content_links: contentLinks,
      requirements: requirements,
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include', // posíláme PHPSESSID
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setErrorMsg('Nejste přihlášen. Přihlaste se, prosím.');
        return;
      }
      if (res.status === 201) {
        // Úspěšně vloženo
        // Reset polí formuláře
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
        // Znovu načteme
        refreshCampaigns();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || `Chyba ${res.status}`);
      }
    } catch (e) {
      setErrorMsg('Síťová chyba: ' + e.message);
    }
  };

  // 3) Přidávání a odebírání URL pro Available Content
  const addContentLink = () => {
    const url = newContentLink.trim();
    if (!url) return;
    setContentLinks((prev) => [...prev, url]);
    setNewContentLink('');
  };
  const removeContentLink = (i) => {
    setContentLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  // 4) Přidávání a odebírání textových požadavků (requirements)
  const addRequirement = () => {
    const txt = newRequirement.trim();
    if (!txt) return;
    setRequirements((prev) => [...prev, txt]);
    setNewRequirement('');
  };
  const removeRequirement = (i) => {
    setRequirements((prev) => prev.filter((_, idx) => idx !== i));
  };

  // 5) Checkbox změna platforem
  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setPlatforms((prev) => ({ ...prev, [name]: checked }));
  };

  // ===== JSX =====
  return (
    <div className="card-container">
      {errorMsg && <div className="card-error">{errorMsg}</div>}

      {/* Tlačítko „Create“ otevírá modál */}
      <button
        className="card-create-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Create
      </button>

      {/* ===== MODAL ===== */}
      {isModalOpen && (
        <div className="card-modal-overlay">
          <div className="card-modal">
            <button
              className="card-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
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
              <fieldset className="form-group">
                <legend>Platforms</legend>
                <label>
                  <input
                    type="checkbox"
                    name="instagram"
                    checked={platforms.instagram}
                    onChange={handlePlatformChange}
                  />{' '}
                  Instagram
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="tiktok"
                    checked={platforms.tiktok}
                    onChange={handlePlatformChange}
                  />{' '}
                  TikTok
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="youtube"
                    checked={platforms.youtube}
                    onChange={handlePlatformChange}
                  />{' '}
                  YouTube
                </label>
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

              {/* Available Content (URL seznam) */}
              <div className="form-group">
                <label>Available Content (URL)</label>
                <div className="list-input-row">
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={newContentLink}
                    onChange={(e) => setNewContentLink(e.target.value)}
                  />
                  <button
                    type="button"
                    className="list-add-btn"
                    onClick={addContentLink}
                  >
                    ➕
                  </button>
                </div>
                <ul className="list-container">
                  {contentLinks.map((link, idx) => (
                    <li key={idx} className="list-item">
                      <a
                        href={/^https?:\/\//.test(link) ? link : `https://${link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        className="list-delete-btn"
                        onClick={() => removeContentLink(idx)}
                      >
                        🗑
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Content Requirements (seznam textů) */}
              <div className="form-group">
                <label>Content Requirements</label>
                <div className="list-input-row">
                  <input
                    type="text"
                    placeholder="e.g. Must tag @whop"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                  />
                  <button
                    type="button"
                    className="list-add-btn"
                    onClick={addRequirement}
                  >
                    ➕
                  </button>
                </div>
                <ul className="list-container">
                  {requirements.map((item, idx) => (
                    <li key={idx} className="list-item">
                      <span>{item}</span>
                      <button
                        type="button"
                        className="list-delete-btn"
                        onClick={() => removeRequirement(idx)}
                      >
                        🗑
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tlačítko pro odeslání */}
              <button type="submit" className="form-submit-btn">
                Save Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== GRID S KAMPANĚMI ===== */}
      <div className="cards-grid">
        {loading && <div>Loading campaigns…</div>}
        {!loading && cardsData.length === 0 && <div>No campaigns yet.</div>}
        {!loading && cardsData.length > 0 &&
          cardsData.map((camp) => (
            <div key={camp.id} className="card-item">
              <div className="card-header">
                <h3>{camp.campaign_name}</h3>
                <span className="card-tag">${camp.reward_per_thousand} / 1K</span>
              </div>
              <div className="card-body">
                <div className="card-line">
                  ${camp.paid_out.toFixed(2)} of ${camp.total_paid_out.toFixed(2)} paid out
                  <span className="card-percent">{camp.paid_percent}%</span>
                </div>
                <div className="card-progress-bar">
                  <div
                    className="card-progress-fill"
                    style={{ width: camp.paid_percent + '%' }}
                  ></div>
                </div>
                <ul className="card-info-list">
                  <li><strong>Category:</strong> {camp.category}</li>
                  <li>
                    <strong>Platforms:</strong>{' '}
                    {camp.platforms.map((p, i) => (
                      <span key={i} className="platform-pill">{p}</span>
                    ))}
                  </li>
                  <li>
                    <strong>Views:</strong> {camp.budget ? Math.round((camp.paid_out / camp.reward_per_thousand) * 1000) : 0}
                  </li>
                </ul>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
