// src/pages/Memberships.jsx

import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import "../styles/memberships.scss";

export default function Memberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyMemberships();
  }, []);

  const fetchMyMemberships = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://app.byxbot.com/php/get_memberships.php", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Očekáváme pole objektů s poli:
      // membership_id, whop_id, slug, banner_url, price, currency,
      // is_recurring, billing_period, start_at, next_payment_at, status
      setMemberships(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Chyba při načítání předplatných:", err);
      setError("Nepodařilo se načíst předplatná.");
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAutoRenew = async (membershipId, whopId) => {
    if (
      !window.confirm(
        "Zrušit automatické obnovování? Přístup Vám vydrží do konce aktuálního období."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(
        "https://app.byxbot.com/php/cancel_auto_renew.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            membership_id: membershipId,
            whop_id: whopId,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Nepodařilo se zrušit auto‐renew.");
      } else {
        alert(json.message);
        fetchMyMemberships();
      }
    } catch (err) {
      console.error("Chyba při rušení auto‐renew:", err);
      alert("Síťová chyba.");
    }
  };

  if (loading) {
    return <div className="memberships-loading">Načítám předplatná…</div>;
  }

  if (error) {
    return (
      <div className="memberships-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="memberships-container">
      <h2>Moje předplatná</h2>
      {memberships.length === 0 ? (
        <p>Nepředplácíte žádné whopy.</p>
      ) : (
        <table className="memberships-table">
          <thead>
            <tr>
              <th>Whop</th>
              <th>Cena</th>
              <th>Perioda</th>
              <th>Začátek</th>
              <th>Další platba</th>
              <th>Stav</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => {
              const start = new Date(m.start_at).toLocaleString();
              const nextPay = m.next_payment_at
                ? new Date(m.next_payment_at).toLocaleString()
                : "-";
              const periodText = Number(m.is_recurring) === 1 ? m.billing_period : "Jednorázově";

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
                        <FaTimesCircle /> Zrušit obnovování
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
