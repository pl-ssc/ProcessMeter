import test from 'node:test';
import assert from 'node:assert';
import { buildTestApp, clearDB, createTestUser, getAuthCookie, closeResources } from './setup.js';
import pool from '../src/db/index.js';

test('Dictionaries API (Departments & Professions)', async (t) => {
    let app;
    let adminToken;

    t.before(async () => {
        app = await buildTestApp();
    });

    t.beforeEach(async () => {
        await clearDB();
        const admin = await createTestUser({ email: 'admin_dict@example.com', password: '123', role: 'admin' });
        adminToken = await getAuthCookie(app, admin);
    });

    t.after(async () => {
        await app.close();
        await closeResources();
    });

    await t.test('POST /api/admin/departments - Create and Fetch', async () => {
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/admin/departments',
            headers: { cookie: adminToken },
            payload: { name: 'IT Отдел' }
        });

        assert.strictEqual(createRes.statusCode, 200);
        const { department } = JSON.parse(createRes.payload);
        assert.strictEqual(department.name, 'IT Отдел');

        const getRes = await app.inject({
            method: 'GET',
            url: '/api/admin/departments',
            headers: { cookie: adminToken }
        });
        const { departments } = JSON.parse(getRes.payload);
        assert.ok(departments.some(d => d.name === 'IT Отдел'));
    });

    await t.test('PUT /api/admin/professions/:id - Edit profession', async () => {
        const { rows } = await pool.query("INSERT INTO professions (name) VALUES ('Разработчик') RETURNING id");
        const profId = rows[0].id;

        const renameRes = await app.inject({
            method: 'PUT',
            url: `/api/admin/professions/${profId}`,
            headers: { cookie: adminToken },
            payload: { name: 'Старший разработчик', is_active: false }
        });

        assert.strictEqual(renameRes.statusCode, 200);
        const { profession } = JSON.parse(renameRes.payload);
        assert.strictEqual(profession.name, 'Старший разработчик');
        assert.strictEqual(profession.is_active, false);
    });
});
