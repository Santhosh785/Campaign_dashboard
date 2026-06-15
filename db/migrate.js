import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, 'migrations');

const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
console.log('Connected to Supabase database');

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

for (const file of files) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  console.log(`Running migration: ${file}`);
  await client.query(sql);
  console.log(`✓ Done: ${file}`);
}

await client.end();
console.log('All migrations completed.');
