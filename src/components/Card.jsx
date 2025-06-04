// src/components/Card.jsx

import React from 'react';
import PropTypes from 'prop-types';
import '../styles/card.scss';
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';

/**
 * Dynamická Card komponenta – vykreslí:
 * - hlavičku (logo/image nebo placeholder + title + payout za 1K)
 * - název kampaně + detaily částky
 * - progress bar + pill s procenty
 * - platformy (ikony sociálních sítí)
 */
const Card = ({
  logoUrl,
  title,
  payout,
  campaignName,
  paid,
  total,
  paidPercent,
  progressPaid,
  progressTotal,
  progressPercent,
  platforms
}) => {
  // Vrací ikonu podle řetězce platformy
  const renderPlatformIcon = (name, idx) => {
    const size = 20;
    switch (name.toLowerCase()) {
      case 'instagram':
        return <FaInstagram key={idx} size={size} />;
      case 'tiktok':
        return <FaTiktok key={idx} size={size} />;
      case 'youtube':
        return <FaYoutube key={idx} size={size} />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      {/* HLAVIČKA */}
      <div className="card__header">
        <div className="card__title">
          {logoUrl ? (
            <img src={logoUrl} className="card__logo" alt="logo" />
          ) : (
            <div className="card__logo-placeholder" />
          )}
          <span className="card__title-text">{title}</span>
        </div>
        <div className="card__payout-pill">{payout}</div>
      </div>

      {/* OBSAH */}
      <div className="card__content">
        <div className="card__name">{campaignName}</div>
        <div className="card__details">
          {paid} of {total} paid out
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="card__progress">
        <div className="card__progress-bar">
          <div
            className="card__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="card__progress-pill">
          {progressPaid} / {progressTotal} ({paidPercent}%)
        </div>
      </div>

      {/* PATIČKA */}
      <div className="card__footer">
        <span className="card__footer-label">PLATFORMS</span>
        <div className="card__footer-icons">
          {platforms.map((p, idx) => renderPlatformIcon(p, idx))}
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  logoUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  payout: PropTypes.string.isRequired,
  campaignName: PropTypes.string.isRequired,
  paid: PropTypes.string.isRequired,
  total: PropTypes.string.isRequired,
  paidPercent: PropTypes.number.isRequired,
  progressPaid: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  progressTotal: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  progressPercent: PropTypes.number.isRequired,
  platforms: PropTypes.arrayOf(PropTypes.string).isRequired
};

Card.defaultProps = {
  logoUrl: '',
  title: 'NAME',
  payout: '$0 / 1K',
  campaignName: 'Campaign',
  paid: '$0.00',
  total: '$0.00',
  paidPercent: 0,
  progressPaid: 0,
  progressTotal: 100,
  progressPercent: 0,
  platforms: []
};

export default Card;
