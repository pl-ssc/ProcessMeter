import bcrypt from 'bcryptjs';
import pool from '../db/index.js';
import { normalizeRoles, pickActiveRole } from './userRoles.js';

export async function createUser({ username, password, full_name, role, roles, active_role, department_id, profession_id, process_1_access }) {
    const safeRoles = normalizeRoles(roles, role || 'respondent');
    const safeActiveRole = pickActiveRole({
        roles: safeRoles,
        preferredRole: active_role || role,
        fallbackRole: 'respondent',
    });
    const safeDepartmentId = safeRoles.includes('admin') ? null : (department_id || null);
    const safeProfessionId = safeRoles.includes('admin') ? null : (profession_id || null);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const passwordHash = await bcrypt.hash(password, 10);
        const { rows } = await client.query(
            `INSERT INTO users (username, password_hash, full_name, role, roles, active_role, department_id, profession_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING id, username, full_name, role, roles, active_role, department_id, profession_id`,
            [username, passwordHash, full_name || null, safeActiveRole, safeRoles, safeActiveRole, safeDepartmentId, safeProfessionId]
        );
        const user = rows[0];

        if (!safeRoles.includes('admin') && process_1_access && process_1_access.length > 0) {
            const uIds = process_1_access.map(() => user.id);
            await client.query(
                `INSERT INTO user_process_1_access (user_id, process_1_id) 
                 SELECT unnest($1::int[]), unnest($2::int[])`,
                [uIds, process_1_access]
            );
        }

        if (safeRoles.includes('respondent')) {
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
