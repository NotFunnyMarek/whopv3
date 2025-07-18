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
import AffiliateSection from "./WhopDashboard/components/AffiliateSection";
import AffiliateDefaultsSection from "./WhopDashboard/components/AffiliateDefaultsSection";
import fetchAffiliateLinks from "./WhopDashboard/fetchAffiliateLinks";
import handleUpdateAffiliateLink from "./WhopDashboard/handleUpdateAffiliateLink";
import "../styles/dashboard.scss";
import DashboardSkeleton from "../components/DashboardSkeleton";

export default function Dashboard() {
  const { showNotification, showConfirm } = useNotifications();

  const [whopId, setWhopId] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [role, setRole] = useState("");
  const [waitlistRequests, setWaitlistRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [bans, setBans] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  // Affiliate links
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [affiliateError, setAffiliateError] = useState("");
  const [affiliateDefaultPercent, setAffiliateDefaultPercent] = useState(30);
  const [affiliateRecurring, setAffiliateRecurring] = useState(false);

  const [chartData, setChartData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // 1) Load whop_id from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wid = params.get("whop_id");
    if (!wid) {
      showNotification({ type: "error", message: "Missing whop_id in URL." });
      return;
    }
    setWhopId(wid);
  }, [showNotification]);

  // 2) Fetch dashboard data
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
          throw new Error(text || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          setRole(json.role);
          setWaitlistRequests(json.waitlist_requests || []);
          setMembers(json.members || []);
          setPayments(json.payments || []);
          setGrossRevenue(parseFloat(json.grossRevenue || 0));
          setMembersCount(parseInt(json.membersCount || 0, 10));
          setBans(json.bans || []);
          setModerators(json.moderators || []);
          if (json.affiliate_default_percent !== undefined)
            setAffiliateDefaultPercent(parseFloat(json.affiliate_default_percent));
          if (json.affiliate_recurring !== undefined)
            setAffiliateRecurring(Boolean(json.affiliate_recurring));
          prepareChartData(json.payments || []);
          setDataLoaded(true);
        } else {
          throw new Error(json.message || "Error loading data.");
        }
      })
      .catch((err) => {
        console.error("Error get_dashboard_data:", err);
        showNotification({
          type: "error",
          message: err.message || "Failed to load data.",
        });
      });
  }, [whopId, showNotification]);

  // 3) Prepare data for chart
  const prepareChartData = (paymentsList) => {
    const sums = {};
    paymentsList.forEach((p) => {
      const dateKey = p.payment_date.split(" ")[0];
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

  // 4) Reload all data
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
          setWaitlistRequests(json.waitlist_requests || []);
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
            message: json.message || "Error refreshing data.",
          });
        }
      })
      .catch((err) => {
        console.error("Error reloadDashboardData:", err);
        showNotification({
          type: "error",
          message: err.message || "Failed to refresh data.",
        });
      });
  };

  // 5) Accept a waitlist request
  const handleAcceptRequest = async (requestId) => {
    try {
      await showConfirm("Are you sure you want to accept this request?");
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/accept_waitlist.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      reloadDashboardData();
    } catch (err) {
      // if user canceled confirm, err.message will be "cancel"
      if (err.message !== "cancel") {
        console.error("Error accept_waitlist:", err);
        showNotification({
          type: "error",
          message: err.message || "Failed to accept request.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 6) Reject a waitlist request
  const handleRejectRequest = async (requestId) => {
    try {
      await showConfirm("Are you sure you want to reject this request?");
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/reject_waitlist.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      reloadDashboardData();
    } catch (err) {
      if (err.message !== "cancel") {
        console.error("Error reject_waitlist:", err);
        showNotification({
          type: "error",
          message: err.message || "Failed to reject request.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 7) Remove a member
  const handleRemoveMember = async (memberUserId) => {
    try {
      await showConfirm("Are you sure you want to remove this member?");
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/remove_member.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove_user_id: memberUserId, whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      setMembers((prev) => prev.filter((m) => m.user_id !== memberUserId));
      setMembersCount((prev) => prev - 1);
    } catch (err) {
      if (err.message !== "cancel") {
        console.error("Error remove_member:", err);
        showNotification({
          type: "error",
          message: err.message || "Failed to remove member.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 8) Ban a user
  const handleBanUser = async (banUserId) => {
    try {
      await showConfirm("Are you sure you want to ban this user?");
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/ban_user.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban_user_id: banUserId, whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      reloadDashboardData();
    } catch (err) {
      if (err.message !== "cancel") {
        console.error("Error ban_user:", err);
        showNotification({
          type: "error",
          message: err.message || "Error banning user.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 9) Unban a user
  const handleUnbanUser = async (banUserId) => {
    try {
      await showConfirm("Are you sure you want to unban this user?");
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/unban_user.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban_user_id: banUserId, whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      reloadDashboardData();
    } catch (err) {
      if (err.message !== "cancel") {
        console.error("Error unban_user:", err);
        showNotification({
          type: "error",
          message: err.message || "Error unbanning user.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 10) Refund a payment
  const handleRefund = async (paymentId) => {
    try {
      await showConfirm("Are you sure you want to refund this payment?");
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/refund_payment.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      reloadDashboardData();
    } catch (err) {
      if (err.message !== "cancel") {
        console.error("Error refund:", err);
        showNotification({
          type: "error",
          message: err.message || "Error refunding payment.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 11) Invite a moderator
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showNotification({ type: "error", message: "Please enter a user email." });
      return;
    }
    try {
      await showConfirm(`Are you sure you want to invite ${inviteEmail.trim()} as a moderator?`);
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/invite_moderator.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      setInviteEmail("");
      reloadDashboardData();
    } catch (err) {
      if (err.message !== "cancel") {
        console.error("Error invite_moderator:", err);
        showNotification({
          type: "error",
          message: err.message || "Error inviting moderator.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 12) Remove a moderator
  const handleRemoveModerator = async (modUserId) => {
    try {
      await showConfirm("Are you sure you want to remove this moderator?");
      setLoadingAction(true);
      const res = await fetch("https://app.byxbot.com/php/remove_moderator.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mod_user_id: modUserId, whop_id: whopId }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || `HTTP error ${res.status}`);
      }
      showNotification({ type: "success", message: json.message });
      reloadDashboardData();
    } catch (err) {
      if (err.message !== "cancel") {
        console.error("Error remove_moderator:", err);
        showNotification({
          type: "error",
          message: err.message || "Error removing moderator.",
        });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // 13) Affiliate links
  const fetchAffiliates = (wid) =>
    fetchAffiliateLinks(wid, setAffiliateLoading, setAffiliateError, setAffiliateLinks);

  useEffect(() => {
    if (whopId && role === "owner") {
      fetchAffiliates(whopId);
    }
  }, [whopId, role]);

  const handleAffiliateChange = async (id, payout, recurring) => {
    const link = affiliateLinks.find((l) => l.id === id) || {};
    let newPayout;
    if (payout !== undefined) {
      const parsed = parseFloat(payout);
      newPayout = isNaN(parsed) ? link.payout_percent : parsed;
    } else {
      newPayout = link.payout_percent;
    }
    newPayout = Math.min(100, Math.max(0, newPayout));
    const newRecurring =
      typeof recurring === "boolean" ? recurring : Boolean(link.payout_recurring);
    await handleUpdateAffiliateLink(
      id,
      newPayout,
      newRecurring,
      false,
      showNotification,
      fetchAffiliates,
      whopId
    );
  };

  const handleAffiliateDelete = async (id) => {
    await handleUpdateAffiliateLink(
      id,
      0,
      false,
      true,
      showNotification,
      fetchAffiliates,
      whopId
    );
  };

  const handleSaveAffiliateDefaults = async () => {
    try {
      const res = await fetch("https://app.byxbot.com/php/update_affiliate_defaults.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whop_id: whopId,
          affiliate_default_percent: Math.min(100, Math.max(0, affiliateDefaultPercent)),
          affiliate_recurring: affiliateRecurring ? 1 : 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") throw new Error(json.message || `HTTP ${res.status}`);
      showNotification({ type: "success", message: "Defaults saved" });
    } catch (err) {
      showNotification({ type: "error", message: err.message });
    }
  };

  // payment filtering and pagination
  const filteredPayments = useMemo(() => {
    if (!filterText.trim()) return payments;
    const q = filterText.trim().toLowerCase();
    return payments.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [payments, filterText]);

  const totalPaymentPages = Math.ceil(filteredPayments.length / PAGE_SIZE);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPayments.slice(start, start + PAGE_SIZE);
  }, [filteredPayments, currentPage]);

  if (!dataLoaded) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Whop Dashboard</h1>

      {(role === "owner" || role === "moderator") && waitlistRequests.length > 0 && (
        <div className="table-section">
          <h2>Waitlist Requests</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Submitted At</th>
                <th>Answers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitlistRequests.map((req) => (
                <tr key={`req-${req.user_id}`}>
                  <td>{req.username}</td>
                  <td>{req.email}</td>
                  <td>{new Date(req.requested_at).toLocaleString()}</td>
                  <td>
                    {req.answers?.length > 0 ? (
                      <ul className="waitlist-answers">
                        {req.answers.map((ans, i) => (
                          <li key={i}>
                            <strong>Q{i + 1}:</strong> {ans}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-accept"
                      disabled={loadingAction}
                      onClick={() => handleAcceptRequest(req.user_id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-reject"
                      disabled={loadingAction}
                      onClick={() => handleRejectRequest(req.user_id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Members</h3>
          <p className="stat-number">{membersCount}</p>
        </div>
        <div className="stat-card">
          <h3>All-Time Revenue</h3>
          <p className="stat-number">{grossRevenue.toFixed(2)} USD</p>
        </div>
        <div className="stat-card">
          <h3>Number of Bans</h3>
          <p className="stat-number">{bans.length}</p>
        </div>
        <div className="stat-card">
          <h3>Moderators</h3>
          <p className="stat-number">{moderators.length}</p>
        </div>
      </div>

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
          <p className="no-data-text">No data available for chart.</p>
        )}
      </div>

      <div className="table-section">
        <h2>Members</h2>
        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Search member by username or email…"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        {members.length === 0 ? (
          <p className="no-data-text">No active members.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Joined At</th>
                <th>Type</th>
                <th>Actions</th>
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
                  <tr key={`member-${m.user_id}-${m.type}`}>
                    <td>{m.username}</td>
                    <td>{m.email}</td>
                    <td>{new Date(m.start_at).toLocaleString()}</td>
                    <td className={m.type === "paid" ? "label-paid" : "label-free"}>
                      {m.type === "paid" ? "Paid" : "Free"}
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

      <div className="table-section">
        <h2>Payments</h2>
        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Search payments by username or email…"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        {filteredPayments.length === 0 ? (
          <p className="no-data-text">No payments match the filter.</p>
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
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={`payment-${p.payment_id}`}>
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
                        ? "One-Time"
                        : p.type === "recurring"
                        ? "Recurring"
                        : p.type === "refunded"
                        ? "Refunded"
                        : "Failed"}
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
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                ←
              </button>
              {Array.from({ length: totalPaymentPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={`page-${num}`}
                  className={`page-btn ${num === currentPage ? "active" : ""}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={currentPage === totalPaymentPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaymentPages))}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      <div className="table-section">
        <h2>Banned Users</h2>
        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Search banned by username or email…"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        {bans.length === 0 ? (
          <p className="no-data-text">No banned users.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Banned At</th>
                <th>Actions</th>
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
                  <tr key={`ban-${b.user_id}`}>
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

      {role === "owner" && (
        <>
          <AffiliateDefaultsSection
            isEditing={true}
            defaultPercent={affiliateDefaultPercent}
            setDefaultPercent={setAffiliateDefaultPercent}
            recurring={affiliateRecurring}
            setRecurring={setAffiliateRecurring}
          />
          <button className="btn-save" onClick={handleSaveAffiliateDefaults}>
            Save Affiliate Settings
          </button>
          <AffiliateSection
            links={affiliateLinks}
            loading={affiliateLoading}
            error={affiliateError}
            onSave={handleAffiliateChange}
            onDelete={handleAffiliateDelete}
          />
        </>
      )}

      <div className="table-section">
        <h2>Team (Moderators)</h2>
        {role === "owner" ? (
          <>
            <div className="invite-form">
              <input
                type="email"
                placeholder="User email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="filter-input"
              />
              <button
                className="btn-invite"
                disabled={loadingAction}
                onClick={handleInvite}
              >
                Invite
              </button>
            </div>
            {moderators.length === 0 ? (
              <p className="no-data-text">No moderators.</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Added At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moderators.map((m) => (
                    <tr key={`mod-${m.user_id}`}>
                      <td>{m.username}</td>
                      <td>{m.email}</td>
                      <td>{new Date(m.added_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn-remove-mod"
                          disabled={loadingAction}
                          onClick={() => handleRemoveModerator(m.user_id)}
                        >
                          Remove
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
            Showing moderators only for the owner. You do not have permission to edit.
          </p>
        )}
      </div>
    </div>
  );
}
