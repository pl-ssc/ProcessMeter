import test from 'node:test';
import assert from 'node:assert';
import { buildTestApp, clearDB, createTestUser, closeResources } from './setup.js';
import bcrypt from 'bcryptjs';

test('Auth & Security API', async (t) => {
    let app;

    t.before(async () => {
        app = await buildTestApp();
    });

    t.beforeEach(async () => {
        await clearDB();
    });

    t.after(async () => {
        await app.close();
        await closeResources(); // Важно для завершения процесса
    });

    await t.test('POST /api/auth/login - Success', async () => {
        await createTestUser({ email: 'test@example.com', password: 'password123' });

        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { username: 'test@example.com', password: 'password123' }
        });

        assert.strictEqual(response.statusCode, 200, 'Status should be 200');
        const body = JSON.parse(response.payload);
        assert.strictEqual(body.user.username, 'test@example.com');

        let cookies = response.headers['set-cookie'];
        if (!Array.isArray(cookies)) cookies = [cookies];
        assert.ok(cookies, 'Cookie must be set');
        assert.ok(cookies[0].includes('pm_token='), 'Cookie name must be pm_token');
        assert.ok(cookies[0].includes('HttpOnly'), 'Cookie must be HttpOnly');
    });

    await t.test('POST /api/auth/login - Wrong password', async () => {
        await createTestUser({ email: 'test@example.com', password: 'password123' });

        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { username: 'test@example.com', password: 'wrongpass' }
        });

        assert.strictEqual(response.statusCode, 401, 'Status should be 401');
    });

    await t.test('POST /api/auth/login - Inactive user', async () => {
        await createTestUser({ email: 'inactive@example.com', password: 'password123', isActive: false });

        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { username: 'inactive@example.com', password: 'password123' }
        });

        assert.strictEqual(response.statusCode, 401, 'Inactive user should get 401');
    });

    await t.test('POST /api/auth/logout', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/logout'
        });

        assert.strictEqual(response.statusCode, 200, 'Status should be 200');
        let cookies = response.headers['set-cookie'];
        if (!Array.isArray(cookies)) cookies = [cookies];
        assert.ok(cookies[0].includes('pm_token=;') || cookies[0].includes('Max-Age=0'), 'Cookie must be cleared');
    });

    await t.test('Role Guards - respondent cannot access admin routes', async () => {
        const user = await createTestUser({ email: 'resp@example.com', password: 'password123', role: 'respondent' });
        const tokenToken = app.jwt.sign({ sub: user.id, role: user.role });

        const response = await app.inject({
            method: 'GET',
            url: '/api/admin/users',
            headers: {
                cookie: `pm_token=${tokenToken}`
            }
        });

        assert.strictEqual(response.statusCode, 403, 'Respondent cannot access admin routes');
    });
});
