/**
 * setup_deposit_addresses.js
 *
 * Tento skript vygeneruje Solana Keypair pro konkr�tn�ho u�ivatele (user_id),
 * ulo�� do datab�ze jeho `deposit_address` a `deposit_secret` (Base58).
 *
 * Spou�t� se p�es p��kazovou ��dku:
 *   node setup_deposit_addresses.js <user_id>
 *
 * Vy�aduje:
 *   npm install mysql2 @solana/web3.js bs58
 */

import mysql from 'mysql2/promise';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// === 1) Parametry ===
if (process.argv.length < 3) {
  console.error('? Chyba: Nebyl p�ed�n user_id. Pou�it�: node setup_deposit_addresses.js <user_id>');
  process.exit(1);
}
const userId = parseInt(process.argv[2], 10);
if (isNaN(userId)) {
  console.error('? Chyba: user_id mus� b�t ��slo.');
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
    console.error('? Nelze se p�ipojit k DB:', e.message);
    process.exit(1);
  }

  try {
    // Ov���me, �e u�ivatel existuje
    const [userRows] = await conn.execute(
      'SELECT id FROM users4 WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) {
      console.error(`? U�ivatel s ID=${userId} neexistuje.`);
      process.exit(1);
    }

    // === 3) Generov�n� Solana Keypair ===
    const newKeypair = Keypair.generate();
    const publicKey = newKeypair.publicKey.toBase58();
    const secretBase58 = bs58.encode(newKeypair.secretKey);

    // === 4) Ulo�en� do DB ===
    await conn.execute(
      `UPDATE users4 
         SET deposit_address = ?, deposit_secret = ?
       WHERE id = ?`,
      [publicKey, secretBase58, userId]
    );

    console.log(`? Nastaven deposit_address a deposit_secret pro user_id=${userId}`);
    console.log(`   deposit_address: ${publicKey}`);
    console.log(`   deposit_secret: <skryt�, priv�tn� kl��>`);
  } catch (e) {
    console.error('? Chyba p�i ukl�d�n� do DB:', e.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
