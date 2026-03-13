BEGIN;

-- Keep existing BUiNU structure intact; only repopulate the existing HR branch.
UPDATE process_1 SET f1_name = 'Управление персоналом', is_active = TRUE, sort = COALESCE(sort, 2) WHERE id = 2;
DELETE FROM process_2 WHERE process_1_id = 2;

WITH
l2_1 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Организационный менеджмент', 1, NULL, TRUE)
    RETURNING id
),
l2_2 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Администрирование персонала', 2, NULL, TRUE)
    RETURNING id
),
l2_3 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Планирование и учет рабочего времени', 3, NULL, TRUE)
    RETURNING id
),
l2_4 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Подбор персонала', 4, NULL, TRUE)
    RETURNING id
),
l2_5 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Обучение и развитие персонала', 5, NULL, TRUE)
    RETURNING id
),
l2_6 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Вознаграждение и мотивация персонала', 6, NULL, TRUE)
    RETURNING id
),
l2_7 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Правовая поддержка', 7, NULL, TRUE)
    RETURNING id
),
l2_8 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Отчетность', 8, NULL, TRUE)
    RETURNING id
),
l2_9 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Бюджетирование', 9, NULL, TRUE)
    RETURNING id
),
l2_10 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Проектная работа и разработка методологии', 10, NULL, TRUE)
    RETURNING id
),
l2_11 AS (
    INSERT INTO process_2 (process_1_id, f2_name, sort, note, is_active)
    VALUES (2, 'Дополнительные функции', 11, NULL, TRUE)
    RETURNING id
),
l3_1_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление эффективностью организационной структуры', 1, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l3_1_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Работа с положениями о подразделениях', 2, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l3_1_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление штатным расписанием', 3, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l3_1_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Работа с должностными инструкциями', 4, NULL, TRUE
    FROM l2_1
    RETURNING id
),
l3_2_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Прием на работу', 1, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Перевод на другую работу', 2, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Расторжение трудового договора', 3, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление сокращения численности/ штата', 4, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Администрирование дисциплинарных взысканий', 5, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_6 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Направыление уведомлений в ФССП', 6, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_7 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Уведомление ФМС о движении иностранцев (прием, увольнение)', 7, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_8 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Воинский учет', 8, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_9 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Персонифицированный учет ПФР и назначение пенсий', 9, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_10 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Направление работников на медосмотр (все типы)', 10, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_11 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление трудовой книжки/вкладыша, включая запись в книге учета', 11, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_12 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Внесение информации о наградах', 12, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_13 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Отчетность в ЦЗН о квотировании рабочих мест для инвалидов', 13, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_14 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Отстранение работника от работы', 14, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_15 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление индексации заработных плат', 15, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_16 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление банковскими карточками (зарплатный проект)', 16, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_17 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Администрирование гражданско-правовых договоров', 17, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_18 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Проверки соблюдения норм законодательства и ЛНА', 18, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_19 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Предоставление справок о трудовой деятельности и копий документов работникам', 19, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_20 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Администрирование ПВТР и политик, относящихся к кадровому администрированию', 20, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_21 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Подготовка проведения специальной оценки условий труда', 21, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_2_22 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Работа с сотрудницами, уходящими в отпуск по беременности и родам, по уходу за ребенком', 22, NULL, TRUE
    FROM l2_2
    RETURNING id
),
l3_3_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Командирование работников', 1, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление нетрудоспособности', 2, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Ведение графика отпусков', 3, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Уведомление работника о предстоящем отпуске', 4, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление отпусков', 5, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_6 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Отзыв из отпуска', 6, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_7 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Компенсация части ежегодного оплачиваемого отпуска', 7, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_8 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Формирование графиков рабочего времени (включая графики сменности)', 8, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_9 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Формирование табеля учета рабочего времени', 9, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_10 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Оформление работы в выходные и праздничные дни, сверхурочной работы', 10, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_3_11 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Организация и введение режимов неполного рабочего времени (простои, неполная рабочая неделя)', 11, NULL, TRUE
    FROM l2_3
    RETURNING id
),
l3_4_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Разработка и актуализация политик в области подбора персонала', 1, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l3_4_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Планирование подбора персонала', 2, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l3_4_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Организация подбора и ротации', 3, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l3_4_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Адаптация персонала', 4, NULL, TRUE
    FROM l2_4
    RETURNING id
),
l3_5_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Разработка и актуализация политик в области обучения и развития персонала', 1, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l3_5_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Планирование обязательного обучения сотрудников', 2, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l3_5_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Планирование обучения сотрудников', 3, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l3_5_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Организация обучения и повышения квалификации', 4, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l3_5_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Организация работы с кадровым резервом', 5, NULL, TRUE
    FROM l2_5
    RETURNING id
),
l3_6_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Разработка и совершенствование системы оплаты труда и политик в области мотивации', 1, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l3_6_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Администрирование системы управления эффективностью (целеполагание, KPI)', 2, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l3_6_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Администрирование системы оплаты труда', 3, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l3_6_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управление нематериальной мотивацией работников', 4, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l3_6_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Социальная работа', 5, NULL, TRUE
    FROM l2_6
    RETURNING id
),
l3_7_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Работа с жалобами работников', 1, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l3_7_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Участие в подготовке документов, необходимых  для рассмотрения трудовых споров', 2, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l3_7_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Участие в установленном порядке в судебных заседаниях по трудовым спорам', 3, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l3_7_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Взаимодействие с правоохранительными и контролирующими органами', 4, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l3_7_5 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Консультирование работников по вопросам трудовых отношений', 5, NULL, TRUE
    FROM l2_7
    RETURNING id
),
l3_8_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Законодательная отчетность', 1, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l3_8_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Управленческая отчетность для внутренних целей', 2, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l3_8_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Отчетность по запросу', 3, NULL, TRUE
    FROM l2_8
    RETURNING id
),
l3_9_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Планирование численности', 1, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l3_9_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Планирование ФОТ', 2, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l3_9_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Факторный анализ отклонений План-Факт, Факт-Факт', 3, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l3_9_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Контроль исполнения Бюджета Расходов на персонал', 4, NULL, TRUE
    FROM l2_9
    RETURNING id
),
l3_10_1 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Реализация проектов, в том числе по трансформации и повышению эффективности функции УП', 1, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l3_10_2 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Разработка и актуализация внутренней регламентной документации по процессам УП', 2, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l3_10_3 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Разработка и актуализация методологии выполнения операций УП', 3, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l3_10_4 AS (
    INSERT INTO process_3 (process_2_id, f3_name, sort, note, is_active)
    SELECT id, 'Разработка бизнес-требований и обеспечение автоматизации процессов УП', 4, NULL, TRUE
    FROM l2_10
    RETURNING id
),
l4_1_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов-инициатив на внесение изменений в организационную структуру', 1, NULL, TRUE, NULL
    FROM l3_1_1
    RETURNING id
),
l4_1_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка проекта организационной структуры', 2, NULL, TRUE, NULL
    FROM l3_1_1
    RETURNING id
),
l4_1_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация согласования и утверждения проекта организационной структуры', 3, NULL, TRUE, NULL
    FROM l3_1_1
    RETURNING id
),
l4_1_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Вывод/ ввод организационной единицы в учетной системе', 4, NULL, TRUE, NULL
    FROM l3_1_1
    RETURNING id
),
l4_1_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Введение атрибутов (признаков) организационной единицы в учетной системе', 5, NULL, TRUE, NULL
    FROM l3_1_1
    RETURNING id
),
l4_1_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация хранения документов', 6, NULL, TRUE, NULL
    FROM l3_1_1
    RETURNING id
),
l4_1_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов-инициатив о разработке/актуализации положения о подразделении', 1, NULL, TRUE, NULL
    FROM l3_1_2
    RETURNING id
),
l4_1_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка проекта положения о подразделении', 2, NULL, TRUE, NULL
    FROM l3_1_2
    RETURNING id
),
l4_1_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация согласования и утверждения проекта положения о подразделении', 3, NULL, TRUE, NULL
    FROM l3_1_2
    RETURNING id
),
l4_1_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с изменениями в положение о подразделении', 4, NULL, TRUE, NULL
    FROM l3_1_2
    RETURNING id
),
l4_1_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация хранения документов', 5, NULL, TRUE, NULL
    FROM l3_1_2
    RETURNING id
),
l4_1_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложений по внесению изменений в штатное расписание', 1, NULL, TRUE, NULL
    FROM l3_1_3
    RETURNING id
),
l4_1_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием документов на изменение штатного расписания', 2, NULL, TRUE, NULL
    FROM l3_1_3
    RETURNING id
),
l4_1_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Анализ необходимых изменений, согласование, принятие решения о целесообразности изменении', 3, NULL, TRUE, NULL
    FROM l3_1_3
    RETURNING id
),
l4_1_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Вывод/ввод/изменение аттрибутов штатной должности', 4, NULL, TRUE, NULL
    FROM l3_1_3
    RETURNING id
),
l4_1_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование выходных форм по изменениям (приказ об утверждении штатного расписания, штатное расписание)', 5, NULL, TRUE, NULL
    FROM l3_1_3
    RETURNING id
),
l4_1_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация утверждения выходных форм', 6, NULL, TRUE, NULL
    FROM l3_1_3
    RETURNING id
),
l4_1_3_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация хранения документов', 7, NULL, TRUE, NULL
    FROM l3_1_3
    RETURNING id
),
l4_1_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложений по разработке/актуализации должностной инструкции', 1, NULL, TRUE, NULL
    FROM l3_1_4
    RETURNING id
),
l4_1_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка проекта должностной инструкции', 2, NULL, TRUE, NULL
    FROM l3_1_4
    RETURNING id
),
l4_1_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация согласования и утверждения проекта должностной инструкции', 3, NULL, TRUE, NULL
    FROM l3_1_4
    RETURNING id
),
l4_1_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление сотрудников с должностной инструкцией', 4, NULL, TRUE, NULL
    FROM l3_1_4
    RETURNING id
),
l4_1_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация хранения должностных инструкций', 5, NULL, TRUE, NULL
    FROM l3_1_4
    RETURNING id
),
l4_2_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение необходимых документов', 1, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Направление на медосмотр и вводный инструктаж (при необходимости)', 2, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Направление уведомления в IT, АХО и СБ', 3, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка условий заключения трудового договора (срок, наличие вакансии, достаточность документов для приема и т.д.)', 4, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение персональных данных работника в систему', 5, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Оформление пакета документов при приеме на работу (согласие на обработку ПД, ТД, приказ и т.д.)', 6, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление с ЛНА', 7, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание пакета документов', 8, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение сведений в журнал учета принятых работников, в книгу учета движения трудовых книжек', 9, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_10 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление бывшего работодателя о приеме работников, состоящих раннее на государственной муниципальной службе', 10, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_11 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача экземпляра трудового договора работнику', 11, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_12 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявлений о перечисление заработной платы на счет в банке', 12, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_13 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявлений справок 182-Н (2-НДФЛ) с предыдущих мест работы', 13, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_14 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение заявлений на налоговые вычеты по НДФЛ', 14, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_1_15 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Заключение договоров о материальной ответственности', 15, NULL, TRUE, NULL
    FROM l3_2_1
    RETURNING id
),
l4_2_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка заявки о необходимости оформления перевода на другую работу', 1, NULL, TRUE, NULL
    FROM l3_2_2
    RETURNING id
),
l4_2_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в систему', 2, NULL, TRUE, NULL
    FROM l3_2_2
    RETURNING id
),
l4_2_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка дополнительного соглашения и приказа о переводе', 3, NULL, TRUE, NULL
    FROM l3_2_2
    RETURNING id
),
l4_2_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание документов', 4, NULL, TRUE, NULL
    FROM l3_2_2
    RETURNING id
),
l4_2_2_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение записи в трудовую книжку', 5, NULL, TRUE, NULL
    FROM l3_2_2
    RETURNING id
),
l4_2_2_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление и передача экземпляра дополнительного соглашения работнику', 6, NULL, TRUE, NULL
    FROM l3_2_2
    RETURNING id
),
l4_2_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение документа-основания для увольнения', 1, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление причастных руководителей о предстоящем увольнении', 2, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение выходного собеседования с работником', 3, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в систему', 4, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа об увольнении', 5, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание приказа об увольнении', 6, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Регистрация приказа об увольнении', 7, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка и предоставление табеля учета рабочего времени и иных документов требующихся при окончательном расчёте (в т.ч. по доходам в натуральной форме)', 8, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание документов у работодателя и с работником, выдача копий документов', 9, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_10 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение информации в трудовую книжку', 10, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_11 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выдача трудовой книжки и справок (при необходимости отправка почтой)', 11, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_3_12 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение обходного листа при увольнении (зявлений на удержаний из заработной платы)', 12, NULL, TRUE, NULL
    FROM l3_2_3
    RETURNING id
),
l4_2_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Создание приказа о сокращении численности/ штата', 1, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Определение лиц с приоритетным правом на оставление', 2, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка уведомлений о предстоящем сокращении', 3, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление работников о предстоящем сокращении', 4, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Анализ имеющихся вакансий, предложение вакансий работнику', 5, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Запрос мотивированного мнения профсоюзного комитета (при наличии)', 6, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление службы занятости', 7, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка предоставленных документов на выплаты за 2 и 3  месяц трудоустройства сокращенного работника', 8, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_4_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказов о выплатах за 2 и 3 месяц трудоустройства сокращенного работника', 9, NULL, TRUE, NULL
    FROM l3_2_4
    RETURNING id
),
l4_2_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Наложение дисциплинарного взыскания', 1, NULL, TRUE, NULL
    FROM l3_2_5
    RETURNING id
),
l4_2_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Участие в служебном расследовании проступка', 2, NULL, TRUE, NULL
    FROM l3_2_5
    RETURNING id
),
l4_2_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка и утверждение приказа на дисциплинарное взыскание', 3, NULL, TRUE, NULL
    FROM l3_2_5
    RETURNING id
),
l4_2_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление сотрудника с приказом', 4, NULL, TRUE, NULL
    FROM l3_2_5
    RETURNING id
),
l4_2_5_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Занесение сведений о взыскании в систему', 5, NULL, TRUE, NULL
    FROM l3_2_5
    RETURNING id
),
l4_2_8_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление о приеме работника', 1, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление об увольнении работника', 2, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Взаимодействие с соответствующим военным комиссариатом (выезд)', 3, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка плана работы на год по осуществлению воинского учета', 4, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Издание приказа об организации воинского учета на текущий год', 5, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка отчета о численности работающих и забронированных граждан (форма 6) в конце года', 6, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка сведений о принятых и уволенных работниках, изменении их персональных данных', 7, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сверка формы 10 с учетными данными военного комиссариата', 8, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Уведомление работника о вызовах (повестках) соответствующего военного комиссариата', 9, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_8_10 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Администрирование, бронирование ГПЗ', 10, NULL, TRUE, NULL
    FROM l3_2_8
    RETURNING id
),
l4_2_9_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка работникам справок и копий трудовой книжки, для перерасчета, сверок, в т.ч. по запросам ПФР', 1, NULL, TRUE, NULL
    FROM l3_2_9
    RETURNING id
),
l4_2_9_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Оформление пакета документов, уточняющих особые условия труда', 2, NULL, TRUE, NULL
    FROM l3_2_9
    RETURNING id
),
l4_2_9_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Предоставление в ПФР сведений персонифицированного учета и соответствующих документов', 3, NULL, TRUE, NULL
    FROM l3_2_9
    RETURNING id
),
l4_2_9_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование перечня рабочих мест, наименований профессий и должностей, занятость на которых  дает право на досрочное назначение пенсии', 4, NULL, TRUE, NULL
    FROM l3_2_9
    RETURNING id
),
l4_2_9_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка поименных списков работников, занятых на работах во вредных условиях за год', 5, NULL, TRUE, NULL
    FROM l3_2_9
    RETURNING id
),
l4_2_9_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ежемесячная проверка списков вредников для перечисления страховых взносов и подтверждения льготного стажа', 6, NULL, TRUE, NULL
    FROM l3_2_9
    RETURNING id
),
l4_2_10_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование списка работников, для которых медосмотр обязателен', 1, NULL, TRUE, NULL
    FROM l3_2_10
    RETURNING id
),
l4_2_10_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование уведомлений о необходимости прохождения медицинского осмотра', 2, NULL, TRUE, NULL
    FROM l3_2_10
    RETURNING id
),
l4_2_10_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выдача уведомлений работникам', 3, NULL, TRUE, NULL
    FROM l3_2_10
    RETURNING id
),
l4_2_10_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль своевременного прохождения медосмотра', 4, NULL, TRUE, NULL
    FROM l3_2_10
    RETURNING id
),
l4_2_10_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных о результатах медицинского осмотра', 5, NULL, TRUE, NULL
    FROM l3_2_10
    RETURNING id
),
l4_2_10_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор и передача в бухгалтерию заявления о возмещении средств работнику', 6, NULL, TRUE, NULL
    FROM l3_2_10
    RETURNING id
),
l4_2_12_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение информации о наградах в систему', 1, NULL, TRUE, NULL
    FROM l3_2_12
    RETURNING id
),
l4_2_12_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение информации о наградах в документы (трудовая книжка, личное дело)', 2, NULL, TRUE, NULL
    FROM l3_2_12
    RETURNING id
),
l4_2_14_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложений по отстранению от работы', 1, NULL, TRUE, NULL
    FROM l3_2_14
    RETURNING id
),
l4_2_14_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Анализ правомерности отстранения от работы', 2, NULL, TRUE, NULL
    FROM l3_2_14
    RETURNING id
),
l4_2_14_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение объяснительных от работника (при необходимости)', 3, NULL, TRUE, NULL
    FROM l3_2_14
    RETURNING id
),
l4_2_14_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация служебного расследования (при необходимости)', 4, NULL, TRUE, NULL
    FROM l3_2_14
    RETURNING id
),
l4_2_14_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Оформление приказа об отстранении', 5, NULL, TRUE, NULL
    FROM l3_2_14
    RETURNING id
),
l4_2_14_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение информации об отстранении в систему', 6, NULL, TRUE, NULL
    FROM l3_2_14
    RETURNING id
),
l4_2_15_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Принятие решения о размерах и сроках индексации', 1, NULL, TRUE, NULL
    FROM l3_2_15
    RETURNING id
),
l4_2_15_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Издание приказа о проведении индексации', 2, NULL, TRUE, NULL
    FROM l3_2_15
    RETURNING id
),
l4_2_15_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Загрузка данных в систему', 3, NULL, TRUE, NULL
    FROM l3_2_15
    RETURNING id
),
l4_2_15_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка данных', 4, NULL, TRUE, NULL
    FROM l3_2_15
    RETURNING id
),
l4_2_15_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование дополнительных соглашений', 5, NULL, TRUE, NULL
    FROM l3_2_15
    RETURNING id
),
l4_2_15_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание дополнительных соглашений со стороны работодателя, обеспечение подписания со стороны работника', 6, NULL, TRUE, NULL
    FROM l3_2_15
    RETURNING id
),
l4_2_16_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выдача бланков заявлений работникам', 1, NULL, TRUE, NULL
    FROM l3_2_16
    RETURNING id
),
l4_2_16_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование реестра на выпуск карт', 2, NULL, TRUE, NULL
    FROM l3_2_16
    RETURNING id
),
l4_2_16_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Передача реестров в Казначейство для отправки через банк-клиент в банк', 3, NULL, TRUE, NULL
    FROM l3_2_16
    RETURNING id
),
l4_2_16_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение реквизитов карт в систему', 4, NULL, TRUE, NULL
    FROM l3_2_16
    RETURNING id
),
l4_2_17_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Бюджетирование договоров ГПХ', 1, NULL, TRUE, NULL
    FROM l3_2_17
    RETURNING id
),
l4_2_17_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка договоров', 2, NULL, TRUE, NULL
    FROM l3_2_17
    RETURNING id
),
l4_2_17_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль предоставления актов выполненных работ руководителями работ', 3, NULL, TRUE, NULL
    FROM l3_2_17
    RETURNING id
),
l4_2_17_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в систему', 4, NULL, TRUE, NULL
    FROM l3_2_17
    RETURNING id
),
l4_2_18_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов по запросу трудовой инспекции, прокуратуры и т.д.', 1, NULL, TRUE, NULL
    FROM l3_2_18
    RETURNING id
),
l4_2_18_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов по внутренним проверкам (аудит и пр.)', 2, NULL, TRUE, NULL
    FROM l3_2_18
    RETURNING id
),
l4_2_18_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка пояснений по результатам проверки в надзорные органы', 3, NULL, TRUE, NULL
    FROM l3_2_18
    RETURNING id
),
l4_2_21_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка перечня должностей/профессий для проведения специальной оценки условий труда', 1, NULL, TRUE, NULL
    FROM l3_2_21
    RETURNING id
),
l4_2_21_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с результатами спецоценки', 2, NULL, TRUE, NULL
    FROM l3_2_21
    RETURNING id
),
l4_2_21_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Участие в работе комиссии', 3, NULL, TRUE, NULL
    FROM l3_2_21
    RETURNING id
),
l4_2_21_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Взаимодействие с профсоюзом по согласованию решений (при наличии)', 4, NULL, TRUE, NULL
    FROM l3_2_21
    RETURNING id
),
l4_2_21_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в систему', 5, NULL, TRUE, NULL
    FROM l3_2_21
    RETURNING id
),
l4_3_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка заявки на командировку', 1, NULL, TRUE, NULL
    FROM l3_3_1
    RETURNING id
),
l4_3_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа о командировке', 2, NULL, TRUE, NULL
    FROM l3_3_1
    RETURNING id
),
l4_3_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание приказа, ознакомление работника с приказом', 3, NULL, TRUE, NULL
    FROM l3_3_1
    RETURNING id
),
l4_3_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Изменение сроков командировки', 4, NULL, TRUE, NULL
    FROM l3_3_1
    RETURNING id
),
l4_3_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отмена командировок', 5, NULL, TRUE, NULL
    FROM l3_3_1
    RETURNING id
),
l4_3_2_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Прием и проверка информации об ЭЛН', 1, NULL, TRUE, NULL
    FROM l3_3_2
    RETURNING id
),
l4_3_2_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных о листке нетрудоспособности в систему', 2, NULL, TRUE, NULL
    FROM l3_3_2
    RETURNING id
),
l4_3_2_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отправка листов нетрудоспособности в ФСС, и формирование заявок на выплату средств за счет средст предприятия', 3, NULL, TRUE, NULL
    FROM l3_3_2
    RETURNING id
),
l4_3_2_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Работа с извещениями ФСС', 4, NULL, TRUE, NULL
    FROM l3_3_2
    RETURNING id
),
l4_3_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор проектов графиков отпусков от подразделений', 1, NULL, TRUE, NULL
    FROM l3_3_3
    RETURNING id
),
l4_3_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и корректировка графиков отпусков от подразделений', 2, NULL, TRUE, NULL
    FROM l3_3_3
    RETURNING id
),
l4_3_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование проекта графика отпусков по Обществу', 3, NULL, TRUE, NULL
    FROM l3_3_3
    RETURNING id
),
l4_3_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование и утверждение графика отпусков', 4, NULL, TRUE, NULL
    FROM l3_3_3
    RETURNING id
),
l4_3_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Загрузка графика отпусков в систему', 5, NULL, TRUE, NULL
    FROM l3_3_3
    RETURNING id
),
l4_3_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с графиком отпусков', 6, NULL, TRUE, NULL
    FROM l3_3_3
    RETURNING id
),
l4_3_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Обеспечение уведомлений о предстоящих отпусках', 1, NULL, TRUE, NULL
    FROM l3_3_4
    RETURNING id
),
l4_3_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение согласованного заявления от работника', 1, NULL, TRUE, NULL
    FROM l3_3_5
    RETURNING id
),
l4_3_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение мероприятия в системе', 2, NULL, TRUE, NULL
    FROM l3_3_5
    RETURNING id
),
l4_3_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование приказа (отпуск по графику, отпуск по заявлению)', 3, NULL, TRUE, NULL
    FROM l3_3_5
    RETURNING id
),
l4_3_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание  приказа, ознакомление работника', 4, NULL, TRUE, NULL
    FROM l3_3_5
    RETURNING id
),
l4_3_6_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка заявки на отзыв работника из отпуска', 1, NULL, TRUE, NULL
    FROM l3_3_6
    RETURNING id
),
l4_3_6_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка возможности отзыва работника из отпуска', 2, NULL, TRUE, NULL
    FROM l3_3_6
    RETURNING id
),
l4_3_6_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение согласия работника на отзыв из отпуска (Заявление работника об удержании из заработной платы)', 3, NULL, TRUE, NULL
    FROM l3_3_6
    RETURNING id
),
l4_3_6_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выполнение мероприятия в системе', 4, NULL, TRUE, NULL
    FROM l3_3_6
    RETURNING id
),
l4_3_6_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выгрузка и организация подписания приказа', 5, NULL, TRUE, NULL
    FROM l3_3_6
    RETURNING id
),
l4_3_6_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работника с приказом', 6, NULL, TRUE, NULL
    FROM l3_3_6
    RETURNING id
),
l4_3_7_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Получение согласованного заявления от работника', 1, NULL, TRUE, NULL
    FROM l3_3_7
    RETURNING id
),
l4_3_7_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка наличия права на компенсацию', 2, NULL, TRUE, NULL
    FROM l3_3_7
    RETURNING id
),
l4_3_7_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выполнение мероприятия в системе', 3, NULL, TRUE, NULL
    FROM l3_3_7
    RETURNING id
),
l4_3_7_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Выгрузка и организация подписания приказа', 4, NULL, TRUE, NULL
    FROM l3_3_7
    RETURNING id
),
l4_3_8_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет плановых графиков работы/сменности на следующий календарный год', 1, NULL, TRUE, NULL
    FROM l3_3_8
    RETURNING id
),
l4_3_8_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка графика рабочего времени, инициация корректировки (при необходимости)', 2, NULL, TRUE, NULL
    FROM l3_3_8
    RETURNING id
),
l4_3_8_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Корректировка графика работы/сменности (при необходимости)', 3, NULL, TRUE, NULL
    FROM l3_3_8
    RETURNING id
),
l4_3_8_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Утверждение графика работы/сменности', 4, NULL, TRUE, NULL
    FROM l3_3_8
    RETURNING id
),
l4_3_8_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с графиком рабочего времени', 5, NULL, TRUE, NULL
    FROM l3_3_8
    RETURNING id
),
l4_3_9_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор табелей рабочего времени от ответственных работников для расчета заработной платы', 1, NULL, TRUE, NULL
    FROM l3_3_9
    RETURNING id
),
l4_3_9_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проверка и корректировка (при необходимости) табелей рабочего времени', 2, NULL, TRUE, NULL
    FROM l3_3_9
    RETURNING id
),
l4_3_9_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование и проверка табеля в учетной системе', 3, NULL, TRUE, NULL
    FROM l3_3_9
    RETURNING id
),
l4_3_9_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование бумажного носителя табеля', 4, NULL, TRUE, NULL
    FROM l3_3_9
    RETURNING id
),
l4_3_9_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подписание табеля рабочего времени', 5, NULL, TRUE, NULL
    FROM l3_3_9
    RETURNING id
),
l4_3_9_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ведение фактического учета присутствия работников', 6, NULL, TRUE, NULL
    FROM l3_3_9
    RETURNING id
),
l4_3_9_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных об отсутствиях/присутствиях на основании первичных документов', 7, NULL, TRUE, NULL
    FROM l3_3_9
    RETURNING id
),
l4_3_10_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документа-основания, получение согласия от работников (формирование приложения к распорядительному документу)', 1, NULL, TRUE, NULL
    FROM l3_3_10
    RETURNING id
),
l4_3_10_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка распорядительного документа', 2, NULL, TRUE, NULL
    FROM l3_3_10
    RETURNING id
),
l4_3_10_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование и утверждение распорядительного документа', 3, NULL, TRUE, NULL
    FROM l3_3_10
    RETURNING id
),
l4_3_10_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ввод данных в систему', 4, NULL, TRUE, NULL
    FROM l3_3_10
    RETURNING id
),
l4_3_11_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Издание приказа об организации труда в период спада производства', 1, NULL, TRUE, NULL
    FROM l3_3_11
    RETURNING id
),
l4_3_11_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка уведомлений в центры занятости', 2, NULL, TRUE, NULL
    FROM l3_3_11
    RETURNING id
),
l4_3_11_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление сотрудников с приказом', 3, NULL, TRUE, NULL
    FROM l3_3_11
    RETURNING id
),
l4_3_11_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ввод данных в систему', 4, NULL, TRUE, NULL
    FROM l3_3_11
    RETURNING id
),
l4_4_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка заявки на подбор', 1, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Обработка заявки', 2, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Поиск кандидатов', 3, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение собеседований', 4, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование кандидата (ГД-2 и ниже)', 5, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование кандидата (уровень ГД-1)', 6, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка предложения (оффер)', 7, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор пакета документов для трудоустройства', 8, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_4_3_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ведение базы кандидатов', 9, NULL, TRUE, NULL
    FROM l3_4_3
    RETURNING id
),
l4_5_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Формирование групп для проведения корпоративного обучения', 1, NULL, TRUE, NULL
    FROM l3_5_4
    RETURNING id
),
l4_5_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация тренингов', 2, NULL, TRUE, NULL
    FROM l3_5_4
    RETURNING id
),
l4_5_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка распорядительных документов о проведении обучения', 3, NULL, TRUE, NULL
    FROM l3_5_4
    RETURNING id
),
l4_5_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ввод данных в систему', 4, NULL, TRUE, NULL
    FROM l3_5_4
    RETURNING id
),
l4_5_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор обратной связи по итогам обучения', 5, NULL, TRUE, NULL
    FROM l3_5_4
    RETURNING id
),
l4_5_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор предложений и личных заявлений о включение в список резерва', 1, NULL, TRUE, NULL
    FROM l3_5_5
    RETURNING id
),
l4_5_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование списка КР внутри Общества', 2, NULL, TRUE, NULL
    FROM l3_5_5
    RETURNING id
),
l4_5_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Составление ИПР', 3, NULL, TRUE, NULL
    FROM l3_5_5
    RETURNING id
),
l4_5_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль исполнения ИПР, проведение стажировок', 4, NULL, TRUE, NULL
    FROM l3_5_5
    RETURNING id
),
l4_6_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Анализ рынка оплаты труда, определение политик в области мотивации и стимулирования', 1, NULL, TRUE, NULL
    FROM l3_6_1
    RETURNING id
),
l4_6_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка и актуализация положений об оплате труда и мотивации', 2, NULL, TRUE, NULL
    FROM l3_6_1
    RETURNING id
),
l4_6_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка и актуализация систем окладов, тарифных ставок', 3, NULL, TRUE, NULL
    FROM l3_6_1
    RETURNING id
),
l4_6_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Создание нового вида начисления', 4, NULL, TRUE, NULL
    FROM l3_6_1
    RETURNING id
),
l4_6_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Ознакомление работников с ЛНА', 5, NULL, TRUE, NULL
    FROM l3_6_1
    RETURNING id
),
l4_6_3_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение расчета оплаты при повременной системе', 1, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Проведение расчета оплаты при сдельной системе', 2, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подведение итогов для премирования (ежемесячное, квартальное, годовое)', 3, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор согласованных справок выполнения показателей для премирования', 4, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Расчет размера премии работникам  в соответствии с ЛНА', 5, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка распорядительных документов о премировании', 6, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Согласование и утверждение распорядительных документов о премировании', 7, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка распорядительных документов о доплатах / надбавках', 8, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных о премировании', 9, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_10 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных доплатах и надбавках в систему (если необходимо внесение изменений в ТД )', 10, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_3_11 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных доплатах и надбавках в систему (разовые начисления, содержащие суммы)', 11, NULL, TRUE, NULL
    FROM l3_6_3
    RETURNING id
),
l4_6_4_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка политик и типовых ЛНА в области нематериальной мотивации', 1, NULL, TRUE, NULL
    FROM l3_6_4
    RETURNING id
),
l4_6_4_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов на награждение работников (за исключением производственных характеристик)', 2, NULL, TRUE, NULL
    FROM l3_6_4
    RETURNING id
),
l4_6_4_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка производственных характеристик', 3, NULL, TRUE, NULL
    FROM l3_6_4
    RETURNING id
),
l4_6_4_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Организация поздравлений к знаменательным датам', 4, NULL, TRUE, NULL
    FROM l3_6_4
    RETURNING id
),
l4_6_4_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка корпоративных мероприятий', 5, NULL, TRUE, NULL
    FROM l3_6_4
    RETURNING id
),
l4_6_4_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка приказа о награждении', 6, NULL, TRUE, NULL
    FROM l3_6_4
    RETURNING id
),
l4_6_5_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Материальная помощь', 1, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Разработка и согласование положения, программы, видов помощи', 2, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Сбор заявлений от работников, формирование списков для предоставления мат помощи', 3, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка документов, в тч. протоколов и проведение согласования на предприятии', 4, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка и подписание приказов о предоставлении материальной помощи', 5, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_6 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение данных в систему', 6, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_7 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Учет льготный категорий (работников и бывших работников): инвалиды, многодетные семьи, вдовы, ветераны и пр. категории', 7, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_8 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Учет и актуализация списков льготных категорий, получение подтверждающих документов', 8, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_9 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Внесение информации в учетную систему', 9, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_6_5_10 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Подготовка информации по запросу', 10, NULL, TRUE, NULL
    FROM l3_6_5
    RETURNING id
),
l4_8_1_1 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Статистическая отчетность (П-4 (НЗ), 1-Т (условия труда), 1-Т (проф) и т.д.)', 1, NULL, TRUE, NULL
    FROM l3_8_1
    RETURNING id
),
l4_8_1_2 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Статистическая отчетность (П-4)', 2, NULL, TRUE, NULL
    FROM l3_8_1
    RETURNING id
),
l4_8_1_3 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отчетность в ПФР и ФСС (ЕФС-1, РСВ и т.д.)', 3, NULL, TRUE, NULL
    FROM l3_8_1
    RETURNING id
),
l4_8_1_4 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Отчетность в органы местного самоуправления (в т.ч. ТОР)', 4, NULL, TRUE, NULL
    FROM l3_8_1
    RETURNING id
),
l4_8_1_5 AS (
    INSERT INTO process_4 (process_3_id, f4_name, sort, note, is_active, executor_id)
    SELECT id, 'Контроль и методология законодательной отчетности', 5, NULL, TRUE, NULL
    FROM l3_8_1
    RETURNING id
)
SELECT COUNT(*) FROM l4_8_1_5;

COMMIT;
