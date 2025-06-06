// src/pages/Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';            // ← už je tu import Link
import CardGrid from '../components/CardGrid';
import CardForm from '../components/CardForm';
import Modal from '../components/Modal';
import '../styles/home.scss';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

const Home = () => {
  // Stav všech karet
  const [cardsData, setCardsData] = useState([]);
  // Stav načítání
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  // Stav otevření/zavření modálního okna (pro tlačítko Create)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtry a řazení
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Nejvyšší rozpočet');

  // 1) Načteme kampaně po prvním vykreslení
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
      if (!res.ok) {
        throw new Error(`Chyba ${res.status}`);
      }
      const data = await res.json();
      // Předpokládáme, že server vrací už "normalized" pole
      setCardsData(data);
    } catch (error) {
      setErrorMsg('Nelze načíst kampaně: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Callback: voláme po úspěšném vytvoření kampaně
  const handleRefresh = () => {
    fetchCampaigns();
  };

  // Filtrování podle typu a kategorie, řazení (useMemo pro výkon)
  const filteredData = useMemo(() => {
    let arr = [...cardsData];
    if (filterType !== 'All') {
      arr = arr.filter((c) => c.category === filterType);
    }
    if (filterCategory !== 'All') {
      arr = arr.filter((c) => c.type === filterCategory);
    }
    // Řazení
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
  }, [cardsData, filterType, filterCategory, sortOption]);

  return (
    <div className="home-container">
      {/* HLAVIČKA */}
      <div className="home-header">
        <h1 className="home-title">Content Rewards</h1>
        <p className="home-subtitle">
          Post content on social media and get paid for the views you generate. Pokud chcete spustit kampaň{' '}
          {/* ZMĚNA: místo <button> otevírajícího modál použijeme <Link to="/intro"> */}
          <Link className="home-link" to="/intro">
            klikněte sem
          </Link>
          .
        </p>
      </div>

      {/* KONTROLY (počet, filtry, tlačítko Create, sort) */}
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
              onChange={(e) => setFilterType(e.target.value)}
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
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option>All</option>
              <option>Personal brand</option>
              <option>Product review</option>
              <option>Entertainment</option>
            </select>
          </label>
        </div>

        <button
          className="home-create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Create
        </button>

        <label className="home-sort">
          Řadit podle:
          <select
            className="home-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option>Nejvyšší rozpočet</option>
            <option>Nejnižší rozpočet</option>
            <option>Nejnovější</option>
            <option>Nejstarší</option>
          </select>
        </label>
      </div>

      {/* MODÁLNÍ OKNO S FORMULÁŘEM pro tlačítko Create */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CardForm onClose={() => setIsModalOpen(false)} onRefresh={handleRefresh} />
      </Modal>

      {/* GRID S KAMPANĚMI NEBO SKELETON-LOADING */}
      <div className="home-grid">
        {errorMsg && <div className="home-error">{errorMsg}</div>}

        {loading ? (
          /* Skeleton loading: zobrazíme třeba 8 prázdných bloků */
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
};

export default Home;
