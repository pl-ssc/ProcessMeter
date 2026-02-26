import pool, { query } from '../db/index.js';

export default async function processesRoutes(fastify, options) {
    fastify.get('/systems', { preHandler: [fastify.authenticate] }, async () => {
        const { rows } = await query(
            'SELECT system_id, system_name FROM systems WHERE is_active IS DISTINCT FROM false ORDER BY system_name'
        );
        return { systems: rows };
    });

    fastify.get('/processes', { preHandler: [fastify.authenticate] }, async (request) => {
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
          ) as has_data
       FROM process_3 p3
       LEFT JOIN process_2 p2 ON p2.id = p3.process_2_id
       LEFT JOIN process_1 p1 ON p1.id = p2.process_1_id
       WHERE p3.is_active IS DISTINCT FROM false
       ORDER BY COALESCE(p1.sort, 0), COALESCE(p2.sort, 0), COALESCE(p3.sort, 0), p3.f3_name`,
            [userId]
        );
        return { process_3: rows };
    });

    fastify.get('/answers', { preHandler: [fastify.authenticate] }, async (request) => {
        const userId = request.user.sub;
        const { process_3_id } = request.query || {};

        const params = [userId];
        let filter = '';
        if (process_3_id) {
            params.push(process_3_id);
            filter = 'AND p4.process_3_id = $2';
        }

        const { rows } = await query(
            `SELECT
          ua.id,
          ua.process_4_id as operation_id,
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
          e.name AS executor_name
       FROM user_answers ua
       JOIN process_4 p4 ON p4.id = ua.process_4_id
       LEFT JOIN process_3 p3 ON p3.id = p4.process_3_id
       LEFT JOIN process_2 p2 ON p2.id = p3.process_2_id
       LEFT JOIN process_1 p1 ON p1.id = p2.process_1_id
       LEFT JOIN executors e ON e.id = p4.executor_id
       WHERE ua.user_id = $1
         AND p4.is_active IS DISTINCT FROM false
         ${filter}
       ORDER BY COALESCE(p1.sort, 0), COALESCE(p2.sort, 0), COALESCE(p3.sort, 0), COALESCE(p4.sort, 0), p4.f4_name`
            , params);

        return { answers: rows };
    });

    fastify.post('/answers/bulk', {
        preHandler: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                operation_id: { type: ['integer', 'string'] },
                                labor_hours: { type: ['number', 'string', 'null'] },
                                system_id: { type: ['integer', 'string', 'null'] },
                                note: { type: ['string', 'null'] }
                            },
                            required: ['operation_id']
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
            // Check if user is already completed
            const { rows: userRows } = await client.query('SELECT is_survey_completed FROM users WHERE id = $1', [userId]);
            if (userRows.length > 0 && userRows[0].is_survey_completed) {
                client.release();
                return reply.code(403).send({ error: 'Survey is already completed and locked for editing.' });
            }

            await client.query('BEGIN');
            const opIds = [];
            const hours = [];
            const sysIds = [];
            const notes = [];

            for (const item of items) {
                if (!item.operation_id) continue;
                opIds.push(Number(item.operation_id));
                hours.push(item.labor_hours === '' || item.labor_hours === null ? null : Number(item.labor_hours));
                sysIds.push(item.system_id === '' || item.system_id === null ? null : Number(item.system_id));
                notes.push(item.note === '' || item.note === null ? null : item.note);
            }

            if (opIds.length > 0) {
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

    fastify.post('/answers/complete', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const userId = request.user.sub;

        // Block if already complete
        const { rows: userRows } = await query('SELECT is_survey_completed FROM users WHERE id = $1', [userId]);
        if (userRows.length > 0 && userRows[0].is_survey_completed) {
            return reply.code(403).send({ error: 'Survey is already completed and locked.' });
        }

        const { rows } = await query(
            `UPDATE users
             SET is_survey_completed = true, survey_completed_at = now()
             WHERE id = $1 AND is_survey_completed = false
             RETURNING id`,
            [userId]
        );

        return { updated: rows.length };
    });

    fastify.get('/user/stats', { preHandler: [fastify.authenticate] }, async (request) => {
        const userId = request.user.sub;

        const { rows: stats } = await query(
            `SELECT 
         COALESCE(SUM(ua.labor_hours), 0) as total_hours,
         u.is_survey_completed as is_submitted
       FROM users u
       LEFT JOIN user_answers ua ON ua.user_id = u.id
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
