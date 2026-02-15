import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.TARGET_DATABASE_URL });

async function debugStats() {
    const client = await pool.connect();
    try {
        console.log('--- Debugging User Stats ---');

        // 1. Get all users
        const { rows: users } = await client.query('SELECT id, username FROM users');
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            console.log(`\nUser: ${user.username} (ID: ${user.id})`);

            // 2. Get raw answers
            const { rows: answers } = await client.query(
                'SELECT id, operation_id, labor_hours, is_done FROM user_answers WHERE user_id = $1',
                [user.id]
            );
            console.log(`- Total answers rows: ${answers.length}`);
            const filled = answers.filter(a => a.labor_hours !== null);
            console.log(`- Filled rows (labor_hours != null): ${filled.length}`);
            if (filled.length > 0) {
                console.log('  Sample filled:', filled.slice(0, 3));
            }

            // 3. Run the stats query exactly as in server.js
            const { rows: stats } = await client.query(
                `SELECT 
                   COALESCE(SUM(labor_hours), 0) as total_hours,
                   BOOL_OR(is_done) as is_submitted
                 FROM user_answers 
                 WHERE user_id = $1`,
                [user.id]
            );
            console.log('- Query Result:', stats[0]);

            const totalHours = parseFloat(stats[0].total_hours || 0);
            const fte = parseFloat((totalHours / 160).toFixed(2));
            console.log(`- Calculated: Total=${totalHours}, FTE=${fte}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

debugStats();
