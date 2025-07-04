/**
 * monitor.js
 *
 * Tento skript pravidelnì kontroluje všechny `deposit_address`
 * uložené v tabulce `users4` a zpracovává nové pøíchozí transakce v Solana Testnetu.
 *
 * Pro každou deposit_address:
 *   1) Zjistí nové transakce (signatures) od posledního zpracování.
 *   2) Stáhne detail transakce a spoèítá, kolik SOL pøišlo na danou adresu.
 *   3) Vloží záznam do `deposit_records` (user_id, deposit_address, sol_amount, usd_amount, tx_signature).
 *   4) Aktualizuje sloupec `balance` v `users4` (navýší o odpovídající USD ekvivalent).
 *   5) Pokud má uživatel nenulový a ne-prázdný `deposit_secret`, provede „sweep“ – pøepošle SOL z depozitní adresy na centrální penìženku.
 *
 * Validuje, že každá adresa je platná (Base58). Pokud není, vypíše varování a danou adresu pøeskoèí.
 */

import mysql from 'mysql2/promise';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Keypair,
  Transaction,
  SystemProgram
} from '@solana/web3.js';
import bs58 from 'bs58';
import fetch from 'node-fetch';

// --- 1) Konfigurace SOLANA a DB ---
const SOLANA_CLUSTER = 'testnet';
const connection = new Connection(clusterApiUrl(SOLANA_CLUSTER), 'confirmed');

const dbConfig = {
  host: 'localhost',
  user: 'dbadmin',
  password: '3otwj3zR6EI',
  database: 'byx',
  port: 3306,
  charset: 'utf8mb4',
};

// *** Base58 privátní klíè centrální penìženky (vygenerovaný export_secret_base58.js) ***
const CENTRAL_SECRET_BASE58 =
  '3tbU6bmmc3XCNs5m8RFMK2DRw7cdeRLq2zrbcao2E5cMEEm2urpsbr3buKXvXiTFDav5HgRvBLRiP5mDSCGBbLwo';

const CENTRAL_SECRET = bs58.decode(CENTRAL_SECRET_BASE58);
const centralKeypair = Keypair.fromSecretKey(Uint8Array.from(CENTRAL_SECRET));
const CENTRAL_PUBLIC_KEY = centralKeypair.publicKey.toBase58();

// Interval kontroly (ms)
const POLL_INTERVAL = 30 * 1000;

// --- Pomocné funkce ---

/**
 * Vrátí aktuální cenu SOL v USD z CoinGecko.
 */
async function fetchSolPrice() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const data = await res.json();
    return data.solana.usd || null;
  } catch {
    return null;
  }
}

/**
 * Naète mapu všech deposit_address › user_id z tabulky `users4`.
 */
async function loadDepositAddresses(conn) {
  const map = new Map();
  const [rows] = await conn.execute(
    'SELECT id AS user_id, deposit_address FROM users4 WHERE deposit_address IS NOT NULL AND deposit_address != ""'
  );
  for (const row of rows) {
    map.set(row.deposit_address, row.user_id);
  }
  return map;
}

/**
 * Vrátí poslední zpracovanou tx_signature pro danou deposit_address.
 */
async function getLastSignature(conn, depositAddress) {
  const [rows] = await conn.execute(
    'SELECT tx_signature FROM deposit_records WHERE deposit_address = ? ORDER BY created_at DESC LIMIT 1',
    [depositAddress]
  );
  if (rows.length > 0) {
    return rows[0].tx_signature;
  }
  return null;
}

/**
 * Uloží záznam do `deposit_records` a aktualizuje `users4.balance`.
 */
async function storeDepositAndUpdateBalance(
  conn,
  userId,
  depositAddress,
  txSignature,
  solAmount,
  usdAmount
) {
  await conn.execute(
    `INSERT INTO deposit_records
      (tx_signature, user_id, deposit_address, sol_amount, usd_amount)
     VALUES (?, ?, ?, ?, ?)`,
    [
      txSignature,
      userId,
      depositAddress,
      solAmount.toFixed(8),
      usdAmount.toFixed(8),
    ]
  );
  await conn.execute(
    `UPDATE users4 SET balance = balance + ? WHERE id = ?`,
    [usdAmount.toFixed(8), userId]
  );
}

/**
 * „Sweepne“ SOL z uživatelské depozitní adresy na centrální penìženku.
 */
async function sweepToCentral(userKeypair) {
  try {
    const lamportsBalance = await connection.getBalance(
      userKeypair.publicKey
    );
    if (lamportsBalance <= 0) return;

    // Rezervujeme pár tisíc lamportù na fee
    const feeLamports = 5000;
    const lamportsToSend = lamportsBalance - feeLamports;
    if (lamportsToSend <= 0) return;

    // Sestavíme transakci
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userKeypair.publicKey,
        toPubkey: centralKeypair.publicKey,
        lamports: lamportsToSend,
      })
    );

    // Nastavíme feePayer a recentBlockhash
    transaction.feePayer = userKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;

    // Podepíšeme transakci privátním klíèem uživatele
    transaction.sign(userKeypair);

    // Odešleme a potvrdíme
    const raw = transaction.serialize();
    const sig = await connection.sendRawTransaction(raw);
    await connection.confirmTransaction(sig, 'confirmed');

    console.log(
      `? Sweep OK: posláno ${ (lamportsToSend / LAMPORTS_PER_SOL).toFixed(8) } SOL » ${centralKeypair.publicKey.toBase58()}. TX=${sig}`
    );
  } catch (err) {
    console.error('? Chyba pøi sweepu:', err.message);
  }
}

/**
 * Pro jednu deposit_address zpracuje nové transakce (od lastSig k nejnovìjšímu).
 * Validuje, že depositAddress je Base58 a odpovídá formátu pro Solana.
 * Pokud není, vypíše varování a danou adresu pøeskoèí.
 */
async function processAddress(
  conn,
  depositAddress,
  userId,
  lastSig,
  solPrice
) {
  let pubkey;
  try {
    pubkey = new PublicKey(depositAddress);
  } catch {
    console.warn(`?? Neplatná adresa, pøeskoèeno: ${depositAddress}`);
    return;
  }

  try {
    const options = lastSig
      ? { until: lastSig, limit: 1000 }
      : { limit: 1000 };
    const signaturesInfo = await connection.getSignaturesForAddress(
      pubkey,
      options
    );
    if (signaturesInfo.length === 0) return;

    // Obnovíme poøadí od nejstarších k nejnovìjším
    const sigs = signaturesInfo.map((info) => info.signature).reverse();

    for (const txSig of sigs) {
      if (txSig === lastSig) continue;

      const parsedTx = await connection.getParsedTransaction(
        txSig,
        'confirmed'
      );
      if (!parsedTx) continue;

      let lamportsIn = 0;
      for (const instr of parsedTx.transaction.message.instructions) {
        if (instr.program === 'system' && instr.parsed?.type === 'transfer') {
          const info = instr.parsed.info;
          if (info.destination === depositAddress) {
            lamportsIn += parseInt(info.lamports, 10);
          }
        }
      }
      if (lamportsIn <= 0) continue;

      const solAmount = lamportsIn / LAMPORTS_PER_SOL;
      const usdAmount = solPrice !== null ? solPrice * solAmount : 0;

      await storeDepositAndUpdateBalance(
        conn,
        userId,
        depositAddress,
        txSig,
        solAmount,
        usdAmount
      );
      console.log(
        `?? Deposit uložen: user=${userId}, ${solAmount.toFixed(
          8
        )} SOL (? $${usdAmount.toFixed(2)}), TX=${txSig}`
      );

      // Teï se podíváme, jestli mùžeme sweepnout
      const [rows] = await conn.execute(
        'SELECT deposit_secret FROM users4 WHERE id = ?',
        [userId]
      );
      if (
        rows.length > 0 &&
        rows[0].deposit_secret &&
        rows[0].deposit_secret.trim() !== ''
      ) {
        try {
          const userSecret = bs58.decode(rows[0].deposit_secret);
          const userKeypair = Keypair.fromSecretKey(Uint8Array.from(userSecret));
          await sweepToCentral(userKeypair);
        } catch {
          console.warn(
            `?? Sweep pøeskoèen (invalid deposit_secret) pro user=${userId}`
          );
        }
      }
    }
  } catch (err) {
    console.error(
      `? Chyba pøi zpracování address=${depositAddress} (user=${userId}):`,
      err.message
    );
  }
}

/**
 * Hlavní funkce: každých POLL_INTERVAL naète nový SOL u všech deposit_address a zpracuje je.
 */
async function processTransactions() {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
  } catch (err) {
    console.error('? Nelze se pøipojit k DB:', err.message);
    return;
  }

  try {
    const solPrice = await fetchSolPrice();

    const depositMap = await loadDepositAddresses(conn);
    if (depositMap.size === 0) {
      console.log('??  Žádné deposit_address v DB.');
      await conn.end();
      return;
    }

    for (const [depositAddress, userId] of depositMap) {
      const lastSig = await getLastSignature(conn, depositAddress);
      await processAddress(conn, depositAddress, userId, lastSig, solPrice);
    }
  } catch (err) {
    console.error('? Chyba v processTransactions:', err.message);
  } finally {
    await conn.end();
  }
}

// === Start monitoru ===
console.log(`?? Centrální penìženka: ${CENTRAL_PUBLIC_KEY}`);
console.log(
  `??  Monitor spuštìn (Testnet). Kontrola každých ${POLL_INTERVAL / 1000}s.`
);

// Okamžitì jedno spuštìní, pak každých 30s
processTransactions();
setInterval(processTransactions, POLL_INTERVAL);
