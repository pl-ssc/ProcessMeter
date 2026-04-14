export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
    pgm.addColumn('users', {
        roles: { type: 'text[]', notNull: false },
        active_role: { type: 'text', notNull: false },
    });

    pgm.sql(`
        UPDATE users
           SET roles = ARRAY[role],
               active_role = COALESCE(active_role, role)
         WHERE roles IS NULL OR active_role IS NULL
    `);

    pgm.alterColumn('users', 'roles', {
        notNull: true,
    });

    pgm.alterColumn('users', 'active_role', {
        notNull: true,
    });

    pgm.sql(`
        ALTER TABLE users
          ALTER COLUMN roles SET DEFAULT ARRAY['respondent']::text[],
          ALTER COLUMN active_role SET DEFAULT 'respondent'
    `);

    pgm.sql(`
        UPDATE users
           SET active_role = role
         WHERE active_role IS NULL OR NOT (active_role = ANY(roles))
    `);

    pgm.sql(`
        CREATE INDEX IF NOT EXISTS users_roles_gin_idx
        ON users USING GIN (roles)
    `);

    pgm.sql(`
        CREATE OR REPLACE VIEW view_stats_survey_progress AS
        SELECT
            COUNT(*) FILTER (WHERE is_survey_completed) as completed_count,
            COUNT(*) FILTER (WHERE roles @> ARRAY['respondent']::text[]) as total_count,
            CASE
                WHEN COUNT(*) FILTER (WHERE roles @> ARRAY['respondent']::text[]) > 0
                THEN (COUNT(*) FILTER (WHERE is_survey_completed)::numeric / COUNT(*) FILTER (WHERE roles @> ARRAY['respondent']::text[])) * 100
                ELSE 0
            END as progress_percent
        FROM users;

        CREATE OR REPLACE VIEW view_stats_average_duration AS
        SELECT
            AVG(survey_completed_at - created_at) as avg_duration_interval,
            AVG(EXTRACT(EPOCH FROM (survey_completed_at - created_at))) as avg_duration_seconds
        FROM users
        WHERE is_survey_completed = true;

        CREATE OR REPLACE VIEW view_stats_completion_trend AS
        SELECT
            DATE(survey_completed_at) as completion_date,
            COUNT(*) as completed_today
        FROM users
        WHERE is_survey_completed = true
        GROUP BY DATE(survey_completed_at)
        ORDER BY completion_date;

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
        WHERE u.roles @> ARRAY['respondent']::text[]
        ORDER BY u.full_name;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
    pgm.sql(`
        DROP VIEW IF EXISTS view_stats_respondents_detail;
        DROP VIEW IF EXISTS view_stats_completion_trend;
        DROP VIEW IF EXISTS view_stats_average_duration;
        DROP VIEW IF EXISTS view_stats_survey_progress;
    `);

    pgm.sql('DROP INDEX IF EXISTS users_roles_gin_idx;');
    pgm.dropColumn('users', 'active_role');
    pgm.dropColumn('users', 'roles');
};
