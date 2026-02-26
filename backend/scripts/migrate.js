import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

import pg from 'pg';
const { Pool } = pg;

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.TARGET_DATABASE_URL;

if (!SOURCE_URL || !TARGET_URL) {
    console.error('Критическая ошибка: SOURCE_DATABASE_URL или TARGET_DATABASE_URL не заданы в .env');
    process.exit(1);
}

async function runMigration() {
    console.log('🚀 Запуск миграции из эталонной базы...');
    console.log(`📡 Источник (SOURCE): ${SOURCE_URL.replace(/:[^:@]+@/, ':***@')}`);
    console.log(`🎯 Приемник (TARGET): ${TARGET_URL.replace(/:[^:@]+@/, ':***@')}`);

    const sourcePool = new Pool({ connectionString: SOURCE_URL });
    const targetPool = new Pool({ connectionString: TARGET_URL });

    const targetClient = await targetPool.connect();

    try {
        await targetClient.query('BEGIN');

        // 1. Очистка ответов и справочников (Сброс старой иерархии процессов)
        // Каскадно удалит user_answers и user_process_1_access, так как миграция справочников
        // должна запускаться ДО начала заполнения таблиц пользователями.
        console.log('🧹 Очистка старых ответов и справочников...');
        const tablesToClear = ['process_4', 'process_3', 'process_2', 'process_1', 'executors', 'systems'];
        await targetClient.query(`TRUNCATE TABLE ${tablesToClear.join(', ')} CASCADE`);
        for (const table of tablesToClear) {
            await targetClient.query(`TRUNCATE TABLE ${table} CASCADE`);
            console.log(`   🗑️  Таблица ${table} очищена.`);
        }


        // 3. Копирование данных из эталонной базы
        const tablesToSync = ['process_1', 'process_2', 'process_3', 'executors', 'process_4', 'systems'];
        const stats = {};

        for (const table of tablesToSync) {
            console.log(`🔄 Синхронизация таблицы: ${table}...`);

            // Читаем из источника
            const { rows, fields } = await sourcePool.query(`SELECT * FROM ${table}`);
            const sourceCount = rows.length;
            console.log(`   📥 Получено строк из источника: ${sourceCount}`);

            if (sourceCount === 0) {
                console.log(`   ⚠️  Таблица ${table} в источнике пуста, пропускаем.`);
                stats[table] = 0;
                continue;
            }

            const columns = fields.map(f => f.name);
            const placeholders = rows.map((_, rowIndex) =>
                `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
            ).join(', ');

            const values = rows.flatMap(row => columns.map(col => row[col]));

            const insertSql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
            await targetClient.query(insertSql, values);

            // Проверяем вставку
            const { rows: targetCountRes } = await targetClient.query(`SELECT COUNT(*) FROM ${table}`);
            const targetCount = targetCountRes[0].count;
            console.log(`   out  Вставлено строк в приемник: ${targetCount}`);
            stats[table] = targetCount;
        }

        // Финальная сверка
        const { rows: p4Count } = await targetClient.query('SELECT COUNT(*) FROM process_4');
        console.log('📊 Итоговая статистика:');
        console.log(`   - Из эталона перенесено операций 4 уровня (process_4): ${p4Count[0].count}`);


        await targetClient.query('COMMIT');
        console.log('✅ Статус: Миграция успешно завершена.');

    } catch (error) {
        await targetClient.query('ROLLBACK');
        console.error('❌ Ошибка миграции:', error);
        process.exit(1);
    } finally {
        targetClient.release();
        await sourcePool.end();
        await targetPool.end();
    }
}

runMigration();
