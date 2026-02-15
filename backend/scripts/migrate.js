import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '../.env') });
import Pool from 'pg-pool';

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.DATABASE_URL;

if (!SOURCE_URL || !TARGET_URL) {
    console.error('Критическая ошибка: SOURCE_DATABASE_URL или DATABASE_URL не заданы в .env');
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

        // 1. Сохранение текущих доступов во временную таблицу
        console.log('📦 Сохранение текущих прав доступа пользователей...');
        await targetClient.query(`
      CREATE TEMP TABLE temp_access AS 
      SELECT user_id, f1_index FROM user_process_1_access
    `);

        // 2. Очистка ответов и справочников
        console.log('🧹 Очистка старых ответов и справочников...');
        const tablesToClear = ['user_answers', 'process_4', 'process_3', 'process_2', 'process_1', 'executors', 'systems'];
        await targetClient.query(`TRUNCATE TABLE ${tablesToClear.join(', ')} CASCADE`);

        // 3. Копирование данных из эталонной базы
        const tablesToSync = ['process_1', 'process_2', 'process_3', 'executors', 'process_4', 'systems'];

        for (const table of tablesToSync) {
            console.log(`🔄 Синхронизация таблицы: ${table}...`);

            // Читаем из источника
            const { rows, fields } = await sourcePool.query(`SELECT * FROM ${table}`);

            if (rows.length === 0) {
                console.log(`⚠️  Таблица ${table} в источнике пуста, пропускаем.`);
                continue;
            }

            const columns = fields.map(f => f.name);
            const placeholders = rows.map((_, rowIndex) =>
                `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
            ).join(', ');

            const values = rows.flatMap(row => columns.map(col => row[col]));

            const insertSql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
            await targetClient.query(insertSql, values);
        }

        // 4. Восстановление доступов
        console.log('🔑 Восстановление прав доступа...');
        await targetClient.query(`
      INSERT INTO user_process_1_access (user_id, f1_index)
      SELECT t.user_id, t.f1_index 
      FROM temp_access t
      JOIN process_1 p1 ON p1.f1_index = t.f1_index
      ON CONFLICT DO NOTHING
    `);

        // 5. Перегенерация пустых ответов для всех пользователей
        console.log('📝 Генерация новых пустых форм ответов...');
        const { rows: users } = await targetClient.query("SELECT id FROM users WHERE is_active = true");
        for (const user of users) {
            await targetClient.query('SELECT copy_operations_to_user_answers($1)', [user.id]);
        }

        await targetClient.query('COMMIT');
        console.log('✅ Статус: Миграция успешно завершена.');

    } catch (error) {
        await targetClient.query('ROLLBACK');
        console.error('❌ Ошибка миграции:', error.message);
        process.exit(1);
    } finally {
        targetClient.release();
        await sourcePool.end();
        await targetPool.end();
    }
}

runMigration();
