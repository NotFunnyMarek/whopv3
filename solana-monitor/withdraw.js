// File: /solana-monitor/withdraw.js
// Mus� platit, �e v /solana-monitor/package.json m�te "type": "module".

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} from '@solana/web3.js';

// Wrapper around fetch with simple retries for 429/errors
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500) {
        const wait = 500 * (i + 1);
        console.error(`Server responded with ${res.status} ${res.statusText}.  Retrying after ${wait}ms delay...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      const wait = 500 * (i + 1);
      console.error(`Fetch error: ${err}. Retrying after ${wait}ms delay...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw new Error('Exhausted retries');
}

const SOL_MINT  = 'So11111111111111111111111111111111111111112';
// Correct devnet USDC mint. The previous value 7rbvUFP8s5eyL9ddi3bDTancoC8NQx7Z1iQg76u1JaSm
// is not supported by Jupiter and prevented swaps.
const USDC_MINT = '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT';
const FEE_LAMPORTS = 5000; // estimated tx fee

async function swapUsdcToSol(lamportsNeeded, connection, keypair) {
  try {
  const quoteUrl =
      `https://quote-api.jup.ag/v6/quote?inputMint=${USDC_MINT}&outputMint=${SOL_MINT}` +
      `&amount=${lamportsNeeded}&slippageBps=50&swapMode=ExactOut&cluster=devnet`;
    const quoteRes = await fetchWithRetry(quoteUrl);
    const quote = await quoteRes.json();
    if (!quote || !quote.data || quote.data.length === 0) {
      throw new Error('Jupiter neposkytl route');
    }
    const route = quote.data[0];

    const swapRes = await fetchWithRetry('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route,
        userPublicKey: keypair.publicKey.toBase58(),
        wrapUnwrapSOL: true,
        feeAccount: null,
      }),
    });
    const swapJson = await swapRes.json();
    if (!swapJson.swapTransaction) {
      throw new Error('Jupiter swap API nevrátil transakci');
    }

    const tx = Transaction.from(Buffer.from(swapJson.swapTransaction, 'base64'));
    tx.feePayer = keypair.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.sign(keypair);

    const txid = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txid, 'confirmed');
    console.log(`💱 Swap USDC→SOL dokončen. TX=${txid}`);
    return true;
  } catch (err) {
    console.error(JSON.stringify({ status: 'error', message: 'Chyba swapu: ' + err.message }));
    return false;
  }
}

async function main() {
  // 1) Zpracov�n� argument�: [0] = c�lov� adresa, [1] = mno�stv� SOL
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Nedostate�n� po�et argument�. Pou�it�: node withdraw.js <solAddress> <solAmount>'
    }));
    process.exit(1);
  }

  const toAddress = args[0];
  const solAmount = parseFloat(args[1]);
  if (isNaN(solAmount) || solAmount <= 0) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Neplatn� hodnota solAmount'
    }));
    process.exit(1);
  }

  // 2) __dirname pro ES modul + cesta ke kl��i v /solana-monitor
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);
  // Te� se v�dy hled� ve stejn�m adres��i, kde je withdraw.js:
  const keypairPath = path.join(__dirname, 'central-keypair.json');

  let secretKeyArray;
  try {
    const raw = fs.readFileSync(keypairPath, 'utf-8');
    secretKeyArray = JSON.parse(raw);
    if (!Array.isArray(secretKeyArray) || secretKeyArray.length !== 64) {
      throw new Error('Soubor neobsahuje pole 64 ��sel');
    }
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Nelze na��st central-keypair.json: ' + err.message
    }));
    process.exit(1);
  }

  // 3) Vytvo��me Keypair z na�ten�ho pole
  let fromKeypair;
  try {
    const secretUint8 = new Uint8Array(secretKeyArray);
    fromKeypair = Keypair.fromSecretKey(secretUint8);
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Chyba p�i vytv��en� Keypair: ' + err.message
    }));
    process.exit(1);
  }

  // 4) P�ipoj�me se k Solana Testnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // 5) Ov��en� c�lov� adresy
  let toPubkey;
  try {
    toPubkey = new PublicKey(toAddress);
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Neplatn� Solana adresa: ' + err.message
    }));
    process.exit(1);
  }

  // 6) P�epo�et SOL na lamports
  const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
  if (lamports <= 0) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Po�et lamports vy�el na nulu'
    }));
    process.exit(1);
  }

  // 7) Zkontrolujeme zůstatek a případně provedeme swap USDC->SOL
  const requiredLamports = lamports + FEE_LAMPORTS;
  let currentBalance;
  try {
    currentBalance = await connection.getBalance(fromKeypair.publicKey, 'confirmed');
  } catch (err) {
    console.error(JSON.stringify({ status: 'error', message: 'Chyba getBalance: ' + err.message }));
    process.exit(1);
  }

  if (currentBalance < requiredLamports) {
    const need = requiredLamports - currentBalance;
    const ok = await swapUsdcToSol(need, connection, fromKeypair);
    if (!ok) {
      process.exit(1);
    }
  }

  // 8) Sestavíme a pošleme transakci
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPubkey,
        lamports: lamports
      })
    );

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [fromKeypair]
    );

    console.log(JSON.stringify({
      status: 'success',
      tx: txSig
    }));
    process.exit(0);
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'On-chain chyba: ' + err.message
    }));
    process.exit(1);
  }
}

main();
