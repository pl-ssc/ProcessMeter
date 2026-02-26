import { query } from '../../db/index.js';

export default async function adminProcessesRoutes(fastify, options) {
    fastify.get('/process-1', { preHandler: [fastify.authenticate, fastify.requireAdminRole] }, async () => {
        const { rows } = await query(
            `SELECT id, f1_name
       FROM process_1
       WHERE is_active IS DISTINCT FROM false
       ORDER BY COALESCE(sort, 0), f1_name`
        );
        return { process_1: rows };
    });
}
