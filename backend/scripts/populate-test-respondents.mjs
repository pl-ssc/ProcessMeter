import bcrypt from 'bcryptjs';
import pg from 'pg';

const TOTAL_USERS = 20;
const COMPLETED_USERS = 15;
const PARTIAL_USERS = 5;
const EMAIL_PREFIX = 'loadtest_';
const EMAIL_DOMAIN = 'example.test';
const DEFAULT_PASSWORD = 'Password123!';
const MIN_ENTRY_HOURS = 0.33;
const MAX_ENTRY_HOURS = 30;
const DEPARTMENTS = [
    'Отдел победы над дедлайнами',
    'Департамент таблиц и магии Excel',
    'Управление стратегического чаепития',
    'Служба героического документооборота',
    'Центр тонкой настройки реальности'
];
const PROFESSIONS = [
    'Бухгалтер',
    'Ведущий бухгалтер',
    'Бухгалтер по расчету заработной платы',
    'Специалист',
    'Стажер'
];
const FULL_NAMES = [
    'Иванова Мария Сергеевна',
    'Петров Алексей Николаевич',
    'Смирнова Анна Викторовна',
    'Кузнецов Дмитрий Олегович',
    'Попова Елена Андреевна',
    'Васильев Артем Игоревич',
    'Новикова Татьяна Павловна',
    'Морозов Кирилл Максимович',
    'Волкова Ольга Романовна',
    'Соколов Илья Евгеньевич',
    'Лебедева Юлия Александровна',
    'Козлов Андрей Сергеевич',
    'Павлова Наталья Ильинична',
    'Семенов Роман Алексеевич',
    'Голубева Дарья Михайловна',
    'Виноградов Максим Денисович',
    'Беляева Ксения Артемовна',
    'Зайцев Егор Валерьевич',
    'Тарасова Полина Олеговна',
    'Крылов Владимир Викторович',
    'Орлова Софья Ильинична',
    'Комаров Павел Андреевич',
    'Федорова Виктория Сергеевна',
    'Никитин Глеб Романович',
    'Жукова Ирина Петровна',
    'Медведев Степан Алексеевич',
    'Егорова Лидия Николаевна',
    'Богданов Тимофей Олегович',
    'Макарова Алина Дмитриевна',
    'Титов Константин Игоревич',
    'Киселева Вероника Павловна',
    'Данилов Никита Сергеевич',
    'Журавлева Светлана Андреевна',
    'Калинин Руслан Евгеньевич',
    'Назарова Милана Викторовна'
];
const UNEVEN_DEPARTMENT_DISTRIBUTION = [
    { name: 'Отдел победы над дедлайнами', count: 12, completed: 11 },
    { name: 'Департамент таблиц и магии Excel', count: 9, completed: 7 },
    { name: 'Управление стратегического чаепития', count: 7, completed: 1 },
    { name: 'Служба героического документооборота', count: 5, completed: 5 },
    { name: 'Центр тонкой настройки реальности', count: 2, completed: 1 }
];
const UNEVEN_PROFESSION_DISTRIBUTION = [
    { name: 'Бухгалтер', count: 12 },
    { name: 'Ведущий бухгалтер', count: 8 },
    { name: 'Бухгалтер по расчету заработной платы', count: 6 },
    { name: 'Специалист', count: 5 },
    { name: 'Стажер', count: 4 }
];

function parseArgs(argv) {
    const options = {
        startIndex: 1,
        count: TOTAL_USERS,
        completed: COMPLETED_USERS,
        partial: PARTIAL_USERS,
        replaceExisting: true
    };

    for (const arg of argv) {
        if (arg.startsWith('--start-index=')) {
            options.startIndex = Number(arg.split('=')[1]);
        } else if (arg.startsWith('--count=')) {
            options.count = Number(arg.split('=')[1]);
        } else if (arg.startsWith('--completed=')) {
            options.completed = Number(arg.split('=')[1]);
        } else if (arg.startsWith('--partial=')) {
            options.partial = Number(arg.split('=')[1]);
        } else if (arg === '--append') {
            options.replaceExisting = false;
        }
    }

    if (!Number.isInteger(options.startIndex) || options.startIndex < 1) {
        throw new Error('startIndex must be a positive integer');
    }

    if (!Number.isInteger(options.count) || options.count < 1) {
        throw new Error('count must be a positive integer');
    }

    if (!Number.isInteger(options.completed) || options.completed < 0) {
        throw new Error('completed must be a non-negative integer');
    }

    if (!Number.isInteger(options.partial) || options.partial < 0) {
        throw new Error('partial must be a non-negative integer');
    }

    if (options.completed + options.partial !== options.count) {
        throw new Error('completed + partial must equal count');
    }

    return options;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    const value = min + Math.random() * (max - min);
    return Number(value.toFixed(decimals));
}

function pad(num) {
    return String(num).padStart(2, '0');
}

function randomPastDate(daysBackMin = 7, daysBackMax = 35) {
    const days = randomInt(daysBackMin, daysBackMax);
    const hours = randomInt(0, 23);
    const minutes = randomInt(0, 59);
    return new Date(Date.now() - (((days * 24) + hours) * 60 + minutes) * 60 * 1000);
}

function generateHours(total, count) {
    const target = Number(total.toFixed(2));
    let remaining = target;
    const hours = [];

    for (let index = 0; index < count; index += 1) {
        const slotsLeft = count - index - 1;
        if (slotsLeft === 0) {
            hours.push(Number(remaining.toFixed(2)));
            break;
        }

        const minAllowed = Math.max(MIN_ENTRY_HOURS, remaining - (slotsLeft * MAX_ENTRY_HOURS));
        const maxAllowed = Math.min(MAX_ENTRY_HOURS, remaining - (slotsLeft * MIN_ENTRY_HOURS));
        const average = remaining / (slotsLeft + 1);
        const sampled = (randomFloat(minAllowed, maxAllowed) + average) / 2;
        const value = Number(Math.min(maxAllowed, Math.max(minAllowed, sampled)).toFixed(2));

        hours.push(value);
        remaining = Number((remaining - value).toFixed(2));
    }

    const diff = Number((target - hours.reduce((sum, value) => sum + value, 0)).toFixed(2));
    hours[hours.length - 1] = Number((hours[hours.length - 1] + diff).toFixed(2));

    return hours;
}

function getFullName(sequence) {
    return FULL_NAMES[(sequence - 1) % FULL_NAMES.length] || `Тестовый респондент ${pad(sequence)}`;
}

function buildUnevenDepartmentPlan(count) {
    if (count !== 35) return null;

    const buckets = UNEVEN_DEPARTMENT_DISTRIBUTION.map((item) => ({
        ...item,
        remaining: item.count,
        completedRemaining: item.completed
    }));
    const plan = [];

    while (plan.length < count) {
        const available = buckets
            .filter((item) => item.remaining > 0)
            .sort((a, b) => b.remaining - a.remaining || a.name.localeCompare(b.name, 'ru'));

        for (const bucket of available) {
            if (bucket.remaining <= 0) continue;

            const mode = bucket.completedRemaining > 0 ? 'completed' : 'partial';
            plan.push({ department: bucket.name, mode });
            bucket.remaining -= 1;
            if (mode === 'completed') {
                bucket.completedRemaining -= 1;
            }

            if (plan.length >= count) break;
        }
    }

    return plan;
}

function buildUnevenProfessionPlan(count) {
    if (count !== 35) return null;

    const buckets = UNEVEN_PROFESSION_DISTRIBUTION.map((item) => ({
        ...item,
        remaining: item.count
    }));
    const plan = [];

    while (plan.length < count) {
        const available = buckets
            .filter((item) => item.remaining > 0)
            .sort((a, b) => b.remaining - a.remaining || a.name.localeCompare(b.name, 'ru'));

        for (const bucket of available) {
            if (bucket.remaining <= 0) continue;
            plan.push(bucket.name);
            bucket.remaining -= 1;
            if (plan.length >= count) break;
        }
    }

    return plan;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const connectionString = process.env.TARGET_DATABASE_URL;
    if (!connectionString) {
        throw new Error('TARGET_DATABASE_URL is required');
    }

    const pool = new pg.Pool({ connectionString });
    const client = await pool.connect();

    try {
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        const { rows: processRows } = await client.query(
            `SELECT id FROM process_1 WHERE is_active IS DISTINCT FROM false ORDER BY id`
        );
        const { rows: systemRows } = await client.query(
            `SELECT system_id FROM systems WHERE is_active IS DISTINCT FROM false ORDER BY system_id`
        );

        const departmentIds = [];
        for (const name of DEPARTMENTS) {
            const { rows } = await client.query(
                `INSERT INTO departments (name, is_active)
                 VALUES ($1, true)
                 ON CONFLICT (name) DO UPDATE SET is_active = true
                 RETURNING id`,
                [name]
            );
            departmentIds.push(rows[0].id);
        }

        const professionIds = [];
        for (const name of PROFESSIONS) {
            const { rows } = await client.query(
                `INSERT INTO professions (name, is_active)
                 VALUES ($1, true)
                 ON CONFLICT (name) DO UPDATE SET is_active = true
                 RETURNING id`,
                [name]
            );
            professionIds.push(rows[0].id);
        }

        if (processRows.length === 0) {
            throw new Error('No process_1 data found. Import reference data before seeding respondents.');
        }

        await client.query('BEGIN');

        if (options.replaceExisting) {
            await client.query(
                `DELETE FROM users
                 WHERE username LIKE $1`,
                [`${EMAIL_PREFIX}%@${EMAIL_DOMAIN}`]
            );
        }

        const processIds = processRows.map((row) => row.id);
        const systemIds = systemRows.map((row) => row.system_id);
        const departmentPlan = options.startIndex === 1
            ? buildUnevenDepartmentPlan(options.count)
            : null;
        const professionPlan = options.startIndex === 1
            ? buildUnevenProfessionPlan(options.count)
            : null;
        const departmentIdByName = new Map(DEPARTMENTS.map((name, index) => [name, departmentIds[index]]));
        const professionIdByName = new Map(PROFESSIONS.map((name, index) => [name, professionIds[index]]));

        const summary = [];

        for (let offset = 0; offset < options.count; offset += 1) {
            const sequence = options.startIndex + offset;
            const plannedDepartment = departmentPlan?.[offset]?.department ?? DEPARTMENTS[(sequence - 1) % DEPARTMENTS.length];
            const plannedProfession = professionPlan?.[offset] ?? PROFESSIONS[(sequence - 1) % PROFESSIONS.length];
            const mode = departmentPlan?.[offset]?.mode ?? (offset < options.completed ? 'completed' : 'partial');
            const email = `${EMAIL_PREFIX}${pad(sequence)}@${EMAIL_DOMAIN}`;
            const fullName = getFullName(sequence);
            const createdAt = randomPastDate();
            const departmentId = departmentIdByName.get(plannedDepartment);
            const professionId = professionIdByName.get(plannedProfession);

            if (!options.replaceExisting) {
                await client.query('DELETE FROM users WHERE username = $1', [email]);
            }

            const { rows: insertedUsers } = await client.query(
                `INSERT INTO users (
                    username,
                    password_hash,
                    full_name,
                    role,
                    is_active,
                    department_id,
                    profession_id,
                    password_changed_at,
                    created_at,
                    is_survey_completed
                )
                VALUES ($1, $2, $3, 'respondent', true, $4, $5, now(), $6, false)
                RETURNING id`,
                [email, passwordHash, fullName, departmentId, professionId, createdAt]
            );

            const userId = insertedUsers[0].id;

            await client.query(
                `INSERT INTO user_process_1_access (user_id, process_1_id)
                 SELECT $1, unnest($2::int[])
                 ON CONFLICT DO NOTHING`,
                [userId, processIds]
            );

            await client.query('SELECT copy_operations_to_user_answers($1)', [userId]);

            const targetTotal = mode === 'completed'
                ? randomFloat(145, 180)
                : randomFloat(80, 150);
            const selectedCount = mode === 'completed'
                ? randomInt(10, 16)
                : randomInt(8, 13);

            const { rows: answerRows } = await client.query(
                `SELECT id, process_4_id
                 FROM user_answers
                 WHERE user_id = $1
                 ORDER BY random()
                 LIMIT $2`,
                [userId, selectedCount]
            );

            const hours = generateHours(targetTotal, answerRows.length);
            let totalHours = 0;

            for (let answerIndex = 0; answerIndex < answerRows.length; answerIndex += 1) {
                const answer = answerRows[answerIndex];
                const laborHours = hours[answerIndex];
                totalHours += laborHours;

                const attachSystem = systemIds.length > 0 && Math.random() < 0.62;
                const systemId = attachSystem ? systemIds[randomInt(0, systemIds.length - 1)] : null;
                const note = Math.random() < 0.25
                    ? `Тестовое заполнение ${pad(sequence)}`
                    : null;

                await client.query(
                    `UPDATE user_answers
                     SET labor_hours = $1,
                         system_id = $2,
                         note = $3
                     WHERE id = $4`,
                    [laborHours, systemId, note, answer.id]
                );
            }

            if (mode === 'completed') {
                const surveyCompletedAt = new Date(createdAt.getTime() + randomInt(2, 120) * 60 * 60 * 1000);
                await client.query(
                    `UPDATE users
                     SET is_survey_completed = true,
                         survey_completed_at = $2
                     WHERE id = $1`,
                    [userId, surveyCompletedAt]
                );
            }

            summary.push({
                email,
                mode,
                department: plannedDepartment,
                profession: plannedProfession,
                answers: answerRows.length,
                totalHours: Number(totalHours.toFixed(2))
            });
        }

        await client.query('COMMIT');

        const completed = summary.filter((item) => item.mode === 'completed');
        const partial = summary.filter((item) => item.mode === 'partial');

        console.log(JSON.stringify({
            created: summary.length,
            completed: completed.length,
            partial: partial.length,
            completed_hours_range: [
                Math.min(...completed.map((item) => item.totalHours)),
                Math.max(...completed.map((item) => item.totalHours))
            ],
            partial_hours_range: [
                Math.min(...partial.map((item) => item.totalHours)),
                Math.max(...partial.map((item) => item.totalHours))
            ],
            sample_users: summary.slice(0, 5)
        }, null, 2));
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
