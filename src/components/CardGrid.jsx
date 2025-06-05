// src/components/CardGrid.jsx
import React from 'react';
import '../styles/card-grid.scss';

export default function CardGrid({ cardsData }) {
  return (
    <div className="card-container">
      {!cardsData.length && (
        <div className="card-empty">Žádné kampaně k zobrazení.</div>
      )}

      {cardsData.length > 0 && (
        <div className="cards-grid">
          {cardsData.map((camp) => (
            <div key={camp.id} className="card-item">
              <div className="card-header">
                <h3>{camp.campaign_name}</h3>
                <span className="card-tag">
                  {camp.currency}{camp.reward_per_thousand.toFixed(2)} / 1K
                </span>
              </div>
              <div className="card-body">
                <div className="card-author">
                  <strong>Autor:</strong> {camp.username}
                </div>
                <div className="card-line">
                  {camp.currency}{camp.paid_out.toFixed(2)} of {camp.currency}{camp.total_paid_out.toFixed(2)} vyplaceno
                  <span className="card-percent">{camp.paid_percent}%</span>
                </div>
                <div className="card-progress-bar">
                  <div
                    className="card-progress-fill"
                    style={{ width: camp.paid_percent + '%' }}
                  ></div>
                </div>
                <ul className="card-info-list">
                  <li><strong>Kategorie:</strong> {camp.category}</li>
                  <li>
                    <strong>Platformy:</strong>{' '}
                    {camp.platforms.map((p, i) => (
                      <span key={i} className="platform-pill">{p}</span>
                    ))}
                  </li>
                  <li>
                    <strong>Odhad zhlédnutí:</strong>{' '}
                    {camp.reward_per_thousand > 0
                      ? Math.round((camp.paid_out / camp.reward_per_thousand) * 1000)
                      : 0}
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
