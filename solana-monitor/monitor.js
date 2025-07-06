import mysql from 'mysql2/promise';
import bs58 from 'bs58';
import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

// Konfigurace
const dbConfig = {
  host: '127.0.0.1',
  user: 'dbadmin',
  password: '3otwj3zR6EI',
  database: 'byx',
  charset: 'utf8mb4',
};

const connection = new Connection(
  'https://snowy-newest-diagram.solana-devnet.quiknode.pro/1aca783b369672a2ab65d19717ce7226c5747524',
  'confirmed'
);

const CENTRAL_SECRET_BASE58 =
  '3tbU6bmmc3XCNs5m8RFMK2DRw7cdeRLq2zrbcao2E5cMEEm2urpsbr3buKXvXiTFDav5HgRvBLRiP5mDSCGBbLwo';
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

const POLL_INTERVAL = 30 * 1000; // 30 sekund
const LAMPORTS = LAMPORTS_PER_SOL;

async function getSolPriceUsd() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await res.json();
    return data?.solana?.usd || 0;
  } catch {
    return 0;
  }
}

async function processAllDeposits() {
  console.log('🔍 Kontrola všech uživatelských adres a nových depositů…');

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
  } catch (err) {
    console.error('❌ Nelze se připojit k databázi:', err);
    return;
  }

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
    const { user_id, deposit_address, deposit_secret } = user;

    let userKeypair;
    try {
      const secretBytes = bs58.decode(deposit_secret);
      userKeypair = Keypair.fromSecretKey(Uint8Array.from(secretBytes));
    } catch {
      console.error(`❌ Chyba dekódování deposit_secret pro user=${user_id}`);
      continue;
    }

    if (userKeypair.publicKey.toBase58() !== deposit_address) {
      console.error(`⚠️ Nesoulad klíčů u user=${user_id}`);
      continue;
    }

    let signatures;
    try {
      signatures = await connection.getSignaturesForAddress(userKeypair.publicKey, { limit: 20 });
    } catch (err) {
      console.error(`❌ getSignaturesForAddress (${deposit_address}):`, err);
      continue;
    }

    for (const sigInfo of signatures) {
      const signature = sigInfo.signature;

      let existing;
      try {
        const [rowsExist] = await conn.execute(
          "SELECT id, swept FROM deposit_records WHERE tx_signature = ?",
          [signature]
        );
        existing = rowsExist;
      } catch (err) {
        console.error(`❌ SELECT deposit_records (TX=${signature}):`, err);
        continue;
      }
      if (existing.length > 0 && existing[0].swept) continue;

      let txDetail;
      try {
        txDetail = await connection.getParsedTransaction(signature, 'confirmed');
      } catch (err) {
        console.error(`❌ getParsedTransaction (TX=${signature}):`, err);
        continue;
      }
      if (!txDetail) continue;

      let lamportsReceived = 0;
      for (const instr of txDetail.transaction.message.instructions) {
        if (
          instr.parsed &&
          instr.parsed.type === 'transfer' &&
          instr.parsed.info.destination === deposit_address
        ) {
          lamportsReceived += instr.parsed.info.lamports;
        }
      }
      if (lamportsReceived <= 0) continue;

      const solAmount = lamportsReceived / LAMPORTS;
      const solPriceUsd = await getSolPriceUsd();
      const usdAmount = solAmount * solPriceUsd;

      let depositRecordId;
      try {
        const [insertRes] = await conn.execute(
          `INSERT INTO deposit_records 
             (tx_signature, user_id, deposit_address, sol_amount, usd_amount, swept) 
           VALUES (?, ?, ?, ?, ?, false)`,
          [signature, user_id, deposit_address, solAmount, usdAmount]
        );
        depositRecordId = insertRes.insertId;
        console.log(`➕ Deposit user=${user_id}: ${solAmount.toFixed(4)} SOL`);
      } catch (err) {
        console.error(`❌ INSERT deposit_records (TX=${signature}):`, err);
        continue;
      }

      try {
        await conn.execute(
          "UPDATE users4 SET balance = balance + ? WHERE id = ?",
          [usdAmount, user_id]
        );
        console.log(`✔️ Balance user=${user_id} +$${usdAmount.toFixed(2)} USD.`);
      } catch (err) {
        console.error(`❌ Chyba update balance user=${user_id}:`, err);
        continue;
      }

      try {
        const userLamportsBalance = await connection.getBalance(userKeypair.publicKey, 'confirmed');
        if (userLamportsBalance <= 0) continue;

        const feeLamports = 5000;
        const lamportsToSend = userLamportsBalance - feeLamports;
        if (lamportsToSend <= 0) continue;

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: userKeypair.publicKey,
            toPubkey: centralKeypair.publicKey,
            lamports: lamportsToSend,
          })
        );

        const sweepSignature = await sendAndConfirmTransaction(connection, transaction, [userKeypair]);

        console.log(`🔀 Sweep OK user=${user_id}: ${(lamportsToSend / LAMPORTS).toFixed(6)} SOL`);

        await conn.execute(
          "UPDATE deposit_records SET swept = true, swept_signature = ? WHERE id = ?",
          [sweepSignature, depositRecordId]
        );
      } catch (err) {
        console.error(`❌ Sweep user=${user_id}:`, err);
        continue;
      }
    }
  }

  await conn.end();
}

console.log(`▶️ Monitor spuštěn. Centrální adresa=${CENTRAL_PUBLIC_KEY}`);

processAllDeposits();
setInterval(processAllDeposits, POLL_INTERVAL);
