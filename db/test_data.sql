-- Insert executors
INSERT INTO executors (id, name, note) VALUES 
(1, 'Исполнитель 1', 'Тестовый исполнитель'),
(2, 'Исполнитель 2', 'Еще один тестовый исполнитель')
ON CONFLICT DO NOTHING;

-- Insert systems
INSERT INTO systems (system_name) VALUES 
('Система А'),
('Система Б')
ON CONFLICT DO NOTHING;

-- Insert process structure
-- Process 1
INSERT INTO process_1 (f1_index, f1_name, sort) VALUES 
('P1-001', 'Процесс 1.1', 1),
('P1-002', 'Процесс 1.2', 2)
ON CONFLICT DO NOTHING;

-- Process 2
INSERT INTO process_2 (f2_index, f1_index, f2_name, sort) VALUES 
('P2-001', 'P1-001', 'Подпроцесс 2.1', 1),
('P2-002', 'P1-002', 'Подпроцесс 2.2', 1)
ON CONFLICT DO NOTHING;

-- Process 3
INSERT INTO process_3 (f3_index, f2_index, f3_name, sort) VALUES 
('P3-001', 'P2-001', 'Группа 3.1', 1),
('P3-002', 'P2-002', 'Группа 3.2', 1)
ON CONFLICT DO NOTHING;

-- Process 4 (Operations)
INSERT INTO process_4 (f4_index, f3_index, f4_name, sort, executor_id) VALUES 
('OP-001', 'P3-001', 'Операция 1.1.1', 1, 1),
('OP-002', 'P3-001', 'Операция 1.1.2', 2, 2),
('OP-003', 'P3-002', 'Операция 1.2.1', 1, 1)
ON CONFLICT DO NOTHING;

-- Grant access to Admin (user_id = 1)
INSERT INTO user_process_1_access (user_id, f1_index) VALUES 
(1, 'P1-001'),
(1, 'P1-002')
ON CONFLICT (user_id, f1_index) DO NOTHING;

-- Generate answers for Admin
SELECT copy_operations_to_user_answers(1);
