// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import CardForm from '../components/CardForm';
import CardGrid from '../components/CardGrid';
import Modal from '../components/Modal';
import '../styles/home.scss';

const API_URL = 'https://app.byxbot.com/php/campaign.php';

const Home = () => {
  // Stav všech karet
  const [cardsData, setCardsData] = useState([]);
  // Stav načítání
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  // Stav otevření/zavření modálního okna
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1) Načteme kampaně po prvním vykreslení
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Funkce pro načtení všech kampaní
  const fetchCampaigns = async () => {
    setLoading(true);
    setErrorMsg('');
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
      // Data jsou již ve správném tvaru (čísla, pole atd.)
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

  return (
    <div className="home-container">
      {/* HLAVIČKA */}
      <div className="home-header">
        <h1 className="home-title">Content Rewards</h1>
        <p className="home-subtitle">
          Post content on social media and get paid for the views you generate. Pokud chcete spustit kampaň{' '}
          <a href="#">klikněte sem</a>.
        </p>
      </div>

      {/* KONTROLY (počet, filtry, tlačítko Create, sort) */}
      <div className="home-controls">
        <div className="home-count">
          {loading
            ? 'Načítám kampaně…'
            : `${cardsData.length} live kampaní`}
        </div>

        <div className="home-filters">
          <label className="home-filter-item">
            Typ:
            <select className="home-select">
              <option>All</option>
              <option>Clipping</option>
              <option>UGC</option>
            </select>
          </label>

          <label className="home-filter-item">
            Kategorie:
            <select className="home-select">
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
          <select className="home-select">
            <option>Nejvyšší rozpočet</option>
            <option>Nejnižší rozpočet</option>
            <option>Nejnovější</option>
            <option>Nejstarší</option>
          </select>
        </label>
      </div>

      {/* MODÁLNÍ OKNO S FORMULÁŘEM */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CardForm
          onAddCard={() => {}}
          onClose={() => setIsModalOpen(false)}
          onRefresh={handleRefresh}
        />
      </Modal>

      {/* GRID S KAMPANĚMI */}
      <div className="home-grid">
        {errorMsg && <div className="home-error">{errorMsg}</div>}
        {!loading && <CardGrid cardsData={cardsData} />}
      </div>
    </div>
  );
};

export default Home;
