-- 1. Статистика по заполнению анкет респондентами (реал-тайм расчет времени)
CREATE OR REPLACE VIEW view_bi_respondent_stats AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.username,
    u.is_survey_completed,
    u.created_at AS invitation_at,
    (SELECT MIN(updated_at) FROM user_answers ua WHERE ua.user_id = u.id AND ua.labor_hours IS NOT NULL) AS first_answer_at,
    u.survey_completed_at AS completion_at,
    -- Время от приглашения до завершения (или до текущего момента, если не завершена) в ДНЯХ
    ROUND(EXTRACT(EPOCH FROM (COALESCE(u.survey_completed_at, now()) - u.created_at)) / 86400, 2) AS elapsed_days_since_invitation,
    -- Время активного заполнения (от первого ответа до завершения/текущего момента) в ДНЯХ
    CASE 
        WHEN (SELECT MIN(updated_at) FROM user_answers ua WHERE ua.user_id = u.id AND ua.labor_hours IS NOT NULL) IS NOT NULL 
        THEN ROUND(EXTRACT(EPOCH FROM (COALESCE(u.survey_completed_at, now()) - (SELECT MIN(updated_at) FROM user_answers ua WHERE ua.user_id = u.id AND ua.labor_hours IS NOT NULL))) / 86400, 2)
        ELSE NULL 
    END AS active_filling_days,
    (SELECT count(*) FROM user_answers ua WHERE ua.user_id = u.id) AS total_operations,
    (SELECT count(*) FROM user_answers ua WHERE ua.user_id = u.id AND ua.labor_hours IS NOT NULL) AS filled_operations,
    COALESCE(
        ROUND(
            (SELECT count(*) FROM user_answers ua WHERE ua.user_id = u.id AND ua.labor_hours IS NOT NULL)::numeric / 
            NULLIF((SELECT count(*) FROM user_answers ua WHERE ua.user_id = u.id), 0) * 100, 2
        ), 0
    ) AS completion_percentage,
    COALESCE((SELECT sum(labor_hours) FROM user_answers ua WHERE ua.user_id = u.id), 0) AS total_labor_hours -- в ЧАСАХ
FROM users u
WHERE u.role = 'respondent';

-- 2. Детальное распределение трудозатрат (добавлен фильтр по роли)
CREATE OR REPLACE VIEW view_bi_labor_distribution AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.username,
    p1.f1_name AS process_level_1,
    p2.f2_name AS process_level_2,
    p3.f3_name AS process_level_3,
    p4.f4_name AS operation_name,
    COALESCE(e.name, 'Не указан') AS executor_type,
    COALESCE(s.system_name, 'Без ИТ-системы') AS system_name,
    ua.labor_hours, -- в ЧАСАХ
    ROUND(ua.labor_hours / 165.0, 4) AS fte,
    ua.note,
    ua.updated_at AS answer_updated_at
FROM user_answers ua
JOIN users u ON u.id = ua.user_id
JOIN process_4 p4 ON p4.id = ua.process_4_id
JOIN process_3 p3 ON p3.id = p4.process_3_id
JOIN process_2 p2 ON p2.id = p3.process_2_id
JOIN process_1 p1 ON p1.id = p2.process_1_id
LEFT JOIN executors e ON e.id = p4.executor_id
LEFT JOIN systems s ON s.system_id = ua.system_id
WHERE ua.labor_hours IS NOT NULL
  AND u.role = 'respondent';

-- 3. Анализ эффективности и "узких мест" на уровне операций (добавлен фильтр по роли во вложенном JOIN)
CREATE OR REPLACE VIEW view_bi_process_efficiency AS
SELECT 
    p4.id AS operation_id,
    p1.f1_name AS process_level_1,
    p2.f2_name AS process_level_2,
    p3.f3_name AS process_level_3,
    p4.f4_name AS operation_name,
    COUNT(ua.user_id) AS total_respondents,
    ROUND(AVG(ua.labor_hours), 2) AS avg_labor_hours, -- в ЧАСАХ
    MIN(ua.labor_hours) AS min_labor_hours,
    MAX(ua.labor_hours) AS max_labor_hours,
    COUNT(ua.note) FILTER (WHERE ua.note IS NOT NULL AND ua.note <> '') AS notes_count
FROM process_4 p4
JOIN process_3 p3 ON p3.id = p4.process_3_id
JOIN process_2 p2 ON p2.id = p3.process_2_id
JOIN process_1 p1 ON p1.id = p2.process_1_id
LEFT JOIN user_answers ua ON ua.process_4_id = p4.id
LEFT JOIN users u ON u.id = ua.user_id
WHERE (u.role = 'respondent' OR u.id IS NULL)
GROUP BY p4.id, p1.f1_name, p2.f2_name, p3.f3_name, p4.f4_name;

-- 4. Агрегированные данные для прогресс-бара (общее кол-во анкет vs заполнено)
CREATE OR REPLACE VIEW view_bi_survey_progress_total AS
SELECT 
    COUNT(*) AS total_respondents,
    COUNT(*) FILTER (WHERE is_survey_completed = true) AS completed_respondents
FROM users
WHERE role = 'respondent';
