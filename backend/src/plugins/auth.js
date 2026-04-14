import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '../config/env.js';
import { query } from '../db/index.js';
import { buildSessionUser } from '../services/userRoles.js';

export default fp(async (fastify, opts) => {
    await fastify.register(jwt, {
        secret: env.JWT_SECRET,
        cookie: {
            cookieName: 'pm_token',
            signed: false
        }
    });

    fastify.decorate('loadUserSession', async (userId) => {
        const { rows } = await query(
            `SELECT id, username, full_name, role, roles, active_role, is_active, password_changed_at
             FROM users
             WHERE id = $1`,
            [userId]
        );
        const userRow = rows[0];

        if (!userRow || !userRow.is_active) {
            return null;
        }

        const { rows: accessRows } = await query(
            'SELECT process_1_id FROM user_process_1_access WHERE user_id = $1 ORDER BY process_1_id',
            [userId]
        );

        return {
            userRow,
            process1Access: accessRows.map((row) => row.process_1_id),
        };
    });

    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
            const userId = Number(request.user?.sub);
            if (!userId) {
                reply.clearCookie('pm_token', { path: '/' });
                return reply.code(401).send({ error: 'unauthorized' });
            }

            const session = await fastify.loadUserSession(userId);
            if (!session) {
                reply.clearCookie('pm_token', { path: '/' });
                return reply.code(401).send({ error: 'unauthorized' });
            }

            const tokenIssuedAt = request.user?.iat;
            const passwordChangedAt = session.userRow.password_changed_at ? Math.floor(new Date(session.userRow.password_changed_at).getTime() / 1000) : null;

            if (tokenIssuedAt && passwordChangedAt && tokenIssuedAt < passwordChangedAt) {
                reply.clearCookie('pm_token', { path: '/' });
                return reply.code(401).send({ error: 'session expired' });
            }

            const sessionUser = buildSessionUser(session.userRow, session.process1Access);
            request.user = {
                ...sessionUser,
                sub: session.userRow.id,
                iat: request.user?.iat,
                exp: request.user?.exp,
            };
        } catch (err) {
            reply.clearCookie('pm_token', { path: '/' });
            reply.code(401).send({ error: 'unauthorized' });
        }
    });
});
