// src/pages/Dashboard.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useNotifications } from "../components/NotificationProvider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "../styles/dashboard.scss";

export default function Dashboard() {
  const { showNotification, showConfirm } = useNotifications();

  const [whopId, setWhopId] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [role, setRole] = useState(""); // "owner", "moderator" nebo ""
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [bans, setBans] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  // Data pro graf (All-Time Revenue)
  const [chartData, setChartData] = useState([]);

  // Platební tabulka – filtrování a stránkování
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // 1) Načtení whop_id z URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wid = params.get("whop_id");
    if (!wid) {
      showNotification({ type: "error", message: "Chybí whop_id v URL." });
      return;
    }
    setWhopId(wid);
  }, [showNotification]);

  // 2) Po získání whopId stáhneme data
  useEffect(() => {
    if (!whopId) return;
    setDataLoaded(false);

    fetch(
      `https://app.byxbot.com/php/get_dashboard_data.php?whop_id=${encodeURIComponent(
        whopId
      )}`,
      { credentials: "include" }
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP chyba ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          setRole(json.role);
          setMembers(json.members || []);
          setPayments(json.payments || []);
          setGrossRevenue(parseFloat(json.grossRevenue || 0));
          setMembersCount(parseInt(json.membersCount || 0, 10));
          setBans(json.bans || []);
          setModerators(json.moderators || []);
          prepareChartData(json.payments || []);
          setDataLoaded(true);
        } else {
          throw new Error(json.message || "Chyba při načítání dat.");
        }
      })
      .catch((err) => {
        console.error("Chyba get_dashboard_data:", err);
        showNotification({
          type: "error",
          message: err.message || "Nepodařilo se načíst data.",
        });
      });
  }, [whopId, showNotification]);

  // 3) Připravíme data pro line chart (All-Time Revenue)
  const prepareChartData = (paymentsList) => {
    const sums = {};
    paymentsList.forEach((p) => {
      const dateKey = p.payment_date.split(" ")[0]; // "YYYY-MM-DD"
      sums[dateKey] = (sums[dateKey] || 0) + parseFloat(p.amount);
    });
    const arr = Object.keys(sums)
      .sort()
      .map((d) => ({
        date: d,
        revenue: parseFloat(sums[d].toFixed(2)),
      }));
    setChartData(arr);
  };

  // 4) Pomocná funkce pro obnovení všech dat (po kick/refund/ban/invite/unban)
  const reloadDashboardData = () => {
    if (!whopId) return;

    fetch(
      `https://app.byxbot.com/php/get_dashboard_data.php?whop_id=${encodeURIComponent(
        whopId
      )}`,
      { credentials: "include" }
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          setRole(json.role);
          setMembers(json.members || []);
          setPayments(json.payments || []);
          setGrossRevenue(parseFloat(json.grossRevenue || 0));
          setMembersCount(parseInt(json.membersCount || 0, 10));
          setBans(json.bans || []);
          setModerators(json.moderators || []);
          prepareChartData(json.payments || []);
        } else {
          showNotification({
            type: "error",
            message: json.message || "Chyba při obnově dat.",
          });
        }
      })
      .catch((err) => {
        console.error("Chyba reloadDashboardData:", err);
        showNotification({
          type: "error",
          message: err.message || "Nepodařilo se obnovit data.",
        });
      });
  };

  // 5) Kick (odstranit člena) – dostupné owner i moderator
  const handleRemoveMember = async (memberUserId) => {
    try {
      await showConfirm("Opravdu chcete odstranit tohoto uživatele z Whopu?");
    } catch {
      return;
    }

    setLoadingAction(true);
    fetch("https://app.byxbot.com/php/remove_member.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remove_user_id: memberUserId, whop_id: whopId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          showNotification({ type: "success", message: json.message });
          setMembers((prev) => prev.filter((m) => m.user_id !== memberUserId));
          setMembersCount((prev) => prev - 1);
        } else {
          showNotification({
            type: "error",
            message: json.message || "Chyba při odstraňování.",
          });
        }
      })
      .catch((err) => {
        console.error("Chyba remove_member:", err);
        showNotification({
          type: "error",
          message: err.message || "Nepodařilo se odstranit člena.",
        });
      })
      .finally(() => {
        setLoadingAction(false);
      });
  };

  // 6) Ban uživatele – dostupné owner i moderator
  const handleBanUser = async (banUserId) => {
    try {
      await showConfirm("Opravdu chcete zabanovat tohoto uživatele?");
    } catch {
      return;
    }

    setLoadingAction(true);
    fetch("https://app.byxbot.com/php/ban_user.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ban_user_id: banUserId, whop_id: whopId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          showNotification({ type: "success", message: json.message });
          reloadDashboardData();
        } else {
          throw new Error(json.message || "Chyba při banování.");
        }
      })
      .catch((err) => {
        console.error("Chyba ban_user:", err);
        showNotification({
          type: "error",
          message: err.message || "Chyba při banování.",
        });
      })
      .finally(() => {
        setLoadingAction(false);
      });
  };

  // 7) Unban uživatele – dostupné owner i moderator
  const handleUnbanUser = async (banUserId) => {
    try {
      await showConfirm("Opravdu chcete odbanovat tohoto uživatele?");
    } catch {
      return;
    }

    setLoadingAction(true);
    fetch("https://app.byxbot.com/php/unban_user.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whop_id: whopId,
        ban_user_id: banUserId, // klíč musí pasovat s tím, co PHP očekává
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          showNotification({ type: "success", message: json.message });
          reloadDashboardData();
        } else {
          throw new Error(json.message || "Chyba při odbanování.");
        }
      })
      .catch((err) => {
        console.error("Chyba unban_user:", err);
        showNotification({
          type: "error",
          message: err.message || "Chyba při odbanování.",
        });
      })
      .finally(() => {
        setLoadingAction(false);
      });
  };

  // 8) Refund platby – pouze owner
  const handleRefund = async (paymentId) => {
    try {
      await showConfirm("Opravdu chcete vrátit tuto platbu?");
    } catch {
      return;
    }

    setLoadingAction(true);
    fetch("https://app.byxbot.com/php/refund_payment.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: paymentId, whop_id: whopId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          showNotification({ type: "success", message: json.message });
          reloadDashboardData();
        } else {
          throw new Error(json.message || "Chyba při refundu.");
        }
      })
      .catch((err) => {
        console.error("Chyba refund:", err);
        showNotification({
          type: "error",
          message: err.message || "Chyba při refundu platby.",
        });
      })
      .finally(() => {
        setLoadingAction(false);
      });
  };

  // 9) Pozvat moderátora – pouze owner
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showNotification({ type: "error", message: "Zadejte email uživatele." });
      return;
    }

    try {
      await showConfirm(
        `Opravdu chcete pozvat ${inviteEmail.trim()} jako moderátora?`
      );
    } catch {
      return;
    }

    setLoadingAction(true);
    fetch("https://app.byxbot.com/php/invite_moderator.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim(), whop_id: whopId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          showNotification({ type: "success", message: json.message });
          reloadDashboardData();
          setInviteEmail("");
        } else {
          throw new Error(json.message || "Chyba při přidávání moderátora.");
        }
      })
      .catch((err) => {
        console.error("Chyba invite_moderator:", err);
        showNotification({
          type: "error",
          message: err.message || "Chyba při pozvání moderátora.",
        });
      })
      .finally(() => {
        setLoadingAction(false);
      });
  };

  // 10) Odebrat moderátora – pouze owner
  const handleRemoveModerator = async (modUserId) => {
    try {
      await showConfirm("Opravdu chcete odebrat tohoto moderátora?");
    } catch {
      return;
    }

    setLoadingAction(true);
    fetch("https://app.byxbot.com/php/remove_moderator.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mod_user_id: modUserId, whop_id: whopId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          showNotification({ type: "success", message: json.message });
          reloadDashboardData();
        } else {
          throw new Error(json.message || "Chyba při odebírání moderátora.");
        }
      })
      .catch((err) => {
        console.error("Chyba remove_moderator:", err);
        showNotification({
          type: "error",
          message: err.message || "Chyba při odebírání moderátora.",
        });
      })
      .finally(() => {
        setLoadingAction(false);
      });
  };

  // 11) Filtrace plateb podle username nebo email (case-insensitive)
  const filteredPayments = useMemo(() => {
    if (!filterText.trim()) return payments;
    const query = filterText.trim().toLowerCase();
    return payments.filter(
      (p) =>
        p.username.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query)
    );
  }, [payments, filterText]);

  // 12) Paginated payments podle PAGE_SIZE
  const totalPaymentPages = Math.ceil(filteredPayments.length / PAGE_SIZE);
  const paginatedPayments = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredPayments.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredPayments, currentPage]);

  if (!dataLoaded) {
    return <p className="dashboard-loading">Načítám dashboard…</p>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Whop Dashboard</h1>

      {/* ───────── STATISTIKY ───────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Aktivní členové</h3>
          <p className="stat-number">{membersCount}</p>
        </div>
        <div className="stat-card">
          <h3>All-Time Revenue</h3>
          <p className="stat-number">{grossRevenue.toFixed(2)} USD</p>
        </div>
        <div className="stat-card">
          <h3>Počet banů</h3>
          <p className="stat-number">{bans.length}</p>
        </div>
        <div className="stat-card">
          <h3>Moderátoři</h3>
          <p className="stat-number">{moderators.length}</p>
        </div>
      </div>

      {/* ───────── GRAF (All-Time Revenue) ───────── */}
      <div className="chart-section">
        <h2>All-Time Revenue Trend</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data-text">Žádné údaje pro graf.</p>
        )}
      </div>

      {/* ───────── SEZNAM ČLENŮ ───────── */}
      <div className="table-section">
        <h2>Aktivní členové</h2>
        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Hledej člena podle uživatele nebo e-mailu…"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        {members.length === 0 ? (
          <p className="no-data-text">Žádní aktivní členové.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Joined At</th>
                <th>Typ</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {members
                .filter((m) => {
                  if (!filterText.trim()) return true;
                  const q = filterText.trim().toLowerCase();
                  return (
                    m.username.toLowerCase().includes(q) ||
                    m.email.toLowerCase().includes(q)
                  );
                })
                .map((m) => (
                  <tr key={`${m.user_id}-${m.type}`}>
                    <td>{m.username}</td>
                    <td>{m.email}</td>
                    <td>{new Date(m.start_at).toLocaleString()}</td>
                    <td className={m.type === "paid" ? "label-paid" : "label-free"}>
                      {m.type === "paid" ? "Placený" : "Free"}
                    </td>
                    <td>
                      {(role === "owner" || role === "moderator") ? (
                        <>
                          <button
                            className="btn-kick"
                            disabled={loadingAction}
                            onClick={() => handleRemoveMember(m.user_id)}
                          >
                            Terminate Membership
                          </button>
                          <button
                            className="btn-ban"
                            disabled={loadingAction}
                            onClick={() => handleBanUser(m.user_id)}
                          >
                            Ban
                          </button>
                        </>
                      ) : (
                        <span className="dashmdash">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ───────── SEZNAM PLATEB (filtrovatelné + stránkované) ───────── */}
      <div className="table-section">
        <h2>Seznam plateb</h2>

        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Hledej platební záznam podle uživatele nebo e-mailu…"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {filteredPayments.length === 0 ? (
          <p className="no-data-text">Žádné platby odpovídající filtru.</p>
        ) : (
          <>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Typ</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.payment_id}>
                    <td>{p.payment_id}</td>
                    <td>{p.username}</td>
                    <td>{p.email}</td>
                    <td>
                      {p.amount} {p.currency}
                    </td>
                    <td>{new Date(p.payment_date).toLocaleString()}</td>
                    <td
                      className={
                        p.type === "one_time" || p.type === "recurring"
                          ? "dashboard-td-success"
                          : p.type === "refunded"
                          ? "dashboard-td-refunded"
                          : "dashboard-td-failed"
                      }
                    >
                      {p.type === "one_time"
                        ? "Jednorázově"
                        : p.type === "recurring"
                        ? "Opakovaně"
                        : p.type === "refunded"
                        ? "Refundováno"
                        : "Neúspěšná platba"}
                    </td>
                    <td>
                      {role === "owner" ? (
                        !["refunded", "failed_refunded", "failed"].includes(p.type) ? (
                          <button
                            className="btn-refund"
                            disabled={loadingAction}
                            onClick={() => handleRefund(p.payment_id)}
                          >
                            Refund
                          </button>
                        ) : (
                          <span className="dashmdash">—</span>
                        )
                      ) : (
                        <span className="dashmdash">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Stránkování */}
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                ←
              </button>
              {Array.from({ length: totalPaymentPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    className={`page-btn ${num === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                )
              )}
              <button
                className="page-btn"
                disabled={currentPage === totalPaymentPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPaymentPages))
                }
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      {/* ───────── SEZNAM BANŮ ───────── */}
      <div className="table-section">
        <h2>Seznam zabanovaných</h2>
        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Hledej banované podle uživatele nebo e-mailu…"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        {bans.length === 0 ? (
          <p className="no-data-text">Žádní zabanovaní uživatelé.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Banned At</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {bans
                .filter((b) => {
                  if (!filterText.trim()) return true;
                  const q = filterText.trim().toLowerCase();
                  return (
                    b.username.toLowerCase().includes(q) ||
                    b.email.toLowerCase().includes(q)
                  );
                })
                .map((b) => (
                  <tr key={b.user_id}>
                    <td>{b.username}</td>
                    <td>{b.email}</td>
                    <td>{new Date(b.banned_at).toLocaleString()}</td>
                    <td>
                      {(role === "owner" || role === "moderator") ? (
                        <button
                          className="btn-unban"
                          disabled={loadingAction}
                          onClick={() => handleUnbanUser(b.user_id)}
                        >
                          Unban
                        </button>
                      ) : (
                        <span className="dashmdash">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ───────── Team (Moderátoři) ───────── */}
      <div className="table-section">
        <h2>Team (Moderátoři)</h2>
        {role === "owner" ? (
          <>
            <div className="invite-form">
              <input
                type="email"
                placeholder="Email uživatele"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="filter-input"
              />
              <button
                className="btn-invite"
                disabled={loadingAction}
                onClick={handleInvite}
              >
                Pozvat
              </button>
            </div>
            {moderators.length === 0 ? (
              <p className="no-data-text">Žádní moderátoři.</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Added At</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {moderators.map((m) => (
                    <tr key={m.user_id}>
                      <td>{m.username}</td>
                      <td>{m.email}</td>
                      <td>{new Date(m.added_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn-remove-mod"
                          disabled={loadingAction}
                          onClick={() => handleRemoveModerator(m.user_id)}
                        >
                          Odebrat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p className="no-data-text">
            Zobrazují se pouze moderátoři (owner). Vám není umožněno upravovat.
          </p>
        )}
      </div>
    </div>
  );
}
