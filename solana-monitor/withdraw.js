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

  // 7) Sestav�me a po�leme transakci
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
