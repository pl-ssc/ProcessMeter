import test from 'node:test';
import assert from 'node:assert';
import { buildTestApp, clearDB, createTestUser, getAuthCookie, closeResources } from './setup.js';
import pool from '../src/db/index.js';

test('Respondent & Processes API', async (t) => {
    let app;

    t.before(async () => {
        app = await buildTestApp();
    });

    t.beforeEach(async () => {
        await clearDB();

        // Вставляем фейковое дерево процессов и систему для тестирования
        await pool.query(`
            INSERT INTO process_1 (id, f1_name, is_active) VALUES (1, 'Process L1', true), (2, 'Hidden L1', true);
            INSERT INTO process_2 (id, process_1_id, f2_name, is_active) VALUES (1, 1, 'Process L2', true), (2, 2, 'Hidden L2', true);
            INSERT INTO process_3 (id, process_2_id, f3_name, is_active) VALUES (1, 1, 'Process L3', true), (2, 2, 'Hidden L3', true);
            INSERT INTO executors (id, name) VALUES (1, 'Executor 1');
            INSERT INTO process_4 (id, process_3_id, f4_name, is_active, executor_id) VALUES 
                (10, 1, 'Operation 1', true, 1),
                (11, 1, 'Operation 2', true, 1),
                (20, 2, 'Hidden Operation', true, 1);
                
            INSERT INTO systems (system_id, system_name, is_active) VALUES (1, 'Excel', true);
        `);
    });

    t.after(async () => {
        await app.close();
        await closeResources();
    });

    await t.test('GET /api/processes - Isolation', async () => {
        const userA = await createTestUser({ email: 'usera@test.com', password: '123' });
        const tokenA = await getAuthCookie(app, userA);

        // Даем userA доступ только к process_1 (id = 1) и генерируем ему answers
        await pool.query('INSERT INTO user_process_1_access (user_id, process_1_id) VALUES ($1, 1)', [userA.id]);
        await pool.query(`
            INSERT INTO user_answers (user_id, process_4_id) 
            VALUES ($1, 10), ($1, 11)
        `, [userA.id]);

        const response = await app.inject({
            method: 'GET',
            url: '/api/answers',
            headers: { cookie: tokenA }
        });

        assert.strictEqual(response.statusCode, 200);
        const { answers } = JSON.parse(response.payload);

        // Убеждаемся, что возвращаются только разрешенные операции
        assert.ok(answers.some(a => a.operation_id === 10), 'Should see Operation 10');
        assert.ok(!answers.some(a => a.operation_id === 20), 'Should NOT see Operation 20');
    });

    await t.test('POST /api/answers/bulk - Saves data correctly', async () => {
        const user = await createTestUser({ email: 'user@test.com', password: '123' });
        const token = await getAuthCookie(app, user);

        await pool.query('INSERT INTO user_answers (user_id, process_4_id) VALUES ($1, 10)', [user.id]);

        const response = await app.inject({
            method: 'POST',
            url: '/api/answers/bulk',
            headers: { cookie: token },
            payload: {
                items: [
                    { operation_id: 10, labor_hours: 5.5, system_id: 1, note: 'Test note' }
                ]
            }
        });

        assert.strictEqual(response.statusCode, 200);

        // Проверяем БД напрямую
        const { rows } = await pool.query('SELECT labor_hours, system_id, note FROM user_answers WHERE user_id = $1 AND process_4_id = 10', [user.id]);
        assert.strictEqual(rows[0].labor_hours, '5.50');
        assert.strictEqual(rows[0].system_id, 1);
        assert.strictEqual(rows[0].note, 'Test note');
    });

    await t.test('GET /api/user/stats - Calculates FTE properly', async () => {
        const user = await createTestUser({ email: 'fte@test.com', password: '123' });
        const token = await getAuthCookie(app, user);

        process.env.FTE_DIVISOR = '165';

        // Имитируем сохраненные часы
        await pool.query('INSERT INTO user_answers (user_id, process_4_id, labor_hours) VALUES ($1, 10, 16.5)', [user.id]);

        const response = await app.inject({
            method: 'GET',
            url: '/api/user/stats',
            headers: { cookie: token }
        });

        const body = JSON.parse(response.payload);
        assert.strictEqual(body.total_hours, 16.5);
        assert.strictEqual(body.fte, 0.1); // 16.5 / 165
        assert.strictEqual(body.status, 'in_progress');
        assert.strictEqual(body.is_submitted, false);
    });

    await t.test('POST /api/answers/complete - Submits survey', async () => {
        const user = await createTestUser({ email: 'complete@test.com', password: '123' });
        const token = await getAuthCookie(app, user);

        await pool.query('INSERT INTO user_answers (user_id, process_4_id) VALUES ($1, 10)', [user.id]);

        const completeRes = await app.inject({
            method: 'POST',
            url: '/api/answers/complete',
            headers: { cookie: token }
        });

        assert.strictEqual(completeRes.statusCode, 200);

        // Проверяем статус
        const statsRes = await app.inject({
            method: 'GET',
            url: '/api/user/stats',
            headers: { cookie: token }
        });

        const body = JSON.parse(statsRes.payload);
        assert.strictEqual(body.status, 'completed');
        assert.strictEqual(body.is_submitted, true);
    });
});
