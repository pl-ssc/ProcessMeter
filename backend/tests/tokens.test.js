import test from 'node:test';
import assert from 'node:assert';
import { buildTestApp, clearDB, createTestUser, closeResources } from './setup.js';
import pool from '../src/db/index.js';
import { createToken } from '../src/services/tokenService.js';

test('Password Recovery & Tokens API', async (t) => {
    let app;

    t.before(async () => {
        app = await buildTestApp();
    });

    t.beforeEach(async () => {
        await clearDB();
        // Вставляем фейковые настройки SMTP, чтобы реальные письма не уходили
        await pool.query(`
            INSERT INTO settings (key, value) VALUES
            ('smtp_host', '127.0.0.1'),
            ('smtp_port', '9999'),
            ('email_reset_html', 'Link: {{link}}')
        `);
    });

    t.after(async () => {
        await app.close();
        await closeResources();
    });

    await t.test('POST /api/auth/forgot-password - Error in SMTP rolls back token', async () => {
        const user = await createTestUser({ email: 'forgot@example.com', password: 'oldpassword' });

        // Поскольку SMTP 127.0.0.1:9999 не существует, отправка письма должна упасть
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/forgot-password',
            payload: { username: 'forgot@example.com' }
        });

        // Запрос должен вернуть 200, даже если SMTP упал (приватность)
        assert.strictEqual(response.statusCode, 200);

        // Проверяем, что токен был ОТКАТЕН из-за ошибки (не остался в базе)
        const { rows } = await pool.query('SELECT * FROM password_tokens WHERE user_id = $1', [user.id]);
        assert.strictEqual(rows.length, 0, 'Token should be deleted on SMTP error');
    });

    await t.test('POST /api/auth/forgot-password - Anti-enumeration', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/forgot-password',
            payload: { username: 'non_existent@example.com' }
        });

        // Возвращает 200 для скрытия факта 존재/отсутствия
        assert.strictEqual(response.statusCode, 200);
    });

    await t.test('POST /api/auth/forgot-password - Rate Limiting', async () => {
        await createTestUser({ email: 'rate@example.com', password: '123' });

        // Отправляем 6 запросов подряд (лимит 5)
        let lastStatusCode = 200;
        for (let i = 0; i < 6; i++) {
            const res = await app.inject({
                method: 'POST',
                url: '/api/auth/forgot-password',
                payload: { username: 'rate@example.com' }
            });
            lastStatusCode = res.statusCode;
        }

        assert.strictEqual(lastStatusCode, 429, '6th request should be rate limited');
    });

    await t.test('POST /api/auth/set-password - Success', async () => {
        const user = await createTestUser({ email: 'set@example.com', password: 'oldpassword' });
        const loginResponseBeforeReset = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { username: 'set@example.com', password: 'oldpassword' }
        });
        const oldSessionCookie = Array.isArray(loginResponseBeforeReset.headers['set-cookie'])
            ? loginResponseBeforeReset.headers['set-cookie'][0]
            : loginResponseBeforeReset.headers['set-cookie'];
        const tokenStr = await createToken(user.id, 'reset');

        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/set-password',
            payload: { token: tokenStr, password: 'new_strong_password' }
        });

        assert.strictEqual(response.statusCode, 200);

        // Проверяем, что токен отмечен как использованный
        const { rows: tokens } = await pool.query('SELECT used_at FROM password_tokens WHERE token = $1', [tokenStr]);
        assert.ok(tokens[0].used_at !== null, 'Token should be marked as used');

        // Проверяем, что теперь можно залогиниться с новым паролем
        const loginResponse = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { username: 'set@example.com', password: 'new_strong_password' }
        });
        assert.strictEqual(loginResponse.statusCode, 200, 'Should be able to login with new password');

        const oldSessionCheck = await app.inject({
            method: 'GET',
            url: '/api/auth/me',
            headers: { cookie: oldSessionCookie }
        });
        assert.strictEqual(oldSessionCheck.statusCode, 401, 'Old session should be invalidated after password reset');
    });

    await t.test('POST /api/auth/set-password - Whitespace password', async () => {
        const user = await createTestUser({ email: 'white@example.com', password: '123' });
        const tokenStr = await createToken(user.id, 'reset');

        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/set-password',
            payload: { token: tokenStr, password: '     ' }
        });

        assert.strictEqual(response.statusCode, 400, 'Whitespace password should be rejected');
        const body = JSON.parse(response.payload);
        assert.ok(body.error === 'Bad Request' || body.message.includes('Пароль'), 'Error should be Bad Request or constraint');
    });
});
