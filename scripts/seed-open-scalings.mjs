import { execSync } from 'node:child_process';
import { parseWranglerConfig } from './utils/parse-wrangler.mjs';

// Mirrors DEFAULT_OPEN_SCALINGS in src/lib/open/defaults.ts (plain .mjs can't import TS).
const scalings = [
  { name: 'Rx', slug: 'rx', rank: 0 },
  { name: 'Scaled', slug: 'scaled', rank: 1 },
  { name: 'Foundations', slug: 'foundations', rank: 2 },
];

function escSql(str) {
  return str.replace(/'/g, "''");
}

const isRemote = process.argv.includes('--remote');
const config = parseWranglerConfig();
const dbName = config.d1_databases?.find(db => db.binding === 'DB')?.database_name;

if (!dbName) {
  console.error('Database name not found in wrangler.jsonc');
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);

const defaultRows = scalings
  .map((scaling) => `('${escSql(scaling.name)}', '${escSql(scaling.slug)}', ${scaling.rank})`)
  .join(', ');

// Single statement so the NOT EXISTS check sees the pre-insert state: only events with
// zero scalings get the defaults, events with any (custom or copied) are left alone. Safe to re-run.
const sql = `INSERT INTO open_scaling (id, eventId, name, slug, rank, createdAt, updatedAt) WITH defaults(name, slug, rank) AS (VALUES ${defaultRows}) SELECT 'osl_' || lower(hex(randomblob(12))), e.id, d.name, d.slug, d.rank, ${now}, ${now} FROM open_event e CROSS JOIN defaults d WHERE NOT EXISTS (SELECT 1 FROM open_scaling s WHERE s.eventId = e.id);`;

const flag = isRemote ? '--remote' : '--local';

console.log(`Seeding default Open scalings for events without any (${isRemote ? 'PRODUCTION' : 'local'})...\n`);

try {
  execSync(`wrangler d1 execute ${dbName} ${flag} --command "${sql.replace(/"/g, '\\"')}"`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('\nSeeded default Open scalings successfully.');
} catch (error) {
  console.error('Failed to seed Open scalings:', error.message);
  process.exit(1);
}
