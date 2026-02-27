DO $$
DECLARE
    u_id INTEGER;
    t_id INTEGER;
    i INTEGER;
    v_username TEXT;
    v_fullname TEXT;
    v_pass_hash TEXT := '$2a$10$8Vn/H1BwYJ8xK.L3K/qBvO2nO3qN5QX.kG.xYgY.v.Y.v.Y.v.Y.v'; -- 'password'
BEGIN
    FOR i IN 1..6 LOOP
        v_username := 'tester' || i || '@processlabs.ru';
        v_fullname := 'Тестовый Пользователь ' || i;
        
        -- Create user
        INSERT INTO users (username, password_hash, full_name, role)
        VALUES (v_username, v_pass_hash, v_fullname, 'respondent')
        ON CONFLICT (username) DO UPDATE SET is_active = true
        RETURNING id INTO u_id;
        
        -- Give access to all process_1
        INSERT INTO user_process_1_access (user_id, process_1_id)
        SELECT u_id, id FROM process_1
        ON CONFLICT DO NOTHING;
        
        -- Generate empty answers
        PERFORM copy_operations_to_user_answers(u_id);
        
        -- Fill random data for 50-80% of answers
        UPDATE user_answers
        SET 
            labor_hours = (random() * 4 + 0.1)::numeric(10,2),
            system_id = (SELECT system_id FROM systems ORDER BY random() LIMIT 1),
            note = 'Тестовый комментарий от пользователя ' || i,
            updated_at = now() - (random() * 2 || ' days')::interval
        WHERE user_id = u_id AND random() < 0.7;
        
        -- Mark as done for users 1 and 2
        IF i <= 2 THEN
            UPDATE users 
            SET is_survey_completed = true, survey_completed_at = now() 
            WHERE id = u_id;
        END IF;
    END LOOP;
END $$;
