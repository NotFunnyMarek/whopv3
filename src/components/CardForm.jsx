// src/components/CardForm.jsx

import React, { useState } from 'react';
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

const API_URL = 'https://app.byxbot.com/php/campaign.php';

export default function CardForm({ whopId, onClose, onRefresh }) {
  const [campaignName, setCampaignName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('Clipping');
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
  const [contentLinks, setContentLinks] = useState([]);
  const [newContentLink, setNewContentLink] = useState('');
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [expirationDateTime, setExpirationDateTime] = useState(''); // Nové pole
  const [errorMsg, setErrorMsg] = useState('');

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

    // Povinná pole: type + expirationDateTime
    if (!type.trim()) {
      setErrorMsg('Zadejte prosím typ kampaně (Clipping/UGC).');
      return;
    }
    if (
      !campaignName.trim() ||
      !category.trim() ||
      !budget ||
      !rewardPerThousand ||
      !expirationDateTime
    ) {
      setErrorMsg('Vyplňte všechna povinná pole (*) včetně data a času vypršení!');
      return;
    }

    // Připravíme payload
    // expirationDateTime má formát "YYYY-MM-DDTHH:mm"
    // PHP očekává "YYYY-MM-DD HH:mm:00" → přidáme ":00" pokud chybí v minutách
    let expFormatted = expirationDateTime.replace('T', ' ');
    // Pokud chybí sekundy, dokážeme je přidat ručně: 
    // např. "2025-06-10 15:30" → "2025-06-10 15:30:00"
    if (expFormatted.length === 16) {
      expFormatted += ':00';
    }

    const payload = {
      whop_id: whopId,
      campaign_name: campaignName.trim(),
      category: category.trim(),
      type: type.trim(),
      budget: parseFloat(budget),
      currency: currency,
      reward_per_thousand: parseFloat(rewardPerThousand),
      min_payout: minPayout ? parseFloat(minPayout) : null,
      max_payout: maxPayout ? parseFloat(maxPayout) : null,
      platforms: Object.keys(platforms).filter((k) => platforms[k]),
      thumbnail_url: thumbnailUrl.trim(),
      content_links: contentLinks,
      requirements: requirements,
      expiration_datetime: expFormatted, // Nové pole ve formátu "YYYY-MM-DD HH:mm:00"
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setErrorMsg('Nejste přihlášen. Přihlaste se prosím.');
        return;
      }
      if (res.status === 201) {
        onRefresh();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || `Chyba ${res.status}`);
      }
    } catch (e) {
      setErrorMsg('Síťová chyba: ' + e.message);
    }
  };

  const renderTypeSelect = () => (
    <div className="cf-input-group">
      <label>
        Typ kampaně <span className="cf-required">*</span>
      </label>
      <select value={type} onChange={(e) => setType(e.target.value)} required>
        <option value="">— Vyberte typ —</option>
        <option value="Clipping">Clipping</option>
        <option value="UGC">UGC</option>
      </select>
    </div>
  );

  const renderPlatformIcon = (name) => {
    const size = 20;
    switch (name) {
      case 'instagram':
        return <FaInstagram size={size} className="cf-icon-instagram" />;
      case 'tiktok':
        return <FaTiktok size={size} className="cf-icon-tiktok" />;
      case 'youtube':
        return <FaYoutube size={size} className="cf-icon-youtube" />;
      default:
        return null;
    }
  };

  return (
    <div className="cf-form-container">
      <h2>Vytvořit kampaň</h2>
      {errorMsg && <div className="cf-error">{errorMsg}</div>}
      <form onSubmit={handleSubmit} className="cf-form">
        {/* Název kampaně */}
        <div className="cf-input-group">
          <label>
            Název kampaně <span className="cf-required">*</span>
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Zadejte název kampaně"
            required
          />
        </div>

        {/* Výběr typu kampaně */}
        {renderTypeSelect()}

        {/* Kategorie */}
        <div className="cf-input-group">
          <label>
            Kategorie <span className="cf-required">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">— Vyberte kategorii —</option>
            <option value="Personal brand">Personal brand</option>
            <option value="Product review">Product review</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>

        {/* Rozpočet + měna */}
        <div className="cf-input-group">
          <label>
            Rozpočet kampaně ($) <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="Celkový rozpočet na kampaň." />
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
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        {/* Odměna za 1000 zhlédnutí */}
        <div className="cf-input-group">
          <label>
            Odměna (za 1000 views) <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="$ za 1000 zhlédnutí" />
          </label>
          <div className="cf-reward-row">
            <span className="cf-currency-symbol">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rewardPerThousand}
              onChange={(e) => setRewardPerThousand(e.target.value)}
              placeholder="0.00"
              required
            />
            <span className="cf-text-views">/ 1000 views</span>
          </div>
        </div>

        {/* Min & Max payout */}
        <div className="cf-grid-two-cols">
          <div className="cf-input-group">
            <label>
              Minimální výplata ($){' '}
              <FaQuestionCircle title="Minimální částka, kterou influencer obdrží." />
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
              Maximální výplata ($){' '}
              <FaQuestionCircle title="Maximální částka, kterou influencer může získat." />
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

        {/* Platformy */}
        <fieldset className="cf-fieldset">
          <legend>
            Platformy <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="Vyberte sociální sítě pro kampaň." />
          </legend>
          <div className="cf-platforms-row">
            {['instagram', 'tiktok', 'youtube'].map((name) => (
              <label key={name} className="cf-platform-label">
                <input
                  type="checkbox"
                  name={name}
                  checked={platforms[name]}
                  onChange={handlePlatformChange}
                />
                {renderPlatformIcon(name)}
                <span className="cf-platform-text">{name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Thumbnail URL */}
        <div className="cf-input-group">
          <label>Thumbnail URL</label>
          <input
            type="text"
            placeholder="https://example.com/thumb.jpg"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        {/* Available Content Links */}
        <div className="cf-input-group">
          <h4 className="cf-subtitle">Dostupný obsah (URL)</h4>
          <label className="cf-small-note">
            Přidejte odkazy (např. Google Drive, YouTube):
          </label>
          <div className="cf-list-input-row">
            <input
              type="text"
              value={newContentLink}
              onChange={(e) => setNewContentLink(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <button
              type="button"
              onClick={addContentLink}
              className="cf-list-add-button"
            >
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
                  aria-label="Odstranit odkaz"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Requirements */}
        <div className="cf-input-group">
          <h4 className="cf-subtitle">Požadavky na obsah</h4>
          <label className="cf-small-note">
            Přidejte pravidla, která musí uživatel splnit:
          </label>
          <div className="cf-list-input-row">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Např. Must tag @whop in caption"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="cf-list-add-button"
            >
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
                  aria-label="Odstranit požadavek"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Expiration Date/Time */}
        <div className="cf-input-group">
          <label>
            Datum a čas ukončení <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="Datum a čas, kdy kampaň vyprší." />
          </label>
          <input
            type="datetime-local"
            value={expirationDateTime}
            onChange={(e) => setExpirationDateTime(e.target.value)}
            required
          />
        </div>

        {/* Tlačítko Uložit */}
        <button type="submit" className="cf-submit-button">
          Uložit kampaň
        </button>
      </form>
    </div>
  );
}
