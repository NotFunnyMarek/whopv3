import mysql from 'mysql2/promise';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const dbConfig = {
  host: '127.0.0.1',
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

  let rows;
  try {
    const [res] = await conn.execute(
      "SELECT id FROM users4 WHERE deposit_address IS NULL OR deposit_address = ''"
    );
    rows = res;
  } catch (err) {
    console.error('❌ SELECT uživatelů:', err);
    await conn.end();
    process.exit(1);
  }

  console.log(`Nalezeno ${rows.length} uživatelů bez deposit_address.`);

  for (const row of rows) {
    const userId = row.id;

    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKeyBase58 = bs58.encode(Buffer.from(keypair.secretKey));

    try {
      await conn.execute(
        "UPDATE users4 SET deposit_address = ?, deposit_secret = ? WHERE id = ?",
        [publicKey, secretKeyBase58, userId]
      );
      console.log(`→ Uživatel ${userId} : deposit_address=${publicKey}`);
    } catch (err) {
      console.error(`❌ UPDATE user=${userId}:`, err);
    }
  }

  await conn.end();
  console.log('✅ Hotovo.');
}

main().catch((err) => {
  console.error('❌ Neočekávaná chyba:', err);
});
