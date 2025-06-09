// src/components/WithdrawForm.jsx

import React, { useState } from 'react';
import { useNotifications } from './NotificationProvider';

export default function WithdrawForm({ onSuccess }) {
  const { showNotification } = useNotifications();

  const [usdAmount, setUsdAmount] = useState('');
  const [solAddress, setSolAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usd = parseFloat(usdAmount);
    if (isNaN(usd) || usd <= 0) {
      showNotification({ type: 'error', message: 'Částka musí být kladné číslo.' });
      return;
    }
    if (!solAddress.trim()) {
      showNotification({ type: 'error', message: 'Zadejte cílovou Solana adresu.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://app.byxbot.com/php/withdraw.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdAmount: usd,
          solAddress: solAddress.trim()
        }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Neplatná odpověď serveru');
      }

      if (!res.ok || data.status !== 'success') {
        showNotification({ type: 'error', message: data.message || 'Nastala neznámá chyba.' });
      } else {
        showNotification({ type: 'success', message: `Úspěšně odesláno. Tx: ${data.tx}` });
        setUsdAmount('');
        setSolAddress('');
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      showNotification({ type: 'error', message: 'Chyba sítě: ' + e.message });
    }
    setLoading(false);
  };

  return (
    <div className="dm-container">
      <form onSubmit={handleSubmit} className="withdraw-form">
        <div className="dm-section">
          <strong>Částka (USD):</strong>
          <input
            type="number"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="dm-section">
          <strong>Vaše Solana adresa (Testnet):</strong>
          <input
            type="text"
            value={solAddress}
            onChange={(e) => setSolAddress(e.target.value)}
            placeholder="např. 7toRbiXgeCNVjSFuMbTiLadD1M4wMnoRLD4P4wmcVDLL"
            required
          />
        </div>
        <div className="dm-close-row">
          <button type="submit" className="dm-close-btn" disabled={loading}>
            {loading ? 'Vyřizuji…' : 'Vybrat'}
          </button>
        </div>
      </form>
    </div>
  );
}
