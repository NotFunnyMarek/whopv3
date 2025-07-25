import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.scss';

const API_WHOPS_URL = 'https://app.byxbot.com/php/search_whops.php?all=1';

const FILTER_TAGS = [
  'Biggest revenue',
  'Most addicting',
  'Newest',
  'Most money made',
];

const applyFilter = (whops, filter) => {
  switch (filter) {
    case 'Biggest revenue':
    case 'Most money made':
      return [...whops].sort((a, b) => b.revenue - a.revenue);
    case 'Most addicting':
      return [...whops].sort((a, b) => b.members_count - a.members_count);
    case 'Newest':
      return [...whops].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    default:
      return whops;
  }
};

export default function Home() {
  const [whops, setWhops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeFilter, setActiveFilter] = useState('Biggest revenue');
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_WHOPS_URL, { credentials: 'include' });
        const json = await res.json();
        setWhops(
          json.data.map((w) => {
            let features = [];
            if (Array.isArray(w.features)) {
              features = w.features;
            } else if (w.features) {
              try { features = JSON.parse(w.features); } catch {}
            }

            let plans = [];
            if (Array.isArray(w.pricing_plans)) {
              plans = w.pricing_plans;
            } else if (w.pricing_plans) {
              try { plans = JSON.parse(w.pricing_plans); } catch {}
            }

            return {
              ...w,
              revenue:       parseFloat(w.revenue) || 0,
              price:         parseFloat(w.price)   || 0,
              members_count: parseInt(w.members_count, 10) || 0,
              review_count:  parseInt(w.review_count, 10)  || 0,
              features,
              pricing_plans: plans,
              created_at:    w.created_at || null,
            };
          })
        );
      } catch {
        setErrorMsg('Chyba při načítání.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayedWhops = useMemo(() => applyFilter(whops, activeFilter), [whops, activeFilter]);

  const leftColumn  = displayedWhops.slice(0, 5);
  const rightColumn = displayedWhops.slice(5, 10);

  useEffect(() => {
    if (!loading) {
      setVisibleCount(0);
      const total = displayedWhops.length;
      const interval = setInterval(() => {
        setVisibleCount(v => {
          if (v + 1 >= total) {
            clearInterval(interval);
            return total;
          }
          return v + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loading, displayedWhops]);

  return (
    <div className="main-content home-container">
      <header className="home-header">
        <h1>Search our most popular Backs!</h1>
        <p className="home-subtitle">
          Post content on social media and get paid for the views you generate. If you want to start a campaign{' '}
          <Link className="home-link" to="/intro">click here</Link>.
        </p>
      </header>

      <div className="home-filters">
        {FILTER_TAGS.map(tag => (
          <span
            key={tag}
            className={`home-filter-tag${activeFilter === tag ? ' active' : ''}`}
            onClick={() => setActiveFilter(tag)}
          >
            {tag}
          </span>
        ))}
      </div>

      {errorMsg && <div className="home-error">{errorMsg}</div>}

      <div className="home-whop-grid">
        <div className="home-whop-column">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="whop-card-skeleton" />
              ))
            : leftColumn.map((item, i) => (
                <Card key={item.slug} item={item} index={i} visibleCount={visibleCount} />
              ))
          }
        </div>
        <div className="home-whop-column">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="whop-card-skeleton" />
              ))
            : rightColumn.map((item, i) => (
                <Card key={item.slug} item={item} index={i + leftColumn.length} visibleCount={visibleCount} />
              ))
          }
        </div>
      </div>
    </div>
  );
}

function Card({ item, index, visibleCount }) {
  const hasPlans = Array.isArray(item.pricing_plans) && item.pricing_plans.length > 0;
  const isFree = item.price === 0 && !hasPlans;
  const visible = index < visibleCount;
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapseClick = (e) => {
    e.preventDefault(); // zabrání navigaci
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  return (
    <Link to={`/c/${item.slug}`} className="whop-card-link">
      <div className={`whop-card${visible ? ' visible' : ''}${collapsed ? ' collapsed' : ' expanded'}`} style={{ transitionDelay: `${index * 0.1}s` }}>
        <div className="whop-thumb">
          <img src={item.banner_url || item.logo_url || '/placeholder.png'} alt={item.name} />
        </div>

        <div className="whop-content">
          <div className="whop-title"><strong>{item.name}</strong></div>
          <div className="whop-desc">{item.description || 'No description'}</div>
          <div className="whop-info">
            <span className="whop-revenue">
              All‑Time: {item.currency}{item.revenue.toFixed(2)}
            </span>
            <span className="whop-members">{item.members_count} members</span>
          </div>

          <div
            className={`whop-features ${collapsed ? 'collapsed' : 'expanded'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {item.features.map((f, i) => (
              <div key={i} className="whop-feature">
                <strong>{f.title}</strong>: {f.subtitle}
              </div>
            ))}
          </div>

          {item.features.length > 0 && (
            <button
              className="whop-collapse-btn"
              onClick={handleCollapseClick}
            >
              {collapsed ? 'Show more' : 'Show less'}
            </button>
          )}
        </div>

        <div className="whop-tag" onClick={(e) => e.stopPropagation()}>
          {isFree ? (
            <span className="free-access">Free Access</span>
          ) : hasPlans ? (
            item.pricing_plans.map((p) => (
              <span key={p.id}>
                {(p.currency || item.currency)}{parseFloat(p.price).toFixed(2)}
                {item.is_recurring ? ` / ${p.billing_period}` : ''}
              </span>
            ))
          ) : (
            <span>
              {item.currency}{item.price.toFixed(2)}{item.is_recurring ? ` / ${item.billing_period}` : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
