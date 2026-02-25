import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';

export default async function authRoutes(fastify, options) {
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

        const { rows } = await query('SELECT id, username, password_hash, full_name, is_active, role FROM users WHERE username = $1', [username]);
        const user = rows[0];
        if (!user || !user.is_active) {
            return reply.code(401).send({ error: 'invalid credentials' });
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return reply.code(401).send({ error: 'invalid credentials' });
        }

        const token = fastify.jwt.sign({ sub: user.id, username: user.username, full_name: user.full_name, role: user.role });
        reply.setCookie('pm_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
        return { user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } };
    });

    fastify.post('/logout', async (request, reply) => {
        reply.clearCookie('pm_token', { path: '/' });
        return { ok: true };
    });

    fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
        return { user: request.user };
    });
}
