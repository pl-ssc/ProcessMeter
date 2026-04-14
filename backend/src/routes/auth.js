import bcrypt from 'bcryptjs';
import pool, { query } from '../db/index.js';
import { createToken, validateToken, markTokenUsed, deleteToken } from '../services/tokenService.js';
import { sendPasswordLinkEmail } from '../services/emailService.js';
import { env } from '../config/env.js';
import { buildSessionUser, normalizeRoles, pickActiveRole } from '../services/userRoles.js';

const DEMO_USERS = {
    admin: {
        username: 'demo-admin@processmeter.local',
        full_name: 'Демо Администратор',
        role: 'admin',
    },
    auditor: {
        username: 'demo-analyst@processmeter.local',
        full_name: 'Демо Аналитик',
        role: 'auditor',
    },
    respondent: {
        username: 'demo-respondent@processmeter.local',
        full_name: 'Демо Респондент',
        role: 'respondent',
    },
};

async function ensureDemoUser(role) {
    const template = DEMO_USERS[role];
    if (!template) {
        throw new Error('invalid demo role');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let user;
        const { rows: existingRows } = await client.query(
            'SELECT id, username, full_name, role FROM users WHERE username = $1 AND is_active = true LIMIT 1',
            [template.username]
        );

        if (existingRows[0]) {
            user = existingRows[0];
        } else {
            const passwordHash = await bcrypt.hash(`demo-${role}-login`, 10);
            const { rows } = await client.query(
                `INSERT INTO users (username, password_hash, full_name, role, roles, active_role, is_active, password_changed_at)
                 VALUES ($1, $2, $3, $4, $5, $6, true, now())
                 RETURNING id, username, full_name, role, roles, active_role`,
                [template.username, passwordHash, template.full_name, template.role, [template.role], template.role]
            );
            user = rows[0];
        }

        if (role === 'respondent') {
            const { rows: processRows } = await client.query(
                `SELECT id
                 FROM process_1
                 WHERE is_active IS DISTINCT FROM false
                 ORDER BY COALESCE(sort, 0), f1_name`
            );

            if (processRows.length > 0) {
                await client.query(
                    `INSERT INTO user_process_1_access (user_id, process_1_id)
                     SELECT $1, p.id
                     FROM unnest($2::int[]) AS p(id)
                     ON CONFLICT DO NOTHING`,
                    [user.id, processRows.map((processRow) => processRow.id)]
                );
                await client.query('SELECT copy_operations_to_user_answers($1)', [user.id]);
            }
        }

        await client.query('COMMIT');
        return user;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function loadSessionPayload(userId) {
    const session = await pool.query(
        `SELECT id, username, full_name, role, roles, active_role
         FROM users
         WHERE id = $1`,
        [userId]
    );
    const userRow = session.rows[0];
    if (!userRow) return null;

    const { rows: accessRows } = await pool.query(
        'SELECT process_1_id FROM user_process_1_access WHERE user_id = $1 ORDER BY process_1_id',
        [userId]
    );

    return buildSessionUser(userRow, accessRows.map((row) => row.process_1_id));
}

export default async function authRoutes(fastify, options) {
    // ── Login ────────────────────────────────────────────────────────────────
    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' }
                },
                required: ['username', 'password']
            }
        }
    }, async (request, reply) => {
        const { username, password } = request.body;

        const { rows } = await query(
            'SELECT id, username, password_hash, full_name, is_active, role, roles, active_role FROM users WHERE username = $1',
            [username]
        );
        const user = rows[0];
        if (!user || !user.is_active) {
            return reply.code(401).send({ error: 'invalid credentials' });
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return reply.code(401).send({ error: 'invalid credentials' });
        }

        const sessionUser = await loadSessionPayload(user.id);
        if (!sessionUser) {
            return reply.code(401).send({ error: 'invalid credentials' });
        }
        const token = fastify.jwt.sign({
            sub: user.id, username: user.username,
            full_name: user.full_name, role: sessionUser.role, active_role: sessionUser.active_role, roles: sessionUser.roles
        });
        reply.setCookie('pm_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });
        return { user: sessionUser };
    });

    fastify.post('/demo-login', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    role: { type: 'string', enum: ['admin', 'auditor', 'respondent'] }
                },
                required: ['role']
            }
        }
    }, async (request, reply) => {
        if (!env.DEMO_MODE) {
            return reply.code(403).send({ error: 'demo mode is disabled' });
        }

        const user = await ensureDemoUser(request.body.role);
        const token = fastify.jwt.sign({
            sub: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.active_role || user.role,
            active_role: user.active_role || user.role,
            roles: user.roles || [user.role]
        });

        reply.setCookie('pm_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        return {
            user: await loadSessionPayload(user.id)
        };
    });

    // ── Logout ───────────────────────────────────────────────────────────────
    fastify.post('/logout', async (request, reply) => {
        reply.clearCookie('pm_token', { path: '/' });
        return { ok: true };
    });

    // ── Me ───────────────────────────────────────────────────────────────────
    fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
        return { user: request.user };
    });

    fastify.post('/switch-role', {
        preHandler: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                properties: {
                    role: { type: 'string', enum: ['admin', 'auditor', 'respondent'] }
                },
                required: ['role']
            }
        }
    }, async (request, reply) => {
        const nextRole = request.body.role;
        const currentRoles = normalizeRoles(request.user?.roles, request.user?.role);
        if (!currentRoles.includes(nextRole)) {
            return reply.code(403).send({ error: 'forbidden' });
        }

        await query(
            'UPDATE users SET active_role = $1 WHERE id = $2',
            [nextRole, request.user.sub]
        );

        const sessionUser = await loadSessionPayload(request.user.sub);
        if (!sessionUser) {
            return reply.code(401).send({ error: 'unauthorized' });
        }
        const token = fastify.jwt.sign({
            sub: sessionUser.id,
            username: sessionUser.username,
            full_name: sessionUser.full_name,
            role: sessionUser.role,
            active_role: sessionUser.active_role,
            roles: sessionUser.roles,
        });

        reply.setCookie('pm_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        return { user: sessionUser };
    });

    // ── Forgot password (public, rate-limited) ───────────────────────────────
    fastify.post('/forgot-password', {
        config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
        schema: {
            body: { type: 'object', properties: { username: { type: 'string' } }, required: ['username'] }
        }
    }, async (request, reply) => {
        const { username } = request.body;
        // Always return 200 to avoid user enumeration
        const { rows } = await query(
            'SELECT id, username, full_name FROM users WHERE username = $1 AND is_active = true',
            [username]
        );
        const user = rows[0];
        if (user) {
            let token;
            try {
                token = await createToken(user.id, 'reset');
                await sendPasswordLinkEmail({ type: 'reset', to: user.username, fullName: user.full_name, token });
            } catch (err) {
                request.log.error(err, 'forgot-password: send failed');
                // Roll back the token so it doesn't linger unused
                if (token) {
                    await deleteToken(token).catch(e => request.log.error(e, 'deleteToken failed'));
                }
            }
        }
        return { ok: true };
    });

    // ── Validate token (public, rate-limited) ────────────────────────────────
    fastify.get('/token-info', {
        config: { rateLimit: { max: 20, timeWindow: '5 minutes' } },
        schema: { querystring: { type: 'object', properties: { token: { type: 'string' } }, required: ['token'] } }
    }, async (request, reply) => {
        try {
            const info = await validateToken(request.query.token);
            return { valid: true, type: info.type, full_name: info.user.full_name };
        } catch (err) {
            return { valid: false, error: err.message };
        }
    });

    // ── Set password via token (public) ──────────────────────────────────────
    fastify.post('/set-password', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    password: { type: 'string', minLength: 6 }
                },
                required: ['token', 'password']
            }
        }
    }, async (request, reply) => {
        const { token, password } = request.body;

        // Reject passwords that are only whitespace
        if (!password.trim()) {
            return reply.code(400).send({ error: 'Пароль не может состоять только из пробелов.' });
        }

        let info;
        try {
            info = await validateToken(token);
        } catch (err) {
            return reply.code(400).send({ error: err.message });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await query(
            'UPDATE users SET password_hash = $1, password_changed_at = now() WHERE id = $2',
            [passwordHash, info.userId]
        );
        await markTokenUsed(info.tokenId);
        reply.clearCookie('pm_token', { path: '/' });

        return { ok: true };
    });
}
