// src/components/WithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationProvider';
import '../styles/withdraw-modal.scss';

export default function WithdrawModal({ isOpen, onClose, onSuccess }) {
  const { showNotification } = useNotifications();

  const [usdAmount, setUsdAmount] = useState('');
  const [solAddress, setSolAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [solPrice, setSolPrice] = useState(null); // SOL→USD rate
  const [solEquivalent, setSolEquivalent] = useState(null);

  // Reset fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUsdAmount('');
      setSolAddress('');
      setLoading(false);
      setSolPrice(null);
      setSolEquivalent(null);
    }
  }, [isOpen]);

  // Fetch SOL price when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function fetchSolPriceUSD() {
      try {
        const resp = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (
          data &&
          data.solana &&
          typeof data.solana.usd === 'number' &&
          data.solana.usd > 0
        ) {
          setSolPrice(data.solana.usd);
        } else {
          setSolPrice(null);
        }
      } catch {
        setSolPrice(null);
      }
    }

    fetchSolPriceUSD();
  }, [isOpen]);

  // Compute SOL equivalent from USD amount
  useEffect(() => {
    const usd = parseFloat(usdAmount);
    if (
      !isNaN(usd) &&
      usd > 0 &&
      solPrice !== null &&
      solPrice > 0
    ) {
      setSolEquivalent(usd / solPrice);
    } else {
      setSolEquivalent(null);
    }
  }, [usdAmount, solPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const usd = parseFloat(usdAmount);
    if (isNaN(usd) || usd < 9.99) {
      showNotification({ type: 'error', message: 'Minimum withdraw amount is 9.99 USD.' });
      return;
    }
    if (!solAddress.trim()) {
      showNotification({ type: 'error', message: 'Please enter a valid Solana address.' });
      return;
    }

    setLoading(true);

    fetch('https://app.byxbot.com/php/withdraw.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        usdAmount: usd,
        solAddress: solAddress.trim(),
      }),
    })
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid server response (HTTP ${res.status})`);
        }

        if (!res.ok) {
          const msg = data.message || `HTTP error: ${res.status}`;
          throw new Error(msg);
        }
        return data;
      })
      .then((data) => {
        if (data.status === 'success') {
          showNotification({
            type: 'success',
            message: `Withdrawal successful: ${data.message} TX: ${data.tx || '-'}`,
          });
          setUsdAmount('');
          setSolAddress('');
          setSolEquivalent(null);
          if (onSuccess) onSuccess();
        } else {
          showNotification({ type: 'error', message: data.message || 'Error submitting withdraw request.' });
        }
      })
      .catch((err) => {
        console.error('Error calling withdraw.php:', err);
        showNotification({ type: 'error', message: err.message || 'Failed to process withdraw request.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wm-container" onClick={(e) => e.stopPropagation()}>
        <h2>Withdraw SOL (Testnet)</h2>

        <form onSubmit={handleSubmit} className="wm-form">
          <div className="wm-input-group">
            <label>
              Amount (USD):
              <input
                type="number"
                step="0.01"
                min="9.99"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                required
              />
            </label>
            <div className="wm-sol-equivalent">
              {solPrice === null ? (
                <span>Loading SOL price…</span>
              ) : solEquivalent !== null ? (
                <span>
                  ≈ {solEquivalent.toFixed(6)} SOL (1 SOL = ${solPrice.toFixed(2)})
                </span>
              ) : (
                <span>Enter at least 9.99 USD to calculate SOL</span>
              )}
            </div>
          </div>

          <div className="wm-input-group">
            <label>
              Solana Address (testnet):
              <input
                type="text"
                value={solAddress}
                onChange={(e) => setSolAddress(e.target.value)}
                placeholder="Enter your Solana address"
                required
              />
            </label>
          </div>

          <button type="submit" className="wm-submit-btn" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Withdraw'}
          </button>
        </form>

        <div className="wm-close-row">
          <button className="wm-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
