import React, { useRef, useState, useEffect } from "react";
import {
  FaStar,
  FaCheckCircle,
  FaInstagram,
  FaTiktok,
  FaGlobe,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import "../styles/landingpage.scss";

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

const Section = ({ children, className }) => {
  const [ref, visible] = useInView();
  return (
    <section
      ref={ref}
      className={`lp-section ${className || ""} ${visible ? "visible" : ""}`.trim()}
    >
      {children}
    </section>
  );
};

function formatUrl(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function LandingPage({ data = {} }) {
  const {
    heroImage = "https://via.placeholder.com/600x300",
    description = "",
    testimonials = [],
    features = [],
    about = {},
    who = [],
    pricing = {},
    faqs = [],
    affiliate = {},
    offerEnds,
  } = data;

  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!offerEnds) return;
    const update = () => {
      const diff = new Date(offerEnds).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("0d 0h 0m 0s");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [offerEnds]);

  return (
    <div className="lp-root">
      <header className="lp-hero">
        <div className="hero-card">
          <img src={heroImage} alt="App screenshot" className="hero-image" />
          <img src={logo} alt="ByX logo" className="hero-logo" />
          <h1 className="hero-title">ByX - Trading Automation</h1>
          <p className="hero-desc">{description}</p>
          <button className="btn primary hero-btn">Join</button>
        </div>
      </header>

      <Section className="reviews">
        <h2 className="section-title">See what other people are saying</h2>
        <div className="reviews-grid">
          {testimonials.map((t, i) => (
            <div className="lp-card review-card" key={i}>
              <div className="review-header">
                <img src={t.avatar} alt="" className="avatar" />
                <span className="name">{t.name}</span>
              </div>
              <div className="rating">
                {Array.from({ length: 5 }).map((_, j) => (
                  <FaStar key={j} className={j < t.stars ? "active" : ""} />
                ))}
              </div>
              <p className="text">{t.text}</p>
              <span className="date">{t.date}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section className="features">
        <h2 className="section-title">Here’s what you’ll get</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="lp-card feature-card" key={i}>
              {f.image_url ? (
                <img src={f.image_url} alt={f.title} className="feature-image" />
              ) : (
                <FaCheckCircle className="icon" />
              )}
              <h3>{f.title}</h3>
              <p>{f.subtitle || f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="about">
        <h2 className="section-title">Learn about me</h2>
        <div className="lp-about-container">
          <div className="lp-card about-card">
            <img src={about.logo || logo} alt="ByX" className="about-logo" />
            <h3>{about.name}</h3>
            <p className="joined">{about.joined}</p>
            <div className="socials">
              {about.socials?.instagram && (
                <a href={formatUrl(about.socials.instagram)}>
                  <FaInstagram />
                </a>
              )}
              {about.socials?.tiktok && (
                <a href={formatUrl(about.socials.tiktok)}>
                  <FaTiktok />
                </a>
              )}
              {about.socials?.website && (
                <a href={formatUrl(about.socials.website)}>
                  <FaGlobe />
                </a>
              )}
              {about.socials?.twitter && (
                <a href={formatUrl(about.socials.twitter)}>
                  <FaTwitter />
                </a>
              )}
              {about.socials?.youtube && (
                <a href={formatUrl(about.socials.youtube)}>
                  <FaYoutube />
                </a>
              )}
            </div>
            <p className="bio">{about.bio}</p>
          </div>
        </div>
      </Section>

      <Section className="who">
        <h2 className="section-title">Who this is for</h2>
        <div className="who-grid">
          {who.map((w, i) => (
            <div className="lp-card" key={i}>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pricing">
  <h2 className="section-title">Pricing</h2>
  <div className="pricing-options">
    {pricing.options?.map((plan, i) => (
      <label
        key={i}
        className={`plan-option ${pricing.selected === plan.id ? "selected" : ""}`}
        onClick={() => {
          if (typeof pricing.onSelect === "function") {
            pricing.onSelect(plan.id);
          }
        }}
      >
        <div className="plan-radio">
          <div className="radio-circle" />
        </div>
        <div className="plan-details">
          <h3>{plan.name}</h3>
          <p>{plan.price}</p>
          <ul className="plan-benefits">
            {plan.benefits?.map((b, j) => (
              <li key={j}><FaCheckCircle /> {b}</li>
            ))}
          </ul>
        </div>
      </label>
    ))}
  </div>
  <button className="btn primary pricing-btn">Join</button>
</Section>


      <Section className="faq">
        <h2 className="section-title">Frequently asked questions</h2>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <details className="faq-item" key={i}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section className="affiliate">
        <h2 className="section-title">Become an affiliate</h2>
        <p className="affiliate-text">{affiliate.text}</p>
        <button className="btn outline">{affiliate.button}</button>
      </Section>

      <div className="bottom-bar">
        {offerEnds && <span className="countdown">{timeLeft}</span>}
        <button className="btn primary">Join</button>
      </div>
    </div>
  );
}
