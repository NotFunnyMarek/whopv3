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
      <h2 className="members-section-title">Members (paid Whops)</h2>
      {membersLoading ? (
        <p className="members-loading">Loading members…</p>
      ) : membersError ? (
        <p className="members-error">{membersError}</p>
      ) : membershipsList.length === 0 ? (
        <p className="members-empty">No members (paid Whops)</p>
      ) : (
        <table className="members-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Price</th>
              <th>Period</th>
              <th>Start</th>
              <th>Next Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {membershipsList.map((m) => {
              const start = new Date(m.start_at).toLocaleString();
              const nextPay = m.next_payment_at
                ? new Date(m.next_payment_at).toLocaleString()
                : "-";
              const periodText = m.is_recurring ? m.billing_period : "One-time";
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
                        Cancel
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
