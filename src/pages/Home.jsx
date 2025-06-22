// src/pages/Home.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CardGrid from '../components/CardGrid';
import '../styles/home.scss';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

export default function Home() {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Highest Budget');

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
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setCardsData(data);
    } catch (error) {
      setErrorMsg('Unable to load campaigns: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show campaigns that are active and still within budget
  const liveCampaigns = useMemo(
    () =>
      cardsData.filter(
        (c) => c.is_active === 1 && c.paid_out < c.total_paid_out
      ),
    [cardsData]
  );

  // Apply filters and sorting
  const filteredData = useMemo(() => {
    let arr = [...liveCampaigns];

    if (filterType !== 'All') {
      arr = arr.filter((c) => c.type === filterType);
    }
    if (filterCategory !== 'All') {
      arr = arr.filter((c) => c.category === filterCategory);
    }

    switch (sortOption) {
      case 'Highest Budget':
        arr.sort((a, b) => b.budget - a.budget);
        break;
      case 'Lowest Budget':
        arr.sort((a, b) => a.budget - b.budget);
        break;
      case 'Newest':
        arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'Oldest':
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
          Post content on social media and get paid for the views you generate. If you want to start a campaign{' '}
          <Link className="home-link" to="/intro">click here</Link>.
        </p>
      </div>

      <div className="home-controls">
        <div className="home-count">
          {loading ? 'Loading campaigns…' : `${filteredData.length} live campaigns`}
        </div>

        <div className="home-filters">
          <label className="home-filter-item">
            Type:
            <select
              className="home-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>All</option>
              <option>Clipping</option>
              <option>UGC</option>
            </select>
          </label>

          <label className="home-filter-item">
            Category:
            <select
              className="home-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option>All</option>
              <option>Personal brand</option>
              <option>Product review</option>
              <option>Entertainment</option>
            </select>
          </label>
        </div>

        <label className="home-sort">
          Sort by:
          <select
            className="home-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option>Highest Budget</option>
            <option>Lowest Budget</option>
            <option>Newest</option>
            <option>Oldest</option>
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
