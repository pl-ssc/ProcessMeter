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
        assert.strictEqual(body.invite_sent, false);
        assert.match(body.invite_error, /приглашение не отправлено/i);

        // Проверяем, что доступы добавлены
        const { rows: access } = await pool.query('SELECT process_1_id FROM user_process_1_access WHERE user_id = $1', [body.user.id]);
        assert.strictEqual(access.length, 2);

        const { rows: tokens } = await pool.query(
            'SELECT type, used_at FROM password_tokens WHERE user_id = $1',
            [body.user.id]
        );
        assert.strictEqual(tokens.length, 0, 'Invite token should be rolled back when email sending fails');

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
        assert.strictEqual(createdUser.can_delete, true);
    });

    await t.test('POST /api/admin/users - Creates analyst role', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/admin/users',
            headers: { cookie: adminToken },
            payload: {
                username: 'analyst@test.com',
                password: 'password123',
                full_name: 'Analyst User',
                role: 'auditor',
                process_1_access: []
            }
        });

        assert.strictEqual(response.statusCode, 200, 'Admin should create analyst');
        const body = JSON.parse(response.payload);
        assert.strictEqual(body.user.role, 'auditor');

        const listRes = await app.inject({
            method: 'GET',
            url: '/api/admin/users?include_admins=true&role=auditor',
            headers: { cookie: adminToken }
        });

        assert.strictEqual(listRes.statusCode, 200);
        const listBody = JSON.parse(listRes.payload);
        assert.ok(listBody.users.some((user) => user.username === 'analyst@test.com'));
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

    await t.test('DELETE /api/admin/users/:id - Deletes user and cascades related data', async () => {
        await pool.query(`INSERT INTO process_1 (id, f1_name, is_active) VALUES (1, 'Process1', true)`);

        const createRes = await app.inject({
            method: 'POST',
            url: '/api/admin/users',
            headers: { cookie: adminToken },
            payload: {
                username: 'delete_me@test.com',
                password: 'password123',
                full_name: 'Delete Me',
                process_1_access: ['1']
            }
        });

        assert.strictEqual(createRes.statusCode, 200);
        const createdUser = JSON.parse(createRes.payload).user;

        await pool.query(
            `INSERT INTO password_tokens (user_id, token, type, expires_at)
             VALUES ($1, $2, 'reset', now() + interval '1 day')`,
            [createdUser.id, 'manual-delete-test-token']
        );

        const deleteRes = await app.inject({
            method: 'DELETE',
            url: `/api/admin/users/${createdUser.id}`,
            headers: { cookie: adminToken }
        });

        assert.strictEqual(deleteRes.statusCode, 200);

        const { rows: users } = await pool.query('SELECT id FROM users WHERE id = $1', [createdUser.id]);
        const { rows: access } = await pool.query('SELECT user_id FROM user_process_1_access WHERE user_id = $1', [createdUser.id]);
        const { rows: answers } = await pool.query('SELECT user_id FROM user_answers WHERE user_id = $1', [createdUser.id]);
        const { rows: tokens } = await pool.query('SELECT user_id FROM password_tokens WHERE user_id = $1', [createdUser.id]);

        assert.strictEqual(users.length, 0);
        assert.strictEqual(access.length, 0);
        assert.strictEqual(answers.length, 0);
        assert.strictEqual(tokens.length, 0);
    });

    await t.test('DELETE /api/admin/users/:id - Prevents deleting current admin', async () => {
        const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', ['admin@test.com']);
        const currentAdminId = rows[0].id;

        const response = await app.inject({
            method: 'DELETE',
            url: `/api/admin/users/${currentAdminId}`,
            headers: { cookie: adminToken }
        });

        assert.strictEqual(response.statusCode, 400);
        assert.match(JSON.parse(response.payload).error, /нельзя удалить текущего пользователя/i);
    });

    await t.test('DELETE /api/admin/users/:id - Prevents deleting last admin', async () => {
        const secondAdmin = await createTestUser({ email: 'admin2@test.com', password: '123', role: 'admin' });

        const deleteSecondAdmin = await app.inject({
            method: 'DELETE',
            url: `/api/admin/users/${secondAdmin.id}`,
            headers: { cookie: adminToken }
        });

        assert.strictEqual(deleteSecondAdmin.statusCode, 200);

        const listResponse = await app.inject({
            method: 'GET',
            url: '/api/admin/users?include_admins=true',
            headers: { cookie: adminToken }
        });

        assert.strictEqual(listResponse.statusCode, 200);
        const adminUser = JSON.parse(listResponse.payload).users.find((user) => user.username === 'admin@test.com');
        assert.strictEqual(adminUser.can_delete, false);

        const { rows } = await pool.query('SELECT COUNT(*)::int AS total_admins FROM users WHERE role = $1', ['admin']);
        assert.strictEqual(rows[0].total_admins, 1);
    });
});
