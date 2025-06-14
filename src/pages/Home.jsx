// src/pages/Home.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CardGrid from '../components/CardGrid';
import '../styles/home.scss';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

export default function Home() {
  const [cardsData, setCardsData]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [errorMsg, setErrorMsg]         = useState('');

  const [filterType, setFilterType]         = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOption, setSortOption]         = useState('Nejvyšší rozpočet');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Chyba ${res.status}`);
      const data = await res.json();
      setCardsData(data);
    } catch (error) {
      setErrorMsg('Nelze načíst kampaně: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Zobrazíme pouze kampaně, které jsou aktivní a ještě nemají vyčerpán rozpočet
  const liveCampaigns = useMemo(
    () => cardsData.filter(c =>
      c.is_active === 1 &&
      c.paid_out < c.total_paid_out
    ),
    [cardsData]
  );

  // Aplikace filtrů a řazení
  const filteredData = useMemo(() => {
    let arr = [...liveCampaigns];

    if (filterType !== 'All') {
      arr = arr.filter(c => c.type === filterType);
    }
    if (filterCategory !== 'All') {
      arr = arr.filter(c => c.category === filterCategory);
    }

    switch (sortOption) {
      case 'Nejvyšší rozpočet':
        arr.sort((a, b) => b.budget - a.budget);
        break;
      case 'Nejnižší rozpočet':
        arr.sort((a, b) => a.budget - b.budget);
        break;
      case 'Nejnovější':
        arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'Nejstarší':
        arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        break;
    }
    return arr;
  }, [liveCampaigns, filterType, filterCategory, sortOption]);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Content Rewards</h1>
        <p className="home-subtitle">
          Post content on social media and get paid for the views you generate. Pokud chcete spustit kampaň{' '}
          <Link className="home-link" to="/intro">klikněte sem</Link>.
        </p>
      </div>

      <div className="home-controls">
        <div className="home-count">
          {loading ? 'Načítám kampaně…' : `${filteredData.length} live kampaní`}
        </div>

        <div className="home-filters">
          <label className="home-filter-item">
            Typ:
            <select
              className="home-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option>All</option>
              <option>Clipping</option>
              <option>UGC</option>
            </select>
          </label>

          <label className="home-filter-item">
            Kategorie:
            <select
              className="home-select"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option>All</option>
              <option>Personal brand</option>
              <option>Product review</option>
              <option>Entertainment</option>
            </select>
          </label>
        </div>

        <label className="home-sort">
          Řadit podle:
          <select
            className="home-select"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <option>Nejvyšší rozpočet</option>
            <option>Nejnižší rozpočet</option>
            <option>Nejnovější</option>
            <option>Nejstarší</option>
          </select>
        </label>
      </div>

      <div className="home-grid">
        {errorMsg && <div className="home-error">{errorMsg}</div>}

        {loading ? (
          <div className="cards-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="card-item card-skeleton" />
            ))}
          </div>
        ) : (
          <CardGrid cardsData={filteredData} />
        )}
      </div>
    </div>
  );
}
