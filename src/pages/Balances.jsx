// src/pages/Balances.jsx

import React, { useState, useEffect } from 'react';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import '../styles/balances.scss';

export default function Balances() {
  const [balance, setBalance]           = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [errorBalance, setErrorBalance] = useState('');

  const [isDepositOpen, setIsDepositOpen]   = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const [activeTab, setActiveTab]       = useState('deposits');
  const [historyData, setHistoryData]   = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState('');

  useEffect(() => {
    setLoadingBalance(true);
    setErrorBalance('');
    fetch('https://app.byxbot.com/php/profile.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setBalance(parseFloat(data.data.balance) || 0);
        } else {
          setErrorBalance(data.message || 'Chyba při načítání balancu');
        }
      })
      .catch((err) => {
        console.error('Chyba načtení balancu:', err);
        setErrorBalance('Nepodařilo se načíst balance');
      })
      .finally(() => {
        setLoadingBalance(false);
      });
  }, []);

  useEffect(() => {
    setLoadingHistory(true);
    setErrorHistory('');
    const url =
      activeTab === 'deposits'
        ? 'https://app.byxbot.com/php/deposit_history.php'
        : 'https://app.byxbot.com/php/withdraw_history.php';

    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setHistoryData(data.data);
        } else {
          setErrorHistory(data.message || 'Chyba při načítání historie');
          setHistoryData([]);
        }
      })
      .catch((err) => {
        console.error('Chyba načítání historie:', err);
        setErrorHistory('Nepodařilo se načíst historii');
        setHistoryData([]);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [activeTab]);

  const openDeposit = () => setIsDepositOpen(true);
  const closeDeposit = () => setIsDepositOpen(false);
  const openWithdraw = () => setIsWithdrawOpen(true);
  const closeWithdraw = () => setIsWithdrawOpen(false);

  return (
    <div className="balances-container">
      <h2>My Balance</h2>

      <div className="balances-header">
        {loadingBalance ? (
          <div className="bal-loading">Loading balance…</div>
        ) : errorBalance ? (
          <div className="bal-error">{errorBalance}</div>
        ) : (
          <div className="bal-amount">
            <span>Balance:</span> ${balance.toFixed(2)}
          </div>
        )}

        <div className="bal-buttons">
          <button className="bal-btn bal-deposit" onClick={openDeposit}>
            Deposit
          </button>
          <button className="bal-btn bal-withdraw" onClick={openWithdraw}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="balances-tabs">
        <button
          className={`tab-btn ${activeTab === 'deposits' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposits')}
        >
          Deposits
        </button>
        <button
          className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawals
        </button>
      </div>

      <div className="balances-history">
        {loadingHistory ? (
          <div className="hist-loading">Loading history…</div>
        ) : errorHistory ? (
          <div className="hist-error">{errorHistory}</div>
        ) : historyData.length === 0 ? (
          <div className="hist-empty">No records yet.</div>
        ) : (
          <table className="hist-table">
            <thead>
              <tr>
                {activeTab === 'deposits' ? (
                  <>
                    <th>Date</th>
                    <th>SOL Amount</th>
                    <th>USD Amount</th>
                    <th>Tx Signature</th>
                  </>
                ) : (
                  <>
                    <th>Date</th>
                    <th>USD Amount</th>
                    <th>SOL Amount</th>
                    <th>Sol Address</th>
                    <th>Status</th>
                    <th>Tx Signature</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, idx) => (
                <tr key={idx}>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  {activeTab === 'deposits' ? (
                    <>
                      <td>{item.sol_amount.toFixed(8)}</td>
                      <td>${item.usd_amount.toFixed(2)}</td>
                      <td className="mono">{item.tx_signature || '-'}</td>
                    </>
                  ) : (
                    <>
                      <td>${item.usd_amount.toFixed(2)}</td>
                      <td>{item.sol_amount.toFixed(8)}</td>
                      <td className="mono">{item.sol_address}</td>
                      <td>
                        {item.status === 'completed' ? (
                          <span className="status-completed">Completed</span>
                        ) : item.status === 'pending' ? (
                          <span className="status-pending">Pending</span>
                        ) : (
                          <span className="status-failed">Failed</span>
                        )}
                      </td>
                      <td className="mono">{item.tx_signature || '-'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DepositModal isOpen={isDepositOpen} onClose={closeDeposit} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={closeWithdraw} />
    </div>
  );
}
