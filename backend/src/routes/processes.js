import pool, { query } from '../db/index.js';
import { recordSurveyEvent } from '../services/surveyEventLog.js';

export default async function processesRoutes(fastify, options) {
    async function ensureSurveyEditable(client, userId, reply, completedMessage) {
        const { rows } = await client.query('SELECT is_survey_completed FROM users WHERE id = $1', [userId]);
        if (rows.length > 0 && rows[0].is_survey_completed) {
            reply.code(403).send({ error: completedMessage });
            return false;
        }
        return true;
    }

    async function userHasProcess3Access(client, userId, process3Id) {
        const { rows } = await client.query(
            `SELECT 1
               FROM process_3 p3
               JOIN process_2 p2 ON p2.id = p3.process_2_id
               JOIN user_process_1_access upa ON upa.process_1_id = p2.process_1_id
              WHERE p3.id = $2
                AND upa.user_id = $1
              LIMIT 1`,
            [userId, process3Id]
        );

        return rows.length > 0;
    }

    async function userHasProcess4Access(client, userId, process4Id) {
        const { rows } = await client.query(
            `SELECT 1
               FROM process_4 p4
               JOIN process_3 p3 ON p3.id = p4.process_3_id
               JOIN process_2 p2 ON p2.id = p3.process_2_id
               JOIN user_process_1_access upa ON upa.process_1_id = p2.process_1_id
              WHERE p4.id = $2
                AND upa.user_id = $1
              LIMIT 1`,
            [userId, process4Id]
        );

        return rows.length > 0;
    }

    fastify.get('/systems', { preHandler: [fastify.authenticate, fastify.requireRespondentRole] }, async () => {
        const { rows } = await query(
            'SELECT system_id, system_name FROM systems WHERE is_active IS DISTINCT FROM false ORDER BY system_name'
        );
        return { systems: rows };
    });

    fastify.get('/processes', { preHandler: [fastify.authenticate, fastify.requireRespondentRole] }, async (request) => {
        const userId = request.user.sub;
        const { rows } = await query(
            `SELECT 
          p3.id as process_3_id,
          p3.f3_name, 
          p2.id as process_2_id,
          p2.f2_name, 
          p1.id as process_1_id,
          p1.f1_name,
          EXISTS (
              SELECT 1 
              FROM process_4 p4
              JOIN user_answers ua ON ua.process_4_id = p4.id
              WHERE p4.process_3_id = p3.id
                AND ua.user_id = $1
                AND ua.labor_hours IS NOT NULL
          ) OR EXISTS (
              SELECT 1
              FROM user_added_operations uao
              WHERE uao.process_3_id = p3.id
                AND uao.user_id = $1
                AND (
                    uao.labor_hours IS NOT NULL
                    OR uao.system_id IS NOT NULL
                    OR NULLIF(BTRIM(uao.note), '') IS NOT NULL
                    OR NULLIF(BTRIM(uao.name), '') IS NOT NULL
                )
          ) as has_data
       FROM process_3 p3
       LEFT JOIN process_2 p2 ON p2.id = p3.process_2_id
       LEFT JOIN process_1 p1 ON p1.id = p2.process_1_id
       JOIN user_process_1_access upa ON upa.user_id = $1 AND upa.process_1_id = p1.id
       WHERE p3.is_active IS DISTINCT FROM false
       ORDER BY COALESCE(p1.sort, 0), COALESCE(p2.sort, 0), COALESCE(p3.sort, 0), p3.f3_name`,
            [userId]
        );
        return { process_3: rows };
    });

    fastify.get('/answers', { preHandler: [fastify.authenticate, fastify.requireRespondentRole] }, async (request) => {
        const userId = request.user.sub;
        const { process_3_id } = request.query || {};

        const params = [userId];
        let filter = '';
        if (process_3_id) {
            params.push(process_3_id);
            filter = 'AND p4.process_3_id = $2';
        }

        const customFilter = process_3_id ? 'AND uao.process_3_id = $2' : '';
        const { rows } = await query(
            `SELECT *
               FROM (
                    SELECT
                      'catalog'::text AS answer_kind,
                      CONCAT('catalog:', ua.process_4_id) AS row_id,
                      ua.id,
                      ua.process_4_id as operation_id,
                      NULL::bigint as custom_operation_id,
                      ua.labor_hours,
                      ua.system_id,
                      ua.note,
                      p4.id as p4_id,
                      p4.f4_name,
                      p4.process_3_id,
                      p3.id as p3_id,
                      p3.f3_name,
                      p2.id as p2_id,
                      p2.f2_name,
                      p1.id as p1_id,
                      p1.f1_name,
                      p4.executor_id,
                      e.name AS executor_name,
                      false as is_custom,
                      COALESCE(p4.sort, 0) as operation_sort,
                      0 as source_sort
                   FROM user_answers ua
                   JOIN process_4 p4 ON p4.id = ua.process_4_id
                   LEFT JOIN process_3 p3 ON p3.id = p4.process_3_id
                   LEFT JOIN process_2 p2 ON p2.id = p3.process_2_id
                   LEFT JOIN process_1 p1 ON p1.id = p2.process_1_id
                   JOIN user_process_1_access upa ON upa.user_id = $1 AND upa.process_1_id = p1.id
                   LEFT JOIN executors e ON e.id = p4.executor_id
                  WHERE ua.user_id = $1
                    AND p4.is_active IS DISTINCT FROM false
                    ${filter}

                  UNION ALL

                  SELECT
                      'custom'::text AS answer_kind,
                      CONCAT('custom:', uao.id) AS row_id,
                      uao.id,
                      NULL::integer as operation_id,
                      uao.id as custom_operation_id,
                      uao.labor_hours,
                      uao.system_id,
                      uao.note,
                      NULL::integer as p4_id,
                      uao.name as f4_name,
                      uao.process_3_id,
                      p3.id as p3_id,
                      p3.f3_name,
                      p2.id as p2_id,
                      p2.f2_name,
                      p1.id as p1_id,
                      p1.f1_name,
                      NULL::integer as executor_id,
                      NULL::text AS executor_name,
                      true as is_custom,
                      1000000 as operation_sort,
                      1 as source_sort
                   FROM user_added_operations uao
                   JOIN process_3 p3 ON p3.id = uao.process_3_id
                   LEFT JOIN process_2 p2 ON p2.id = p3.process_2_id
                   LEFT JOIN process_1 p1 ON p1.id = p2.process_1_id
                   JOIN user_process_1_access upa ON upa.user_id = $1 AND upa.process_1_id = p1.id
                  WHERE uao.user_id = $1
                    ${customFilter}
               ) answers
           ORDER BY COALESCE(p1_id, 0), COALESCE(p2_id, 0), COALESCE(p3_id, 0), source_sort, operation_sort, f4_name`,
            params
        );

        return { answers: rows };
    });

    fastify.post('/answers/bulk', {
        preHandler: [fastify.authenticate, fastify.requireRespondentRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                answer_kind: { type: ['string', 'null'], enum: ['catalog', 'custom', null] },
                                row_id: { type: ['string', 'null'] },
                                operation_id: { type: ['integer', 'string', 'null'] },
                                custom_operation_id: { type: ['integer', 'string', 'null'] },
                                labor_hours: { type: ['number', 'string', 'null'] },
                                system_id: { type: ['integer', 'string', 'null'] },
                                note: { type: ['string', 'null'] }
                            }
                        },
                        minItems: 1
                    }
                },
                required: ['items']
            }
        }
    }, async (request, reply) => {
        const userId = request.user.sub;
        const { items } = request.body;

        const client = await pool.connect();
        try {
            const isEditable = await ensureSurveyEditable(client, userId, reply, 'Survey is already completed and locked for editing.');
            if (!isEditable) {
                return;
            }

            await client.query('BEGIN');
            const catalogItems = [];
            const customItems = [];

            for (const item of items) {
                const normalized = {
                    labor_hours: item.labor_hours === '' || item.labor_hours === null ? null : Number(item.labor_hours),
                    system_id: item.system_id === '' || item.system_id === null ? null : Number(item.system_id),
                    note: item.note === '' || item.note === null ? null : item.note
                };

                if (item.answer_kind === 'custom' || item.custom_operation_id) {
                    if (!item.custom_operation_id) continue;
                    customItems.push({ custom_operation_id: Number(item.custom_operation_id), ...normalized });
                    continue;
                }

                if (!item.operation_id) continue;
                catalogItems.push({ operation_id: Number(item.operation_id), ...normalized });
            }

            for (const item of catalogItems) {
                const hasAccess = await userHasProcess4Access(client, userId, item.operation_id);
                if (!hasAccess) {
                    await client.query('ROLLBACK');
                    return reply.code(403).send({ error: 'Access denied for the selected process.' });
                }
            }

            for (const item of customItems) {
                const { rows: customRows } = await client.query(
                    'SELECT process_3_id FROM user_added_operations WHERE id = $1 AND user_id = $2',
                    [item.custom_operation_id, userId]
                );
                const process3Id = customRows[0]?.process_3_id;
                const hasAccess = process3Id ? await userHasProcess3Access(client, userId, process3Id) : false;
                if (!hasAccess) {
                    await client.query('ROLLBACK');
                    return reply.code(403).send({ error: 'Access denied for the selected process.' });
                }
            }

            if (catalogItems.length > 0) {
                const opIds = catalogItems.map((item) => item.operation_id);
                const hours = catalogItems.map((item) => item.labor_hours);
                const sysIds = catalogItems.map((item) => item.system_id);
                const notes = catalogItems.map((item) => item.note);

                await client.query(
                    `UPDATE user_answers AS ua
                     SET labor_hours = args.labor_hours,
                         system_id = args.system_id,
                         note = args.note
                     FROM (
                         SELECT unnest($1::integer[]) AS process_4_id,
                                unnest($2::numeric[]) AS labor_hours,
                                unnest($3::integer[]) AS system_id,
                                unnest($4::text[]) AS note
                     ) AS args
                     WHERE ua.user_id = $5 AND ua.process_4_id = args.process_4_id`,
                    [opIds, hours, sysIds, notes, userId]
                );
            }

            if (customItems.length > 0) {
                const ids = customItems.map((item) => item.custom_operation_id);
                const hours = customItems.map((item) => item.labor_hours);
                const sysIds = customItems.map((item) => item.system_id);
                const notes = customItems.map((item) => item.note);

                await client.query(
                    `UPDATE user_added_operations AS uao
                     SET labor_hours = args.labor_hours,
                         system_id = args.system_id,
                         note = args.note
                     FROM (
                         SELECT unnest($1::bigint[]) AS custom_operation_id,
                                unnest($2::numeric[]) AS labor_hours,
                                unnest($3::integer[]) AS system_id,
                                unnest($4::text[]) AS note
                     ) AS args
                     WHERE uao.user_id = $5 AND uao.id = args.custom_operation_id`,
                    [ids, hours, sysIds, notes, userId]
                );
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            request.log.error(err);
            return reply.code(500).send({ error: 'bulk update failed' });
        } finally {
            client.release();
        }

        return { ok: true };
    });

    fastify.post('/answers/custom', {
        preHandler: [fastify.authenticate, fastify.requireRespondentRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    process_3_id: { type: ['integer', 'string'] },
                    name: { type: 'string', minLength: 1 },
                    labor_hours: { type: ['number', 'string', 'null'] },
                    system_id: { type: ['integer', 'string', 'null'] },
                    note: { type: ['string', 'null'] }
                },
                required: ['process_3_id', 'name']
            }
        }
    }, async (request, reply) => {
        const userId = request.user.sub;
        const client = await pool.connect();

        try {
            const isEditable = await ensureSurveyEditable(client, userId, reply, 'Survey is already completed and locked for editing.');
            if (!isEditable) {
                return;
            }

            const process3Id = Number(request.body.process_3_id);
            const hasAccess = await userHasProcess3Access(client, userId, process3Id);
            if (!hasAccess) {
                return reply.code(403).send({ error: 'Access denied for the selected process.' });
            }

            const name = request.body.name.trim();
            const note = request.body.note === '' || request.body.note === null ? null : request.body.note;
            const laborHours = request.body.labor_hours === '' || request.body.labor_hours === null ? null : Number(request.body.labor_hours);
            const systemId = request.body.system_id === '' || request.body.system_id === null ? null : Number(request.body.system_id);

            const { rows } = await client.query(
                `INSERT INTO user_added_operations (user_id, process_3_id, name, labor_hours, system_id, note)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, process_3_id, name, labor_hours, system_id, note`,
                [userId, process3Id, name, laborHours, systemId, note]
            );

            return { operation: rows[0] };
        } finally {
            client.release();
        }
    });

    fastify.delete('/answers/custom/:id', { preHandler: [fastify.authenticate, fastify.requireRespondentRole] }, async (request, reply) => {
        const userId = request.user.sub;
        const client = await pool.connect();

        try {
            const isEditable = await ensureSurveyEditable(client, userId, reply, 'Survey is already completed and locked for editing.');
            if (!isEditable) {
                return;
            }

            const { rows } = await client.query(
                'DELETE FROM user_added_operations WHERE id = $1 AND user_id = $2 RETURNING id',
                [Number(request.params.id), userId]
            );

            if (rows.length === 0) {
                return reply.code(404).send({ error: 'Custom operation not found.' });
            }

            return reply.code(204).send();
        } finally {
            client.release();
        }
    });

    fastify.post('/answers/complete', { preHandler: [fastify.authenticate, fastify.requireRespondentRole] }, async (request, reply) => {
        const userId = request.user.sub;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows: userRows } = await client.query(
                'SELECT id, is_survey_completed FROM users WHERE id = $1 FOR UPDATE',
                [userId]
            );
            if (userRows.length > 0 && userRows[0].is_survey_completed) {
                await client.query('ROLLBACK');
                return reply.code(403).send({ error: 'Survey is already completed and locked.' });
            }

            const { rows } = await client.query(
                `UPDATE users
                 SET is_survey_completed = true, survey_completed_at = now()
                 WHERE id = $1 AND is_survey_completed = false
                 RETURNING id`,
                [userId]
            );

            if (rows.length > 0) {
                await recordSurveyEvent(client, {
                    userId,
                    actorUserId: userId,
                    eventType: 'survey_completed',
                    payload: { source: 'user_complete_action' }
                });
            }

            await client.query('COMMIT');
            return { updated: rows.length };
        } catch (err) {
            await client.query('ROLLBACK');
            request.log.error(err);
            return reply.code(500).send({ error: 'complete survey failed' });
        } finally {
            client.release();
        }
    });

    fastify.get('/user/stats', { preHandler: [fastify.authenticate, fastify.requireRespondentRole] }, async (request) => {
        const userId = request.user.sub;

        const { rows: stats } = await query(
            `SELECT 
         COALESCE((
            SELECT SUM(hours)
            FROM (
                SELECT ua.labor_hours AS hours
                FROM user_answers ua
                WHERE ua.user_id = u.id
                UNION ALL
                SELECT uao.labor_hours AS hours
                FROM user_added_operations uao
                WHERE uao.user_id = u.id
            ) all_hours
         ), 0) as total_hours,
         u.is_survey_completed as is_submitted
       FROM users u
       WHERE u.id = $1
       GROUP BY u.id, u.is_survey_completed`,
            [userId]
        );

        const totalHours = parseFloat(stats[0].total_hours || 0);
        const isSubmitted = stats[0].is_submitted || false;

        let status = 'not_started';
        if (isSubmitted) {
            status = 'completed';
        } else if (totalHours > 0) {
            status = 'in_progress';
        }

        const fteDivisor = Number(process.env.FTE_DIVISOR ?? 165);
        const safeDivisor = Number.isFinite(fteDivisor) && fteDivisor > 0 ? fteDivisor : 165;
        const fte = parseFloat((totalHours / safeDivisor).toFixed(2));

        return {
            total_hours: totalHours,
            fte,
            status,
            is_submitted: isSubmitted
        };
    });
}
