import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import "../styles/whop-dashboard/landing-page.scss";
import { useNotifications } from "./NotificationProvider";

export default function ReviewSection({ whopId, title }) {
  const { showNotification } = useNotifications();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ text: "", rating: 5 });

  useEffect(() => {
    if (!whopId) return;
    fetch(`https://app.byxbot.com/php/get_reviews.php?whop_id=${whopId}`,
      { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.status === "success") setReviews(j.data);
      })
      .catch(() => {});
  }, [whopId]);

  async function handleDelete(id) {
    await fetch("https://app.byxbot.com/php/delete_review.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: id }),
      credentials: "include",
    });
    const fr = await fetch(`https://app.byxbot.com/php/get_reviews.php?whop_id=${whopId}`,
      { credentials: "include" });
    const jj = await fr.json();
    if (jj.status === "success") setReviews(jj.data);
  }

  async function handleSubmit() {
    const payload = { ...newReview, whop_id: whopId };
    const res = await fetch("https://app.byxbot.com/php/add_review.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (j.status === "success") {
      setNewReview({ text: "", rating: 5 });
      const fr = await fetch(`https://app.byxbot.com/php/get_reviews.php?whop_id=${whopId}`,
        { credentials: "include" });
      const jj = await fr.json();
      if (jj.status === "success") setReviews(jj.data);
    } else {
      showNotification({ type: "error", message: j.message || "Error" });
    }
  }

  return (
    <section className="section reviews-section">
      <h2 className="section-title">{title}</h2>
      <div className="reviews-grid">
        {reviews.map((r) => (
          <div key={r.id} className="card review glass">
            <div className="review-rating">
              {Array.from({ length: r.rating }).map((_, j) => (
                <FaStar key={j} />
              ))}
            </div>
            <p className="review-text">“{r.text}”</p>
            <div className="review-meta">
              <span className="review-author">
                <img src={r.avatar_url} alt="avatar" className="review-avatar" /> {r.username}
              </span>
              <span className="review-date">
                Bought {new Date(r.purchase_at).toLocaleDateString()}
              </span>
            </div>
            {r.is_mine === 1 && (
              <button className="btn outline" onClick={() => handleDelete(r.id)}>
                Remove
              </button>
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
        <button className="btn primary" onClick={handleSubmit}>
          Submit Review
        </button>
      </div>
    </section>
  );
}
