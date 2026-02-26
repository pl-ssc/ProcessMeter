/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    // 1. Добавляем колонки в users
    pgm.addColumn('users', {
        is_survey_completed: { type: 'boolean', default: false, notNull: true },
        survey_completed_at: { type: 'timestamp with time zone' }
    });

    // 2. Переносим существующие значения
    // Если у пользователя есть хотя бы один завершенный ответ, считаем что он завершил всё
    pgm.sql(`
        UPDATE users
        SET 
            is_survey_completed = true,
            survey_completed_at = (
                SELECT MAX(done_at) 
                FROM user_answers 
                WHERE user_id = users.id AND is_done = true
            )
        WHERE EXISTS (
            SELECT 1 
            FROM user_answers 
            WHERE user_id = users.id AND is_done = true
        )
    `);

    // 3. Удаляем замененные колонки из ответов
    pgm.dropColumn('user_answers', 'is_done');
    pgm.dropColumn('user_answers', 'done_at');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.addColumn('user_answers', {
        is_done: { type: 'boolean', default: false },
        done_at: { type: 'timestamp with time zone' }
    });

    pgm.sql(`
        UPDATE user_answers
        SET 
            is_done = users.is_survey_completed,
            done_at = users.survey_completed_at
        FROM users
        WHERE user_answers.user_id = users.id AND users.is_survey_completed = true
    `);

    pgm.dropColumn('users', 'survey_completed_at');
    pgm.dropColumn('users', 'is_survey_completed');
};
