import fs from 'fs';
import bs58 from 'bs58';

// Uprav cestu k tv�mu central-keypair.json, pokud le�� jinde:
const KEYPAIR_PATH = '/root/solana-keys/central-keypair.json';

const raw = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
const secretKeyBase58 = bs58.encode(Buffer.from(raw));
console.log(secretKeyBase58);
