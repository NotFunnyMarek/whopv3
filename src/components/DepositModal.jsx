// src/components/DepositModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../styles/deposit-modal.scss';

/**
 * DepositModal
 *
 * Props:
 *   - isOpen    : boolean, zda je modal otevřený
 *   - onClose   : funkce (bez parametrů), volá se, když chceme modal zavřít
 *
 * Tento komponent stáhne z backendu deposit_address a balance.
 * Také zavolá CoinGecko, aby zjistil aktuální cenu SOL v USD (testnet cenu používáme stejnou),
 * a ukáže uživateli, kolik USD je hodnota 1 SOL.
 *
 * Obsahuje:
 *   - Zobrazení adresy pro vklad
 *   - Možnost překopírování adresy do schránky
 *   - Ukázku aktuálního zůstatku (v USD) a instrukce
 */
export default function DepositModal({ isOpen, onClose }) {
  const [depositAddress, setDepositAddress] = useState('');
  const [balance, setBalance] = useState('0.00000000');
  const [solPrice, setSolPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---- 1) Načíst deposit_address a balance z backendu ----
  useEffect(() => {
    if (!isOpen) return; // když se modal zavře, nebudeme dále fetchovat
    async function fetchDepositInfo() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://app.byxbot.com/php/deposit.php', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status === 401) {
          throw new Error('Uživatel není přihlášen. Přihlaste se prosím.');
        }
        if (!res.ok) {
          throw new Error(`Chyba při načítání: ${res.status}`);
        }
        const body = await res.json();
        if (body.status !== 'success') {
          throw new Error(body.message || 'Neznámá chyba při načítání');
        }
        setDepositAddress(body.data.deposit_address || '');
        setBalance(body.data.balance || '0.00000000');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDepositInfo();
  }, [isOpen]);

  // ---- 2) Načíst cenu SOL z CoinGecko ----
  useEffect(() => {
    if (!isOpen) return;
    async function fetchSolPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        if (!res.ok) {
          throw new Error('Nelze získat cenu SOL');
        }
        const data = await res.json();
        if (data.solana && data.solana.usd) {
          setSolPrice(data.solana.usd);
        } else {
          setSolPrice(null);
        }
      } catch {
        setSolPrice(null);
      }
    }
    fetchSolPrice();
  }, [isOpen]);

  // ---- 3) Kopírování do schránky ----
  const copyToClipboard = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress).catch(() => {});
  };

  // ---- RENDER ----
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="dm-container">
        <h2>Deposit SOL (Testnet)</h2>

        {loading && <div className="dm-loading">Načítám informace…</div>}

        {!loading && error && (
          <div className="dm-error">Chyba: {error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="dm-section">
              <strong>Váš vklad (deposit) adres:</strong>
              {depositAddress ? (
                <div className="dm-address-row">
                  <input
                    type="text"
                    readOnly
                    value={depositAddress}
                    className="dm-address-input"
                  />
                  <button
                    type="button"
                    className="dm-copy-btn"
                    onClick={copyToClipboard}
                  >
                    Kopírovat
                  </button>
                </div>
              ) : (
                <div>Adresa pro deposit zatím není dostupná.</div>
              )}
            </div>

            <div className="dm-section">
              <strong>Váš zůstatek v USD:</strong>
              <div className="dm-balance">${Number(balance).toFixed(2)}</div>
            </div>

            <div className="dm-section">
              <strong>Instrukce:</strong>
              <ul className="dm-instructions">
                <li>
                  Přepněte si peněženku na <code>Solana Testnet</code>.
                </li>
                <li>
                  Pošlete SOL na výše uvedenou adresu.
                </li>
                <li>
                  Do pole „Memo“ (poznámka) napište své <strong>user_id</strong>.
                  <br />
                  (Např. pokud je vaše user_id <code>42</code>, napište v Memo <code>42</code>.)
                </li>
                <li>
                  Jakmile transakce proběhne, systém deposit zachytí a připíše
                  ekvivalent v USD na váš účet.
                </li>
              </ul>
            </div>

            <div className="dm-section">
              <strong>1 SOL ≈</strong>{' '}
              {solPrice !== null ? `$${solPrice.toFixed(2)} USD` : '…'}
            </div>

            <div className="dm-close-row">
              <button
                type="button"
                className="dm-close-btn"
                onClick={onClose}
              >
                Zavřít
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
