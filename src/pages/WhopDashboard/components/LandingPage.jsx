// src/pages/WhopDashboard/components/LandingPage.jsx

import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaClock,
  FaGlobe,
  FaInstagram,
  FaDiscord,
  FaCheckCircle,
  FaStar,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "../../../styles/whop-dashboard/landing-page.scss";

export default function LandingPage({
  whopData,
  memberLoading,
  handleSubscribe,
  handleRequestWaitlist,
  showNotification,
}) {
  const [loaded, setLoaded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [requested, setRequested] = useState(false);
  const [faqOpen, setFaqOpen] = useState({});

  // Delay entrance animation
  useEffect(() => {
    setTimeout(() => setLoaded(true), 300);
  }, []);

  // Initialize waitlist answers + requested
  useEffect(() => {
    if (!whopData) return;
    setRequested(
      Boolean(whopData.is_pending_waitlist || whopData.is_accepted_waitlist)
    );
    setAnswers((whopData.waitlist_questions || []).map(() => ""));
  }, [whopData]);

  if (!whopData) return null;

  const {
    name,
    description,
    banner_url,
    members_count,
    price,
    currency,
    is_recurring,
    billing_period,
    waitlist_enabled,
    user_balance,
    website_url,
    socials = {},
    id,
    features = [],
    about_bio,
    who_for = [],
    faq = [],
    slug,
    created_at,
  } = whopData;

  const priceLabel =
    price > 0
      ? `${currency}${price.toFixed(2)}${is_recurring ? `/${billing_period}` : ""}`
      : "Free";

  // Static reviews — leave as is
  const reviews = [
    { name: "Tadeáš Beránek", text: "100% recommend, I've used it 14 days and made 12% profit.", date: "Nov 9, 2024", rating: 5 },
    { name: "Hell",         text: "Great app, beta without bugs.",                     date: "Oct 18, 2024", rating: 4 },
    { name: "kubadockal4",  text: "Simple, friendly team.",                            date: "Jun 11, 2024", rating: 5 },
    { name: "Marwik",       text: "nice",                                              date: "Jul 23, 2023", rating: 3 },
  ];

  // Submit waitlist request
  async function handleWaitlistClick() {
    if (price > 0 && user_balance < price) {
      showNotification({ type: "error", message: "Insufficient balance." });
      return;
    }
    try {
      await handleRequestWaitlist(id, answers);
      showNotification({ type: "success", message: "Request submitted." });
      setRequested(true);
    } catch (e) {
      showNotification({ type: "error", message: e.message || "Error." });
    }
  }

  function toggleFaq(index) {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <div className={`landing-page ${loaded ? "loaded" : ""}`}>
      {/* HERO */}
      <div className="hero glass" style={{ backgroundImage: `url(${banner_url})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{name}</h1>
          <p className="hero-desc">{description}</p>
          <div className="hero-buttons">
            <button
              className="btn primary"
              onClick={waitlist_enabled ? handleWaitlistClick : handleSubscribe}
              disabled={memberLoading || requested}
            >
              {memberLoading
                ? "Loading..."
                : waitlist_enabled
                  ? <><FaClock /> Request Access</>
                  : <><FaUserPlus /> Join</>}
            </button>
            {website_url && (
              <a href={website_url} target="_blank" rel="noreferrer" className="btn outline">
                <FaGlobe /> Website
              </a>
            )}
          </div>
          <div className="hero-stats">
            <FaUsers /> {members_count} members
          </div>
          <div className="hero-socials">
            {website_url && <a href={website_url}><FaGlobe /></a>}
            {socials.instagram && <a href={socials.instagram}><FaInstagram /></a>}
            {socials.discord && <a href={socials.discord}><FaDiscord /></a>}
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION - static */}
      <section className="section reviews-section">
        <h2 className="section-title">See what other people are saying</h2>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div key={i} className="card review glass">
              <div className="review-rating">
                {Array.from({ length: r.rating }).map((_, j) => <FaStar key={j} />)}
              </div>
              <p className="review-text">“{r.text}”</p>
              <div className="review-meta">
                <span className="review-author">{r.name}</span>
                <span className="review-date">{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION - dynamic */}
      {features.length > 0 && (
        <section className="section features-section alt">
          <h2 className="section-title">Here's what you'll get</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="card feature glass">
                <FaCheckCircle className="feature-icon" />
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT SECTION - dynamic */}
      <section className="section about-section">
        <h2 className="section-title">Learn about me</h2>
        <div className="about-container">
          <div className="card about glass">
            <h3 className="about-title">{name}</h3>
            <p className="about-subtitle">
              @{slug} • Joined {new Date(created_at).toLocaleDateString()}
            </p>
            <div className="about-socials">
              {website_url && <a href={website_url}><FaGlobe /></a>}
              {socials.instagram && <a href={socials.instagram}><FaInstagram /></a>}
              {socials.discord && <a href={socials.discord}><FaDiscord /></a>}
            </div>
            <p className="about-bio">{about_bio}</p>
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR - dynamic */}
      {who_for.length > 0 && (
        <section className="section who-section alt">
          <h2 className="section-title">Who this is for</h2>
          <div className="who-grid">
            {who_for.map((w, i) => (
              <div key={i} className="card glass">
                <h4>{w.title}</h4>
                <p>{w.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRICING SECTION - dynamic list */}
      <section className="section pricing-section">
        <h2 className="section-title">Pricing</h2>
        <div className="pricing-container">
          <div className="card pricing glass">
            <h3 className="pricing-title">Join {name}</h3>
            <p className="pricing-price">{priceLabel}</p>
            <ul className="pricing-list">
              {features.map((f, i) => (
                <li key={i}>{f.title}</li>
              ))}
            </ul>
            <button
              className="btn primary pricing-btn"
              onClick={waitlist_enabled ? handleWaitlistClick : handleSubscribe}
              disabled={memberLoading || requested}
            >
              {waitlist_enabled
                ? <><FaClock /> Request Access</>
                : <><FaUserPlus /> Join</>}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION - dynamic */}
      {faq.length > 0 && (
        <section className="section faq-section alt">
          <h2 className="section-title">Frequently asked questions</h2>
          <div className="faq-container">
            {faq.map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-question" onClick={() => toggleFaq(i)}>
                  <span>{f.question}</span>
                  <span className="faq-icon">
                    {faqOpen[i] ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                {faqOpen[i] && (
                  <div className="faq-answer">
                    <p>{f.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AFFILIATE & REPORT SECTION - static */}
      <section className="section affiliate-section">
        <h2 className="section-title">Become an affiliate</h2>
        <div className="affiliate-grid">
          <div className="card glass"><h3>30% reward per referral</h3></div>
          <div className="card glass">
            <button className="btn outline report-btn">Report this company</button>
          </div>
        </div>
      </section>
    </div>
  );
}
