import React, { useRef, useState, useEffect } from "react";
import { FaStar, FaCheckCircle, FaInstagram, FaTiktok, FaGlobe, FaTwitter, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";
import "../styles/landingpage.scss";

const testimonials = [
  { name: "Alice", text: "Amazing service!", date: "Jan 2024" },
  { name: "Bob", text: "My trading improved a lot.", date: "Feb 2024" },
  { name: "Charlie", text: "Highly recommend ByX.", date: "Mar 2024" },
  { name: "Diana", text: "Easy to use and powerful.", date: "Apr 2024" },
];

const features = [
  { title: "ByX 2.0 App access", desc: "Gain access to our automated Crypto Trading." },
  { title: "Video Archive", desc: "Learn from a course program designed to help you grow and reach your goals." },
  { title: "Bounties", desc: "Complete tasks that we post and earn cash for them!" },
  { title: "Announcements", desc: "Share your thoughts and connect with others on topics that matter to you." },
];

const benefits = [
  "Access the Trading Learning Center with the best resources.",
  "Exclusive access to our revolutionary trading application.",
  "24/7 support for all your questions and issues.",
  "The opportunity to join the Ambassador Program and earn rewards.",
  "Automation of trading for more efficient operations.",
];

const faqs = [
  { q: "How to join?", a: "Click the join button and follow the instructions." },
  { q: "What will happen after joining?", a: "You will receive immediate access to our platform." },
];

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
    <section ref={ref} className={`lp-section ${className || ""} ${visible ? "visible" : ""}`.trim()}>
      {children}
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="lp-root">
      <header className="lp-hero">
        <div className="hero-card">
          <img
            src="https://via.placeholder.com/600x300"
            alt="App screenshot"
            className="hero-image"
          />
          <img src={logo} alt="ByX logo" className="hero-logo" />
          <h1 className="hero-title">ByX - Trading Automation</h1>
          <p className="hero-desc">
            Introducing a revolutionary solution for Trading Automation in the global crypto markets!
          </p>
          <button className="btn primary hero-btn">Join</button>
        </div>
      </header>

      <Section className="reviews">
        <h2 className="section-title">See what other people are saying</h2>
        <div className="reviews-grid">
          {testimonials.map((t, i) => (
            <div className="lp-card review-card" key={i}>
              <div className="review-header">
                <div className="avatar" />
                <span className="name">{t.name}</span>
              </div>
              <div className="rating">
                {Array.from({ length: 5 }).map((_, j) => (
                  <FaStar key={j} />
                ))}
              </div>
              <p className="text">“{t.text}”</p>
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
              <FaCheckCircle className="icon" />
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="about">
        <h2 className="section-title">Learn about me</h2>
        <div className="lp-about-container">
          <div className="lp-card about-card">
            <img src={logo} alt="ByX" className="about-logo" />
            <h3>ByX</h3>
            <p className="joined">Joined March 2023</p>
            <div className="socials">
              <FaInstagram />
              <FaTiktok />
              <FaGlobe />
              <FaTwitter />
              <FaYoutube />
            </div>
            <p className="bio">
              We are trading enthusiasts and believe that ByX will revolutionize trading automation. Our community is full of successful traders, and we are confident that you will be proud to be a part of it. With ByX 2.1, we aim to provide the best tools and support for everyone.
            </p>
          </div>
        </div>
      </Section>

      <Section className="who">
        <h2 className="section-title">Who this is for</h2>
        <div className="who-grid">
          <div className="lp-card">
            <h3>Investors</h3>
            <p>Great investing option.</p>
          </div>
          <div className="lp-card">
            <h3>Traders</h3>
            <p>You can learn in our learning center.</p>
          </div>
        </div>
      </Section>

      <Section className="pricing">
        <h2 className="section-title">Pricing</h2>
        <div className="pricing-container">
          <div className="lp-card pricing-card">
            <h3 className="price-title">Join ByX – $1,990/year</h3>
            <button className="btn primary pricing-btn">Join</button>
            <ul className="benefits">
              {benefits.map((b, i) => (
                <li key={i}>
                  <FaCheckCircle /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
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
        <p className="affiliate-text">
          Earn money by bringing customers to ByX. Every time a customer purchases using your link, you’ll earn a commission.
        </p>
        <button className="btn outline">Add to my affiliates dashboard</button>
      </Section>

      <div className="bottom-bar">
        <button className="btn primary">Join</button>
      </div>
    </div>
  );
}
