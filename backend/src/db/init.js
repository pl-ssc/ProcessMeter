import bcrypt from 'bcryptjs';
import pool from './index.js';
import { env } from '../config/env.js';

export const ensureAdminUser = async (app) => {
    if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
        if (app) app.log.warn('ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping admin creation');
        return;
    }

    try {
        const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [env.ADMIN_USERNAME]);
        if (rows.length > 0) {
            if (app) app.log.info({ username: env.ADMIN_USERNAME }, 'Admin user already exists');
            return;
        }

        const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
        await pool.query(
            'INSERT INTO users (username, password_hash, full_name, role, roles, active_role, password_changed_at) VALUES ($1, $2, $3, $4, $5, $6, now())',
            [env.ADMIN_USERNAME, passwordHash, env.ADMIN_FULL_NAME || null, 'admin', ['admin'], 'admin']
        );
        if (app) app.log.info({ username: env.ADMIN_USERNAME }, 'Admin user created successfully');
    } catch (err) {
        if (app) app.log.error(err, 'Failed to create admin user');
    }
};
