// src/pages/Intro.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/intro.scss';

export default function Intro() {
  const navigate = useNavigate();

  const handleCreateWhop = () => {
    navigate('/onboarding');
  };

  return (
    <div className="intro-container">
      <div className="intro-content">
        <div className="intro-media">
          <img
            src="https://i.ibb.co/0jGtPCHm/Frame-5959.png"
            alt="Intro video placeholder"
            className="intro-video"
          />
        </div>
        <h1 className="intro-title">
          Create a social business in under two minutes <span className="intro-emoji">💫</span>
        </h1>
        <p className="intro-subtitle">
          People use Whop to process payments, host products, build store pages,
          and promote their products with Content Rewards.
        </p>
        <button className="intro-button" onClick={handleCreateWhop}>
          Create your Whop
        </button>
        <div className="intro-metrics">
          <div className="metric-item">
            <div className="metric-value">$1,228,191,994</div>
            <div className="metric-label">MADE BY PEOPLE</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">8,924,915</div>
            <div className="metric-label">USERS ON WHOP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
