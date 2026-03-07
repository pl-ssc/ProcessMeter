import { runner } from 'node-pg-migrate';
import { env } from '../src/config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertSafeTestDatabase } from './guard-test-db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
    assertSafeTestDatabase();
    console.log('Running test database migrations...');
    await runner({
        databaseUrl: env.TARGET_DATABASE_URL,
        dir: path.join(__dirname, '../migrations'),
        direction: 'up',
        migrationsTable: 'pgmigrations',
        log: (msg) => console.log(msg)
    });
    console.log('Migrations complete.');
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
