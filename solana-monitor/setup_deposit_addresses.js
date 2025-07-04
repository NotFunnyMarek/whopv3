/**
 * setup_deposit_addresses.js
 *
 * Tento skript vygeneruje Solana Keypair pro konkrétního uživatele (user_id),
 * uloží do databáze jeho `deposit_address` a `deposit_secret` (Base58).
 *
 * Spouští se pøes pøíkazovou øádku:
 *   node setup_deposit_addresses.js <user_id>
 *
 * Vyžaduje:
 *   npm install mysql2 @solana/web3.js bs58
 */

import mysql from 'mysql2/promise';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// === 1) Parametry ===
if (process.argv.length < 3) {
  console.error('? Chyba: Nebyl pøedán user_id. Použití: node setup_deposit_addresses.js <user_id>');
  process.exit(1);
}
const userId = parseInt(process.argv[2], 10);
if (isNaN(userId)) {
  console.error('? Chyba: user_id musí být èíslo.');
  process.exit(1);
}

// === 2) Konfigurace DB ===
const dbConfig = {
  host: 'localhost',
  user: 'dbadmin',
  password: '3otwj3zR6EI',
  database: 'byx',
  port: 3306,
  charset: 'utf8mb4',
};

async function main() {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
  } catch (e) {
    console.error('? Nelze se pøipojit k DB:', e.message);
    process.exit(1);
  }

  try {
    // Ovìøíme, že uživatel existuje
    const [userRows] = await conn.execute(
      'SELECT id FROM users4 WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) {
      console.error(`? Uživatel s ID=${userId} neexistuje.`);
      process.exit(1);
    }

    // === 3) Generování Solana Keypair ===
    const newKeypair = Keypair.generate();
    const publicKey = newKeypair.publicKey.toBase58();
    const secretBase58 = bs58.encode(newKeypair.secretKey);

    // === 4) Uložení do DB ===
    await conn.execute(
      `UPDATE users4 
         SET deposit_address = ?, deposit_secret = ?
       WHERE id = ?`,
      [publicKey, secretBase58, userId]
    );

    console.log(`? Nastaven deposit_address a deposit_secret pro user_id=${userId}`);
    console.log(`   deposit_address: ${publicKey}`);
    console.log(`   deposit_secret: <skrytì, privátní klíè>`);
  } catch (e) {
    console.error('? Chyba pøi ukládání do DB:', e.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
