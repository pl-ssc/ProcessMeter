#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import pg from '../backend/node_modules/pg/lib/index.js';

const outputPath = process.argv[2] || 'tmp/process_names_before.tsv';
const connectionString = process.env.SOURCE_DATABASE_URL;

if (!connectionString) {
  console.error('SOURCE_DATABASE_URL is required');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const queries = [
  {
    level: 'process_1',
    sql: 'SELECT id, NULL::int AS parent_id, f1_name AS name FROM process_1 ORDER BY id',
  },
  {
    level: 'process_2',
    sql: 'SELECT id, process_1_id AS parent_id, f2_name AS name FROM process_2 ORDER BY id',
  },
  {
    level: 'process_3',
    sql: 'SELECT id, process_2_id AS parent_id, f3_name AS name FROM process_3 ORDER BY id',
  },
  {
    level: 'process_4',
    sql: 'SELECT id, process_3_id AS parent_id, f4_name AS name FROM process_4 ORDER BY id',
  },
];

function escapeTsv(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

async function main() {
  const rows = ['level\tid\tparent_id\tname'];
  for (const query of queries) {
    const result = await pool.query(query.sql);
    for (const row of result.rows) {
      rows.push(
        [query.level, row.id, row.parent_id ?? '', escapeTsv(row.name)].join('\t')
      );
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, rows.join('\n') + '\n', 'utf-8');
  console.log(outputPath);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
