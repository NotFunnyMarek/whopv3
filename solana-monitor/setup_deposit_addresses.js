/**
 * setup_deposit_addresses.js
 *
 * Tento skript jednorázově projde všechny záznamy v tabulce users4,
 * kterým chybí `deposit_address`, vygeneruje pro ně nový Solana Keypair
 * a uloží do databáze jejich veřejný i privátní klíč (Base58).
 *
 * Použití:
 *   cd solana-monitor
 *   node setup_deposit_addresses.js
 */

import mysql from 'mysql2/promise';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// --- 1) Konfigurace připojení k DB ---
const dbConfig = {
  host: '127.0.0.1',     // nikoli "localhost", ale 127.0.0.1
  user: 'dbadmin',
  password: '3otwj3zR6EI',
  database: 'byx',
  charset: 'utf8mb4',
};

async function main() {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
  } catch (err) {
    console.error('❌ Nelze se připojit k databázi:', err);
    process.exit(1);
  }

  // 2) Vybereme všechny uživatele bez deposit_address
  let rows;
  try {
    const [res] = await conn.execute(
      "SELECT id FROM users4 WHERE deposit_address IS NULL OR deposit_address = ''"
    );
    rows = res;
  } catch (err) {
    console.error('❌ Chyba při SELECT uživatelů:', err);
    await conn.end();
    process.exit(1);
  }

  console.log(`Nalezeno ${rows.length} uživatelů bez deposit_address.`);

  for (const row of rows) {
    const userId = row.id;

    // 3) Vygenerujeme nový Solana Keypair
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    // Privátní klíč zakódujeme do Base58
    const secretKeyBase58 = bs58.encode(Buffer.from(keypair.secretKey));

    // 4) Uložíme do DB
    try {
      await conn.execute(
        "UPDATE users4 SET deposit_address = ?, deposit_secret = ? WHERE id = ?",
        [publicKey, secretKeyBase58, userId]
      );
      console.log(`→ Uživatel ${userId} : deposit_address=${publicKey}`);
    } catch (err) {
      console.error(`❌ Chyba při UPDATE uživatele ${userId}:`, err);
      // Pokračujeme na dalšího uživatele
    }
  }

  await conn.end();
  console.log('✅ Hotovo: deposit_address a deposit_secret nastaveny.');
}

main().catch((err) => {
  console.error('❌ Neočekávaná chyba v setup_deposit_addresses.js:', err);
});
