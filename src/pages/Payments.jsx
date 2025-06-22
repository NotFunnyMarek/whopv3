import React, { useEffect, useState } from "react";
import { useNotifications } from "../components/NotificationProvider";
import "../styles/payments.scss";

export default function Payments() {
  const { showNotification } = useNotifications();

  const [payments, setPayments] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://app.byxbot.com/php/get_payments.php", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== "success") {
        throw new Error(json.message || "Failed to load payments.");
      }
      setPayments(json.data.payments);
      setTotalEarned(json.data.total_spent);
      showNotification({ type: "success", message: "Payments loaded." });
    } catch (err) {
      console.error("Error loading payments:", err);
      showNotification({
        type: "error",
        message: "Failed to load payment history.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="payments-loading">Loading payment history…</div>;
  }

  return (
    <div className="payments-container">
      <h2 className="payments-title">Payment History</h2>

      {payments.length === 0 ? (
        <p className="payments-empty">No payments to display.</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Whop</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const amt = parseFloat(p.amount);
              const isPayout = p.type === "payout";
              const sign = isPayout ? "+" : "-";
              const cls = isPayout ? "positive" : "negative";
              const typeLabel =
                p.type === "one_time"
                  ? "One-Time"
                  : p.type === "recurring"
                  ? "Recurring"
                  : p.type === "refunded"
                  ? "Refunded"
                  : p.type === "payout"
                  ? "Payout"
                  : "Unknown Type";
              return (
                <tr key={p.id}>
                  <td>{new Date(p.payment_date).toLocaleString()}</td>
                  <td>{p.whop_name}</td>
                  <td className={`amount ${cls}`}>{sign}{Math.abs(amt).toFixed(2)}</td>
                  <td>{p.currency}</td>
                  <td className={`type ${p.type}`}>{typeLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
