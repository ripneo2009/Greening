import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const directory = fileURLToPath(new URL('../../migrations', import.meta.url));
await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
for (const name of (await readdir(directory)).filter((f) => f.endsWith('.sql')).sort()) {
  const exists = await pool.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name]);
  if (exists.rowCount) continue;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(await readFile(join(directory, name), 'utf8'));
    await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
    await client.query('COMMIT');
    console.log(`applied ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
await pool.end();
