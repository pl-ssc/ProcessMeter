import test from 'node:test';
import assert from 'node:assert';
import { buildTestApp, clearDB, createTestUser, getAuthCookie, closeResources } from './setup.js';
import pool from '../src/db/index.js';

test('Admin API (Users, Settings, Import)', async (t) => {
    let app;
    let adminToken;

    t.before(async () => {
        app = await buildTestApp();
    });

    t.beforeEach(async () => {
        await clearDB();
        const admin = await createTestUser({ email: 'admin@test.com', password: '123', role: 'admin' });
        adminToken = await getAuthCookie(app, admin);
    });

    t.after(async () => {
        await app.close();
        await closeResources();
    });

    await t.test('POST /api/admin/users - Creates user and issues access with dicts', async () => {
        // Подготовка фейковых процессов в БД
        await pool.query(`INSERT INTO process_1 (id, f1_name, is_active) VALUES (1, 'Process1', true), (2, 'Process2', true)`);

        // Подготовка справочников
        const depRes = await pool.query(`INSERT INTO departments (name) VALUES ('Test Dept') RETURNING id`);
        const profRes = await pool.query(`INSERT INTO professions (name) VALUES ('Test Prof') RETURNING id`);
        const depId = depRes.rows[0].id;
        const profId = profRes.rows[0].id;

        const response = await app.inject({
            method: 'POST',
            url: '/api/admin/users',
            headers: { cookie: adminToken },
            payload: {
                username: 'new_respondent@test.com',
                password: 'password123',
                full_name: 'New Respondent',
                department_id: depId,
                profession_id: profId,
                process_1_access: ["1", "2"]
            }
        });

        assert.strictEqual(response.statusCode, 200, 'Admin should be able to create user');
        const body = JSON.parse(response.payload);
        assert.strictEqual(body.user.username, 'new_respondent@test.com');
        assert.strictEqual(body.user.department_id, depId);
        assert.strictEqual(body.user.profession_id, profId);

        // Проверяем, что доступы добавлены
        const { rows: access } = await pool.query('SELECT process_1_id FROM user_process_1_access WHERE user_id = $1', [body.user.id]);
        assert.strictEqual(access.length, 2);

        // Проверяем GET /api/admin/users
        const getRes = await app.inject({
            method: 'GET',
            url: '/api/admin/users',
            headers: { cookie: adminToken }
        });

        const getBody = JSON.parse(getRes.payload);
        const createdUser = getBody.users.find(u => u.username === 'new_respondent@test.com');
        assert.ok(createdUser);
        assert.strictEqual(createdUser.department_name, 'Test Dept');
        assert.strictEqual(createdUser.profession_name, 'Test Prof');
    });

    await t.test('POST /api/admin/settings - Updates settings correctly', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/admin/settings',
            headers: { cookie: adminToken },
            payload: {
                smtp_host: 'smtp.mailtrap.io',
                smtp_port: '2525'
            }
        });

        assert.strictEqual(response.statusCode, 200);

        // Проверка в БД
        const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', ['smtp_host']);
        assert.strictEqual(rows[0].value, 'smtp.mailtrap.io');
    });

    await t.test('POST /api/admin/settings - Masks password on GET', async () => {
        await pool.query(`INSERT INTO settings (key, value) VALUES ('smtp_password', 'secret_pass')`);

        const response = await app.inject({
            method: 'GET',
            url: '/api/admin/settings',
            headers: { cookie: adminToken }
        });

        assert.strictEqual(response.statusCode, 200);
        const body = JSON.parse(response.payload);
        assert.strictEqual(body.settings.smtp_password, '••••••••', 'Password should be masked');
    });
});
