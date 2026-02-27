export default async function statsRoutes(fastify, options) {
    fastify.get('/dashboard', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { role } = request.user;

        // Only admins and auditors can see stats
        if (role !== 'admin' && role !== 'auditor') {
            return reply.code(403).send({ error: 'Access denied' });
        }

        const client = await fastify.pg.connect();
        try {
            // 1. Progress
            const { rows: progressRows } = await client.query('SELECT * FROM view_stats_survey_progress');
            const progress = progressRows[0] || { completed_count: 0, total_count: 0, progress_percent: 0 };

            // 2. Average Duration
            const { rows: durationRows } = await client.query('SELECT * FROM view_stats_average_duration');
            const averageDuration = durationRows[0] || { avg_duration_interval: null, avg_duration_seconds: 0 };

            // 3. Trends (Last 30 days)
            const { rows: trendRows } = await client.query(`
                SELECT 
                    completion_date, 
                    completed_today 
                FROM view_stats_completion_trend 
                WHERE completion_date > CURRENT_DATE - INTERVAL '30 days'
            `);

            // 4. Detailed Table
            const { rows: respondentsRows } = await client.query('SELECT * FROM view_stats_respondents_detail');

            return {
                progress,
                averageDuration,
                trends: trendRows,
                respondents: respondentsRows
            };
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({ error: 'Failed to fetch statistics' });
        } finally {
            client.release();
        }
    });
}
