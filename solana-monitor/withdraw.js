// File: /solana-monitor/withdraw.js
// Musí platit, že v /solana-monitor/package.json máte "type": "module".

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

async function main() {
  // 1) Zpracování argumentù: [0] = cílová adresa, [1] = množství SOL
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Nedostateèný poèet argumentù. Použití: node withdraw.js <solAddress> <solAmount>'
    }));
    process.exit(1);
  }

  const toAddress = args[0];
  const solAmount = parseFloat(args[1]);
  if (isNaN(solAmount) || solAmount <= 0) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Neplatná hodnota solAmount'
    }));
    process.exit(1);
  }

  // 2) __dirname pro ES modul + cesta ke klíèi v /solana-monitor
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);
  // Teï se vždy hledá ve stejném adresáøi, kde je withdraw.js:
  const keypairPath = path.join(__dirname, 'central-keypair.json');

  let secretKeyArray;
  try {
    const raw = fs.readFileSync(keypairPath, 'utf-8');
    secretKeyArray = JSON.parse(raw);
    if (!Array.isArray(secretKeyArray) || secretKeyArray.length !== 64) {
      throw new Error('Soubor neobsahuje pole 64 èísel');
    }
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Nelze naèíst central-keypair.json: ' + err.message
    }));
    process.exit(1);
  }

  // 3) Vytvoøíme Keypair z naèteného pole
  let fromKeypair;
  try {
    const secretUint8 = new Uint8Array(secretKeyArray);
    fromKeypair = Keypair.fromSecretKey(secretUint8);
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Chyba pøi vytváøení Keypair: ' + err.message
    }));
    process.exit(1);
  }

  // 4) Pøipojíme se k Solana Testnet
  const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

  // 5) Ovìøení cílové adresy
  let toPubkey;
  try {
    toPubkey = new PublicKey(toAddress);
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Neplatná Solana adresa: ' + err.message
    }));
    process.exit(1);
  }

  // 6) Pøepoèet SOL na lamports
  const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
  if (lamports <= 0) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Poèet lamports vyšel na nulu'
    }));
    process.exit(1);
  }

  // 7) Sestavíme a pošleme transakci
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
