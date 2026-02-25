import bcrypt from 'bcryptjs';
import pool from '../db/index.js';

export async function createUser({ username, password, full_name, role, process_1_access }) {
    const safeRole = role === 'admin' ? 'admin' : 'respondent';
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const passwordHash = await bcrypt.hash(password, 10);
        const { rows } = await client.query(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
            [username, passwordHash, full_name || null, safeRole]
        );
        const user = rows[0];

        if (process_1_access && process_1_access.length > 0) {
            const uIds = process_1_access.map(() => user.id);
            await client.query(
                `INSERT INTO user_process_1_access (user_id, process_1_id) 
                 SELECT unnest($1::int[]), unnest($2::int[])`,
                [uIds, process_1_access]
            );
        }

        if (safeRole === 'respondent') {
            await client.query('SELECT copy_operations_to_user_answers($1)', [user.id]);
        }

        await client.query('COMMIT');
        return user;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
