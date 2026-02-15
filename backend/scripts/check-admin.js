import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const pool = new Pool({
    connectionString: process.env.TARGET_DATABASE_URL
});

async function checkAdmin() {
    try {
        const result = await pool.query('SELECT username, is_active FROM users WHERE role = $1', ['admin']);
        if (result.rows.length === 0) {
            console.log('Администратор не найден.');
        } else {
            console.log('Найдены администраторы:', result.rows);
        }
    } catch (err) {
        console.error('Ошибка при проверке администратора:', err);
    } finally {
        await pool.end();
    }
}

checkAdmin();
