// src/components/WithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationProvider';
import '../styles/withdraw-modal.scss';

export default function WithdrawModal({ isOpen, onClose, onSuccess }) {
  const { showNotification } = useNotifications();

  const [usdAmount, setUsdAmount] = useState('');
  const [solAddress, setSolAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [solPrice, setSolPrice] = useState(null); // kurz SOL→USD
  const [solEquivalent, setSolEquivalent] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setUsdAmount('');
      setSolAddress('');
      setLoading(false);
      setSolPrice(null);
      setSolEquivalent(null);
    }
  }, [isOpen]);

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

  useEffect(() => {
    const usd = parseFloat(usdAmount);
    if (
      !isNaN(usd) &&
      usd > 0 &&
      solPrice !== null &&
      typeof solPrice === 'number' &&
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
      showNotification({ type: 'error', message: 'Minimální částka k výběru je 9.99 USD.' });
      return;
    }
    if (!solAddress.trim()) {
      showNotification({ type: 'error', message: 'Zadejte platnou Solana adresu.' });
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
          throw new Error(`Neplatná odpověď serveru (HTTP ${res.status})`);
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
            message: `Výběr úspěšný: ${data.message} TX: ${data.tx || '-'}`,
          });
          setUsdAmount('');
          setSolAddress('');
          setSolEquivalent(null);
          if (onSuccess) onSuccess();
        } else {
          showNotification({ type: 'error', message: data.message || 'Chyba při odesílání žádosti.' });
        }
      })
      .catch((err) => {
        console.error('Chyba při volání withdraw.php:', err);
        showNotification({ type: 'error', message: err.message || 'Nepodařilo se provést žádost o výběr.' });
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
              Částka (USD):
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
                <span>Načítám kurz SOL…</span>
              ) : solEquivalent !== null ? (
                <span>
                  ≈ {solEquivalent.toFixed(6)} SOL (1 SOL = ${solPrice.toFixed(2)})
                </span>
              ) : (
                <span>Zadejte částku ≥ 9.99 USD pro výpočet SOL</span>
              )}
            </div>
          </div>

          <div className="wm-input-group">
            <label>
              Solana Adresa (testnet):
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
            {loading ? 'Odesílám…' : 'Submit Withdraw'}
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
