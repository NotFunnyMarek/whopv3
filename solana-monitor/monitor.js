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
import { VersionedTransaction } from '@solana/web3.js';
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
  host: '127.0.0.1',
  user: 'dbadmin',
  password: '3otwj3zR6EI',
  database: 'byx',
  charset: 'utf8mb4',
};

// Připojení k Solana Testnet RPC
const connection = new Connection(
  'https://icy-lively-telescope.solana-mainnet.quiknode.pro/f3cec49667700280c1925092e91051a329e9635b/',
  'confirmed'
);


// Vaše centrální (sweep) peněženka – privátní klíč v Base58
const CENTRAL_SECRET_BASE58 = '3rMoueuUabKyV8aiYaKho3WT8sChyFJm3Yg1H9zrATbinkXsjz7snGnkLt52smtY9PNPkhtyLm6wyWxWvrNsCVAs';
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

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 && attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 10000);
        console.warn(`Server responded with 429 Too Many Requests. Retrying after ${delay}ms delay...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 10000);
      console.warn(`Fetch error: ${err.message}. Retrying after ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ---------------------------------------------
// 2) Získání ceny SOL v USD (CoinGecko)
// ---------------------------------------------
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
async function getSolPriceUsd() {
  try {
    const response = await fetchWithRetry(COINGECKO_API_URL);
    const data = await response.json();
    return data?.solana?.usd || 0;
  } catch (err) {
    console.error('❌ Nelze získat cenu SOL z CoinGecko:', err);
    return 0;
  }
}

// ---------------------------------------------
// 2.1) Převod SOL -> USDC přes Jupiter API
// ---------------------------------------------
const SOL_MINT  = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// ✅ Funkce pro zjištění USDC balance centrální peněženky
async function getUsdcBalance(pubkey) {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(pubkey),
      { mint: new PublicKey(USDC_MINT) }
    );
    if (tokenAccounts.value.length === 0) return 0;
    return parseFloat(tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount);
  } catch (e) {
    console.error('❌ Nelze získat USDC balance:', e);
    return 0;
  }
}

// ✅ Nová verze swap funkce
async function swapSolToUsdc(lamportsAmount) {
  if (!lamportsAmount || lamportsAmount < 0.01 * LAMPORTS) {
    console.warn(`⚠️ Swap přeskočen – amount příliš malý (${(lamportsAmount/LAMPORTS).toFixed(4)} SOL).`);
    return;
  }

  try {
    const balanceBefore = await getUsdcBalance(CENTRAL_PUBLIC_KEY);

    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${lamportsAmount}&slippageBps=50&swapMode=ExactIn`;
    console.log('🔗 DEBUG QUOTE URL:', quoteUrl);

    const quoteRes = await fetchWithRetry(quoteUrl);
    const quote = await quoteRes.json();
    console.log('🔗 DEBUG QUOTE RESPONSE:', JSON.stringify(quote));

    // ✅ správná kontrola pro API v6
    if (!quote || !quote.routePlan || quote.routePlan.length === 0) {
      console.warn('⚠️ Jupiter neposkytl žádnou route pro swap.');
      return;
    }

const swapBody = {
  quoteResponse: quote,    // ✅ Jupiter vyžaduje celé quoteResponse
  userPublicKey: CENTRAL_PUBLIC_KEY,
  wrapAndUnwrapSol: true   // ✅ správný název pole
};

const swapRes = await fetchWithRetry('https://quote-api.jup.ag/v6/swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(swapBody),
});

const swapJson = await swapRes.json();

// ✅ Logování případné chyby z Jupiter API
if (!swapJson.swapTransaction && swapJson.error) {
   console.error('❌ Jupiter swap API vrátilo chybu:', swapJson.error);
   return;
}

if (!swapJson.swapTransaction) {
   console.warn('⚠️ Jupiter swap API nevrátil transakci.');
   return;
}

    const tx = VersionedTransaction.deserialize(Buffer.from(swapJson.swapTransaction, 'base64'));
    tx.feePayer = centralKeypair.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.sign([centralKeypair]);


    // ⬇️ produkční odeslání
    const txid = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txid, 'confirmed');

    const balanceAfter = await getUsdcBalance(CENTRAL_PUBLIC_KEY);
    const diff = balanceAfter - balanceBefore;

    if (diff > 0) {
      console.log(`💱 Swap SOL→USDC úspěšný, přibylo ${diff.toFixed(6)} USDC. TX=${txid}`);
    } else {
      console.error(`❌ Swap selhal – SOL odešlo, ale USDC nepřišlo! TX=${txid}`);
    }

  } catch (err) {
    console.error('❌ Chyba při swapu SOL→USDC:', err);
  }
}


// ---------------------------------------------
// 2.2) Úvodní kontrola připojení a API
// ---------------------------------------------
async function performStartupCheck() {
  console.log('🔧 Probíhá úvodní kontrola systému…');
  let ok = true;

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('SELECT 1');
    await conn.end();
    console.log('✅ MySQL připojení OK.');
  } catch (err) {
    console.error('❌ MySQL připojení selhalo:', err);
    ok = false;
  }

  try {
    await connection.getLatestBlockhash();
    console.log('✅ Solana RPC OK.');
  } catch (err) {
    console.error('❌ Solana RPC nedostupné:', err);
    ok = false;
  }

  try {
const testUrl =
  `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}` +
  `&amount=1000&swapMode=ExactIn`;
    const res = await fetchWithRetry(testUrl);
    const q = await res.json();
    if (q && q.data && q.data.length > 0) {
      console.log('✅ Jupiter API OK.');
    } else {
      console.warn('⚠️ Jupiter API nevrátila route.');
      ok = false;
    }
  } catch (err) {
    console.error('❌ Chyba spojení na Jupiter API:', err);
    ok = false;
  }

  if (ok) {
    console.log('✅ Úvodní kontrola dokončena bez chyb.');
  } else {
    console.warn('⚠️ Úvodní kontrola zjistila problémy.');
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
     (tx_signature, user_id, deposit_address, sol_amount, usd_amount, swept) 
   VALUES (?, ?, ?, ?, ?, false)`,
  [signature, userId, depositAddress, solAmount, usdAmount]
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
         // --- ponechat minimální rent-exempt zůstatek, aby účet zůstal platný ---
const RENT_EXEMPT_RESERVE = 2000000; // 0.002 SOL
const feeLamports = 10000;
const lamportsToSend = userLamportsBalance - feeLamports - RENT_EXEMPT_RESERVE;

if (lamportsToSend <= 0) {
  console.warn(`⚠️ Sweep: user=${userId}, zůstatek ${userLamportsBalance} nestačí na sweep (ponechán rent).`);
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

            // 3.10.3) Ihned konvertujeme SOL na USDC
            await swapSolToUsdc(lamportsToSend);
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

async function start() {
  await performStartupCheck();
  processAllDeposits();
  setInterval(processAllDeposits, POLL_INTERVAL);
}

start().catch((err) => {
  console.error('❌ Chyba při startu monitoru:', err);
});
