import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '../.env') });
import pkg from 'pg';
const { Pool } = pkg;

const REF_DB_URL = process.env.SOURCE_DATABASE_URL;

if (!REF_DB_URL) {
    console.error('Критическая ошибка: SOURCE_DATABASE_URL не задан в .env');
    process.exit(1);
}

async function cleanData() {
    console.log('🧹 Запуск очистки эталонных данных в refdb...');
    const pool = new Pool({ connectionString: REF_DB_URL });

    try {
        // 1. Очистка f3_name от ссылок на года и лишних пробелов
        console.log('🔄 Очистка названий в process_3...');
        await pool.query(`
      UPDATE process_3 
      SET f3_name = trim(regexp_replace(f3_name, ' за [0-9]{4} год', '', 'g'))
      WHERE f3_name ~ ' за [0-9]{4} год'
    `);

        // 2. Очистка f4_name
        console.log('🔄 Очистка названий в process_4...');
        await pool.query(`
      UPDATE process_4 
      SET f4_name = trim(regexp_replace(f4_name, ' за [0-9]{4} год', '', 'g'))
      WHERE f4_name ~ ' за [0-9]{4} год'
    `);

        // 3. Дополнительная очистка от специфических префиксов (АО, ООО, ПАО) в начале названий
        console.log('🔄 Удаление юридических префиксов из всех уровней...');
        const tables = ['process_1', 'process_2', 'process_3', 'process_4'];
        const columns = ['f1_name', 'f2_name', 'f3_name', 'f4_name'];

        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const col = columns[i];
            await pool.query(`
        UPDATE ${table}
        SET ${col} = trim(regexp_replace(${col}, '^(АО|ООО|ПАО|ИП)\\s+', '', 'i'))
        WHERE ${col} ~* '^(АО|ООО|ПАО|ИП)\\s+'
      `);
        }

        console.log('✅ Очистка эталонной базы завершена успешно.');
    } catch (err) {
        console.error('❌ Ошибка при очистке эталонной базы:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

cleanData();
