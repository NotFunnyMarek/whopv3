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

export default function CardForm({ onAddCard, onClose, onRefresh }) {
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

  // Thumbnail URL (textové pole), ne file
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Stavy pro AVAILABLE CONTENT (více URL)
  const [newContentLink, setNewContentLink] = useState('');
  const [contentLinks, setContentLinks] = useState([]);

  // Stavy pro CONTENT REQUIREMENTS (víc pravidel)
  const [newRequirement, setNewRequirement] = useState('');
  const [requirements, setRequirements] = useState([]);

  // Chyby
  const [errorMsg, setErrorMsg] = useState('');

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Kontrola povinných polí
    if (
      !campaignName.trim() ||
      !category.trim() ||
      !budget ||
      !rewardPerThousand
    ) {
      setErrorMsg('Vyplňte všechna povinná pole (*)!');
      return;
    }

    // Vytvoříme payload
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
      requirements: requirements
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
        // Úspěšné vložení – zavřeme modal a informujeme rodiče o úspěchu
        onRefresh(); // Řekneme rodiči, aby znovu načetl data
        onClose();
        // V parentském komponentu (Home) pak aktualizujeme stav cardsData
      } else {
        // Vrátila se chyba 400/500
        const data = await res.json();
        setErrorMsg(data.error || `Chyba ${res.status}`);
      }
    } catch (e) {
      setErrorMsg('Síťová chyba: ' + e.message);
    }
  };

  // Rendeříme ikonku platformy v preview (nebo pro checkboxy)
  const renderPlatformIcon = (name, idx) => {
    const size = 20;
    switch (name) {
      case 'instagram':
        return <FaInstagram key={idx} size={size} className="cf-icon-instagram" />;
      case 'tiktok':
        return <FaTiktok key={idx} size={size} className="cf-icon-tiktok" />;
      case 'youtube':
        return <FaYoutube key={idx} size={size} className="cf-icon-youtube" />;
      default:
        return null;
    }
  };

  return (
    <div className="cf-form-container">
      <h2>Vytvořit kampaň</h2>
      {errorMsg && <div className="cf-error">{errorMsg}</div>}
      <form onSubmit={handleSubmit} className="cf-form">
        {/* Campaign name */}
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

        {/* Category */}
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

        {/* Campaign budget */}
        <div className="cf-input-group">
          <label>
            Rozpočet kampaně <span className="cf-required">*</span>{' '}
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
        <div className="cf-input-group">
          <label>
            Odměna (za 1000 zhlédnutí) <span className="cf-required">*</span>{' '}
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

        {/* Minimum & Maximum payout */}
        <div className="cf-grid-two-cols">
          <div className="cf-input-group">
            <label>
              Minimální vyplacená částka{' '}
              <FaQuestionCircle title="Minimální částka, kterou influencer dostane." />
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
              Maximální vyplacená částka{' '}
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

        {/* Platforms */}
        <fieldset className="cf-input-group cf-fieldset">
          <legend>
            Platformy <span className="cf-required">*</span>{' '}
            <FaQuestionCircle title="Vyberte sociální sítě, kde bude kampaň běžet." />
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
                {name === 'instagram' && (
                  <FaInstagram className="cf-icon-instagram" />
                )}
                {name === 'tiktok' && <FaTiktok className="cf-icon-tiktok" />}
                {name === 'youtube' && (
                  <FaYoutube className="cf-icon-youtube" />
                )}
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

        {/* ---------- AVAILABLE CONTENT ---------- */}
        <div className="cf-input-group">
          <h4 className="cf-subtitle">Dostupný obsah</h4>
          <label className="cf-small-note">
            Můžete sem přidat odkazy na zajímavá videa nebo materiály:
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
          {/* Seznam přidaných odkazů */}
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

        {/* ---------- CONTENT REQUIREMENTS ---------- */}
        <div className="cf-input-group">
          <h4 className="cf-subtitle">Požadavky na obsah</h4>
          <label className="cf-small-note">
            Přidejte pravidla, kterým se uživatel musí řídit:
          </label>
          <div className="cf-list-input-row">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Např. Označit @whop v popisku"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="cf-list-add-button"
            >
              <FaPlus />
            </button>
          </div>
          {/* Seznam přidaných požadavků */}
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

        {/* Tlačítko Create */}
        <button type="submit" className="cf-submit-button">
          Uložit kampaň
        </button>
      </form>
    </div>
  );
}
