import { query } from '../../db/index.js';
import { testSmtpConnection } from '../../services/emailService.js';

const ALLOWED_KEYS = [
    'smtp_host',
    'smtp_port',
    'smtp_user',
    'smtp_password',
    'smtp_from',
    'smtp_from_name',
    'smtp_secure',
];

export default async function adminSettingsRoutes(fastify, options) {
    // GET all settings (passwords are masked in the response)
    fastify.get('/settings', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole]
    }, async () => {
        const { rows } = await query(
            `SELECT key, value FROM settings WHERE key = ANY($1) ORDER BY key`,
            [ALLOWED_KEYS]
        );
        // Mask password in response
        const settings = {};
        for (const row of rows) {
            settings[row.key] = row.key === 'smtp_password' && row.value
                ? '••••••••'
                : (row.value ?? '');
        }
        return { settings };
    });

    // POST saves settings (only updates password if non-masked value is provided)
    fastify.post('/settings', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                additionalProperties: { type: 'string' }
            }
        }
    }, async (request, reply) => {
        const incoming = request.body;
        const toUpdate = [];

        for (const [key, value] of Object.entries(incoming)) {
            if (!ALLOWED_KEYS.includes(key)) continue;
            // Skip masked password placeholder
            if (key === 'smtp_password' && value === '••••••••') continue;
            toUpdate.push({ key, value });
        }

        if (toUpdate.length === 0) {
            return { ok: true };
        }

        for (const { key, value } of toUpdate) {
            await query(
                `INSERT INTO settings (key, value, updated_at)
                 VALUES ($1, $2, now())
                 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
                [key, value]
            );
        }

        return { ok: true };
    });

    // POST /settings/test — verifies SMTP connection
    fastify.post('/settings/test-smtp', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    smtp_host: { type: 'string' },
                    smtp_port: { type: 'string' },
                    smtp_user: { type: 'string' },
                    smtp_password: { type: 'string' },
                    smtp_secure: { type: 'string' },
                }
            }
        }
    }, async (request, reply) => {
        try {
            // If password is masked — load the real one from DB
            let password = request.body.smtp_password;
            if (password === '••••••••') {
                const { rows } = await query(
                    `SELECT value FROM settings WHERE key = 'smtp_password'`
                );
                password = rows[0]?.value ?? '';
            }

            await testSmtpConnection({ ...request.body, smtp_password: password });
            return { ok: true, message: 'Соединение успешно установлено!' };
        } catch (err) {
            return reply.code(400).send({ error: err.message });
        }
    });
}
