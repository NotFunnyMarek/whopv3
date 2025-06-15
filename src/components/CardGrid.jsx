// src/components/CardGrid.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/card.scss';
import '../styles/activeUsers.scss';
import ActiveUsersIndicator from './ActiveUsersIndicator';

export default function CardGrid({ cardsData }) {
  // Filtrujeme pouze aktivní a nevyčerpané kampaně
  const activeCampaigns = cardsData.filter(c =>
    c.is_active === 1 &&
    c.paid_out < c.total_paid_out
  );

  return (
    <div className="card-container">
      {!activeCampaigns.length ? (
        <div className="card-empty">Žádné kampaně k zobrazení.</div>
      ) : (
        <div className="cards-grid">
          {activeCampaigns.map(camp => {
            // Čas do expirace
            const now = new Date();
            const expDate = new Date(camp.expiration_datetime.replace(' ', 'T'));
            const timeLeftMs = expDate.getTime() - now.getTime();
            const expiredByTime = timeLeftMs <= 0;

            // Oříznutí paid_out na budget
            const paidOut = Math.min(camp.paid_out, camp.total_paid_out);
            const percent = camp.total_paid_out > 0
              ? Math.min(Math.round((paidOut / camp.total_paid_out) * 100), 100)
              : 0;
            const expiredByBudget = paidOut >= camp.total_paid_out;

            // Celkové vypršení
            const isExpired = camp.is_active === 0 || expiredByTime || expiredByBudget;

            // Text ukončení
            const endingText = isExpired
              ? 'EXPIRED'
              : (() => {
                  const d = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
                  const h = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const m = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
                  return `Ending in: ${d}d ${h}h ${m}m`;
                })();

            return (
              <Link
                key={camp.id}
                to={isExpired ? '#' : `/c/${camp.whop_slug}`}
                className={`card-item-link${isExpired ? ' disabled' : ''}`}
              >
                <div className={`card-item${isExpired ? ' expired' : ''}`}>
                  <div className="card-header">
                    <div className="card-icon">
                      {camp.thumbnail_url
                        ? <img src={camp.thumbnail_url} alt="Thumb" />
                        : camp.username.charAt(0).toUpperCase()}
                    </div>
                    <h3>{camp.campaign_name}</h3>
                    <span className="card-tag">
                      {camp.currency}{camp.reward_per_thousand.toFixed(2)} / 1K
                    </span>
                    <span className={isExpired ? 'card-ending expired' : 'card-ending'}>
                      {endingText}
                    </span>
                    <ActiveUsersIndicator campaignId={camp.id} />
                  </div>

                  <div className="card-body">
                    {/* Autor kampaně */}
                    <div className="card-author">
                      <strong>Author:</strong> {camp.username}
                    </div>

                    <div className="card-line views">
                      <strong>Views:</strong> {camp.total_views}
                    </div>

                    <div className="card-line">
                      {camp.currency}{paidOut.toFixed(2)} of {camp.currency}{camp.total_paid_out.toFixed(2)} paid out
                      <span className="card-percent"> {percent}%</span>
                    </div>

                    <div className="card-progress-bar">
                      <div className="card-progress-fill" style={{ width: `${percent}%` }} />
                    </div>

                    <ul className="card-info-list">
                      <li><strong>Type:</strong> {camp.type}</li>
                      <li><strong>Category:</strong> {camp.category}</li>
                      <li>
                        <strong>Platforms:</strong>{' '}
                        {camp.platforms.map((p, i) => (
                          <span key={i} className="platform-pill">{p}</span>
                        ))}
                      </li>
                      <li>
                        <strong>Paid Views:</strong>{' '}
                        {camp.reward_per_thousand > 0
                          ? Math.round((paidOut / camp.reward_per_thousand) * 1000)
                          : 0}
                      </li>
                    </ul>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
