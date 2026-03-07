import { query } from '../db/index.js';

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function round(value, digits = 2) {
    return Number(toNumber(value).toFixed(digits));
}

function buildRespondentWhere(filters) {
    const conditions = [`u.role = 'respondent'`];
    const params = [];

    if (filters.department_id) {
        params.push(Number(filters.department_id));
        conditions.push(`u.department_id = $${params.length}`);
    }

    if (filters.profession_id) {
        params.push(Number(filters.profession_id));
        conditions.push(`u.profession_id = $${params.length}`);
    }

    if (filters.status === 'completed') {
        conditions.push('u.is_survey_completed = true');
    } else if (filters.status === 'in_progress') {
        conditions.push('u.is_survey_completed = false');
    }

    return { where: conditions.join(' AND '), params };
}

function topItems(items, limit, sortKey) {
    return [...items]
        .sort((left, right) => toNumber(right[sortKey]) - toNumber(left[sortKey]))
        .slice(0, limit);
}

export default async function analyticsRoutes(fastify) {
    fastify.get('/meta', { preHandler: [fastify.authenticate, fastify.requireAnalyticsRole] }, async () => {
        const [{ rows: departments }, { rows: professions }, { rows: process1 }, { rows: systems }, { rows: executors }] = await Promise.all([
            query(`SELECT id, name FROM departments WHERE is_active IS DISTINCT FROM false ORDER BY name`),
            query(`SELECT id, name FROM professions WHERE is_active IS DISTINCT FROM false ORDER BY name`),
            query(`SELECT id, f1_name AS name FROM process_1 WHERE is_active IS DISTINCT FROM false ORDER BY COALESCE(sort, 0), f1_name`),
            query(`SELECT system_id AS id, system_name AS name FROM systems WHERE is_active IS DISTINCT FROM false ORDER BY system_name`),
            query(`SELECT id, name FROM executors ORDER BY name`)
        ]);

        return {
            departments,
            professions,
            process_level_1: process1,
            systems,
            executors,
        };
    });

    fastify.get('/dashboard', { preHandler: [fastify.authenticate, fastify.requireAnalyticsRole] }, async (request) => {
        const { where, params } = buildRespondentWhere(request.query || {});
        const fteDivisor = Number(process.env.FTE_DIVISOR ?? 165);
        const safeDivisor = Number.isFinite(fteDivisor) && fteDivisor > 0 ? fteDivisor : 165;

        const respondentsPromise = query(
            `SELECT
                u.id AS user_id,
                u.username,
                u.full_name,
                u.created_at AS invitation_at,
                u.is_survey_completed,
                u.survey_completed_at AS completion_at,
                d.name AS department_name,
                p.name AS profession_name,
                COUNT(ua.id)::int AS total_operations,
                COUNT(*) FILTER (WHERE ua.labor_hours IS NOT NULL)::int AS filled_operations,
                COALESCE(SUM(ua.labor_hours), 0) AS total_labor_hours,
                MIN(ua.updated_at) FILTER (WHERE ua.labor_hours IS NOT NULL) AS first_answer_at
             FROM users u
             LEFT JOIN departments d ON d.id = u.department_id
             LEFT JOIN professions p ON p.id = u.profession_id
             LEFT JOIN user_answers ua ON ua.user_id = u.id
             WHERE ${where}
             GROUP BY u.id, d.name, p.name
             ORDER BY u.full_name NULLS LAST, u.username`,
            params
        );

        const answersPromise = query(
            `SELECT
                u.id AS user_id,
                u.full_name,
                d.name AS department_name,
                p.name AS profession_name,
                p1.f1_name AS process_level_1,
                p2.f2_name AS process_level_2,
                p3.f3_name AS process_level_3,
                p4.f4_name AS operation_name,
                COALESCE(e.name, 'Не указан') AS executor_type,
                COALESCE(s.system_name, 'Без ИТ-системы') AS system_name,
                ua.labor_hours,
                ua.note,
                ua.updated_at AS answer_updated_at
             FROM user_answers ua
             JOIN users u ON u.id = ua.user_id
             LEFT JOIN departments d ON d.id = u.department_id
             LEFT JOIN professions p ON p.id = u.profession_id
             JOIN process_4 p4 ON p4.id = ua.process_4_id
             JOIN process_3 p3 ON p3.id = p4.process_3_id
             JOIN process_2 p2 ON p2.id = p3.process_2_id
             JOIN process_1 p1 ON p1.id = p2.process_1_id
             LEFT JOIN executors e ON e.id = p4.executor_id
             LEFT JOIN systems s ON s.system_id = ua.system_id
             WHERE ${where.replaceAll('u.', 'u.')}
               AND ua.labor_hours IS NOT NULL
             ORDER BY ua.updated_at DESC NULLS LAST`,
            params
        );

        const [respondentsResult, answersResult] = await Promise.all([respondentsPromise, answersPromise]);
        const respondents = respondentsResult.rows.map((row) => {
            const completionPercentage = row.total_operations > 0
                ? round((row.filled_operations / row.total_operations) * 100)
                : 0;

            const elapsedDaysSinceInvitation = row.completion_at
                ? round((new Date(row.completion_at).getTime() - new Date(row.invitation_at).getTime()) / 86400000)
                : round((Date.now() - new Date(row.invitation_at).getTime()) / 86400000);

            const activeFillingDays = row.first_answer_at
                ? round(((row.completion_at ? new Date(row.completion_at).getTime() : Date.now()) - new Date(row.first_answer_at).getTime()) / 86400000)
                : null;

            return {
                ...row,
                total_labor_hours: round(row.total_labor_hours),
                completion_percentage: completionPercentage,
                elapsed_days_since_invitation: elapsedDaysSinceInvitation,
                active_filling_days: activeFillingDays,
            };
        });

        const answers = answersResult.rows.map((row) => ({
            ...row,
            labor_hours: round(row.labor_hours),
            fte: round(row.labor_hours / safeDivisor, 4),
            has_note: Boolean(row.note && row.note.trim()),
        }));

        const totalRespondents = respondents.length;
        const completedRespondents = respondents.filter((item) => item.is_survey_completed).length;
        const completionRate = totalRespondents > 0 ? round((completedRespondents / totalRespondents) * 100) : 0;
        const avgCompletionPercentage = totalRespondents > 0
            ? round(respondents.reduce((sum, item) => sum + item.completion_percentage, 0) / totalRespondents)
            : 0;
        const completedWithDuration = respondents.filter((item) => item.is_survey_completed);
        const avgCompletionDays = completedWithDuration.length > 0
            ? round(completedWithDuration.reduce((sum, item) => sum + item.elapsed_days_since_invitation, 0) / completedWithDuration.length)
            : 0;
        const totalHours = round(answers.reduce((sum, item) => sum + item.labor_hours, 0));
        const totalFte = round(totalHours / safeDivisor);

        const trendMap = new Map();
        for (const respondent of respondents) {
            if (!respondent.completion_at) continue;
            const day = new Date(respondent.completion_at).toISOString().slice(0, 10);
            trendMap.set(day, (trendMap.get(day) || 0) + 1);
        }

        const departmentProgressMap = new Map();
        for (const respondent of respondents) {
            const key = respondent.department_name || 'Без подразделения';
            const current = departmentProgressMap.get(key) || { department: key, total: 0, completed: 0 };
            current.total += 1;
            if (respondent.is_survey_completed) current.completed += 1;
            departmentProgressMap.set(key, current);
        }
        const departmentProgress = [...departmentProgressMap.values()].map((item) => ({
            ...item,
            completion_rate: item.total > 0 ? round((item.completed / item.total) * 100) : 0,
        }));

        const processMap = new Map();
        const executorMap = new Map();
        const departmentHoursMap = new Map();
        const professionHoursMap = new Map();
        const systemMap = new Map();
        const operationMap = new Map();
        const processSystemMap = new Map();
        const departmentProcessMixMap = new Map();

        for (const answer of answers) {
            const processKey = answer.process_level_1 || 'Без процесса';
            const executorKey = answer.executor_type || 'Не указан';
            const departmentKey = answer.department_name || 'Без подразделения';
            const professionKey = answer.profession_name || 'Без профессии';
            const systemKey = answer.system_name || 'Без ИТ-системы';
            const operationKey = answer.operation_name || 'Без операции';
            const mixKey = `${departmentKey}__${processKey}`;

            processMap.set(processKey, (processMap.get(processKey) || 0) + answer.labor_hours);
            executorMap.set(executorKey, (executorMap.get(executorKey) || 0) + answer.labor_hours);
            departmentHoursMap.set(departmentKey, (departmentHoursMap.get(departmentKey) || 0) + answer.labor_hours);
            professionHoursMap.set(professionKey, (professionHoursMap.get(professionKey) || 0) + answer.labor_hours);

            const systemItem = systemMap.get(systemKey) || {
                system_name: systemKey,
                labor_hours: 0,
                operations_without_system: 0,
                notes_count: 0,
            };
            systemItem.labor_hours += answer.labor_hours;
            if (systemKey === 'Без ИТ-системы') systemItem.operations_without_system += 1;
            if (answer.has_note) systemItem.notes_count += 1;
            systemMap.set(systemKey, systemItem);

            const operationItem = operationMap.get(operationKey) || {
                operation_name: operationKey,
                process_level_1: processKey,
                process_level_2: answer.process_level_2,
                process_level_3: answer.process_level_3,
                total_labor_hours: 0,
                total_respondents: new Set(),
                notes_count: 0,
                min_labor_hours: null,
                max_labor_hours: null,
            };
            operationItem.total_labor_hours += answer.labor_hours;
            operationItem.total_respondents.add(answer.user_id);
            if (answer.has_note) operationItem.notes_count += 1;
            operationItem.min_labor_hours = operationItem.min_labor_hours === null
                ? answer.labor_hours
                : Math.min(operationItem.min_labor_hours, answer.labor_hours);
            operationItem.max_labor_hours = operationItem.max_labor_hours === null
                ? answer.labor_hours
                : Math.max(operationItem.max_labor_hours, answer.labor_hours);
            operationMap.set(operationKey, operationItem);

            const processSystemKey = `${processKey}__${systemKey}`;
            processSystemMap.set(processSystemKey, {
                process_level_1: processKey,
                system_name: systemKey,
                labor_hours: round((processSystemMap.get(processSystemKey)?.labor_hours || 0) + answer.labor_hours),
            });

            departmentProcessMixMap.set(mixKey, {
                department_name: departmentKey,
                process_level_1: processKey,
                labor_hours: round((departmentProcessMixMap.get(mixKey)?.labor_hours || 0) + answer.labor_hours),
            });
        }

        const processTotals = topItems(
            [...processMap.entries()].map(([name, labor_hours]) => ({
                name,
                labor_hours: round(labor_hours),
                fte: round(labor_hours / safeDivisor),
            })),
            10,
            'labor_hours'
        );

        const executorDistribution = [...executorMap.entries()].map(([name, labor_hours]) => ({
            name,
            labor_hours: round(labor_hours),
            fte: round(labor_hours / safeDivisor),
        }));

        const departmentHours = topItems(
            [...departmentHoursMap.entries()].map(([name, labor_hours]) => ({
                name,
                labor_hours: round(labor_hours),
                fte: round(labor_hours / safeDivisor),
            })),
            10,
            'labor_hours'
        );

        const professionHours = topItems(
            [...professionHoursMap.entries()].map(([name, labor_hours]) => ({
                name,
                labor_hours: round(labor_hours),
                fte: round(labor_hours / safeDivisor),
            })),
            10,
            'labor_hours'
        );

        const systems = topItems(
            [...systemMap.values()].map((item) => ({
                ...item,
                labor_hours: round(item.labor_hours),
                fte: round(item.labor_hours / safeDivisor),
            })),
            10,
            'labor_hours'
        );

        const operations = [...operationMap.values()].map((item) => ({
            operation_name: item.operation_name,
            process_level_1: item.process_level_1,
            process_level_2: item.process_level_2,
            process_level_3: item.process_level_3,
            avg_labor_hours: item.total_respondents.size > 0 ? round(item.total_labor_hours / item.total_respondents.size) : 0,
            min_labor_hours: round(item.min_labor_hours),
            max_labor_hours: round(item.max_labor_hours),
            total_labor_hours: round(item.total_labor_hours),
            total_respondents: item.total_respondents.size,
            notes_count: item.notes_count,
        }));

        const topOperationsByAvg = topItems(operations, 12, 'avg_labor_hours');
        const topOperationsByNotes = topItems(operations, 12, 'notes_count');
        const manualHeavyOperations = operations
            .filter((operation) => {
                const withoutSystemHours = answers
                    .filter((answer) => answer.operation_name === operation.operation_name && answer.system_name === 'Без ИТ-системы')
                    .reduce((sum, answer) => sum + answer.labor_hours, 0);
                return withoutSystemHours > 0;
            })
            .map((operation) => ({
                ...operation,
                labor_hours_without_system: round(
                    answers
                        .filter((answer) => answer.operation_name === operation.operation_name && answer.system_name === 'Без ИТ-системы')
                        .reduce((sum, answer) => sum + answer.labor_hours, 0)
                ),
            }))
            .sort((left, right) => right.labor_hours_without_system - left.labor_hours_without_system)
            .slice(0, 10);

        return {
            summary: {
                total_respondents: totalRespondents,
                completed_respondents: completedRespondents,
                completion_rate: completionRate,
                avg_completion_days: avgCompletionDays,
                avg_completion_percentage: avgCompletionPercentage,
                total_hours: totalHours,
                total_fte: totalFte,
                avg_hours_per_respondent: totalRespondents > 0 ? round(totalHours / totalRespondents) : 0,
            },
            trends: [...trendMap.entries()]
                .map(([date, completed]) => ({ date, completed }))
                .sort((left, right) => left.date.localeCompare(right.date)),
            respondents,
            department_progress: departmentProgress.sort((left, right) => right.completion_rate - left.completion_rate),
            labor: {
                process_totals: processTotals,
                executor_distribution: executorDistribution.sort((left, right) => right.labor_hours - left.labor_hours),
                department_hours: departmentHours,
                profession_hours: professionHours,
            },
            processes: {
                top_operations_by_avg: topOperationsByAvg,
                top_operations_by_notes: topOperationsByNotes,
                operations_table: topItems(operations, 20, 'total_labor_hours'),
            },
            systems: {
                systems,
                process_system_matrix: topItems([...processSystemMap.values()], 20, 'labor_hours'),
                manual_heavy_operations: manualHeavyOperations,
            },
            organization: {
                department_process_mix: topItems([...departmentProcessMixMap.values()], 20, 'labor_hours'),
                department_hours: departmentHours,
                profession_hours: professionHours,
            },
        };
    });
}
