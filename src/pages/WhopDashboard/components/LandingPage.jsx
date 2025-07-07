// src/pages/WhopDashboard/components/LandingPage.jsx

import React, { useState, useEffect } from "react";
import WaitlistModal from "./WaitlistModal";
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
  const [requested, setRequested] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [submittingWaitlist, setSubmittingWaitlist] = useState(false);
  const [faqOpen, setFaqOpen] = useState({});
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ text: "", rating: 5 });

  function formatUrl(url) {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  // Delay entrance animation
  useEffect(() => {
    setTimeout(() => setLoaded(true), 300);
  }, []);

  // Initialize waitlist requested state
  useEffect(() => {
    if (!whopData) return;
    setRequested(
      Boolean(whopData.is_pending_waitlist || whopData.is_accepted_waitlist)
    );
  }, [whopData]);

  // Load reviews when whop changes
  useEffect(() => {
    if (!whopData?.id) return;
    fetch(`https://app.byxbot.com/php/get_reviews.php?whop_id=${whopData.id}`,
      { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.status === "success") setReviews(j.data);
      })
      .catch(() => {});
  }, [whopData]);

  if (!whopData) return null;

  const {
    name,
    description,
    long_description,
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
    landing_texts = {},
  } = whopData;

  const priceLabel =
    price > 0
      ? `${currency}${price.toFixed(2)}${is_recurring ? `/${billing_period}` : ""}`
      : "Free";

  const reviewsTitle = landing_texts.reviews_title || "See what other people are saying";
  const featuresTitle = landing_texts.features_title || "Here's what you'll get";
  const aboutTitle = landing_texts.about_title || "Learn about me";
  const faqTitle = landing_texts.faq_title || "Frequently asked questions";
  function handleWaitlistClick() {
    if (price > 0 && user_balance < price) {
      showNotification({ type: "error", message: "Insufficient balance." });
      return;
    }
    if (whopData.waitlist_questions && whopData.waitlist_questions.length > 0) {
      setShowWaitlistModal(true);
    } else {
      submitWaitlist([]);
    }
  }

  async function submitWaitlist(ans) {
    setSubmittingWaitlist(true);
    try {
      await handleRequestWaitlist(id, ans);
      showNotification({ type: "success", message: "Request submitted." });
      setRequested(true);
      setShowWaitlistModal(false);
    } catch (e) {
      showNotification({ type: "error", message: e.message || "Error." });
    } finally {
      setSubmittingWaitlist(false);
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
          {long_description && (
            <p className="long-desc">{long_description}</p>
          )}
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
              <a href={formatUrl(website_url)} target="_blank" rel="noreferrer" className="btn outline">
                <FaGlobe /> Website
              </a>
            )}
          </div>
          <div className="hero-stats">
            <FaUsers /> {members_count} members
          </div>
          <div className="hero-socials">
            {website_url && <a href={formatUrl(website_url)}><FaGlobe /></a>}
            {socials.instagram && <a href={formatUrl(socials.instagram)}><FaInstagram /></a>}
            {socials.discord && <a href={formatUrl(socials.discord)}><FaDiscord /></a>}
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="section reviews-section">
        <h2 className="section-title">{reviewsTitle}</h2>
        <div className="reviews-grid">
          {reviews.map(r => (
            <div key={r.id} className="card review glass">
              <div className="review-rating">
                {Array.from({ length: r.rating }).map((_, j) => <FaStar key={j} />)}
              </div>
              <p className="review-text">“{r.text}”</p>
              <div className="review-meta">
                <span className="review-author">
                  <img src={r.avatar_url} alt="avatar" className="review-avatar" /> {r.username}
                </span>
                <span className="review-date">Bought {new Date(r.purchase_at).toLocaleDateString()}</span>
              </div>
              {r.is_mine === 1 && (
                <button
                  className="btn outline"
                  onClick={async () => {
                    await fetch("https://app.byxbot.com/php/delete_review.php", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ review_id: r.id }),
                      credentials: "include",
                    });
                    const fr = await fetch(`https://app.byxbot.com/php/get_reviews.php?whop_id=${id}`, { credentials: "include" });
                    const jj = await fr.json();
                    if (jj.status === "success") setReviews(jj.data);
                  }}
                >Remove</button>
              )}
            </div>
          ))}
        </div>
        <div className="review-form">
          <div className="rating-select">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                className={i < newReview.rating ? "active" : ""}
              />
            ))}
          </div>
          <textarea
            className="review-input"
            placeholder="Your review"
            value={newReview.text}
            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
          />
          <button
            className="btn primary"
            onClick={async () => {
              const payload = { ...newReview, whop_id: id };
              const res = await fetch("https://app.byxbot.com/php/add_review.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
              });
              const j = await res.json();
              if (j.status === "success") {
                setNewReview({ text: "", rating: 5 });
                const fr = await fetch(`https://app.byxbot.com/php/get_reviews.php?whop_id=${id}`,
                  { credentials: "include" });
                const jj = await fr.json();
                if (jj.status === "success") setReviews(jj.data);
              } else {
                showNotification({ type: "error", message: j.message || "Error" });
              }
            }}
          >
            Submit Review
          </button>
        </div>
      </section>

      {/* FEATURES SECTION - dynamic */}
      {features.length > 0 && whopData.modules?.text !== false && (
        <section className="section features-section alt">
          <h2 className="section-title">{featuresTitle}</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="card feature glass">
                {f.image_url ? (
                  <img
                    src={f.image_url}
                    alt={f.title}
                    className="feature-image"
                  />
                ) : (
                  <FaCheckCircle className="feature-icon" />
                )}
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT SECTION - dynamic */}
      <section className="section about-section">
        <h2 className="section-title">{aboutTitle}</h2>
        <div className="about-container">
          <div className="card about glass">
            <h3 className="about-title">{name}</h3>
            <p className="about-subtitle">
              @{slug} • Joined {new Date(created_at).toLocaleDateString()}
            </p>
            <div className="about-socials">
              {website_url && <a href={formatUrl(website_url)}><FaGlobe /></a>}
              {socials.instagram && <a href={formatUrl(socials.instagram)}><FaInstagram /></a>}
              {socials.discord && <a href={formatUrl(socials.discord)}><FaDiscord /></a>}
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
        <h2 className="section-title">{faqTitle}</h2>
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
      {showWaitlistModal && (
        <WaitlistModal
          questions={whopData.waitlist_questions || []}
          onSubmit={submitWaitlist}
          onClose={() => setShowWaitlistModal(false)}
          submitting={submittingWaitlist}
        />
      )}
    </div>
  );
}
