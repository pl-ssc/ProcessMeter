import test from 'node:test';
import assert from 'node:assert';
import { buildTestApp, clearDB, createTestUser, closeResources, getAuthCookie } from './setup.js';
import bcrypt from 'bcryptjs';
import pool from '../src/db/index.js';
import { env } from '../src/config/env.js';

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
        assert.deepStrictEqual(body.user.roles, ['respondent']);
        assert.strictEqual(body.user.active_role, 'respondent');

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
        const tokenToken = await getAuthCookie(app, user);

        const response = await app.inject({
            method: 'GET',
            url: '/api/admin/users',
            headers: {
                cookie: tokenToken
            }
        });

        assert.strictEqual(response.statusCode, 403, 'Respondent cannot access admin routes');
    });

    await t.test('Role Guards - analyst can access analytics routes', async () => {
        const analyst = await createTestUser({ email: 'analyst@example.com', password: 'password123', role: 'auditor' });
        const authCookie = await getAuthCookie(app, analyst);

        const response = await app.inject({
            method: 'GET',
            url: '/api/analytics/meta',
            headers: {
                cookie: authCookie
            }
        });

        assert.strictEqual(response.statusCode, 200, 'Analyst should access analytics routes');
    });

    await t.test('POST /api/auth/switch-role - updates active role for multi-role user', async () => {
        await pool.query(`
            INSERT INTO process_1 (id, f1_name, is_active) VALUES (1, 'Process 1', true)
        `);

        const user = await createTestUser({ email: 'dual@example.com', password: 'password123', role: 'respondent' });
        await pool.query(
            `UPDATE users
                SET roles = ARRAY['respondent', 'auditor']::text[],
                    active_role = 'respondent'
              WHERE id = $1`,
            [user.id]
        );
        await pool.query('INSERT INTO user_process_1_access (user_id, process_1_id) VALUES ($1, 1)', [user.id]);

        const authCookie = await getAuthCookie(app, { ...user, roles: ['respondent', 'auditor'], active_role: 'respondent' });

        const switchResponse = await app.inject({
            method: 'POST',
            url: '/api/auth/switch-role',
            headers: { cookie: authCookie },
            payload: { role: 'auditor' }
        });

        assert.strictEqual(switchResponse.statusCode, 200);
        const switchBody = JSON.parse(switchResponse.payload);
        assert.strictEqual(switchBody.user.active_role, 'auditor');
        assert.ok(switchBody.user.roles.includes('respondent'));
        assert.ok(switchBody.user.roles.includes('auditor'));

        const analyticsCookieHeader = switchResponse.headers['set-cookie'];
        let analyticsCookie = Array.isArray(analyticsCookieHeader) ? analyticsCookieHeader[0] : analyticsCookieHeader;
        analyticsCookie = analyticsCookie.split(';')[0];

        const analyticsResponse = await app.inject({
            method: 'GET',
            url: '/api/analytics/meta',
            headers: {
                cookie: analyticsCookie
            }
        });

        assert.strictEqual(analyticsResponse.statusCode, 200, 'Switched analyst should access analytics routes');
    });

    await t.test('Role Guards - respondent cannot access analytics routes', async () => {
        const respondent = await createTestUser({ email: 'resp-analytics@example.com', password: 'password123', role: 'respondent' });
        const authCookie = await getAuthCookie(app, respondent);

        const response = await app.inject({
            method: 'GET',
            url: '/api/analytics/meta',
            headers: {
                cookie: authCookie
            }
        });

        assert.strictEqual(response.statusCode, 403, 'Respondent cannot access analytics routes');
    });

    await t.test('POST /api/auth/demo-login - restores respondent access for existing demo user', async () => {
        const previousDemoMode = env.DEMO_MODE;
        env.DEMO_MODE = true;

        try {
            await pool.query(`INSERT INTO process_1 (id, f1_name) VALUES (1, 'Process 1'), (2, 'Process 2')`);
            await pool.query(`INSERT INTO process_2 (id, process_1_id, f2_name) VALUES (11, 1, 'Process 1.1'), (21, 2, 'Process 2.1')`);
            await pool.query(`INSERT INTO process_3 (id, process_2_id, f3_name) VALUES (111, 11, 'Process 1.1.1'), (211, 21, 'Process 2.1.1')`);
            await pool.query(`INSERT INTO process_4 (id, process_3_id, f4_name) VALUES (1111, 111, 'Operation 1'), (2111, 211, 'Operation 2')`);

            await pool.query(
                `INSERT INTO users (username, password_hash, full_name, role, roles, active_role, is_active, password_changed_at)
                 VALUES ($1, $2, $3, 'respondent', ARRAY['respondent']::text[], 'respondent', true, now())`,
                [ 'demo-respondent@processmeter.local', await bcrypt.hash('demo-respondent-login', 2), 'Демо Респондент' ]
            );

            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/demo-login',
                payload: { role: 'respondent' }
            });

            assert.strictEqual(response.statusCode, 200, 'Status should be 200');

            const { rows: accessRows } = await pool.query(
                'SELECT process_1_id FROM user_process_1_access WHERE user_id = (SELECT id FROM users WHERE username = $1) ORDER BY process_1_id',
                ['demo-respondent@processmeter.local']
            );
            const { rows: answerRows } = await pool.query(
                'SELECT process_4_id FROM user_answers WHERE user_id = (SELECT id FROM users WHERE username = $1) ORDER BY process_4_id',
                ['demo-respondent@processmeter.local']
            );

            assert.deepStrictEqual(accessRows.map((row) => row.process_1_id), [1, 2], 'Demo respondent should have access to all process_1 records');
            assert.deepStrictEqual(answerRows.map((row) => row.process_4_id), [1111, 2111], 'Demo respondent should receive answers for all available operations');
        } finally {
            env.DEMO_MODE = previousDemoMode;
        }
    });
});
