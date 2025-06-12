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
        throw new Error(json.message || "Nepodařilo se načíst platby.");
      }
      setPayments(json.data.payments);
      setTotalEarned(json.data.total_spent);
      showNotification({ type: "success", message: "Platby načteny." });
    } catch (err) {
      console.error("Chyba při načítání plateb:", err);
      showNotification({
        type: "error",
        message: "Nepodařilo se načíst historii plateb.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="payments-loading">Načítám historii plateb…</div>;
  }

  return (
    <div className="payments-container">
      <h2 className="payments-title">Historie plateb</h2>

      {payments.length === 0 ? (
        <p className="payments-empty">Žádné platby k zobrazení.</p>
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
            {payments.map((p) => {
              const amt = parseFloat(p.amount);
              const isPayout = p.type === 'payout';
              const sign = isPayout ? '+' : '-';
              const cls = isPayout ? 'positive' : 'negative';
              return (
                <tr key={p.id}>
                  <td>{new Date(p.payment_date).toLocaleString()}</td>
                  <td>{p.whop_name}</td>
                  <td className={`amount ${cls}`}>{sign}{Math.abs(amt).toFixed(2)}</td>
                  <td>{p.currency}</td>
                  <td className={`type ${p.type}`}>{
                    p.type === 'one_time'
                      ? 'Jednorázově'
                      : p.type === 'recurring'
                      ? 'Opakovaně'
                      : p.type === 'refunded'
                      ? 'Refundováno'
                      : p.type === 'payout'
                      ? 'Výplata'
                      : 'Neznámý typ'
                  }</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
