import fp from 'fastify-plugin';
import { env } from '../config/env.js';

export default fp(async (fastify, opts) => {
    fastify.decorate('requireAdmin', async (request, reply) => {
        const key = request.headers['x-admin-key'];
        if (!key || key !== env.ADMIN_API_KEY) {
            reply.code(403).send({ error: 'forbidden' });
        }
    });

    fastify.decorate('requireAdminRole', async (request, reply) => {
        if (request.user?.role !== 'admin') {
            reply.code(403).send({ error: 'forbidden' });
        }
    });
});
