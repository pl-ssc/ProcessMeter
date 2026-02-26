import bcrypt from 'bcryptjs';
import pool, { query } from '../../db/index.js';
import { createToken, deleteToken } from '../../services/tokenService.js';
import { sendPasswordLinkEmail, isValidEmail } from '../../services/emailService.js';
import { createUser } from '../../services/userService.js';

export default async function adminUsersRoutes(fastify, options) {
    fastify.get('/', { preHandler: [fastify.authenticate, fastify.requireAdminRole] }, async (request) => {
        const { search, role, status, include_admins } = request.query || {};

        const conditions = [];
        const params = [];
        let idx = 1;

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(username ILIKE $${idx} OR full_name ILIKE $${idx})`);
            idx += 1;
        }

        if (role && (role === 'admin' || role === 'respondent')) {
            params.push(role);
            conditions.push(`role = $${idx}`);
            idx += 1;
        }

        if (include_admins !== 'true') {
            conditions.push(`role <> 'admin'`);
        }

        if (status === 'active') {
            conditions.push('is_active = true');
        } else if (status === 'inactive') {
            conditions.push('is_active = false');
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const { rows } = await query(
            `SELECT u.id, u.username, u.full_name, u.role, u.is_active, u.created_at, u.is_survey_completed,
              u.department_id, d.name AS department_name,
              u.profession_id, p.name AS profession_name,
              COALESCE(count(a.process_1_id), 0) AS access_count
       FROM users u
       LEFT JOIN user_process_1_access a ON a.user_id = u.id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN professions p ON p.id = u.profession_id
       ${where}
       GROUP BY u.id, d.name, p.name
       ORDER BY u.created_at DESC, u.id DESC`,
            params
        );

        return { users: rows };
    });

    fastify.post('/', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                    full_name: { type: 'string', nullable: true },
                    role: { type: 'string', enum: ['admin', 'respondent'] },
                    department_id: { type: ['integer', 'null'] },
                    profession_id: { type: ['integer', 'null'] },
                    process_1_access: { type: 'array', items: { type: 'string' }, minItems: 1 }
                },
                required: ['username', 'password', 'process_1_access']
            }
        }
    }, async (request, reply) => {
        const { username, password, full_name, role, department_id, profession_id, process_1_access } = request.body;
        try {
            const user = await createUser({ username, password, full_name, role, department_id, profession_id, process_1_access });
            return { user };
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({ error: 'create user failed' });
        }
    });

    fastify.post('/:id/reset-password', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
            body: { type: 'object', properties: { password: { type: 'string' } }, required: ['password'] }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { password } = request.body;

        const passwordHash = await bcrypt.hash(password, 10);
        const { rowCount } = await query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [passwordHash, id]
        );

        if (rowCount === 0) {
            return reply.code(404).send({ error: 'user not found' });
        }

        return { ok: true };
    });

    fastify.post('/:id/status', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
            body: { type: 'object', properties: { is_active: { type: 'boolean' } }, required: ['is_active'] }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { is_active } = request.body;

        const { rowCount } = await query(
            'UPDATE users SET is_active = $1 WHERE id = $2',
            [is_active, id]
        );

        if (rowCount === 0) {
            return reply.code(404).send({ error: 'user not found' });
        }

        return { ok: true };
    });

    fastify.get('/:id/access', { preHandler: [fastify.authenticate, fastify.requireAdminRole] }, async (request) => {
        const { id } = request.params;
        const { rows } = await query(
            'SELECT process_1_id FROM user_process_1_access WHERE user_id = $1 ORDER BY process_1_id',
            [id]
        );
        return { process_1_access: rows.map((r) => r.process_1_id) };
    });

    fastify.post('/:id/access', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
            body: { type: 'object', properties: { process_1_access: { type: 'array', items: { type: 'string' } } }, required: ['process_1_access'] }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { process_1_access } = request.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM user_process_1_access WHERE user_id = $1', [id]);
            if (process_1_access.length > 0) {
                const uIds = process_1_access.map(() => id);
                await client.query(
                    `INSERT INTO user_process_1_access (user_id, process_1_id) 
                     SELECT unnest($1::int[]), unnest($2::int[])`,
                    [uIds, process_1_access]
                );
            }
            await client.query('DELETE FROM user_answers WHERE user_id = $1', [id]);
            await client.query('SELECT copy_operations_to_user_answers($1)', [id]);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            request.log.error(err);
            return reply.code(500).send({ error: 'update access failed' });
        } finally {
            client.release();
        }

        return { ok: true };
    });

    fastify.post('/access-bulk', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    user_ids: { type: 'array', items: { type: 'integer' }, minItems: 1 },
                    process_1_access: { type: 'array', items: { type: 'string' } },
                    mode: { type: 'string', enum: ['append', 'replace'] }
                },
                required: ['user_ids', 'process_1_access']
            }
        }
    }, async (request, reply) => {
        const { user_ids, process_1_access, mode } = request.body;
        const safeMode = mode === 'append' ? 'append' : 'replace';

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            if (safeMode === 'replace') {
                await client.query('DELETE FROM user_process_1_access WHERE user_id = ANY($1::int[])', [user_ids]);
            }

            if (process_1_access.length > 0 && user_ids.length > 0) {
                const uIds = [];
                const f1Ids = [];
                for (const userId of user_ids) {
                    for (const f1Index of process_1_access) {
                        uIds.push(userId);
                        f1Ids.push(f1Index);
                    }
                }

                await client.query(
                    `INSERT INTO user_process_1_access (user_id, process_1_id)
                     SELECT unnest($1::int[]), unnest($2::int[])
                     ON CONFLICT DO NOTHING`,
                    [uIds, f1Ids]
                );
            }

            await client.query('DELETE FROM user_answers WHERE user_id = ANY($1::int[])', [user_ids]);

            for (const userId of user_ids) {
                await client.query('SELECT copy_operations_to_user_answers($1)', [userId]);
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            request.log.error(err);
            return reply.code(500).send({ error: 'bulk update failed' });
        } finally {
            client.release();
        }

        return { ok: true };
    });

    // ── Bulk import users ────────────────────────────────────────────────────
    fastify.post('/bulk-import', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    users: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                username: { type: 'string' },
                                full_name: { type: ['string', 'null'] },
                                role: { type: 'string', enum: ['admin', 'respondent'] },
                                department_name: { type: ['string', 'null'] },
                                profession_name: { type: ['string', 'null'] }
                            },
                            required: ['username']
                        },
                        minItems: 1
                    }
                },
                required: ['users']
            }
        }
    }, async (request, reply) => {
        const { users } = request.body;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            let importedCount = 0;
            let skippedCount = 0;

            for (const u of users) {
                // Check if user exists
                const { rows: existing } = await client.query('SELECT id FROM users WHERE username = $1', [u.username]);
                if (existing.length > 0) {
                    skippedCount++;
                    continue; // Skip existing users for now
                }

                // Resolve dictionaries
                let depId = null;
                if (u.department_name) {
                    const depRes = await client.query('SELECT id FROM departments WHERE name = $1', [u.department_name.trim()]);
                    if (depRes.rows.length > 0) {
                        depId = depRes.rows[0].id;
                    } else {
                        const newDep = await client.query('INSERT INTO departments (name) VALUES ($1) RETURNING id', [u.department_name.trim()]);
                        depId = newDep.rows[0].id;
                    }
                }

                let profId = null;
                if (u.profession_name) {
                    const profRes = await client.query('SELECT id FROM professions WHERE name = $1', [u.profession_name.trim()]);
                    if (profRes.rows.length > 0) {
                        profId = profRes.rows[0].id;
                    } else {
                        const newProf = await client.query('INSERT INTO professions (name) VALUES ($1) RETURNING id', [u.profession_name.trim()]);
                        profId = newProf.rows[0].id;
                    }
                }

                const safeRole = u.role === 'admin' ? 'admin' : 'respondent';
                const tempPassword = Math.random().toString(36).slice(-10) + 'X9!';
                const passwordHash = await bcrypt.hash(tempPassword, 10);

                await client.query(
                    `INSERT INTO users (username, password_hash, full_name, role, department_id, profession_id)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [u.username.trim(), passwordHash, u.full_name || null, safeRole, depId, profId]
                );

                importedCount++;
            }

            await client.query('COMMIT');
            return { imported: importedCount, skipped: skippedCount };

        } catch (err) {
            await client.query('ROLLBACK');
            request.log.error(err);
            return reply.code(500).send({ error: 'Bulk import failed: ' + err.message });
        } finally {
            client.release();
        }
    });

    // ── Send invitation or password-reset email ──────────────────────────────
    // Unified handler: POST /:id/send-invite  and  POST /:id/send-reset
    async function sendEmailHandler(type, request, reply) {
        const { id } = request.params;
        const { rows } = await query(
            'SELECT id, username, full_name FROM users WHERE id = $1 AND is_active = true',
            [id]
        );
        if (!rows[0]) return reply.code(404).send({ error: 'user not found' });

        const { username, full_name } = rows[0];

        if (!isValidEmail(username)) {
            return reply.code(422).send({ error: `Email пользователя невалиден: ${username}` });
        }

        const token = await createToken(id, type);
        try {
            await sendPasswordLinkEmail({ type, to: username, fullName: full_name, token });
        } catch (err) {
            request.log.error(err, `sendPasswordLinkEmail (${type}) failed`);
            // Roll back the token so it doesn't linger unused
            await deleteToken(token).catch(e => request.log.error(e, 'deleteToken failed'));
            return reply.code(500).send({ error: 'Не удалось отправить письмо. Проверьте SMTP-настройки.' });
        }
        return { ok: true };
    }

    fastify.post('/:id/send-invite', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: { params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] } }
    }, (request, reply) => sendEmailHandler('invite', request, reply));

    fastify.post('/:id/send-reset', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: { params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] } }
    }, (request, reply) => sendEmailHandler('reset', request, reply));
}
