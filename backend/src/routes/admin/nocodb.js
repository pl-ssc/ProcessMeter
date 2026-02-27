import { nocodbClient } from '../../services/nocodb.js';

export default async function adminNocodbRoutes(fastify, options) {
    fastify.get('/users', { preHandler: [fastify.authenticate, fastify.requireAdminRole] }, async (request, reply) => {
        try {
            const users = await nocodbClient.getUsers(request.log);
            return { users };
        } catch (err) {
            request.log.error(err);
            return reply.code(err.message.includes('NocoDB credentials') ? 500 : (err.status || 500)).send({
                error: `NocoDB Error: ${err.message || 'Unknown network error'}`
            });
        }
    });

    fastify.post('/users', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    roles: { type: 'string', enum: ['owner', 'creator', 'editor', 'commenter', 'viewer'], default: 'editor' }
                },
                required: ['email']
            }
        }
    }, async (request, reply) => {
        try {
            const { email, roles } = request.body;
            const data = await nocodbClient.inviteUser(email, roles, request.log);
            return data;
        } catch (err) {
            request.log.error(err);
            return reply.code(err.message.includes('NocoDB credentials') ? 500 : (err.status || 500)).send({
                error: `NocoDB Error: ${err.message || 'Unknown network error'}`
            });
        }
    });
}
