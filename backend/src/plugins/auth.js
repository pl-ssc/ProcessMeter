import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '../config/env.js';
import { query } from '../db/index.js';

export default fp(async (fastify, opts) => {
    await fastify.register(jwt, {
        secret: env.JWT_SECRET,
        cookie: {
            cookieName: 'pm_token',
            signed: false
        }
    });

    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
            const userId = Number(request.user?.sub);
            if (!userId) {
                reply.clearCookie('pm_token', { path: '/' });
                return reply.code(401).send({ error: 'unauthorized' });
            }

            const { rows } = await query(
                'SELECT id, is_active, password_changed_at FROM users WHERE id = $1',
                [userId]
            );
            const dbUser = rows[0];

            if (!dbUser || !dbUser.is_active) {
                reply.clearCookie('pm_token', { path: '/' });
                return reply.code(401).send({ error: 'unauthorized' });
            }

            const tokenIssuedAt = request.user?.iat;
            const passwordChangedAt = dbUser.password_changed_at ? Math.floor(new Date(dbUser.password_changed_at).getTime() / 1000) : null;

            if (tokenIssuedAt && passwordChangedAt && tokenIssuedAt < passwordChangedAt) {
                reply.clearCookie('pm_token', { path: '/' });
                return reply.code(401).send({ error: 'session expired' });
            }
        } catch (err) {
            reply.clearCookie('pm_token', { path: '/' });
            reply.code(401).send({ error: 'unauthorized' });
        }
    });
});
