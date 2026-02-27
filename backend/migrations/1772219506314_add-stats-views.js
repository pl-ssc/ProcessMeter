/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
    // 1. Прогресс опроса
    pgm.sql(`
        CREATE OR REPLACE VIEW view_stats_survey_progress AS
        SELECT 
            COUNT(*) FILTER (WHERE is_survey_completed) as completed_count,
            COUNT(*) FILTER (WHERE role = 'respondent') as total_count,
            CASE 
                WHEN COUNT(*) FILTER (WHERE role = 'respondent') > 0 
                THEN (COUNT(*) FILTER (WHERE is_survey_completed)::numeric / COUNT(*) FILTER (WHERE role = 'respondent')) * 100
                ELSE 0 
            END as progress_percent
        FROM users;
    `);

    // 2. Среднее время завершения
    pgm.sql(`
        CREATE OR REPLACE VIEW view_stats_average_duration AS
        SELECT 
            AVG(survey_completed_at - created_at) as avg_duration_interval,
            EXTRACT(EPOCH FROM AVG(survey_completed_at - created_at)) as avg_duration_seconds
        FROM users
        WHERE is_survey_completed = true;
    `);

    // 3. Динамика завершения по датам
    pgm.sql(`
        CREATE OR REPLACE VIEW view_stats_completion_trend AS
        SELECT 
            date_trunc('day', survey_completed_at)::date as completion_date,
            COUNT(*) as completed_today
        FROM users
        WHERE is_survey_completed = true
        GROUP BY completion_date
        ORDER BY completion_date;
    `);

    // 4. Детальная информация по респондентам
    pgm.sql(`
        CREATE OR REPLACE VIEW view_stats_respondents_detail AS
        SELECT 
            u.id as user_id,
            u.full_name,
            d.name as department_name,
            u.created_at as invite_date,
            u.survey_completed_at as completed_date,
            u.is_survey_completed,
            COALESCE((SELECT SUM(labor_hours) FROM user_answers WHERE user_id = u.id), 0) as total_labor_hours
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.role = 'respondent'
        ORDER BY u.full_name;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
    pgm.sql('DROP VIEW IF EXISTS view_stats_respondents_detail;');
    pgm.sql('DROP VIEW IF EXISTS view_stats_completion_trend;');
    pgm.sql('DROP VIEW IF EXISTS view_stats_average_duration;');
    pgm.sql('DROP VIEW IF EXISTS view_stats_survey_progress;');
};
