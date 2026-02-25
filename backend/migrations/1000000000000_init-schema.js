import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const shorthands = undefined;

export const up = (pgm) => {
    const schemaPath = path.join(__dirname, '../../db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    pgm.sql(sql);
};

export const down = (pgm) => {
    pgm.sql('DROP TRIGGER IF EXISTS trg_user_answers_updated_at ON user_answers;');
    pgm.sql('DROP FUNCTION IF EXISTS set_updated_at;');
    pgm.sql('DROP FUNCTION IF EXISTS copy_operations_to_user_answers;');

    pgm.sql('DROP TABLE IF EXISTS user_answers CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS user_process_1_access CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS users CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS systems CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS process_4 CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS executors CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS process_3 CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS process_2 CASCADE;');
    pgm.sql('DROP TABLE IF EXISTS process_1 CASCADE;');
};
