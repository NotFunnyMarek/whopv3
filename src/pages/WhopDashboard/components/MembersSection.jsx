// src/pages/WhopDashboard/components/MembersSection.jsx

import React from "react";
import "../../../styles/whop-dashboard/_owner.scss";

export default function MembersSection({
  membersLoading,
  membersError,
  membershipsList,
  handleCancelMember,
}) {
  return (
    <div className="whop-members-section">
      <h2 className="members-section-title">Členové (placené Whopy)</h2>
      {membersLoading ? (
        <p className="members-loading">Načítám členy…</p>
      ) : membersError ? (
        <p className="members-error">{membersError}</p>
      ) : membershipsList.length === 0 ? (
        <p className="members-empty">Žádní členové (placené Whopy)</p>
      ) : (
        <table className="members-table">
          <thead>
            <tr>
              <th>Uživatel</th>
              <th>Cena</th>
              <th>Perioda</th>
              <th>Začátek</th>
              <th>Další platba</th>
              <th>Stav</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {membershipsList.map((m) => {
              const start = new Date(m.start_at).toLocaleString();
              const nextPay = m.next_payment_at
                ? new Date(m.next_payment_at).toLocaleString()
                : "-";
              const periodText = m.is_recurring ? m.billing_period : "Jednorázově";
              return (
                <tr key={m.user_id}>
                  <td>{m.username}</td>
                  <td>
                    {m.currency}
                    {parseFloat(m.price).toFixed(2)}
                  </td>
                  <td>{periodText}</td>
                  <td>{start}</td>
                  <td>{nextPay}</td>
                  <td>{m.status}</td>
                  <td>
                    {m.status === "active" ? (
                      <button
                        className="member-cancel-btn"
                        onClick={() => handleCancelMember(m.user_id)}
                      >
                        Zrušit
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
