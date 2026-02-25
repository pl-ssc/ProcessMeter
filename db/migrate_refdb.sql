-- 1. Удаление операционных таблиц и связанных функций из эталонной БД
-- Структура этих таблиц должна инициализироваться из кода самого приложения (через миграции или db/schema.sql)
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS user_process_1_access CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS copy_operations_to_user_answers(integer) CASCADE;

-- 2. Добавление NOT NULL ограничений для внешних ключей иерархии
ALTER TABLE process_2 ALTER COLUMN f1_index SET NOT NULL;
ALTER TABLE process_3 ALTER COLUMN f2_index SET NOT NULL;
ALTER TABLE process_4 ALTER COLUMN f3_index SET NOT NULL;

-- 3. Добавление NOT NULL ограничений для наименований
ALTER TABLE process_2 ALTER COLUMN f2_name SET NOT NULL;
ALTER TABLE process_3 ALTER COLUMN f3_name SET NOT NULL;
ALTER TABLE process_4 ALTER COLUMN f4_name SET NOT NULL;
ALTER TABLE executors ALTER COLUMN name SET NOT NULL;

-- 4. Приведение типа сортировки (sort) к единому типу integer
ALTER TABLE process_1 ALTER COLUMN sort TYPE integer;
ALTER TABLE process_2 ALTER COLUMN sort TYPE integer;
ALTER TABLE process_3 ALTER COLUMN sort TYPE integer;
ALTER TABLE process_4 ALTER COLUMN sort TYPE integer;

-- 5. Стандартизация флага is_active (boolean DEFAULT true NOT NULL)
-- Сначала заменяем возможные NULL на true во избежание ошибок
UPDATE process_1 SET is_active = true WHERE is_active IS NULL;
UPDATE process_2 SET is_active = true WHERE is_active IS NULL;
UPDATE process_3 SET is_active = true WHERE is_active IS NULL;
UPDATE process_4 SET is_active = true WHERE is_active IS NULL;

ALTER TABLE process_1 ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE process_1 ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE process_2 ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE process_2 ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE process_3 ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE process_3 ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE process_4 ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE process_4 ALTER COLUMN is_active SET NOT NULL;

-- 6. Синхронизация типов данных для исполнителей
-- Изменяем тип id в таблице executors с smallint на integer, чтобы он соответствовал process_4.executor_id
ALTER TABLE executors ALTER COLUMN id TYPE integer;
