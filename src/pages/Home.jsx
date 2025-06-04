// src/pages/Home.jsx
import React, { useState } from 'react';
import CardForm from '../components/CardForm';
import CardGrid from '../components/CardGrid';
import Modal from '../components/Modal';
import '../styles/home.scss'; // vlastní stylování pro Home

const Home = () => {
  // Stav všech karet
  const [cardsData, setCardsData] = useState([]);
  // Stav otevření/zavření modálního okna
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Callback: přidá novou kartu a zavře modal
  const handleAddCard = (newCard) => {
    setCardsData(prev => [newCard, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="home-container">
      {/* ====== HLAVIČKA ====== */}
      <div className="home-header">
        <h1 className="home-title">Content Rewards</h1>
        <p className="home-subtitle">
          Post content on social media and get paid for the views you generate. If you want to launch a campaign{' '}
          <a href="#">click here</a>.
        </p>
      </div>

      {/* ====== PODHLAVIČKA S FILTRY, POČTEM, CREATE A SORT BY ====== */}
      <div className="home-controls">
        <div className="home-count">447 447 live Content Rewards</div>

        <div className="home-filters">
          <label className="home-filter-item">
            Type:
            <select className="home-select">
              <option>All</option>
              <option>Clipping</option>
              <option>UGC</option>
            </select>
          </label>

          <label className="home-filter-item">
            Category:
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
          Sort by:
          <select className="home-select">
            <option>Highest available budget</option>
            <option>Lowest available budget</option>
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </label>
      </div>

      {/* ====== MODAL S FORMULÁŘEM ====== */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CardForm
          onAddCard={handleAddCard}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* ====== GRID S KARTAMI ====== */}
      <div className="home-grid">
        {/* Pokud je cardsData prázdné, CardGrid vykreslí prázdný stav */}
        <CardGrid cardsData={cardsData} />
      </div>
    </div>
  );
};

export default Home;
