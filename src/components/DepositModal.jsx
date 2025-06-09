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

    // 1) Načteme deposit_address z deposit.php
    fetch('https://app.byxbot.com/php/deposit.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setDepositAddress(data.data.deposit_address);
          showNotification({ type: 'success', message: 'Adresa pro deposit načtena.' });
          // 2) Poté načteme cenu SOL z CoinGecko
          return fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
          );
        } else {
          throw new Error(data.message || 'Chyba při načítání deposit dat');
        }
      })
      .then((res) => {
        if (!res.ok) throw new Error(`CoinGecko HTTP error: ${res.status}`);
        return res.json();
      })
      .then((priceData) => {
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
      .catch((err) => {
        console.error('Chyba při načítání deposit nebo ceny SOL:', err);
        setError('Nepodařilo se načíst data pro deposit');
        showNotification({ type: 'error', message: 'Chyba při načítání deposit dat.' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, showNotification]);

  const handleCopy = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress).then(
      () => {
        showNotification({ type: 'success', message: 'Adresa zkopírována do schránky.' });
        if (onSuccess) onSuccess();
      },
      () => {
        showNotification({ type: 'error', message: 'Chyba při kopírování.' });
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dm-container" onClick={(e) => e.stopPropagation()}>
        <h2>Deposit SOL (Testnet)</h2>

        {loading && <div className="dm-loading">Načítám…</div>}
        {error && <div className="dm-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="dm-section">
              <strong>Solana Adresa:</strong>
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
              <strong>Postup:</strong>
              <ul className="dm-instructions">
                <li>
                  Přihlašte se do své Solana testnet peněženky (Phantom apod.) a
                  zašlete SOL na výše uvedenou adresu.
                </li>
                <li>
                  1 SOL ≈ $
                  {priceUsd !== null ? priceUsd.toFixed(2) : '–'} USD
                </li>
                <li>Čekejte přibližně 30 s na zpracování transakce.</li>
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
