BEGIN;

UPDATE process_1 SET f1_name = 'Бухгалтерский и налоговый учет', is_active = TRUE, sort = COALESCE(sort, 1) WHERE id = 1;
DELETE FROM process_2 WHERE process_1_id = 1;

WITH
l2_1 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Расчеты с поставщиками, подрядчиками и кредиторами', 1, NULL, TRUE)
    RETURNING id
),
l3_1_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Работы и услуги', 1, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку работ и услуг', 1, NULL, TRUE, 1
    FROM l3_1_1
    RETURNING id
),
l4_1_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_1_1
    RETURNING id
),
l4_1_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_1_1
    RETURNING id
),
l4_1_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_1_1
    RETURNING id
),
l4_1_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_1_1
    RETURNING id
),
l4_1_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_1_1
    RETURNING id
),
l3_1_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Авансы выданные', 2, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку авансов выданных', 1, NULL, TRUE, 1
    FROM l3_1_2
    RETURNING id
),
l4_1_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_1_2
    RETURNING id
),
l4_1_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 3, NULL, TRUE, 2
    FROM l3_1_2
    RETURNING id
),
l4_1_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 4, NULL, TRUE, 2
    FROM l3_1_2
    RETURNING id
),
l4_1_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_1_2
    RETURNING id
),
l3_1_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Расходы будущих периодов', 3, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку расходов будущих периодов', 1, NULL, TRUE, 1
    FROM l3_1_3
    RETURNING id
),
l4_1_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_1_3
    RETURNING id
),
l4_1_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 3, NULL, TRUE, 2
    FROM l3_1_3
    RETURNING id
),
l4_1_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 4, NULL, TRUE, 2
    FROM l3_1_3
    RETURNING id
),
l4_1_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_1_3
    RETURNING id
),
l3_1_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Прочие кредиторы и взаиморасчеты', 4, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l4_1_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку прочих кредиторов и взаиморасчетов', 1, NULL, TRUE, 1
    FROM l3_1_4
    RETURNING id
),
l4_1_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_1_4
    RETURNING id
),
l4_1_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_1_4
    RETURNING id
),
l4_1_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_1_4
    RETURNING id
),
l4_1_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_1_4
    RETURNING id
),
l4_1_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_1_4
    RETURNING id
),
l2_2 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Расчеты с покупателями, заказчиками и дебиторами', 2, NULL, TRUE)
    RETURNING id
),
l3_2_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Реализация товаров, работ и услуг', 1, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку реализации товаров, работ и услуг', 1, NULL, TRUE, 1
    FROM l3_2_1
    RETURNING id
),
l4_2_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l4_2_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_2_1
    RETURNING id
),
l4_2_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_2_1
    RETURNING id
),
l4_2_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_2_1
    RETURNING id
),
l4_2_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_2_1
    RETURNING id
),
l3_2_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Авансы полученные и доходы будущих периодов', 2, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку авансов полученных и доходов будущих периодов', 1, NULL, TRUE, 1
    FROM l3_2_2
    RETURNING id
),
l4_2_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_2_2
    RETURNING id
),
l4_2_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 3, NULL, TRUE, 2
    FROM l3_2_2
    RETURNING id
),
l4_2_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 4, NULL, TRUE, 2
    FROM l3_2_2
    RETURNING id
),
l4_2_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_2_2
    RETURNING id
),
l3_2_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Прочая дебиторская задолженность и претензии', 3, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку прочей дебиторской задолженности и претензий', 1, NULL, TRUE, 1
    FROM l3_2_3
    RETURNING id
),
l4_2_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_2_3
    RETURNING id
),
l4_2_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_2_3
    RETURNING id
),
l4_2_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_2_3
    RETURNING id
),
l4_2_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_2_3
    RETURNING id
),
l4_2_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_2_3
    RETURNING id
),
l3_2_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Списание безнадежной задолженности', 4, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l4_2_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подтверждение оснований для списания задолженности', 1, NULL, TRUE, 1
    FROM l3_2_4
    RETURNING id
),
l4_2_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка документов по списанию задолженности', 2, NULL, TRUE, 3
    FROM l3_2_4
    RETURNING id
),
l4_2_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов на списание задолженности', 3, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l4_2_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение списания задолженности в учетной системе', 4, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l4_2_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_2_4
    RETURNING id
),
l2_3 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Банковские, казначейские, кассовые и подотчетные операции', 3, NULL, TRUE)
    RETURNING id
),
l3_3_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Осуществление платежей', 1, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка заявки на платеж', 1, NULL, TRUE, 1
    FROM l3_3_1
    RETURNING id
),
l4_3_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка платежных документов', 2, NULL, TRUE, 3
    FROM l3_3_1
    RETURNING id
),
l4_3_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование платежных документов', 3, NULL, TRUE, 2
    FROM l3_3_1
    RETURNING id
),
l4_3_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование платежа', 4, NULL, TRUE, 1
    FROM l3_3_1
    RETURNING id
),
l4_3_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отправка платежа', 5, NULL, TRUE, 2
    FROM l3_3_1
    RETURNING id
),
l4_3_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение платежа в учетной системе', 6, NULL, TRUE, 2
    FROM l3_3_1
    RETURNING id
),
l3_3_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Обработка банковской выписки', 2, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение банковской выписки', 1, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l4_3_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка банковской выписки', 2, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l4_3_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разнесение операций по выписке', 3, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l4_3_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уточнение неидентифицированных операций', 4, NULL, TRUE, 3
    FROM l3_3_2
    RETURNING id
),
l4_3_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение банковских операций в учетной системе', 5, NULL, TRUE, 2
    FROM l3_3_2
    RETURNING id
),
l3_3_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Кассовые операции', 3, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка кассовых документов', 1, NULL, TRUE, 3
    FROM l3_3_3
    RETURNING id
),
l4_3_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка кассовых документов', 2, NULL, TRUE, 3
    FROM l3_3_3
    RETURNING id
),
l4_3_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение кассовых операций в учетной системе', 3, NULL, TRUE, 2
    FROM l3_3_3
    RETURNING id
),
l4_3_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль остатков и кассовой дисциплины', 4, NULL, TRUE, 2
    FROM l3_3_3
    RETURNING id
),
l4_3_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_3_3
    RETURNING id
),
l3_3_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Расчеты с подотчетными лицами', 4, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l4_3_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявки на выдачу денежных средств под отчет', 1, NULL, TRUE, 1
    FROM l3_3_4
    RETURNING id
),
l4_3_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка заявки и подтверждающих документов', 2, NULL, TRUE, 3
    FROM l3_3_4
    RETURNING id
),
l4_3_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Оформление выдачи денежных средств', 3, NULL, TRUE, 2
    FROM l3_3_4
    RETURNING id
),
l4_3_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка авансового отчета', 4, NULL, TRUE, 3
    FROM l3_3_4
    RETURNING id
),
l4_3_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение расчетов с подотчетными лицами в учетной системе', 5, NULL, TRUE, 2
    FROM l3_3_4
    RETURNING id
),
l4_3_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль закрытия подотчета', 6, NULL, TRUE, 2
    FROM l3_3_4
    RETURNING id
),
l2_4 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Расчеты с персоналом и физическими лицами', 4, NULL, TRUE)
    RETURNING id
),
l3_4_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Расчет заработной платы и вознаграждений по договорам', 1, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l4_4_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение исходных данных для расчета', 1, NULL, TRUE, 1
    FROM l3_4_1
    RETURNING id
),
l4_4_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка исходных данных для расчета', 2, NULL, TRUE, 3
    FROM l3_4_1
    RETURNING id
),
l4_4_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет начислений работникам и физическим лицам', 3, NULL, TRUE, 2
    FROM l3_4_1
    RETURNING id
),
l4_4_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение начислений в учетной системе', 4, NULL, TRUE, 2
    FROM l3_4_1
    RETURNING id
),
l4_4_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка расчетных регистров', 5, NULL, TRUE, 2
    FROM l3_4_1
    RETURNING id
),
l4_4_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для выплаты', 6, NULL, TRUE, 2
    FROM l3_4_1
    RETURNING id
),
l3_4_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Пособия и выплаты социального характера', 2, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l4_4_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение оснований для выплаты', 1, NULL, TRUE, 1
    FROM l3_4_2
    RETURNING id
),
l4_4_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка документов по выплате', 2, NULL, TRUE, 3
    FROM l3_4_2
    RETURNING id
),
l4_4_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет выплат социального характера', 3, NULL, TRUE, 2
    FROM l3_4_2
    RETURNING id
),
l4_4_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение выплат в учетной системе', 4, NULL, TRUE, 2
    FROM l3_4_2
    RETURNING id
),
l4_4_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для выплаты', 5, NULL, TRUE, 2
    FROM l3_4_2
    RETURNING id
),
l3_4_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'НДФЛ и страховые взносы', 3, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l4_4_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка налоговой базы и базы по взносам', 1, NULL, TRUE, 2
    FROM l3_4_3
    RETURNING id
),
l4_4_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет НДФЛ и страховых взносов', 2, NULL, TRUE, 2
    FROM l3_4_3
    RETURNING id
),
l4_4_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение НДФЛ и страховых взносов в учетной системе', 3, NULL, TRUE, 2
    FROM l3_4_3
    RETURNING id
),
l4_4_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка платежных данных', 4, NULL, TRUE, 2
    FROM l3_4_3
    RETURNING id
),
l4_4_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование отчетности по НДФЛ и страховым взносам', 5, NULL, TRUE, 2
    FROM l3_4_3
    RETURNING id
),
l4_4_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений по запросам', 6, NULL, TRUE, 3
    FROM l3_4_3
    RETURNING id
),
l3_4_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Прочие расчеты с персоналом и расчетные справки', 4, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l4_4_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение запроса или основания для расчета', 1, NULL, TRUE, 3
    FROM l3_4_4
    RETURNING id
),
l4_4_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка документов и исходных данных', 2, NULL, TRUE, 3
    FROM l3_4_4
    RETURNING id
),
l4_4_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение расчетов в учетной системе', 3, NULL, TRUE, 2
    FROM l3_4_4
    RETURNING id
),
l4_4_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка расчетных справок и расшифровок', 4, NULL, TRUE, 2
    FROM l3_4_4
    RETURNING id
),
l4_4_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача результата работнику или заказчику', 5, NULL, TRUE, 3
    FROM l3_4_4
    RETURNING id
),
l2_5 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Учет запасов и товаров', 5, NULL, TRUE)
    RETURNING id
),
l3_5_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Поступление запасов', 1, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l4_5_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку поступления запасов', 1, NULL, TRUE, 1
    FROM l3_5_1
    RETURNING id
),
l4_5_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_5_1
    RETURNING id
),
l4_5_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_5_1
    RETURNING id
),
l4_5_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_5_1
    RETURNING id
),
l4_5_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_5_1
    RETURNING id
),
l4_5_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_5_1
    RETURNING id
),
l3_5_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Выбытие запасов', 2, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l4_5_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку выбытия запасов', 1, NULL, TRUE, 1
    FROM l3_5_2
    RETURNING id
),
l4_5_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_5_2
    RETURNING id
),
l4_5_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_5_2
    RETURNING id
),
l4_5_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_5_2
    RETURNING id
),
l4_5_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_5_2
    RETURNING id
),
l4_5_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_5_2
    RETURNING id
),
l3_5_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Спецодежда, инвентарь и средства индивидуальной защиты', 3, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l4_5_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку спецодежды, инвентаря и средств индивидуальной защиты', 1, NULL, TRUE, 1
    FROM l3_5_3
    RETURNING id
),
l4_5_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_5_3
    RETURNING id
),
l4_5_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_5_3
    RETURNING id
),
l4_5_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_5_3
    RETURNING id
),
l4_5_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_5_3
    RETURNING id
),
l4_5_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_5_3
    RETURNING id
),
l3_5_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Внутренние перемещения и остатки запасов', 4, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l4_5_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку внутренних перемещений и остатков запасов', 1, NULL, TRUE, 1
    FROM l3_5_4
    RETURNING id
),
l4_5_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_5_4
    RETURNING id
),
l4_5_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_5_4
    RETURNING id
),
l4_5_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_5_4
    RETURNING id
),
l4_5_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_5_4
    RETURNING id
),
l4_5_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_5_4
    RETURNING id
),
l2_6 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Основные средства, нематериальные активы, аренда и капитальные вложения', 6, NULL, TRUE)
    RETURNING id
),
l3_6_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Приобретение основных средств, нематериальных активов и капитальных вложений', 1, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку приобретения основных средств, нематериальных активов и капитальных вложений', 1, NULL, TRUE, 1
    FROM l3_6_1
    RETURNING id
),
l4_6_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_6_1
    RETURNING id
),
l4_6_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_6_1
    RETURNING id
),
l4_6_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_6_1
    RETURNING id
),
l4_6_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_6_1
    RETURNING id
),
l4_6_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_6_1
    RETURNING id
),
l3_6_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Ввод в эксплуатацию и амортизация', 2, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача документов и сведений о вводе в эксплуатацию', 1, NULL, TRUE, 1
    FROM l3_6_2
    RETURNING id
),
l4_6_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка документов по вводу в эксплуатацию', 2, NULL, TRUE, 3
    FROM l3_6_2
    RETURNING id
),
l4_6_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Принятие объектов к учету', 3, NULL, TRUE, 2
    FROM l3_6_2
    RETURNING id
),
l4_6_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Начисление амортизации', 4, NULL, TRUE, 2
    FROM l3_6_2
    RETURNING id
),
l4_6_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_6_2
    RETURNING id
),
l3_6_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Перемещение, модернизация, реконструкция и ремонты', 3, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку перемещения, модернизации, реконструкции и ремонтов', 1, NULL, TRUE, 1
    FROM l3_6_3
    RETURNING id
),
l4_6_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_6_3
    RETURNING id
),
l4_6_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_6_3
    RETURNING id
),
l4_6_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_6_3
    RETURNING id
),
l4_6_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_6_3
    RETURNING id
),
l4_6_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_6_3
    RETURNING id
),
l3_6_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Выбытие, аренда и лизинг', 4, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l4_6_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку выбытия, аренды и лизинга', 1, NULL, TRUE, 1
    FROM l3_6_4
    RETURNING id
),
l4_6_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_6_4
    RETURNING id
),
l4_6_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_6_4
    RETURNING id
),
l4_6_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_6_4
    RETURNING id
),
l4_6_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_6_4
    RETURNING id
),
l4_6_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_6_4
    RETURNING id
),
l2_7 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Учет затрат, выпуска и себестоимости', 7, NULL, TRUE)
    RETURNING id
),
l3_7_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Учет затрат по производству и услугам', 1, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку затрат по производству и услугам', 1, NULL, TRUE, 1
    FROM l3_7_1
    RETURNING id
),
l4_7_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_7_1
    RETURNING id
),
l4_7_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_7_1
    RETURNING id
),
l4_7_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l4_7_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l4_7_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_7_1
    RETURNING id
),
l3_7_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Учет затрат при торговой деятельности', 2, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку затрат при торговой деятельности', 1, NULL, TRUE, 1
    FROM l3_7_2
    RETURNING id
),
l4_7_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_7_2
    RETURNING id
),
l4_7_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_7_2
    RETURNING id
),
l4_7_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_7_2
    RETURNING id
),
l4_7_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_7_2
    RETURNING id
),
l4_7_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_7_2
    RETURNING id
),
l3_7_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Учет затрат обслуживающих производств и хозяйств', 3, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку затрат обслуживающих производств и хозяйств', 1, NULL, TRUE, 1
    FROM l3_7_3
    RETURNING id
),
l4_7_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_7_3
    RETURNING id
),
l4_7_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_7_3
    RETURNING id
),
l4_7_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_7_3
    RETURNING id
),
l4_7_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_7_3
    RETURNING id
),
l4_7_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_7_3
    RETURNING id
),
l3_7_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Выпуск продукции, незавершенное производство и себестоимость', 4, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l4_7_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение исходных данных по выпуску и остаткам', 1, NULL, TRUE, 1
    FROM l3_7_4
    RETURNING id
),
l4_7_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка исходных данных по выпуску и остаткам', 2, NULL, TRUE, 3
    FROM l3_7_4
    RETURNING id
),
l4_7_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет выпуска и незавершенного производства', 3, NULL, TRUE, 2
    FROM l3_7_4
    RETURNING id
),
l4_7_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование себестоимости', 4, NULL, TRUE, 2
    FROM l3_7_4
    RETURNING id
),
l4_7_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение выпуска и себестоимости в учетной системе', 5, NULL, TRUE, 2
    FROM l3_7_4
    RETURNING id
),
l4_7_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_7_4
    RETURNING id
),
l2_8 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Финансовые вложения, кредиты, займы, капитал и резервы', 8, NULL, TRUE)
    RETURNING id
),
l3_8_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Финансовые вложения', 1, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку финансовых вложений', 1, NULL, TRUE, 1
    FROM l3_8_1
    RETURNING id
),
l4_8_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_8_1
    RETURNING id
),
l4_8_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_8_1
    RETURNING id
),
l4_8_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_8_1
    RETURNING id
),
l4_8_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_8_1
    RETURNING id
),
l4_8_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_8_1
    RETURNING id
),
l3_8_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Кредиты и займы', 2, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача первичных документов и сведений по участку кредитов и займов', 1, NULL, TRUE, 1
    FROM l3_8_2
    RETURNING id
),
l4_8_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка документов', 2, NULL, TRUE, 3
    FROM l3_8_2
    RETURNING id
),
l4_8_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос недостающих или исправленных документов', 3, NULL, TRUE, 3
    FROM l3_8_2
    RETURNING id
),
l4_8_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций в учетной системе', 4, NULL, TRUE, 2
    FROM l3_8_2
    RETURNING id
),
l4_8_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка расчетов и контроль остатков', 5, NULL, TRUE, 2
    FROM l3_8_2
    RETURNING id
),
l4_8_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 6, NULL, TRUE, 2
    FROM l3_8_2
    RETURNING id
),
l3_8_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Капитал, нераспределенная прибыль и дивиденды', 3, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение решения и исходных данных', 1, NULL, TRUE, 1
    FROM l3_8_3
    RETURNING id
),
l4_8_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка документов и расчетов', 2, NULL, TRUE, 3
    FROM l3_8_3
    RETURNING id
),
l4_8_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение операций по капиталу и дивидендам в учетной системе', 3, NULL, TRUE, 2
    FROM l3_8_3
    RETURNING id
),
l4_8_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка расчетов и регистров', 4, NULL, TRUE, 2
    FROM l3_8_3
    RETURNING id
),
l4_8_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_8_3
    RETURNING id
),
l3_8_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оценочные резервы и обязательства', 4, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l4_8_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение исходных данных для оценки', 1, NULL, TRUE, 1
    FROM l3_8_4
    RETURNING id
),
l4_8_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка исходных данных и расчетных допущений', 2, NULL, TRUE, 3
    FROM l3_8_4
    RETURNING id
),
l4_8_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет оценочных резервов и обязательств', 3, NULL, TRUE, 2
    FROM l3_8_4
    RETURNING id
),
l4_8_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение резервов и обязательств в учетной системе', 4, NULL, TRUE, 2
    FROM l3_8_4
    RETURNING id
),
l4_8_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_8_4
    RETURNING id
),
l2_9 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Налоговый учет и налоговая отчетность', 9, NULL, TRUE)
    RETURNING id
),
l3_9_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'НДС', 1, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l4_9_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка налоговой базы по НДС', 1, NULL, TRUE, 2
    FROM l3_9_1
    RETURNING id
),
l4_9_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование книги покупок и книги продаж', 2, NULL, TRUE, 2
    FROM l3_9_1
    RETURNING id
),
l4_9_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет НДС и подготовка декларации', 3, NULL, TRUE, 2
    FROM l3_9_1
    RETURNING id
),
l4_9_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подача отчетности по НДС', 4, NULL, TRUE, 2
    FROM l3_9_1
    RETURNING id
),
l4_9_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений и ответов по НДС', 5, NULL, TRUE, 3
    FROM l3_9_1
    RETURNING id
),
l3_9_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Налог на прибыль', 2, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l4_9_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка налоговой базы по налогу на прибыль', 1, NULL, TRUE, 2
    FROM l3_9_2
    RETURNING id
),
l4_9_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование налоговых регистров', 2, NULL, TRUE, 2
    FROM l3_9_2
    RETURNING id
),
l4_9_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет налога на прибыль', 3, NULL, TRUE, 2
    FROM l3_9_2
    RETURNING id
),
l4_9_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка и подача декларации по налогу на прибыль', 4, NULL, TRUE, 2
    FROM l3_9_2
    RETURNING id
),
l4_9_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений и ответов по налогу на прибыль', 5, NULL, TRUE, 3
    FROM l3_9_2
    RETURNING id
),
l3_9_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Налог на имущество, транспортный налог, земельный налог и НДПИ', 3, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l4_9_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка налоговой базы по имущественным налогам и НДПИ', 1, NULL, TRUE, 2
    FROM l3_9_3
    RETURNING id
),
l4_9_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет имущественных налогов и НДПИ', 2, NULL, TRUE, 2
    FROM l3_9_3
    RETURNING id
),
l4_9_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка налоговой отчетности', 3, NULL, TRUE, 2
    FROM l3_9_3
    RETURNING id
),
l4_9_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подача налоговой отчетности', 4, NULL, TRUE, 2
    FROM l3_9_3
    RETURNING id
),
l4_9_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений и ответов', 5, NULL, TRUE, 3
    FROM l3_9_3
    RETURNING id
),
l3_9_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Трансфертное ценообразование и прочие налоги', 4, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l4_9_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор исходных данных по трансфертному ценообразованию и прочим налогам', 1, NULL, TRUE, 1
    FROM l3_9_4
    RETURNING id
),
l4_9_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и консолидация исходных данных', 2, NULL, TRUE, 3
    FROM l3_9_4
    RETURNING id
),
l4_9_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет налоговой базы и подготовка регистров', 3, NULL, TRUE, 2
    FROM l3_9_4
    RETURNING id
),
l4_9_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка и подача отчетности', 4, NULL, TRUE, 2
    FROM l3_9_4
    RETURNING id
),
l4_9_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений и ответов', 5, NULL, TRUE, 3
    FROM l3_9_4
    RETURNING id
),
l3_9_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Налоговые риски, проверки и споры', 5, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l4_9_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Мониторинг налоговых рисков', 1, NULL, TRUE, 2
    FROM l3_9_5
    RETURNING id
),
l4_9_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка позиции по спорным вопросам', 2, NULL, TRUE, 1
    FROM l3_9_5
    RETURNING id
),
l4_9_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов для проверок', 3, NULL, TRUE, 2
    FROM l3_9_5
    RETURNING id
),
l4_9_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка ответов и пояснений', 4, NULL, TRUE, 3
    FROM l3_9_5
    RETURNING id
),
l4_9_5_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Координация взаимодействия с контролирующими органами', 5, NULL, TRUE, 3
    FROM l3_9_5
    RETURNING id
),
l2_10 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Закрытие периода, отчетность, инвентаризация и сверки', 10, NULL, TRUE)
    RETURNING id
),
l3_10_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Закрытие периода', 1, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l4_10_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка полноты отражения операций', 1, NULL, TRUE, 2
    FROM l3_10_1
    RETURNING id
),
l4_10_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выполнение процедур закрытия периода', 2, NULL, TRUE, 2
    FROM l3_10_1
    RETURNING id
),
l4_10_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет курсовых разниц и реформация счетов', 3, NULL, TRUE, 2
    FROM l3_10_1
    RETURNING id
),
l4_10_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль результатов закрытия периода', 4, NULL, TRUE, 2
    FROM l3_10_1
    RETURNING id
),
l4_10_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для отчетности', 5, NULL, TRUE, 2
    FROM l3_10_1
    RETURNING id
),
l3_10_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Бухгалтерская отчетность', 2, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l4_10_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор данных для бухгалтерской отчетности', 1, NULL, TRUE, 2
    FROM l3_10_2
    RETURNING id
),
l4_10_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка форм бухгалтерской отчетности', 2, NULL, TRUE, 2
    FROM l3_10_2
    RETURNING id
),
l4_10_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка расшифровок и пояснений к отчетности', 3, NULL, TRUE, 2
    FROM l3_10_2
    RETURNING id
),
l4_10_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и согласование бухгалтерской отчетности', 4, NULL, TRUE, 1
    FROM l3_10_2
    RETURNING id
),
l4_10_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Представление бухгалтерской отчетности', 5, NULL, TRUE, 2
    FROM l3_10_2
    RETURNING id
),
l3_10_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Статистическая и регламентированная отчетность', 3, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l4_10_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор данных для статистической и регламентированной отчетности', 1, NULL, TRUE, 2
    FROM l3_10_3
    RETURNING id
),
l4_10_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка отчетности', 2, NULL, TRUE, 2
    FROM l3_10_3
    RETURNING id
),
l4_10_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка отчетности', 3, NULL, TRUE, 2
    FROM l3_10_3
    RETURNING id
),
l4_10_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Представление отчетности', 4, NULL, TRUE, 2
    FROM l3_10_3
    RETURNING id
),
l4_10_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений по запросам', 5, NULL, TRUE, 3
    FROM l3_10_3
    RETURNING id
),
l3_10_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управленческая отчетность и аналитические материалы', 4, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l4_10_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор исходных данных для управленческой отчетности', 1, NULL, TRUE, 2
    FROM l3_10_4
    RETURNING id
),
l4_10_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и консолидация данных', 2, NULL, TRUE, 2
    FROM l3_10_4
    RETURNING id
),
l4_10_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка управленческой отчетности', 3, NULL, TRUE, 2
    FROM l3_10_4
    RETURNING id
),
l4_10_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка аналитических комментариев', 4, NULL, TRUE, 2
    FROM l3_10_4
    RETURNING id
),
l4_10_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Представление результатов заказчикам', 5, NULL, TRUE, 3
    FROM l3_10_4
    RETURNING id
),
l3_10_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Инвентаризация активов и обязательств', 5, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l4_10_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка перечней и документов для инвентаризации', 1, NULL, TRUE, 2
    FROM l3_10_5
    RETURNING id
),
l4_10_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Участие подразделений в проведении инвентаризации', 2, NULL, TRUE, 1
    FROM l3_10_5
    RETURNING id
),
l4_10_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Обработка результатов инвентаризации', 3, NULL, TRUE, 2
    FROM l3_10_5
    RETURNING id
),
l4_10_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение результатов инвентаризации в учетной системе', 4, NULL, TRUE, 2
    FROM l3_10_5
    RETURNING id
),
l4_10_5_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов по итогам инвентаризации', 5, NULL, TRUE, 2
    FROM l3_10_5
    RETURNING id
),
l3_10_6 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Сверки с контрагентами и по счетам учета', 6, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l4_10_6_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка данных для сверки', 1, NULL, TRUE, 2
    FROM l3_10_6
    RETURNING id
),
l4_10_6_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение сверки с контрагентами и подразделениями', 2, NULL, TRUE, 3
    FROM l3_10_6
    RETURNING id
),
l4_10_6_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отражение результатов сверки в учетной системе', 3, NULL, TRUE, 2
    FROM l3_10_6
    RETURNING id
),
l4_10_6_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка корректировок по итогам сверки', 4, NULL, TRUE, 2
    FROM l3_10_6
    RETURNING id
),
l4_10_6_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль закрытия расхождений', 5, NULL, TRUE, 3
    FROM l3_10_6
    RETURNING id
),
l2_11 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (1, 'Управление бухгалтерской функцией и методология', 11, NULL, TRUE)
    RETURNING id
),
l3_11_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Методология и консультационная поддержка', 1, NULL, TRUE
    FROM l2_11
    RETURNING id
),
l4_11_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка методологических документов', 1, NULL, TRUE, 1
    FROM l3_11_1
    RETURNING id
),
l4_11_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Актуализация методологических документов', 2, NULL, TRUE, 1
    FROM l3_11_1
    RETURNING id
),
l4_11_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Консультационная поддержка по вопросам учета', 3, NULL, TRUE, 3
    FROM l3_11_1
    RETURNING id
),
l4_11_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Доведение изменений до исполнителей', 4, NULL, TRUE, 3
    FROM l3_11_1
    RETURNING id
),
l3_11_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Документооборот и архив', 2, NULL, TRUE
    FROM l2_11
    RETURNING id
),
l4_11_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Регистрация входящих документов', 1, NULL, TRUE, 3
    FROM l3_11_2
    RETURNING id
),
l4_11_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль наличия оригиналов документов', 2, NULL, TRUE, 3
    FROM l3_11_2
    RETURNING id
),
l4_11_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача документов в архив', 3, NULL, TRUE, 2
    FROM l3_11_2
    RETURNING id
),
l4_11_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Поиск, копирование и предоставление документов', 4, NULL, TRUE, 3
    FROM l3_11_2
    RETURNING id
),
l3_11_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Автоматизация и ведение нормативно-справочной информации', 3, NULL, TRUE
    FROM l2_11
    RETURNING id
),
l4_11_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор заявок на изменение учетных систем и справочников', 1, NULL, TRUE, 3
    FROM l3_11_3
    RETURNING id
),
l4_11_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка требований к доработкам', 2, NULL, TRUE, 1
    FROM l3_11_3
    RETURNING id
),
l4_11_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Настройка и ведение нормативно-справочной информации', 3, NULL, TRUE, 2
    FROM l3_11_3
    RETURNING id
),
l4_11_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Тестирование и приемка изменений', 4, NULL, TRUE, 3
    FROM l3_11_3
    RETURNING id
),
l3_11_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Взаимодействие с аудиторами, судами и внешними запросами', 4, NULL, TRUE
    FROM l2_11
    RETURNING id
),
l4_11_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение и регистрация запроса', 1, NULL, TRUE, 3
    FROM l3_11_4
    RETURNING id
),
l4_11_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов и материалов', 2, NULL, TRUE, 2
    FROM l3_11_4
    RETURNING id
),
l4_11_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка позиции и ответов', 3, NULL, TRUE, 1
    FROM l3_11_4
    RETURNING id
),
l4_11_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Координация отправки ответа и взаимодействия', 4, NULL, TRUE, 3
    FROM l3_11_4
    RETURNING id
),
l3_11_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Обучение, развитие и поддержка изменений', 5, NULL, TRUE
    FROM l2_11
    RETURNING id
),
l4_11_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка плана обучения и изменений', 1, NULL, TRUE, 1
    FROM l3_11_5
    RETURNING id
),
l4_11_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация обучения сотрудников', 2, NULL, TRUE, 3
    FROM l3_11_5
    RETURNING id
),
l4_11_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение обучения и инструктажей', 3, NULL, TRUE, 3
    FROM l3_11_5
    RETURNING id
),
l4_11_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль прохождения обучения и внедрения изменений', 4, NULL, TRUE, 3
    FROM l3_11_5
    RETURNING id
)
SELECT COUNT(*) FROM l4_11_5_4;

COMMIT;
