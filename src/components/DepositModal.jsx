// src/components/DepositModal.jsx

import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationProvider';
import '../styles/deposit-modal.scss';

export default function DepositModal({ isOpen, onClose, onSuccess }) {
  const { showNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [priceUsd, setPriceUsd] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError('');
    setDepositAddress('');
    setPriceUsd(null);

    // 1) Load deposit_address from deposit.php
    fetch('https://app.byxbot.com/php/deposit.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          setDepositAddress(data.data.deposit_address);
          showNotification({ type: 'success', message: 'Deposit address loaded.' });
          // 2) Then fetch the SOL price from CoinGecko
          return fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
          );
        } else {
          throw new Error(data.message || 'Error loading deposit data');
        }
      })
      .then(res => {
        if (!res.ok) throw new Error(`CoinGecko HTTP error: ${res.status}`);
        return res.json();
      })
      .then(priceData => {
        if (
          priceData &&
          priceData.solana &&
          typeof priceData.solana.usd === 'number'
        ) {
          setPriceUsd(priceData.solana.usd);
        } else {
          setPriceUsd(null);
        }
      })
      .catch(err => {
        console.error('Error loading deposit or SOL price:', err);
        setError('Unable to load deposit data');
        showNotification({ type: 'error', message: 'Error loading deposit data.' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, showNotification]);

  const handleCopy = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress).then(
      () => {
        showNotification({ type: 'success', message: 'Address copied to clipboard.' });
        if (onSuccess) onSuccess();
      },
      () => {
        showNotification({ type: 'error', message: 'Copy failed.' });
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dm-container" onClick={e => e.stopPropagation()}>
        <h2>Deposit SOL (Testnet)</h2>

        {loading && <div className="dm-loading">Loading…</div>}
        {error && <div className="dm-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="dm-section">
              <strong>Solana Address:</strong>
              <div className="dm-address-row">
                <input
                  type="text"
                  className="dm-address-input"
                  readOnly
                  value={depositAddress}
                />
                <button className="dm-copy-btn" onClick={handleCopy}>
                  Copy
                </button>
              </div>
            </div>

            <div className="dm-section">
              <strong>Instructions:</strong>
              <ul className="dm-instructions">
                <li>
                  Log into your Solana testnet wallet (e.g., Phantom) and send SOL to the above address.
                </li>
                <li>
                  1 SOL ≈ ${priceUsd !== null ? priceUsd.toFixed(2) : '–'} USD
                </li>
                <li>Wait approximately 30 s for the transaction to process.</li>
              </ul>
            </div>

            <div className="dm-close-row">
              <button className="dm-close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
