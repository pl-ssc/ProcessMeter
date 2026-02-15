import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root (similar to server.js and migrate.js)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const TARGET_DATABASE_URL = process.env.TARGET_DATABASE_URL;

if (!TARGET_DATABASE_URL) {
    console.error('❌ Ошибка: TARGET_DATABASE_URL не найден в .env');
    process.exit(1);
}

const pool = new Pool({ connectionString: TARGET_DATABASE_URL });

async function clearDatabase() {
    console.log(`⚠️  ВНИМАНИЕ! Вы собираетесь ПОЛНОСТЬЮ очистить базу данных:`);
    console.log(`🎯 TARGET: ${TARGET_DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
    console.log(`🧨 Будут удалены ВСЕ данные, включая пользователей, настройки и справочники.`);
    console.log(`🛑 Это действие НЕОБРАТИМО.`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Вы уверены? Введите "yes" для подтверждения: ', async (answer) => {
        rl.close();
        if (answer.trim().toLowerCase() !== 'yes') {
            console.log('🚫 Отмена.');
            process.exit(0);
        }

        const client = await pool.connect();
        try {
            console.log('🚀 Начинаем очистку...');
            await client.query('BEGIN');

            // List of tables to truncate
            // Order doesn't strictly matter with CASCADE, but listing them for clarity
            const tables = [
                'user_answers',
                'user_process_1_access',
                'users',
                'process_4',
                'process_3',
                'process_2',
                'process_1',
                'systems',
                'executors'
            ];

            console.log(`🔥 Очистка таблиц: ${tables.join(', ')}...`);
            await client.query(`TRUNCATE TABLE ${tables.join(', ')} CASCADE`);

            await client.query('COMMIT');
            console.log('✅ База данных полностью очищена.');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('❌ Ошибка при очистке:', err);
            process.exit(1);
        } finally {
            client.release();
            await pool.end();
        }
    });
}

clearDatabase();
