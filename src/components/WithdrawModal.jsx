// src/components/WithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import '../styles/withdraw-modal.scss';

export default function WithdrawModal({ isOpen, onClose }) {
  const [usdAmount, setUsdAmount] = useState('');
  const [solAddress, setSolAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [solPrice, setSolPrice] = useState(null); // kurz SOL→USD
  const [solEquivalent, setSolEquivalent] = useState(null);

  // Když se modal zavře, vyčistíme předchozí hlášky i kurz
  useEffect(() => {
    if (!isOpen) {
      setUsdAmount('');
      setSolAddress('');
      setError('');
      setSuccessMsg('');
      setLoading(false);
      setSolPrice(null);
      setSolEquivalent(null);
    }
  }, [isOpen]);

  // Jakmile se modal otevře, načteme cenu SOL z CoinGecko
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

  // Vypočítáme odpovídající SOL, když se změní USD částka nebo kurz
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
    setError('');
    setSuccessMsg('');

    const usd = parseFloat(usdAmount);
    if (isNaN(usd) || usd < 9.99) {
      setError('Minimální částka k výběru je 9.99 USD.');
      return;
    }
    if (!solAddress.trim()) {
      setError('Zadejte platnou Solana adresu.');
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
          setSuccessMsg(
            `Výběr úspěšný: ${data.message} TX: ${data.tx || '-'}`
          );
          setUsdAmount('');
          setSolAddress('');
          setSolEquivalent(null);
        } else {
          setError(data.message || 'Chyba při odesílání žádosti.');
        }
      })
      .catch((err) => {
        console.error('Chyba při volání withdraw.php:', err);
        setError(err.message || 'Nepodařilo se provést žádost o výběr.');
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

        {error && <div className="wm-error">{error}</div>}
        {successMsg && <div className="wm-success">{successMsg}</div>}

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
