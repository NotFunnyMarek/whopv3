import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/card.scss';
import '../styles/activeUsers.scss';
import ActiveUsersIndicator from './ActiveUsersIndicator';

export default function CardGrid({ cardsData }) {
  // Zobrazíme jen aktivní (is_active === 1)
  const activeCampaigns = cardsData.filter((camp) => camp.is_active === 1);

  return (
    <div className="card-container">
      {!activeCampaigns.length && (
        <div className="card-empty">Žádné kampaně k zobrazení.</div>
      )}

      {activeCampaigns.length > 0 && (
        <div className="cards-grid">
          {activeCampaigns.map((camp) => (
            <Link
              key={camp.id}
              to={`/c/${camp.whop_slug}`}
              className="card-item-link"
            >
              <div className="card-item">
                <div className="card-header">
                  <div className="card-icon">
                    {camp.thumbnail_url ? (
                      <img src={camp.thumbnail_url} alt="Thumb" />
                    ) : (
                      camp.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h3>{camp.campaign_name}</h3>
                  <span className="card-tag">
                    {camp.currency}
                    {camp.reward_per_thousand.toFixed(2)} / 1K
                  </span>
                  {/* Přidáme indikátor aktivních uživatelů */}
                  <ActiveUsersIndicator campaignId={camp.id} />
                </div>

                <div className="card-body">
                  <div className="card-author">
                    <strong>Author:</strong> {camp.username}
                  </div>

                  <div className="card-line">
                    {camp.currency}
                    {camp.paid_out.toFixed(2)} of {camp.currency}
                    {camp.total_paid_out.toFixed(2)} paid out
                    <span className="card-percent">{camp.paid_percent}%</span>
                  </div>

                  <div className="card-progress-bar">
                    <div
                      className="card-progress-fill"
                      style={{ width: `${camp.paid_percent}%` }}
                    />
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
                      <strong>Views:</strong>{' '}
                      {camp.reward_per_thousand > 0
                        ? Math.round((camp.paid_out / camp.reward_per_thousand) * 1000)
                        : 0}
                    </li>
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
