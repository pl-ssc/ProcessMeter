BEGIN;

UPDATE process_1 SET f1_name = 'Управление персоналом', is_active = TRUE, sort = COALESCE(sort, 2) WHERE id = 2;
DELETE FROM process_2 WHERE process_1_id = 2;

WITH
l2_1 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Организационный менеджмент', 1, NULL, TRUE)
    RETURNING id
),
l3_1_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление организационной структурой', 1, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на изменение организационной структуры', 1, NULL, TRUE, 1
    FROM l3_1_1
    RETURNING id
),
l4_1_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка проекта организационной структуры', 2, NULL, TRUE, 3
    FROM l3_1_1
    RETURNING id
),
l4_1_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование организационной структуры', 3, NULL, TRUE, 1
    FROM l3_1_1
    RETURNING id
),
l4_1_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение изменений в учетную систему', 4, NULL, TRUE, 2
    FROM l3_1_1
    RETURNING id
),
l4_1_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение документов', 5, NULL, TRUE, 2
    FROM l3_1_1
    RETURNING id
),
l3_1_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление штатным расписанием', 2, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на изменение штатного расписания', 1, NULL, TRUE, 1
    FROM l3_1_2
    RETURNING id
),
l4_1_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка обоснования и комплектности документов', 2, NULL, TRUE, 3
    FROM l3_1_2
    RETURNING id
),
l4_1_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка проекта изменений штатного расписания', 3, NULL, TRUE, 2
    FROM l3_1_2
    RETURNING id
),
l4_1_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование изменений штатного расписания', 4, NULL, TRUE, 1
    FROM l3_1_2
    RETURNING id
),
l4_1_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение изменений в учетную систему', 5, NULL, TRUE, 2
    FROM l3_1_2
    RETURNING id
),
l4_1_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование приказа и форм штатного расписания', 6, NULL, TRUE, 2
    FROM l3_1_2
    RETURNING id
),
l4_1_2_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение документов', 7, NULL, TRUE, 2
    FROM l3_1_2
    RETURNING id
),
l3_1_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Положения о подразделениях', 3, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение предложения о разработке или изменении положения', 1, NULL, TRUE, 1
    FROM l3_1_3
    RETURNING id
),
l4_1_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка проекта положения о подразделении', 2, NULL, TRUE, 3
    FROM l3_1_3
    RETURNING id
),
l4_1_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование положения о подразделении', 3, NULL, TRUE, 1
    FROM l3_1_3
    RETURNING id
),
l4_1_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников', 4, NULL, TRUE, 3
    FROM l3_1_3
    RETURNING id
),
l4_1_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение документов', 5, NULL, TRUE, 2
    FROM l3_1_3
    RETURNING id
),
l3_1_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Должности и должностные инструкции', 4, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение предложения о разработке или изменении инструкции', 1, NULL, TRUE, 1
    FROM l3_1_4
    RETURNING id
),
l4_1_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка проекта должностной инструкции', 2, NULL, TRUE, 3
    FROM l3_1_4
    RETURNING id
),
l4_1_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование и утверждение должностной инструкции', 3, NULL, TRUE, 1
    FROM l3_1_4
    RETURNING id
),
l4_1_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работника с должностной инструкцией', 4, NULL, TRUE, 3
    FROM l3_1_4
    RETURNING id
),
l4_1_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение документов', 5, NULL, TRUE, 2
    FROM l3_1_4
    RETURNING id
),
l2_2 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Кадровое администрирование', 2, NULL, TRUE)
    RETURNING id
),
l3_2_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Прием на работу', 1, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение документов от кандидата', 1, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l4_2_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка комплектности документов', 2, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l4_2_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка условий приема на работу', 3, NULL, TRUE, 2
    FROM l3_2_1
    RETURNING id
),
l4_2_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка кадровых документов', 4, NULL, TRUE, 2
    FROM l3_2_1
    RETURNING id
),
l4_2_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания документов', 5, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l4_2_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работника с локальными нормативными актами', 6, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l4_2_1_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 7, NULL, TRUE, 2
    FROM l3_2_1
    RETURNING id
),
l4_2_1_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача экземпляров документов работнику', 8, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l4_2_1_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача сведений в смежные службы', 9, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l3_2_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Изменение условий трудового договора', 2, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на изменение условий труда', 1, NULL, TRUE, 1
    FROM l3_2_2
    RETURNING id
),
l4_2_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка основания для изменения условий труда', 2, NULL, TRUE, 3
    FROM l3_2_2
    RETURNING id
),
l4_2_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка дополнительного соглашения', 3, NULL, TRUE, 2
    FROM l3_2_2
    RETURNING id
),
l4_2_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа', 4, NULL, TRUE, 2
    FROM l3_2_2
    RETURNING id
),
l4_2_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания документов', 5, NULL, TRUE, 3
    FROM l3_2_2
    RETURNING id
),
l4_2_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 6, NULL, TRUE, 2
    FROM l3_2_2
    RETURNING id
),
l3_2_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Перевод на другую работу', 3, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на перевод', 1, NULL, TRUE, 1
    FROM l3_2_3
    RETURNING id
),
l4_2_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка возможности перевода', 2, NULL, TRUE, 3
    FROM l3_2_3
    RETURNING id
),
l4_2_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка дополнительного соглашения и приказа', 3, NULL, TRUE, 2
    FROM l3_2_3
    RETURNING id
),
l4_2_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания документов', 4, NULL, TRUE, 3
    FROM l3_2_3
    RETURNING id
),
l4_2_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение записи о переводе', 5, NULL, TRUE, 2
    FROM l3_2_3
    RETURNING id
),
l4_2_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 6, NULL, TRUE, 2
    FROM l3_2_3
    RETURNING id
),
l3_2_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Расторжение трудового договора', 4, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение основания для увольнения', 1, NULL, TRUE, 3
    FROM l3_2_4
    RETURNING id
),
l4_2_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка основания и сроков увольнения', 2, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l4_2_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа об увольнении', 3, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l4_2_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l4_2_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов для окончательного расчета и выдачи', 5, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l4_2_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания и ознакомления с документами', 6, NULL, TRUE, 3
    FROM l3_2_4
    RETURNING id
),
l4_2_4_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выдача документов работнику', 7, NULL, TRUE, 3
    FROM l3_2_4
    RETURNING id
),
l4_2_4_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Закрытие кадрового события и архивирование документов', 8, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l3_2_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Сокращение численности и штата', 5, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка решения о сокращении', 1, NULL, TRUE, 1
    FROM l3_2_5
    RETURNING id
),
l4_2_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование перечня работников и вакансий', 2, NULL, TRUE, 3
    FROM l3_2_5
    RETURNING id
),
l4_2_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка уведомлений и кадровых документов', 3, NULL, TRUE, 2
    FROM l3_2_5
    RETURNING id
),
l4_2_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление работников о сокращении', 4, NULL, TRUE, 3
    FROM l3_2_5
    RETURNING id
),
l4_2_5_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование решения и документов', 5, NULL, TRUE, 1
    FROM l3_2_5
    RETURNING id
),
l4_2_5_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление государственных органов', 6, NULL, TRUE, 2
    FROM l3_2_5
    RETURNING id
),
l4_2_5_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Оформление выплат на период трудоустройства', 7, NULL, TRUE, 2
    FROM l3_2_5
    RETURNING id
),
l4_2_5_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 8, NULL, TRUE, 2
    FROM l3_2_5
    RETURNING id
),
l3_2_6 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Дисциплинарные взыскания', 6, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_6_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение информации о нарушении', 1, NULL, TRUE, 1
    FROM l3_2_6
    RETURNING id
),
l4_2_6_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор объяснений и материалов', 2, NULL, TRUE, 3
    FROM l3_2_6
    RETURNING id
),
l4_2_6_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка проекта взыскания', 3, NULL, TRUE, 2
    FROM l3_2_6
    RETURNING id
),
l4_2_6_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование и подписание документов', 4, NULL, TRUE, 1
    FROM l3_2_6
    RETURNING id
),
l4_2_6_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работника с документами', 5, NULL, TRUE, 3
    FROM l3_2_6
    RETURNING id
),
l4_2_6_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 6, NULL, TRUE, 2
    FROM l3_2_6
    RETURNING id
),
l3_2_7 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Отстранение работника от работы', 7, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_7_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение основания для отстранения', 1, NULL, TRUE, 1
    FROM l3_2_7
    RETURNING id
),
l4_2_7_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка основания для отстранения', 2, NULL, TRUE, 3
    FROM l3_2_7
    RETURNING id
),
l4_2_7_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа об отстранении', 3, NULL, TRUE, 2
    FROM l3_2_7
    RETURNING id
),
l4_2_7_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работника с приказом', 4, NULL, TRUE, 3
    FROM l3_2_7
    RETURNING id
),
l4_2_7_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 5, NULL, TRUE, 2
    FROM l3_2_7
    RETURNING id
),
l3_2_8 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Договоры гражданско-правового характера', 8, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_8_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на оформление договора', 1, NULL, TRUE, 1
    FROM l3_2_8
    RETURNING id
),
l4_2_8_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка проекта договора', 2, NULL, TRUE, 2
    FROM l3_2_8
    RETURNING id
),
l4_2_8_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания договора', 3, NULL, TRUE, 3
    FROM l3_2_8
    RETURNING id
),
l4_2_8_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение кадровых данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_2_8
    RETURNING id
),
l4_2_8_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача данных в бухгалтерию для расчетов по договору', 5, NULL, TRUE, 3
    FROM l3_2_8
    RETURNING id
),
l3_2_9 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Трудовые книжки и сведения о трудовой деятельности', 9, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_9_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение записей в трудовую книжку и сведения о трудовой деятельности', 1, NULL, TRUE, 2
    FROM l3_2_9
    RETURNING id
),
l4_2_9_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Оформление вкладыша или дубликата', 2, NULL, TRUE, 2
    FROM l3_2_9
    RETURNING id
),
l4_2_9_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка сведений о трудовой деятельности и кадровых справок', 3, NULL, TRUE, 2
    FROM l3_2_9
    RETURNING id
),
l4_2_9_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выдача документов работнику', 4, NULL, TRUE, 3
    FROM l3_2_9
    RETURNING id
),
l4_2_9_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение учетных форм и документов', 5, NULL, TRUE, 2
    FROM l3_2_9
    RETURNING id
),
l3_2_10 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Кадровые запросы и обращения работников', 10, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_10_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием запроса работника', 1, NULL, TRUE, 3
    FROM l3_2_10
    RETURNING id
),
l4_2_10_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка основания и состава документов', 2, NULL, TRUE, 3
    FROM l3_2_10
    RETURNING id
),
l4_2_10_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка справок и копий документов', 3, NULL, TRUE, 2
    FROM l3_2_10
    RETURNING id
),
l4_2_10_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Регистрация и подписание ответа', 4, NULL, TRUE, 2
    FROM l3_2_10
    RETURNING id
),
l4_2_10_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выдача ответа работнику', 5, NULL, TRUE, 3
    FROM l3_2_10
    RETURNING id
),
l3_2_11 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление отпусков по беременности и родам и по уходу за ребенком', 11, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_11_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием документов от работника', 1, NULL, TRUE, 3
    FROM l3_2_11
    RETURNING id
),
l4_2_11_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка оснований и сроков', 2, NULL, TRUE, 2
    FROM l3_2_11
    RETURNING id
),
l4_2_11_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа и кадровых документов', 3, NULL, TRUE, 2
    FROM l3_2_11
    RETURNING id
),
l4_2_11_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_2_11
    RETURNING id
),
l4_2_11_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача сведений для расчета пособий', 5, NULL, TRUE, 2
    FROM l3_2_11
    RETURNING id
),
l4_2_11_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Консультирование работника', 6, NULL, TRUE, 3
    FROM l3_2_11
    RETURNING id
),
l3_2_12 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Возврат работника после длительного отсутствия', 12, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_12_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение уведомления о выходе работника', 1, NULL, TRUE, 3
    FROM l3_2_12
    RETURNING id
),
l4_2_12_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка даты и условий выхода', 2, NULL, TRUE, 3
    FROM l3_2_12
    RETURNING id
),
l4_2_12_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка кадровых документов', 3, NULL, TRUE, 2
    FROM l3_2_12
    RETURNING id
),
l4_2_12_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_2_12
    RETURNING id
),
l4_2_12_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Информирование работника и руководителя', 5, NULL, TRUE, 3
    FROM l3_2_12
    RETURNING id
),
l3_2_13 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Медосмотры работников', 13, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_13_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование перечня работников для медосмотра', 1, NULL, TRUE, 3
    FROM l3_2_13
    RETURNING id
),
l4_2_13_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка направлений на медосмотр', 2, NULL, TRUE, 2
    FROM l3_2_13
    RETURNING id
),
l4_2_13_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выдача направлений работникам', 3, NULL, TRUE, 3
    FROM l3_2_13
    RETURNING id
),
l4_2_13_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль прохождения медосмотра', 4, NULL, TRUE, 3
    FROM l3_2_13
    RETURNING id
),
l4_2_13_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение результатов в учетную систему', 5, NULL, TRUE, 2
    FROM l3_2_13
    RETURNING id
),
l4_2_13_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача сведений смежным функциям', 6, NULL, TRUE, 3
    FROM l3_2_13
    RETURNING id
),
l3_2_14 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Специальная оценка условий труда', 14, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_14_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование перечня рабочих мест', 1, NULL, TRUE, 3
    FROM l3_2_14
    RETURNING id
),
l4_2_14_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка материалов для специальной оценки условий труда', 2, NULL, TRUE, 2
    FROM l3_2_14
    RETURNING id
),
l4_2_14_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование результатов специальной оценки условий труда', 3, NULL, TRUE, 1
    FROM l3_2_14
    RETURNING id
),
l4_2_14_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с результатами', 4, NULL, TRUE, 3
    FROM l3_2_14
    RETURNING id
),
l4_2_14_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 5, NULL, TRUE, 2
    FROM l3_2_14
    RETURNING id
),
l2_3 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Рабочее время, отпуска и отсутствия', 3, NULL, TRUE)
    RETURNING id
),
l3_3_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Командирование работников', 1, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на командировку', 1, NULL, TRUE, 1
    FROM l3_3_1
    RETURNING id
),
l4_3_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и оформление командировки', 2, NULL, TRUE, 3
    FROM l3_3_1
    RETURNING id
),
l4_3_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа о командировке', 3, NULL, TRUE, 2
    FROM l3_3_1
    RETURNING id
),
l4_3_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания и ознакомления', 4, NULL, TRUE, 3
    FROM l3_3_1
    RETURNING id
),
l4_3_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 5, NULL, TRUE, 2
    FROM l3_3_1
    RETURNING id
),
l3_3_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Нетрудоспособность работников', 2, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение информации о листке нетрудоспособности', 1, NULL, TRUE, 3
    FROM l3_3_2
    RETURNING id
),
l4_3_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка данных по нетрудоспособности', 2, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l4_3_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 3, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l4_3_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача сведений в бухгалтерию для расчета пособия', 4, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l4_3_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Работа с уточнениями и извещениями', 5, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l3_3_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'График отпусков', 3, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор предложений по графику отпусков', 1, NULL, TRUE, 1
    FROM l3_3_3
    RETURNING id
),
l4_3_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и консолидация графика отпусков', 2, NULL, TRUE, 3
    FROM l3_3_3
    RETURNING id
),
l4_3_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование проекта графика отпусков', 3, NULL, TRUE, 2
    FROM l3_3_3
    RETURNING id
),
l4_3_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование и утверждение графика отпусков', 4, NULL, TRUE, 1
    FROM l3_3_3
    RETURNING id
),
l4_3_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Загрузка графика отпусков в учетную систему', 5, NULL, TRUE, 2
    FROM l3_3_3
    RETURNING id
),
l4_3_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с графиком отпусков', 6, NULL, TRUE, 3
    FROM l3_3_3
    RETURNING id
),
l3_3_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление отпусков', 4, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием заявления или основания на отпуск', 1, NULL, TRUE, 3
    FROM l3_3_4
    RETURNING id
),
l4_3_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка права на отпуск и соответствия графику', 2, NULL, TRUE, 2
    FROM l3_3_4
    RETURNING id
),
l4_3_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа на отпуск', 3, NULL, TRUE, 2
    FROM l3_3_4
    RETURNING id
),
l4_3_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания и ознакомления', 4, NULL, TRUE, 3
    FROM l3_3_4
    RETURNING id
),
l4_3_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 5, NULL, TRUE, 2
    FROM l3_3_4
    RETURNING id
),
l3_3_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Отзыв из отпуска и компенсация отпуска', 5, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки или заявления', 1, NULL, TRUE, 1
    FROM l3_3_5
    RETURNING id
),
l4_3_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка возможности оформления', 2, NULL, TRUE, 2
    FROM l3_3_5
    RETURNING id
),
l4_3_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа', 3, NULL, TRUE, 2
    FROM l3_3_5
    RETURNING id
),
l4_3_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания и ознакомления', 4, NULL, TRUE, 3
    FROM l3_3_5
    RETURNING id
),
l4_3_5_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 5, NULL, TRUE, 2
    FROM l3_3_5
    RETURNING id
),
l4_3_5_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Информирование работника', 6, NULL, TRUE, 3
    FROM l3_3_5
    RETURNING id
),
l3_3_6 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Графики работы и сменности', 6, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_6_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка графиков работы и сменности', 1, NULL, TRUE, 3
    FROM l3_3_6
    RETURNING id
),
l4_3_6_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и корректировка графиков', 2, NULL, TRUE, 3
    FROM l3_3_6
    RETURNING id
),
l4_3_6_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование графиков', 3, NULL, TRUE, 1
    FROM l3_3_6
    RETURNING id
),
l4_3_6_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Загрузка графиков в учетную систему', 4, NULL, TRUE, 2
    FROM l3_3_6
    RETURNING id
),
l4_3_6_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с графиками', 5, NULL, TRUE, 3
    FROM l3_3_6
    RETURNING id
),
l3_3_7 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Табельный учет рабочего времени', 7, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_7_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование первичных данных по рабочему времени', 1, NULL, TRUE, 1
    FROM l3_3_7
    RETURNING id
),
l4_3_7_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием табелей и подтверждающих документов', 2, NULL, TRUE, 3
    FROM l3_3_7
    RETURNING id
),
l4_3_7_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и корректировка табелей', 3, NULL, TRUE, 3
    FROM l3_3_7
    RETURNING id
),
l4_3_7_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_3_7
    RETURNING id
),
l4_3_7_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование табеля учета рабочего времени', 5, NULL, TRUE, 2
    FROM l3_3_7
    RETURNING id
),
l4_3_7_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание табеля учета рабочего времени', 6, NULL, TRUE, 1
    FROM l3_3_7
    RETURNING id
),
l4_3_7_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение табелей и документов', 7, NULL, TRUE, 2
    FROM l3_3_7
    RETURNING id
),
l3_3_8 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Работа в выходные, праздники и сверхурочно', 8, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_8_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки и обоснования', 1, NULL, TRUE, 1
    FROM l3_3_8
    RETURNING id
),
l4_3_8_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка оснований и согласий работников', 2, NULL, TRUE, 3
    FROM l3_3_8
    RETURNING id
),
l4_3_8_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка распорядительного документа', 3, NULL, TRUE, 2
    FROM l3_3_8
    RETURNING id
),
l4_3_8_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_3_8
    RETURNING id
),
l3_3_9 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Режимы неполного рабочего времени и простои', 9, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_9_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка решения о введении режима', 1, NULL, TRUE, 1
    FROM l3_3_9
    RETURNING id
),
l4_3_9_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка уведомлений и документов', 2, NULL, TRUE, 2
    FROM l3_3_9
    RETURNING id
),
l4_3_9_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников', 3, NULL, TRUE, 3
    FROM l3_3_9
    RETURNING id
),
l4_3_9_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_3_9
    RETURNING id
),
l2_4 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Подбор и адаптация персонала', 4, NULL, TRUE)
    RETURNING id
),
l3_4_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Подбор персонала', 1, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l4_4_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на подбор', 1, NULL, TRUE, 1
    FROM l3_4_1
    RETURNING id
),
l4_4_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка заявки на подбор', 2, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l4_4_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Поиск кандидатов', 3, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l4_4_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Первичный отбор кандидатов', 4, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l4_4_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация интервью с кандидатами', 5, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l4_4_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение профильного интервью', 6, NULL, TRUE, 1
    FROM l3_4_1
    RETURNING id
),
l4_4_1_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование кандидатуры', 7, NULL, TRUE, 1
    FROM l3_4_1
    RETURNING id
),
l4_4_1_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложения кандидату', 8, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l4_4_1_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор документов кандидата', 9, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l4_4_1_10 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ведение базы кандидатов', 10, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l3_4_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Внутренние перемещения и карьерные переходы', 2, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l4_4_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на внутреннее перемещение', 1, NULL, TRUE, 1
    FROM l3_4_2
    RETURNING id
),
l4_4_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Поиск внутренних кандидатов', 2, NULL, TRUE, 3
    FROM l3_4_2
    RETURNING id
),
l4_4_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация оценки кандидатов', 3, NULL, TRUE, 3
    FROM l3_4_2
    RETURNING id
),
l4_4_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование перехода', 4, NULL, TRUE, 1
    FROM l3_4_2
    RETURNING id
),
l4_4_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложения работнику', 5, NULL, TRUE, 3
    FROM l3_4_2
    RETURNING id
),
l4_4_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача данных для кадрового оформления', 6, NULL, TRUE, 2
    FROM l3_4_2
    RETURNING id
),
l3_4_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Адаптация персонала', 3, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l4_4_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование плана адаптации', 1, NULL, TRUE, 3
    FROM l3_4_3
    RETURNING id
),
l4_4_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Назначение ответственных за адаптацию', 2, NULL, TRUE, 1
    FROM l3_4_3
    RETURNING id
),
l4_4_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация вводных мероприятий', 3, NULL, TRUE, 3
    FROM l3_4_3
    RETURNING id
),
l4_4_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль прохождения испытательного срока', 4, NULL, TRUE, 1
    FROM l3_4_3
    RETURNING id
),
l4_4_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подведение итогов адаптации', 5, NULL, TRUE, 1
    FROM l3_4_3
    RETURNING id
),
l2_5 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Обучение и развитие персонала', 5, NULL, TRUE)
    RETURNING id
),
l3_5_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Организация обязательного обучения', 1, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l4_5_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование перечня работников для обязательного обучения', 1, NULL, TRUE, 3
    FROM l3_5_1
    RETURNING id
),
l4_5_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация обязательного обучения', 2, NULL, TRUE, 3
    FROM l3_5_1
    RETURNING id
),
l4_5_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль сроков прохождения обязательного обучения', 3, NULL, TRUE, 3
    FROM l3_5_1
    RETURNING id
),
l4_5_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение результатов обучения в учетную систему', 4, NULL, TRUE, 2
    FROM l3_5_1
    RETURNING id
),
l3_5_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Организация обучения и повышения квалификации', 2, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l4_5_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор потребности в обучении', 1, NULL, TRUE, 1
    FROM l3_5_2
    RETURNING id
),
l4_5_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование групп и графика обучения', 2, NULL, TRUE, 3
    FROM l3_5_2
    RETURNING id
),
l4_5_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация обучения', 3, NULL, TRUE, 3
    FROM l3_5_2
    RETURNING id
),
l4_5_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов по обучению', 4, NULL, TRUE, 2
    FROM l3_5_2
    RETURNING id
),
l4_5_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 5, NULL, TRUE, 2
    FROM l3_5_2
    RETURNING id
),
l4_5_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор обратной связи по итогам обучения', 6, NULL, TRUE, 3
    FROM l3_5_2
    RETURNING id
),
l3_5_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Кадровый резерв и планы развития', 3, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l4_5_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование списка кандидатов в кадровый резерв', 1, NULL, TRUE, 1
    FROM l3_5_3
    RETURNING id
),
l4_5_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование состава кадрового резерва', 2, NULL, TRUE, 1
    FROM l3_5_3
    RETURNING id
),
l4_5_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка планов развития', 3, NULL, TRUE, 3
    FROM l3_5_3
    RETURNING id
),
l4_5_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль выполнения планов развития', 4, NULL, TRUE, 3
    FROM l3_5_3
    RETURNING id
),
l2_6 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Оплата труда, льготы и мотивация', 6, NULL, TRUE)
    RETURNING id
),
l3_6_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Премирование, доплаты и надбавки', 1, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение оснований для премирования, доплат и надбавок', 1, NULL, TRUE, 1
    FROM l3_6_1
    RETURNING id
),
l4_6_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и консолидация оснований', 2, NULL, TRUE, 3
    FROM l3_6_1
    RETURNING id
),
l4_6_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказов и реестров', 3, NULL, TRUE, 2
    FROM l3_6_1
    RETURNING id
),
l4_6_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование выплат', 4, NULL, TRUE, 1
    FROM l3_6_1
    RETURNING id
),
l4_6_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача данных в бухгалтерию для расчета', 5, NULL, TRUE, 3
    FROM l3_6_1
    RETURNING id
),
l4_6_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Информирование работников', 6, NULL, TRUE, 3
    FROM l3_6_1
    RETURNING id
),
l3_6_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Индексация заработной платы', 2, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложений по индексации', 1, NULL, TRUE, 1
    FROM l3_6_2
    RETURNING id
),
l4_6_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов по индексации', 2, NULL, TRUE, 2
    FROM l3_6_2
    RETURNING id
),
l4_6_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация подписания дополнительных соглашений', 3, NULL, TRUE, 3
    FROM l3_6_2
    RETURNING id
),
l4_6_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача данных в бухгалтерию для расчета и отражения', 4, NULL, TRUE, 3
    FROM l3_6_2
    RETURNING id
),
l4_6_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль завершения оформления', 5, NULL, TRUE, 2
    FROM l3_6_2
    RETURNING id
),
l3_6_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Зарплатный проект', 3, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием заявлений работников', 1, NULL, TRUE, 3
    FROM l3_6_3
    RETURNING id
),
l4_6_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка банковских реквизитов', 2, NULL, TRUE, 3
    FROM l3_6_3
    RETURNING id
),
l4_6_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование реестра для банка', 3, NULL, TRUE, 2
    FROM l3_6_3
    RETURNING id
),
l4_6_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача реестра в банк', 4, NULL, TRUE, 2
    FROM l3_6_3
    RETURNING id
),
l4_6_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Обновление реквизитов работников в учетной системе', 5, NULL, TRUE, 2
    FROM l3_6_3
    RETURNING id
),
l3_6_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Льготы и социальные программы', 4, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием заявлений работников', 1, NULL, TRUE, 3
    FROM l3_6_4
    RETURNING id
),
l4_6_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка подтверждающих документов', 2, NULL, TRUE, 3
    FROM l3_6_4
    RETURNING id
),
l4_6_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка решений и приказов', 3, NULL, TRUE, 2
    FROM l3_6_4
    RETURNING id
),
l4_6_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в учетную систему', 4, NULL, TRUE, 2
    FROM l3_6_4
    RETURNING id
),
l4_6_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ведение списков льготных категорий', 5, NULL, TRUE, 2
    FROM l3_6_4
    RETURNING id
),
l4_6_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка ответов по запросам работников', 6, NULL, TRUE, 3
    FROM l3_6_4
    RETURNING id
),
l3_6_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Нематериальная мотивация и награждение', 5, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор предложений на награждение', 1, NULL, TRUE, 1
    FROM l3_6_5
    RETURNING id
),
l4_6_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов на награждение', 2, NULL, TRUE, 3
    FROM l3_6_5
    RETURNING id
),
l4_6_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа о награждении', 3, NULL, TRUE, 2
    FROM l3_6_5
    RETURNING id
),
l4_6_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация мероприятий и поздравлений', 4, NULL, TRUE, 3
    FROM l3_6_5
    RETURNING id
),
l4_6_5_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение сведений о наградах', 5, NULL, TRUE, 2
    FROM l3_6_5
    RETURNING id
),
l2_7 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Отчетность и обязательные уведомления', 7, NULL, TRUE)
    RETURNING id
),
l3_7_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Воинский учет', 1, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ведение данных по воинскому учету', 1, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l4_7_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка уведомлений о приеме и увольнении', 2, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l4_7_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка сведений об изменении данных работников', 3, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l4_7_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка данных с военным комиссариатом', 4, NULL, TRUE, 3
    FROM l3_7_1
    RETURNING id
),
l4_7_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка планов и отчетов по воинскому учету', 5, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l4_7_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление работников о вызовах', 6, NULL, TRUE, 3
    FROM l3_7_1
    RETURNING id
),
l4_7_1_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Бронирование граждан', 7, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l4_7_1_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение документов', 8, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l3_7_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Персонифицированный учет ПФР и назначение пенсий', 2, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка справок и копий документов', 1, NULL, TRUE, 3
    FROM l3_7_2
    RETURNING id
),
l4_7_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка сведений персонифицированного учета', 2, NULL, TRUE, 2
    FROM l3_7_2
    RETURNING id
),
l4_7_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача сведений в ПФР', 3, NULL, TRUE, 2
    FROM l3_7_2
    RETURNING id
),
l4_7_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов по льготному стажу', 4, NULL, TRUE, 2
    FROM l3_7_2
    RETURNING id
),
l4_7_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ведение перечней льготных рабочих мест', 5, NULL, TRUE, 2
    FROM l3_7_2
    RETURNING id
),
l4_7_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Консультирование работников по пенсионным вопросам', 6, NULL, TRUE, 3
    FROM l3_7_2
    RETURNING id
),
l3_7_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Уведомление ФМС о движении иностранцев', 3, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение данных по иностранному работнику', 1, NULL, TRUE, 3
    FROM l3_7_3
    RETURNING id
),
l4_7_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка уведомления', 2, NULL, TRUE, 2
    FROM l3_7_3
    RETURNING id
),
l4_7_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Направление уведомления в ФМС', 3, NULL, TRUE, 2
    FROM l3_7_3
    RETURNING id
),
l4_7_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение подтверждающих документов', 4, NULL, TRUE, 2
    FROM l3_7_3
    RETURNING id
),
l3_7_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Направление уведомлений в ФССП', 4, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение исполнительного документа', 1, NULL, TRUE, 3
    FROM l3_7_4
    RETURNING id
),
l4_7_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и регистрация исполнительного документа', 2, NULL, TRUE, 2
    FROM l3_7_4
    RETURNING id
),
l4_7_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка и направление уведомления в ФССП', 3, NULL, TRUE, 2
    FROM l3_7_4
    RETURNING id
),
l4_7_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение документов и контроль сроков', 4, NULL, TRUE, 2
    FROM l3_7_4
    RETURNING id
),
l3_7_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Отчетность в ЦЗН о квотировании рабочих мест для инвалидов', 5, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор данных для отчетности', 1, NULL, TRUE, 2
    FROM l3_7_5
    RETURNING id
),
l4_7_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка отчетности', 2, NULL, TRUE, 2
    FROM l3_7_5
    RETURNING id
),
l4_7_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Направление отчетности в ЦЗН', 3, NULL, TRUE, 2
    FROM l3_7_5
    RETURNING id
),
l4_7_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Хранение подтверждающих документов', 4, NULL, TRUE, 2
    FROM l3_7_5
    RETURNING id
),
l3_7_6 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Законодательная отчетность', 6, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_6_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор данных для законодательной отчетности', 1, NULL, TRUE, 2
    FROM l3_7_6
    RETURNING id
),
l4_7_6_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование законодательной отчетности', 2, NULL, TRUE, 2
    FROM l3_7_6
    RETURNING id
),
l4_7_6_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка законодательной отчетности', 3, NULL, TRUE, 2
    FROM l3_7_6
    RETURNING id
),
l4_7_6_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Направление законодательной отчетности', 4, NULL, TRUE, 2
    FROM l3_7_6
    RETURNING id
),
l4_7_6_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль сроков и полноты отчетности', 5, NULL, TRUE, 2
    FROM l3_7_6
    RETURNING id
),
l3_7_7 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Проверки и запросы контролирующих органов', 7, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_7_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение запроса или предписания', 1, NULL, TRUE, 3
    FROM l3_7_7
    RETURNING id
),
l4_7_7_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка комплекта документов', 2, NULL, TRUE, 2
    FROM l3_7_7
    RETURNING id
),
l4_7_7_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений и ответов', 3, NULL, TRUE, 2
    FROM l3_7_7
    RETURNING id
),
l4_7_7_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Координация отправки ответа', 4, NULL, TRUE, 3
    FROM l3_7_7
    RETURNING id
),
l2_8 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Управление HR-функцией и методология', 8, NULL, TRUE)
    RETURNING id
),
l3_8_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Политики и регламенты по управлению персоналом', 1, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложений по изменению политик и регламентов', 1, NULL, TRUE, 1
    FROM l3_8_1
    RETURNING id
),
l4_8_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка проектов документов', 2, NULL, TRUE, 1
    FROM l3_8_1
    RETURNING id
),
l4_8_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование и утверждение документов', 3, NULL, TRUE, 1
    FROM l3_8_1
    RETURNING id
),
l4_8_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Доведение изменений до исполнителей', 4, NULL, TRUE, 3
    FROM l3_8_1
    RETURNING id
),
l3_8_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Планирование подбора персонала', 2, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор потребности в подборе персонала', 1, NULL, TRUE, 1
    FROM l3_8_2
    RETURNING id
),
l4_8_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Консолидация потребности в подборе', 2, NULL, TRUE, 3
    FROM l3_8_2
    RETURNING id
),
l4_8_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование плана подбора персонала', 3, NULL, TRUE, 1
    FROM l3_8_2
    RETURNING id
),
l4_8_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Мониторинг исполнения плана подбора', 4, NULL, TRUE, 3
    FROM l3_8_2
    RETURNING id
),
l3_8_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Планирование обучения персонала', 3, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор потребности в обучении персонала', 1, NULL, TRUE, 1
    FROM l3_8_3
    RETURNING id
),
l4_8_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование плана обучения персонала', 2, NULL, TRUE, 1
    FROM l3_8_3
    RETURNING id
),
l4_8_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование плана и бюджета обучения', 3, NULL, TRUE, 1
    FROM l3_8_3
    RETURNING id
),
l4_8_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль исполнения плана обучения', 4, NULL, TRUE, 3
    FROM l3_8_3
    RETURNING id
),
l3_8_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление системой оплаты труда и мотивации', 4, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Анализ рынка и внутренних данных по оплате труда', 1, NULL, TRUE, 1
    FROM l3_8_4
    RETURNING id
),
l4_8_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложений по системе оплаты труда', 2, NULL, TRUE, 1
    FROM l3_8_4
    RETURNING id
),
l4_8_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка и актуализация положений по оплате труда и мотивации', 3, NULL, TRUE, 1
    FROM l3_8_4
    RETURNING id
),
l4_8_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Настройка видов начислений в системе', 4, NULL, TRUE, 2
    FROM l3_8_4
    RETURNING id
),
l4_8_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Доведение изменений до исполнителей', 5, NULL, TRUE, 3
    FROM l3_8_4
    RETURNING id
),
l3_8_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление эффективностью деятельности работников', 5, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка правил оценки деятельности работников', 1, NULL, TRUE, 1
    FROM l3_8_5
    RETURNING id
),
l4_8_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Настройка цикла оценки деятельности', 2, NULL, TRUE, 1
    FROM l3_8_5
    RETURNING id
),
l4_8_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Консультационная поддержка руководителей', 3, NULL, TRUE, 3
    FROM l3_8_5
    RETURNING id
),
l4_8_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка сводных результатов оценки', 4, NULL, TRUE, 2
    FROM l3_8_5
    RETURNING id
),
l3_8_6 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Бюджетирование численности и расходов на персонал', 6, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_6_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор исходных данных для бюджета', 1, NULL, TRUE, 1
    FROM l3_8_6
    RETURNING id
),
l4_8_6_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование бюджета численности и расходов на персонал', 2, NULL, TRUE, 1
    FROM l3_8_6
    RETURNING id
),
l4_8_6_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование бюджета', 3, NULL, TRUE, 1
    FROM l3_8_6
    RETURNING id
),
l4_8_6_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Мониторинг исполнения бюджета', 4, NULL, TRUE, 2
    FROM l3_8_6
    RETURNING id
),
l4_8_6_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Факторный анализ отклонений', 5, NULL, TRUE, 2
    FROM l3_8_6
    RETURNING id
),
l3_8_7 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управленческая отчетность и аналитика по персоналу', 7, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_7_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка регулярной управленческой отчетности', 1, NULL, TRUE, 2
    FROM l3_8_7
    RETURNING id
),
l4_8_7_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка аналитических материалов', 2, NULL, TRUE, 2
    FROM l3_8_7
    RETURNING id
),
l4_8_7_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка разовой отчетности по запросу', 3, NULL, TRUE, 2
    FROM l3_8_7
    RETURNING id
),
l4_8_7_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Представление результатов заказчикам', 4, NULL, TRUE, 3
    FROM l3_8_7
    RETURNING id
),
l3_8_8 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Правовая поддержка трудовых отношений', 8, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_8_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Консультирование по трудовым вопросам', 1, NULL, TRUE, 3
    FROM l3_8_8
    RETURNING id
),
l4_8_8_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка правовой позиции', 2, NULL, TRUE, 1
    FROM l3_8_8
    RETURNING id
),
l4_8_8_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка материалов по трудовым спорам', 3, NULL, TRUE, 1
    FROM l3_8_8
    RETURNING id
),
l4_8_8_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Взаимодействие с контролирующими и правоохранительными органами', 4, NULL, TRUE, 1
    FROM l3_8_8
    RETURNING id
),
l3_8_9 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Автоматизация HR-процессов', 9, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_9_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор и описание потребностей в автоматизации', 1, NULL, TRUE, 3
    FROM l3_8_9
    RETURNING id
),
l4_8_9_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка бизнес-требований', 2, NULL, TRUE, 1
    FROM l3_8_9
    RETURNING id
),
l4_8_9_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Постановка задач и сопровождение разработки', 3, NULL, TRUE, 1
    FROM l3_8_9
    RETURNING id
),
l4_8_9_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Приемка изменений и внедрение', 4, NULL, TRUE, 3
    FROM l3_8_9
    RETURNING id
),
l3_8_10 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Проекты развития HR-функции', 10, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_10_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование инициатив по развитию HR-функции', 1, NULL, TRUE, 1
    FROM l3_8_10
    RETURNING id
),
l4_8_10_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка плана проекта', 2, NULL, TRUE, 1
    FROM l3_8_10
    RETURNING id
),
l4_8_10_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Координация реализации проекта', 3, NULL, TRUE, 3
    FROM l3_8_10
    RETURNING id
),
l4_8_10_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Мониторинг результатов и эффектов', 4, NULL, TRUE, 1
    FROM l3_8_10
    RETURNING id
)
SELECT COUNT(*) FROM l4_8_10_4;

COMMIT;
