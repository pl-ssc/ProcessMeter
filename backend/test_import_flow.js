import { buildApp } from './src/app.js';
import * as XLSX from '../frontend/node_modules/xlsx/xlsx.mjs';
import pool from './src/db/index.js';
import fs from 'fs';

async function run() {
    process.env.NODE_ENV = 'development';
    const app = await buildApp({ logger: true });
    await app.listen({ port: 0 }); // Случайный порт
    const port = app.server.address().port;
    const baseUrl = `http://localhost:${port}`;

    console.log(`[TEST] Сервер запущен на порту ${port}`);

    // Получаем админский токен
    console.log('[TEST] Авторизация...');
    let admin = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (admin.rows.length === 0) {
        console.log('[TEST] Админ не найден, создаем...');
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.default.hash('123', 10);
        await pool.query("INSERT INTO users (username, password_hash, full_name, role, is_active) VALUES ('admin@test.local', $1, 'Admin', 'admin', true)", [hash]);
    }

    let adminUsername = admin.rows.length > 0 ? admin.rows[0].username : 'admin@test.local';

    const adminUser = (await pool.query("SELECT * FROM users WHERE username = $1", [adminUsername])).rows[0];
    const token = app.jwt.sign({ sub: adminUser.id, email: adminUser.username, role: 'admin' }, { expiresIn: '1h' });
    const cookie = `pm_token=${token}`;

    console.log('[TEST] 1. Запуск импорта из эталонной базы...');
    const importRes = await fetch(`${baseUrl}/api/admin/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:5433/refdb' })
    });

    if (!importRes.ok) {
        console.error('[TEST] Ошибка импорта из эталонной базы:', await importRes.text());
        process.exit(1);
    }
    console.log('[TEST] Импорт эталонной БД успешно завершен!');

    console.log('[TEST] 2. Генерация тестового XLSX файла...');
    const usersData = [
        { 'Email': 'user1@test.local', 'ФИО': 'Иванов Иван', 'Роль': 'Респондент', 'Подразделение': 'Отдел Альфа', 'Профессия': 'Менеджер' },
        { 'Email': 'user2@test.local', 'ФИО': 'Петров Петр', 'Роль': 'Респондент', 'Подразделение': 'Отдел Альфа', 'Профессия': 'Аналитик' },
        { 'Email': 'user3@test.local', 'ФИО': 'Смирнов Сергей', 'Роль': 'Респондент', 'Подразделение': 'Отдел Бета', 'Профессия': 'Разработчик' },
        { 'Email': 'user4@test.local', 'ФИО': 'Кузнецова Анна', 'Роль': 'Респондент', 'Подразделение': 'Отдел Бета', 'Профессия': 'Тестировщик' },
        { 'Email': 'user5@test.local', 'ФИО': 'Васильев Василий', 'Роль': 'Администратор', 'Подразделение': 'Дирекция', 'Профессия': 'Директор' },
    ];

    // Создадим физический XLSX файл для проверки
    const ws = XLSX.utils.json_to_sheet(usersData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync("test_users.xlsx", buf);
    console.log('[TEST] test_users.xlsx успешно создан в папке backend!');

    const usersPayload = usersData.map(u => ({
        username: u["Email"],
        full_name: u["ФИО"],
        role: u["Роль"] === 'Администратор' ? 'admin' : 'respondent',
        department_name: u["Подразделение"],
        profession_name: u["Профессия"]
    }));

    console.log('[TEST] 3. Выполнение массового импорта 5 пользователей...');
    const bulkRes = await fetch(`${baseUrl}/api/admin/users/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ users: usersPayload })
    });

    if (!bulkRes.ok) {
        console.error('[TEST] Ошибка bulk-import:', await bulkRes.text());
        process.exit(1);
    }
    const bulkData = await bulkRes.json();
    console.log(`[TEST] Bulk импорт: добавлено ${bulkData.imported} пользователей, пропущено: ${bulkData.skipped}.`);

    console.log('[TEST] 4. Проверка создания ответов для новых пользователей...');
    const newUsers = await pool.query(`SELECT id, username FROM users WHERE username IN ('user1@test.local', 'user2@test.local', 'user3@test.local', 'user4@test.local', 'user5@test.local')`);

    console.log('[TEST] Выдаем доступы для генерации user_answers...');
    const p1 = await pool.query('SELECT id FROM process_1 LIMIT 2');

    if (p1.rows.length === 0) {
        console.log('[TEST] Нет процессов 1 уровня! Создание user_answers невозможно.');
    } else {
        const processIds = p1.rows.map(r => String(r.id));

        for (const u of newUsers.rows) {
            const accessRes = await fetch(`${baseUrl}/api/admin/users/${u.id}/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
                body: JSON.stringify({ process_1_access: processIds })
            });
            if (!accessRes.ok) {
                console.error(`[TEST] Ошибка выдачи доступа для ${u.username}`, await accessRes.text());
            }
        }

        console.log('[TEST] Доступы выданы. Проверяем user_answers...');
        const answersCount = await pool.query(`SELECT COUNT(*) FROM user_answers WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'user%@test.local')`);
        console.log(`[TEST] Создано записей в user_answers для тестовых пользователей: ${answersCount.rows[0].count}`);
    }

    await app.close();
    await pool.end();
    console.log('[TEST] Завершено успешно!');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
