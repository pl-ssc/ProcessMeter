import pg from 'pg';
import { env } from '../config/env.js';

const TARGET_DATABASE_URL = env.TARGET_DATABASE_URL;

if (!TARGET_DATABASE_URL) {
    console.error('TARGET_DATABASE_URL is required');
    process.exit(1);
}

const pool = new pg.Pool({ connectionString: TARGET_DATABASE_URL });

console.log(`Connecting to database at ${TARGET_DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);

export const query = (text, params) => pool.query(text, params);
export default pool;
