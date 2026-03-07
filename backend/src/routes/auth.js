import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { createToken, validateToken, markTokenUsed, deleteToken } from '../services/tokenService.js';
import { sendPasswordLinkEmail } from '../services/emailService.js';

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
            'SELECT id, username, password_hash, full_name, is_active, role FROM users WHERE username = $1',
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

        const token = fastify.jwt.sign({
            sub: user.id, username: user.username,
            full_name: user.full_name, role: user.role
        });
        reply.setCookie('pm_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });
        return { user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } };
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
