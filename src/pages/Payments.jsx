// src/pages/Payments.jsx

import React, { useEffect, useState } from "react";
import "../styles/payments.scss";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://app.byxbot.com/php/get_payments.php", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== "success") {
        throw new Error(json.message || "Nepodařilo se načíst platby.");
      }
      // Očekáváme, že backend vrací: { status: "success", data: { payments: [...], total_spent: X } }
      setPayments(json.data.payments);
      setTotalSpent(json.data.total_spent);
    } catch (err) {
      console.error("Chyba při načítání plateb:", err);
      setError("Nepodařilo se načíst historii plateb.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="payments-loading">Načítám historii plateb…</div>;
  }

  if (error) {
    return (
      <div className="payments-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <h2>Historie Plateb</h2>
      <div className="payments-total">
        <strong>Celkem utraceno:</strong> ${totalSpent.toFixed(2)}
      </div>
      {payments.length === 0 ? (
        <p>Žádné platby k zobrazení.</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Whop</th>
              <th>Částka</th>
              <th>Měna</th>
              <th>Typ</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.payment_date).toLocaleString()}</td>
                <td>{p.whop_name}</td>
                <td>{parseFloat(p.amount).toFixed(2)}</td>
                <td>{p.currency}</td>
                <td
                  className={
                    p.type === "failed" ? "failed" : "success"
                  }
                >
                  {p.type === "one_time"
                    ? "Jednorázově"
                    : p.type === "recurring"
                    ? "Opakovaně"
                    : "Neúspěšná platba"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
