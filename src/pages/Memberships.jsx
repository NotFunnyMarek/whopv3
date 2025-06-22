// src/pages/Memberships.jsx

import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/memberships.scss";

export default function Memberships() {
  const { showNotification, showConfirm } = useNotifications();

  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the user's memberships
  useEffect(() => {
    fetchMyMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyMemberships = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://app.byxbot.com/php/get_memberships.php", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMemberships(Array.isArray(data) ? data : []);
      showNotification({ type: "success", message: "Memberships loaded." });
    } catch (err) {
      console.error("Error fetching memberships:", err);
      showNotification({ type: "error", message: "Failed to load memberships." });
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  // Cancel auto-renewal for a given membership
  const handleCancelAutoRenew = async (membershipId, whopId) => {
    try {
      await showConfirm(
        "Cancel auto-renewal? You will retain access until the end of the current period."
      );
    } catch {
      return; // User cancelled
    }
    try {
      const res = await fetch("https://app.byxbot.com/php/cancel_auto_renew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          membership_id: membershipId,
          whop_id: whopId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showNotification({ type: "error", message: json.message || "Failed to cancel auto-renewal." });
      } else {
        showNotification({ type: "success", message: json.message });
        fetchMyMemberships();
      }
    } catch (err) {
      console.error("Error cancelling auto-renewal:", err);
      showNotification({ type: "error", message: "Network error." });
    }
  };

  // Show loading state
  if (loading) {
    return <div className="memberships-loading">Loading memberships…</div>;
  }

  return (
    <div className="memberships-container">
      <h2>My Memberships</h2>
      {memberships.length === 0 ? (
        <p>You are not subscribed to any Whops.</p>
      ) : (
        <table className="memberships-table">
          <thead>
            <tr>
              <th>Whop</th>
              <th>Price</th>
              <th>Period</th>
              <th>Start</th>
              <th>Next Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => {
              const start = new Date(m.start_at).toLocaleString();
              const nextPay = m.next_payment_at
                ? new Date(m.next_payment_at).toLocaleString()
                : "-";
              const periodText = Number(m.is_recurring) === 1 ? m.billing_period : "One-Time";

              return (
                <tr key={m.membership_id}>
                  <td>{m.slug}</td>
                  <td>
                    {m.currency}
                    {parseFloat(m.price).toFixed(2)}
                  </td>
                  <td>{periodText}</td>
                  <td>{start}</td>
                  <td>{nextPay}</td>
                  <td>{m.status}</td>
                  <td>
                    {m.status === "active" && Number(m.is_recurring) === 1 ? (
                      <button
                        className="cancel-btn"
                        onClick={() =>
                          handleCancelAutoRenew(m.membership_id, m.whop_id)
                        }
                      >
                        <FaTimesCircle /> Cancel Renewal
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
