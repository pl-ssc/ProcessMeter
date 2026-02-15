import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const REF_DB_URL = process.env.SOURCE_DATABASE_URL;

if (!REF_DB_URL) {
    console.error('❌ SOURCE_DATABASE_URL не найден в .env');
    process.exit(1);
}

// Помощник для парсинга SQL кортежей (tuples)
function transformTuples(sql, columnsToKeep) {
    const valuesMatch = sql.match(/VALUES\s+(.*);?$/is);
    if (!valuesMatch) return sql;

    const header = sql.substring(0, sql.indexOf('VALUES'));
    const valuesPart = valuesMatch[1].trim().replace(/;$/, '');

    // Очень грубый сплит по кортежам. В наших данных они простые.
    const tuples = valuesPart.split(/\),\s*\(/);

    const transformedTuples = tuples.map(t => {
        // Убираем внешние скобки если они остались
        let raw = t.replace(/^\(/, '').replace(/\)$/, '');

        // Сплит по запятым, но учитываем строки в кавычках
        // В данном случае данные простые, можем попробовать простой regex
        const parts = [];
        let currentPart = '';
        let inQuotes = false;
        for (let i = 0; i < raw.length; i++) {
            const char = raw[i];
            if (char === "'" && raw[i - 1] !== "\\") inQuotes = !inQuotes;
            if (char === ',' && !inQuotes) {
                parts.push(currentPart.trim());
                currentPart = '';
            } else {
                currentPart += char;
            }
        }
        parts.push(currentPart.trim());

        // Выбираем только нужные колонки
        const kept = columnsToKeep.map(idx => parts[idx]);
        return `(${kept.join(', ')})`;
    });

    const newHeader = header.replace(/\(".*?"\)/, `(${columnsToKeep.map(() => '??').join(', ')})`); // Мы заменим заголовки явно в task
    return header + ' VALUES ' + transformedTuples.join(', ') + ';';
}

async function run() {
    console.log('🚀 Начинаем импорт старых данных (v3)...');

    const client = new Client({ connectionString: REF_DB_URL });

    try {
        await client.connect();
        console.log('✅ Соединение установлено.');

        await client.query('BEGIN');

        console.log('🧹 Очистка таблиц...');
        await client.query('TRUNCATE TABLE user_answers, process_4, process_3, process_2, process_1, executors, systems CASCADE');

        const oldTablesDir = path.join(process.cwd(), '../old_tables');

        const importTasks = [
            {
                file: 'executors_rows.sql',
                table: 'executors',
                transform: (sql) => {
                    let s = sql.replace(/"public"\./g, '')
                        .replace(/\("id", "sort", "date_created", "date_updated", "name", "note"\)/, '("id", "name", "note")');
                    // Индексы в старом SQL: 0:id, 1:sort, 2:date_created, 3:date_updated, 4:name, 5:note
                    // Нам нужны 0, 4, 5
                    return transformTuples(s, [0, 4, 5]).replace(/\(\?\?, \?\?, \?\?\)/, '("id", "name", "note")');
                }
            },
            {
                file: 'systems_rows.sql',
                table: 'systems',
                transform: (sql) => {
                    let s = sql.replace(/"public"\./g, '')
                        .replace(/\("system_id", "system_name", "is_active", "created_at", "updated_at"\)/, '("system_id", "system_name", "is_active")');
                    // Индексы: 0:system_id, 1:system_name, 2:is_active, 3:created_at, 4:updated_at
                    return transformTuples(s, [0, 1, 2]).replace(/\(\?\?, \?\?, \?\?\)/, '("system_id", "system_name", "is_active")');
                }
            },
            {
                file: 'process_1_rows.sql',
                table: 'process_1',
                transform: (sql) => {
                    let s = sql.replace(/"public"\./g, '')
                        .replace(/\("f1_index", "f1_name", "sort", "note", "is_active", "level1_id"\)/, '("f1_index", "f1_name", "sort", "note", "is_active")');
                    // Индексы: 0:f1_index, 1:f1_name, 2:sort, 3:note, 4:is_active, 5:level1_id
                    return transformTuples(s, [0, 1, 2, 3, 4]).replace(/\(\?\?, \?\?, \?\?, \?\?, \?\?\)/, '("f1_index", "f1_name", "sort", "note", "is_active")');
                }
            },
            { file: 'process_2_rows.sql', table: 'process_2', transform: s => s.replace(/"public"\./g, '') },
            { file: 'process_3_rows.sql', table: 'process_3', transform: s => s.replace(/"public"\./g, '') },
            { file: 'process_4_rows.sql', table: 'process_4', transform: s => s.replace(/"public"\./g, '') }
        ];

        for (const task of importTasks) {
            console.log(`📦 Загрузка ${task.file}...`);
            let sql = fs.readFileSync(path.join(oldTablesDir, task.file), 'utf8');
            if (task.transform) {
                sql = task.transform(sql);
            }
            await client.query(sql);
            console.log(`   ✅ ${task.table} загружена.`);
        }

        await client.query('COMMIT');
        console.log('🎉 Все данные успешно импортированы!');

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('❌ Ошибка импорта:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        if (client) await client.end();
    }
}

run();
