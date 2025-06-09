// src/pages/Balances.jsx

import React, { useState, useEffect } from 'react';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/balances.scss';

export default function Balances() {
  const { showNotification } = useNotifications();

  const [balance, setBalance]           = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [isDepositOpen, setIsDepositOpen]   = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const [activeTab, setActiveTab]       = useState('deposits');
  const [historyData, setHistoryData]   = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setLoadingBalance(true);
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
          showNotification({ type: 'success', message: 'Balance načteno.' });
        } else {
          showNotification({ type: 'error', message: data.message || 'Chyba při načítání balancu' });
        }
      })
      .catch((err) => {
        console.error('Chyba načtení balancu:', err);
        showNotification({ type: 'error', message: 'Nepodařilo se načíst balance' });
      })
      .finally(() => {
        setLoadingBalance(false);
      });
  }, [showNotification]);

  useEffect(() => {
    setLoadingHistory(true);
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
          showNotification({ type: 'success', message: 'Aktualizována historie.' });
        } else {
          setHistoryData([]);
          showNotification({ type: 'error', message: data.message || 'Chyba při načítání historie' });
        }
      })
      .catch((err) => {
        console.error('Chyba načítání historie:', err);
        setHistoryData([]);
        showNotification({ type: 'error', message: 'Nepodařilo se načíst historii' });
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [activeTab, showNotification]);

  const openDeposit = () => {
    setIsDepositOpen(true);
  };
  const closeDeposit = () => {
    setIsDepositOpen(false);
  };
  const openWithdraw = () => {
    setIsWithdrawOpen(true);
  };
  const closeWithdraw = () => {
    setIsWithdrawOpen(false);
  };

  const onSuccessWithdraw = () => {
    // po úspěchu výběru znovu načteme historii a balance
    setActiveTab('withdrawals');
  };

  const onSuccessDeposit = () => {
    // po úspěchu depositu přepneme na deposit kartu
    setActiveTab('deposits');
  };

  return (
    <div className="balances-container">
      <h2>My Balance</h2>

      <div className="balances-header">
        {loadingBalance ? (
          <div className="bal-loading">Loading balance…</div>
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

      <DepositModal isOpen={isDepositOpen} onClose={closeDeposit} onSuccess={onSuccessDeposit} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={closeWithdraw} onSuccess={onSuccessWithdraw} />
    </div>
  );
}
