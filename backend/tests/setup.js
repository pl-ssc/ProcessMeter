import { buildApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import pool from '../src/db/index.js';
import bcrypt from 'bcryptjs';
import { assertSafeTestDatabase } from './guard-test-db.js';

/**
 * Создает инстанс Fastify для тестов, переиспользуя боевой код из src/app.js
 */
export async function buildTestApp() {
    assertSafeTestDatabase();
    // Отключаем логи для чистоты вывода тестов
    const app = await buildApp({ logger: false });
    await app.ready();
    return app;
}

/**
 * Очищает таблицы в БД перед каждым тестом (TRUNCATE).
 */
export async function clearDB() {
    assertSafeTestDatabase();
    const client = await pool.connect();
    try {
        await client.query(`
            TRUNCATE TABLE 
                users, 
                password_tokens, 
                user_answers, 
                user_added_operations,
                survey_event_log,
                settings, 
                user_process_1_access,
                process_1,
                systems,
                executors,
                departments,
                professions
            CASCADE
        `);
    } finally {
        client.release();
    }
}

/**
 * Создает тестового пользователя в БД и возвращает его данные.
 */
export async function createTestUser({ email, password, role = 'respondent', isActive = true }) {
    const hash = await bcrypt.hash(password, 2); // Быстрый хэш для тестов
    const { rows } = await pool.query(
        `INSERT INTO users (username, password_hash, full_name, role, roles, active_role, is_active, password_changed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now() - interval '1 second')
         RETURNING id, username, full_name, role, roles, active_role, is_active`,
        [email, hash, 'Test User', role, [role], role, isActive]
    );
    return rows[0];
}

/**
 * Генерирует токен (cookies) для инъекции в тестовые запросы.
 */
export async function getAuthCookie(app, user) {
    const token = app.jwt.sign({
        sub: user.id,
        email: user.username,
        role: user.active_role || user.role,
        active_role: user.active_role || user.role,
        roles: user.roles || [user.role]
    }, { expiresIn: '12h' });

    return `pm_token=${token}`;
}

/**
 * Закрыть пулы после тестов.
 */
export async function closeResources() {
    await pool.end();
}
