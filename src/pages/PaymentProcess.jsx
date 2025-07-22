import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/payment-process.scss";

export default function PaymentProcess() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotifications();

  const [whopData, setWhopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const search = new URLSearchParams(location.search);
  const planId = search.get("plan");
  const action = search.get("action") || "join"; // join | waitlist

  useEffect(() => {
    async function fetchWhop() {
      try {
        const res = await fetch(
          `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(slug)}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (res.ok && json.status === "success") {
          setWhopData(json.data);
        } else {
          showNotification({ type: "error", message: json.message || "Failed to load." });
        }
      } catch (err) {
        showNotification({ type: "error", message: "Network error." });
      } finally {
        setLoading(false);
      }
    }
    fetchWhop();
  }, [slug, showNotification]);

  const price = (() => {
    if (!whopData) return 0;
    if (planId && Array.isArray(whopData.pricing_plans)) {
      const p = whopData.pricing_plans.find(pl => pl.id === parseInt(planId));
      return p ? parseFloat(p.price) : parseFloat(whopData.price);
    }
    return parseFloat(whopData.price);
  })();
  const currency = (() => {
    if (!whopData) return "";
    if (planId && Array.isArray(whopData.pricing_plans)) {
      const p = whopData.pricing_plans.find(pl => pl.id === parseInt(planId));
      return p ? p.currency || whopData.currency : whopData.currency;
    }
    return whopData.currency;
  })();
  const billingPeriod = (() => {
    if (!whopData) return "";
    if (planId && Array.isArray(whopData.pricing_plans)) {
      const p = whopData.pricing_plans.find(pl => pl.id === parseInt(planId));
      return p ? p.billing_period : whopData.billing_period;
    }
    return whopData.billing_period;
  })();
  const planName = (() => {
    if (!whopData || !planId) return "";
    const p = Array.isArray(whopData.pricing_plans)
      ? whopData.pricing_plans.find(pl => pl.id === parseInt(planId))
      : null;
    return p ? p.plan_name || p.billing_period : "";
  })();

  const isRecurring = whopData && whopData.is_recurring;

  useEffect(() => {
    if (!loading && whopData) {
      if (
        whopData.waitlist_enabled &&
        !whopData.is_accepted_waitlist &&
        action !== "waitlist"
      ) {
        showNotification({
          type: "error",
          message: "Access requires waitlist approval.",
        });
        navigate(`/c/${slug}`);
      }
    }
  }, [loading, whopData, action, navigate, slug, showNotification]);

  async function handlePay() {
    if (!whopData) return;
    setSubmitting(true);
    try {
      if (action === "waitlist") {
        const res = await fetch("https://app.byxbot.com/php/request_waitlist.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ whop_id: whopData.id, answers: [] })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error");
        showNotification({ type: "success", message: json.message || "Request sent." });
      } else if (!price || price <= 0) {
        const res = await fetch("https://app.byxbot.com/php/join_whop.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ whop_id: whopData.id })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error");
        showNotification({ type: "success", message: json.message || "Joined" });
      } else {
        const payload = { whop_id: whopData.id };
        if (planId) payload.plan_id = parseInt(planId);
        const res = await fetch("https://app.byxbot.com/php/subscribe_whop.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error");
        showNotification({ type: "success", message: json.message || "Subscribed" });
      }
      navigate(`/c/${slug}`);
    } catch (err) {
      if (err.message) {
        showNotification({ type: "error", message: err.message });
      } else {
        showNotification({ type: "error", message: "Network error" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="payment-process-container"><p>Loading…</p></div>;
  }
  if (!whopData) {
    return <div className="payment-process-container"><p>Unable to load payment info.</p></div>;
  }

  return (
    <div className="payment-process-container">
      <h2>{whopData.name}</h2>
      <div className="payment-summary">
        {planName && (
          <div className="summary-row">
            <span className="label">Plan</span>
            <span>{planName}</span>
          </div>
        )}
        <div className="summary-row">
          <span className="label">Price</span>
          <span>{currency}{price.toFixed(2)}</span>
        </div>
        {action !== "waitlist" && isRecurring && (
          <div className="summary-row">
            <span className="label">Renews</span>
            <span>every {billingPeriod}</span>
          </div>
        )}
        {action === "waitlist" && (
          <div className="summary-row">
            <span className="label">Type</span>
            <span>Waitlist request (no charge)</span>
          </div>
        )}
        <div className="summary-row">
          <span className="label">Fee</span>
          <span>0</span>
        </div>
        <div className="summary-row total">
          <span className="label">Total</span>
          <span>{currency}{price.toFixed(2)}</span>
        </div>
      </div>
      <div className="payment-actions">
        <button className="btn-cancel btn" onClick={() => navigate(`/c/${slug}`)} disabled={submitting}>Cancel</button>
        <button className="btn-confirm btn" onClick={handlePay} disabled={submitting}>{submitting ? 'Processing…' : 'Pay'}</button>
      </div>
    </div>
  );
}
