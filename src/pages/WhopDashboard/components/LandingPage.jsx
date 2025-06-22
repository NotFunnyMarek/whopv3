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

  useEffect(() => {
    setTimeout(() => setLoaded(true), 300);
  }, []);

  useEffect(() => {
    if (!whopData) return;
    setRequested(
      Boolean(whopData.is_pending_waitlist || whopData.is_accepted_waitlist)
    );
    setAnswers(whopData.waitlist_questions.map(() => ""));
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
  } = whopData;

  const priceLabel =
    price > 0
      ? `${currency}${price.toFixed(2)}${is_recurring ? `/${billing_period}` : ""}`
      : "zdarma";

  // Recenze
  const reviews = [
    { name: "Tadeáš Beránek", text: "100% doporučuji, používám 14 dní a zisk 12%.", date: "Nov 9, 2024", rating: 5 },
    { name: "Hell",         text: "Výborná aplikace, beta verze bez bugů.",         date: "Oct 18, 2024", rating: 4 },
    { name: "kubadockal4",  text: "Jednoduché, přátelský tým.",                    date: "Jun 11, 2024", rating: 5 },
    { name: "Marwik",       text: "nice",                                          date: "Jul 23, 2023", rating: 3 },
  ];

  // FAQ data
  const faqList = [
    { q: "How to join?", a: "Click the Join button and follow the prompts." },
    { q: "What happens after joining?", a: "You’ll get immediate access to all features." },
    { q: "Can I cancel anytime?", a: "Yes – subscription can be canceled with one click." },
  ];

  // Odeslání žádosti o waitlist
  async function handleWaitlist() {
    if (price > 0 && user_balance < price) {
      showNotification({ type: "error", message: "Nedostatek prostředků." });
      return;
    }
    try {
      await handleRequestWaitlist(id, answers);
      showNotification({ type: "success", message: "Žádost odeslána." });
      setRequested(true);
    } catch (e) {
      showNotification({ type: "error", message: e.message || "Chyba." });
    }
  }

  function toggleFaq(i) {
    setFaqOpen(prev => ({ ...prev, [i]: !prev[i] }));
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
              onClick={waitlist_enabled ? handleWaitlist : handleSubscribe}
              disabled={memberLoading}
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

      {/* REVIEWS */}
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

      {/* FEATURES */}
      <section className="section features-section alt">
        <h2 className="section-title">Here's what you'll get</h2>
        <div className="features-grid">
          {[
            { title: "ByX 2.0 App access", desc: "Automated crypto trading." },
            { title: "Video Archive",      desc: "Structured learning courses." },
            { title: "Bounties",           desc: "Earn cash for tasks." },
            { title: "Announcements",      desc: "Connect and share." },
          ].map((f, i) => (
            <div key={i} className="card feature glass">
              <FaCheckCircle className="feature-icon" />
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT ME */}
      <section className="section about-section">
        <h2 className="section-title">Learn about me</h2>
        <div className="about-container">
          <div className="card about glass">
            <h3 className="about-title">ByX</h3>
            <p className="about-subtitle">@byx • Joined Mar 2023</p>
            <button className="btn outline about-btn">Send creator a message…</button>
            <div className="about-socials">
              {website_url && <a href={website_url}><FaGlobe /></a>}
              {socials.instagram && <a href={socials.instagram}><FaInstagram /></a>}
              {socials.discord && <a href={socials.discord}><FaDiscord /></a>}
            </div>
            <p className="about-bio">
              We are trading enthusiasts and believe that ByX will revolutionize trading automation.
              Our community is full of successful traders, and we are confident that you will be
              proud to be a part of it. With ByX 2.1, we aim to provide the best tools and support
              for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* WHO FOR */}
      <section className="section who-section alt">
        <h2 className="section-title">Who this is for</h2>
        <div className="who-grid">
          <div className="card glass"><h4>Investors</h4><p>Great investing option.</p></div>
          <div className="card glass"><h4>Traders</h4><p>Learn in our learning center.</p></div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section pricing-section">
        <h2 className="section-title">Pricing</h2>
        <div className="pricing-container">
          <div className="card pricing glass">
            <h3 className="pricing-title">Join ByX</h3>
            <p className="pricing-price">
              {currency}{price.toFixed(2)}{is_recurring ? `/${billing_period}` : ""}
            </p>
            <ul className="pricing-list">
              <li>Automated trading</li>
              <li>Video courses</li>
              <li>24/7 support</li>
              <li>Ambassador program</li>
            </ul>
            <button
              className="btn primary pricing-btn"
              onClick={waitlist_enabled ? handleWaitlist : handleSubscribe}
            >
              {waitlist_enabled ? <><FaClock /> Request Access</> : <><FaUserPlus /> Join</>}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="section faq-section alt">
        <h2 className="section-title">Frequently asked questions</h2>
        <div className="faq-container">
          {faqList.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-question" onClick={() => toggleFaq(i)}>
                <span>{f.q}</span>
                <span className="faq-icon">
                  {faqOpen[i] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              {faqOpen[i] && (
                <div className="faq-answer">
                  <p>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AFFILIATE & REPORT */}
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
