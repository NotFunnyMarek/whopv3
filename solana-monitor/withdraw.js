
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

import {
  VersionedTransaction,
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} from '@solana/web3.js';

const SOL_MINT  = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const FEE_LAMPORTS = 5000; // estimated tx fee

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 && attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 10000);
        // console.warn(`Server responded with 429 Too Many Requests. Retrying after ${delay}ms delay...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 10000);
      // console.warn(`Fetch error: ${err.message}. Retrying after ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function swapUsdcToSol(lamportsNeeded, connection, keypair) {
  // console.log(`DEBUG: Swap požadováno SOL: ${(lamportsNeeded / LAMPORTS_PER_SOL).toFixed(6)} SOL (${lamportsNeeded} lamports)`);
  
  // Minimální částka v lamports (např. 0.001 SOL = 1_000_000 lamports)
  if (!lamportsNeeded || lamportsNeeded < 1_000_000) {
        // console.warn(`⚠️ Swap USDC→SOL přeskočen – částka příliš malá (${(lamportsNeeded / LAMPORTS_PER_SOL).toFixed(6)} SOL).`);
    return false;
  }

  async function getUsdcBalance(pubkey) {
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubkey,
        { mint: new PublicKey(USDC_MINT) }
      );
      if (tokenAccounts.value.length === 0) return 0;
      return parseFloat(tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount);
    } catch (err) {
  // console.error('❌ Nelze získat USDC balance:', err);
      return 0;
    }
  }

  try {
    const balanceBefore = await getUsdcBalance(keypair.publicKey);
     // console.log(`DEBUG: USDC balance před swapem: ${balanceBefore}`);

const quoteUrl =
  `https://quote-api.jup.ag/v6/quote?inputMint=${USDC_MINT}&outputMint=${SOL_MINT}` +
  `&amount=${lamportsNeeded}&slippageBps=300&swapMode=ExactOut`;


    const quoteRes = await fetchWithRetry(quoteUrl);
const quote = await quoteRes.json();

 // console.log('DEBUG: Jupiter quote response:', JSON.stringify(quote, null, 2));

if (!quote || !quote.routePlan || quote.routePlan.length === 0) {
  throw new Error('⚠️ Jupiter neposkytl route pro USDC→SOL');
}

if (!quote.routePlan || quote.routePlan.length === 0) {
  throw new Error('⚠️ Jupiter neposkytl žádné route v quote response');
}

const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteResponse: quote,
    userPublicKey: keypair.publicKey.toBase58(),
    wrapAndUnwrapSol: true,
    feeAccount: null,
    platformFeeAccount: null,
    dynamicSlippage: { maxBps: 300 },
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: {
      priorityLevelWithMaxLamports: {
        maxLamports: 10000000,
        priorityLevel: "veryHigh"
      }
    }
  })
});


const swapJson = await swapRes.json();
    // console.log('DEBUG swap response:', swapJson);

if (swapJson.error) {
     // console.error('❌ Jupiter swap API error:', swapJson.error);
}
if (!swapJson.swapTransaction) {
  throw new Error('Jupiter swap API nevrátil transakci');
}


const tx = VersionedTransaction.deserialize(Buffer.from(swapJson.swapTransaction, 'base64'));
tx.feePayer = keypair.publicKey;
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
tx.sign([keypair]); // POZOR: musí být pole s keypairem


    const txid = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txid, 'confirmed');

    const balanceAfter = await getUsdcBalance(keypair.publicKey);
    const diff = balanceBefore - balanceAfter;

    if (diff <= 0) {
      throw new Error(`USDC se neodečetly nebo swap selhal! TX=${txid}`);
    }

       // console.log(`💱 Swap USDC→SOL OK, utraceno ${diff.toFixed(6)} USDC. TX=${txid}`);
    return true;

  } catch (err) {
    // console.error(JSON.stringify({ status: 'error', message: 'Chyba swapu: ' + err.message }));
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Nedostatečný počet argumentů. Použití: node withdraw.js <solAddress> <solAmount>'
    }));
    process.exit(1);
  }

  const toAddress = args[0];
  const solAmount = parseFloat(args[1]);
  if (isNaN(solAmount) || solAmount <= 0) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Neplatná SOL částka'
    }));
    process.exit(1);
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);
  const keypairPath = path.join(__dirname, 'central-keypair.json');

  let secretKeyArray;
  try {
    const raw = fs.readFileSync(keypairPath, 'utf-8');
    secretKeyArray = JSON.parse(raw);
    if (!Array.isArray(secretKeyArray) || secretKeyArray.length !== 64) {
      throw new Error('Soubor neobsahuje pole 64 čísel');
    }
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Withdrawal failed, please try again. ' + err.message
    }));
    process.exit(1);
  }

  let fromKeypair;
  try {
    const secretUint8 = new Uint8Array(secretKeyArray);
    fromKeypair = Keypair.fromSecretKey(secretUint8);
  } catch (err) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Chyba při vytvoření Keypair: ' + err.message
    }));
    process.exit(1);
  }

  const connection = new Connection(
    'https://icy-lively-telescope.solana-mainnet.quiknode.pro/f3cec49667700280c1925092e91051a329e9635b/',
    'confirmed'
  );

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

  // Už máme SOL částku, žádný přepočet na SOL pomocí ceny
  const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
  const requiredLamports = lamports + FEE_LAMPORTS;

  // console.log(`DEBUG: SOL částka: ${solAmount}, lamports: ${lamports}, requiredLamports: ${requiredLamports}`);

  // Provede swap z USDC na SOL, parametr je výstup SOL v lamports
  const ok = await swapUsdcToSol(requiredLamports, connection, fromKeypair);
  if (!ok) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Withdrawal failed, please try again.'
    }));
    process.exit(1);
  }

  // Po swapu zkontrolujeme SOL balance
  let currentBalance;
  try {
    currentBalance = await connection.getBalance(fromKeypair.publicKey, 'confirmed');
  } catch (err) {
    console.error(JSON.stringify({ status: 'error', message: 'Chyba getBalance: ' + err.message }));
    process.exit(1);
  }

  if (currentBalance < requiredLamports) {
    console.error(JSON.stringify({
      status: 'error',
      message: 'Nedostatek SOL i po swapu'
    }));
    process.exit(1);
  }

  // Odešleme transakci na cílovou adresu
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

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
