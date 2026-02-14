import { execSync } from 'node:child_process';
import { parseWranglerConfig } from './utils/parse-wrangler.mjs';
import { createId } from '@paralleldrive/cuid2';

const questions = [
  {
    category: "liked",
    label: "Things You Liked",
    description: "Share 3 things this coach did well",
    placeholder: "Something you liked...",
    itemCount: 3,
    sortOrder: 0,
  },
  {
    category: "improvement",
    label: "Areas for Improvement",
    description: "Share 3 areas where this coach could improve",
    placeholder: "An area for improvement...",
    itemCount: 3,
    sortOrder: 1,
  },
];

function escSql(str) {
  return str.replace(/'/g, "''");
}

const isRemote = process.argv.includes('--remote');
const config = parseWranglerConfig();
const dbName = config.d1_databases?.[0]?.database_name;

if (!dbName) {
  console.error('Database name not found in wrangler.jsonc');
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);

const statements = questions.map((q) => {
  const id = `fq_${createId()}`;
  return `INSERT OR IGNORE INTO feedback_question (id, category, label, description, placeholder, itemCount, sortOrder, isActive, createdAt, updatedAt) VALUES ('${escSql(id)}', '${escSql(q.category)}', '${escSql(q.label)}', '${escSql(q.description)}', '${escSql(q.placeholder)}', ${q.itemCount}, ${q.sortOrder}, 1, ${now}, ${now});`;
});

const sql = statements.join('\n');
const flag = isRemote ? '--remote' : '--local';

console.log(`Seeding ${questions.length} feedback questions (${isRemote ? 'PRODUCTION' : 'local'})...\n`);

try {
  execSync(`wrangler d1 execute ${dbName} ${flag} --command "${sql.replace(/"/g, '\\"')}"`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log(`\nSeeded ${questions.length} feedback questions successfully.`);
} catch (error) {
  console.error('Failed to seed feedback questions:', error.message);
  process.exit(1);
}
