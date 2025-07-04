/**
 * monitor.js
 *
 * Pravidelně (každých 30 s) kontroluje transakce na všech uživatelských deposit_address,
 * uloží je do tabulky deposit_records a zároveň provede „sweep“ – pošle všechny SOL
 * z té uživatelské peněženky na centrální peněženku CENTRAL_ADDRESS.
 *
 * Předpoklady:
 * 1) V package.json máte:
 *    "type": "module",
 *    "dependencies": { "@solana/web3.js", "mysql2", "bs58" }
 * 2) Přístup k MySQL (127.0.0.1:3306, uživatel dbadmin, heslo 3otwj3zR6EI).
 * 3) Privátní klíč vaší centrální peněženky v Base58 (replace níže).
 * 4) Node.js v18+ (má nativní fetch).
 *
 * Spuštění:  
 *   cd solana-monitor
 *   node monitor.js
 */

import mysql from 'mysql2/promise';
import bs58 from 'bs58';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

// ---------------------------------------------
// 1) Konfigurace
// ---------------------------------------------

// MySQL připojení
const dbConfig = {
  host: 'localhost',
  user: 'dbadmin',
  password: '3otwj3zR6EI',
  database: 'byx',
  charset: 'utf8mb4',
};

// Připojení k Solana Testnet RPC
const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

// Vaše centrální (sweep) peněženka – privátní klíč v Base58
const CENTRAL_SECRET_BASE58 = '3tbU6bmmc3XCNs5m8RFMK2DRw7cdeRLq2zrbcao2E5cMEEm2urpsbr3buKXvXiTFDav5HgRvBLRiP5mDSCGBbLwo';
let centralKeypair;
let CENTRAL_PUBLIC_KEY = '';
try {
  const secretBytes = bs58.decode(CENTRAL_SECRET_BASE58);
  centralKeypair = Keypair.fromSecretKey(Uint8Array.from(secretBytes));
  CENTRAL_PUBLIC_KEY = centralKeypair.publicKey.toBase58();
} catch (err) {
  console.error('❌ Neplatný formát CENTRAL_SECRET_BASE58:', err);
  process.exit(1);
}

console.log(`Centrální peněženka: ${CENTRAL_PUBLIC_KEY}`);

// Interval mezi kontrolami (v ms)
const POLL_INTERVAL = 30 * 1000; // 30 sekund

// Pro přepočet lamports→SOL
const LAMPORTS = LAMPORTS_PER_SOL;

// ---------------------------------------------
// 2) Získání ceny SOL v USD (CoinGecko)
// ---------------------------------------------
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
async function getSolPriceUsd() {
  try {
    const response = await fetch(COINGECKO_API_URL);
    const data = await response.json();
    return data?.solana?.usd || 0;
  } catch (err) {
    console.error('❌ Nelze získat cenu SOL z CoinGecko:', err);
    return 0;
  }
}

// ---------------------------------------------
// 3) Hlavní funkce: zpracování depositů + sweep
// ---------------------------------------------
async function processAllDeposits() {
  console.log('🔍 Kontrola všech uživatelských adres a nových depositů…');

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
  } catch (err) {
    console.error('❌ Nelze se připojit k databázi:', err);
    return;
  }

  // 3.1) Načteme všechny uživatele (user_id, deposit_address, deposit_secret)
  let users;
  try {
    const [rows] = await conn.execute(
      "SELECT id AS user_id, deposit_address, deposit_secret FROM users4 WHERE deposit_address IS NOT NULL AND deposit_secret IS NOT NULL"
    );
    users = rows;
  } catch (err) {
    console.error('❌ Chyba SELECT uživatelů:', err);
    await conn.end();
    return;
  }

  for (const user of users) {
    const userId = user.user_id;
    const depositAddress = user.deposit_address;
    const depositSecretBase58 = user.deposit_secret;

    // 3.2) Dekódujeme privátní klíč a ověříme publicKey
    let userKeypair;
    try {
      const secretBytes = bs58.decode(depositSecretBase58);
      userKeypair = Keypair.fromSecretKey(Uint8Array.from(secretBytes));
    } catch (err) {
      console.error(`❌ Chyba dekódování deposit_secret pro uživatele ${userId}:`, err);
      continue;
    }
    if (userKeypair.publicKey.toBase58() !== depositAddress) {
      console.error(`⚠️ Nesoulad klíčů u uživatele ${userId}: deposit_address != publicKey(priv)`);
      continue;
    }

    // 3.3) Získáme posledních 20 potvrzených signatures pro depositAddress
    let signatures;
    try {
      signatures = await connection.getSignaturesForAddress(
        userKeypair.publicKey,
        { limit: 20 }
      );
    } catch (err) {
      console.error(`❌ Chyba getSignaturesForAddress (${depositAddress}):`, err);
      continue;
    }

    for (const sigInfo of signatures) {
      const signature = sigInfo.signature;

      // 3.4) Zkontrolujeme, jestli záznam již neexistuje
      let existing;
      try {
        const [rowsExist] = await conn.execute(
          "SELECT id, swept FROM deposit_records WHERE tx_signature = ?",
          [signature]
        );
        existing = rowsExist;
      } catch (err) {
        console.error(`❌ Chyba SELECT deposit_records (TX=${signature}):`, err);
        continue;
      }
      if (existing.length > 0) {
        if (existing[0].swept) {
          // Už byl sweep proveden
          continue;
        }
        // swept=false → budeme pokračovat do sweep fáze
      }

      // 3.5) Získáme detail transakce
      let txDetail;
      try {
        txDetail = await connection.getParsedTransaction(signature, 'confirmed');
      } catch (err) {
        console.error(`❌ Chyba getParsedTransaction (TX=${signature}):`, err);
        continue;
      }
      if (!txDetail) continue;

      // 3.6) Spočítáme lamports, které přišly na depositAddress
      let lamportsReceived = 0;
      for (const instr of txDetail.transaction.message.instructions) {
        if (
          instr.parsed &&
          instr.parsed.type === 'transfer' &&
          instr.parsed.info.destination === depositAddress
        ) {
          lamportsReceived += instr.parsed.info.lamports;
        }
      }
      if (lamportsReceived <= 0) continue;

      const solAmount = lamportsReceived / LAMPORTS;

      // 3.7) Získáme cenu SOL v USD
      const solPriceUsd = await getSolPriceUsd();
      const usdAmount = solAmount * solPriceUsd;

      // 3.8) Vložíme nový záznam do deposit_records
      let depositRecordId;
      try {
        const [insertRes] = await conn.execute(
          `INSERT INTO deposit_records 
             (tx_signature, user_id, sol_amount, usd_amount, swept) 
           VALUES (?, ?, ?, ?, false)`,
          [signature, userId, solAmount, usdAmount]
        );
        depositRecordId = insertRes.insertId;
        console.log(`➕ Deposit uložen (ID=${depositRecordId}) user=${userId}: ${solAmount.toFixed(4)} SOL (≈ $${usdAmount.toFixed(2)}).`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          const [rowDup] = await conn.execute(
            "SELECT id FROM deposit_records WHERE tx_signature = ?",
            [signature]
          );
          if (rowDup.length > 0) {
            depositRecordId = rowDup[0].id;
          }
        } else {
          console.error(`❌ Chyba INSERT deposit_records (TX=${signature}):`, err);
          continue;
        }
      }

      // 3.9) Aktualizujeme balance uživatele
      try {
        await conn.execute(
          "UPDATE users4 SET balance = balance + ? WHERE id = ?",
          [usdAmount, userId]
        );
        console.log(`✔️ Balance user=${userId} +$${usdAmount.toFixed(2)} USD.`);
      } catch (err) {
        console.error(`❌ Chyba update balance user=${userId}:`, err);
        continue;
      }

      // 3.10) Provedeme sweep (pošleme SOL do centrály)
      try {
        const userLamportsBalance = await connection.getBalance(userKeypair.publicKey, 'confirmed');
        if (userLamportsBalance <= 0) {
          console.warn(`⚠️ Sweep: user=${userId} má 0 lamports na ${depositAddress}.`);
        } else {
          const feeLamports = 5000;  // ~0.000005 SOL na testnet
          const lamportsToSend = userLamportsBalance - feeLamports;
          if (lamportsToSend <= 0) {
            console.warn(`⚠️ Sweep: user=${userId}, zůstatek ${userLamportsBalance} nestačí na fee.`);
          } else {
            const transaction = new Transaction().add(
              SystemProgram.transfer({
                fromPubkey: userKeypair.publicKey,
                toPubkey:   centralKeypair.publicKey,
                lamports:   lamportsToSend,
              })
            );

            const sweepSignature = await sendAndConfirmTransaction(
              connection,
              transaction,
              [userKeypair]
            );

            console.log(`🔀 Sweep OK user=${userId}: posláno ${(lamportsToSend / LAMPORTS).toFixed(6)} SOL → ${CENTRAL_PUBLIC_KEY}. TX=${sweepSignature}`);

            // 3.10.2) Označíme record jako sweeplený
            await conn.execute(
              "UPDATE deposit_records SET swept = true, swept_signature = ? WHERE id = ?",
              [sweepSignature, depositRecordId]
            );
          }
        }
      } catch (err) {
        console.error(`❌ Chyba při sweep user=${userId}:`, err);
        continue;
      }
    }
  }

  await conn.end();
}

// ---------------------------------------------
// 4) Spuštění monitoru
// ---------------------------------------------
console.log(`▶️ Monitor spuštěn. Centrální adresa=${CENTRAL_PUBLIC_KEY}. Kontrola každých ${POLL_INTERVAL/1000} s.`);

// Spustíme jednou hned
processAllDeposits();

// Poté periodicky
setInterval(processAllDeposits, POLL_INTERVAL);
