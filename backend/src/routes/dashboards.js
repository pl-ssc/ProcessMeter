import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export default async function dashboardRoutes(fastify, options) {
    fastify.get('/token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { role } = request.user;

        // Only admins and auditors can see dashboards
        if (role !== 'admin' && role !== 'auditor') {
            return reply.code(403).send({ error: 'Access denied' });
        }

        const METABASE_SITE_URL = env.METABASE_SITE_URL;
        const METABASE_SECRET_KEY = env.METABASE_SECRET_KEY;

        if (!METABASE_SECRET_KEY) {
            return reply.code(500).send({ error: 'Metabase secret key not configured' });
        }

        const payload = {
            resource: { dashboard: 2 },
            params: {},
            exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
        };

        const token = jwt.sign(payload, METABASE_SECRET_KEY);

        return {
            token,
            instanceUrl: METABASE_SITE_URL
        };
    });
}
