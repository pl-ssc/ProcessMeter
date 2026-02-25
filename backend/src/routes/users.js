import pool from '../db/index.js';
import { createUser } from '../services/userService.js';

export default async function usersRoutes(fastify, options) {
    fastify.post('/', {
        preHandler: [fastify.requireAdmin],
        schema: {
            body: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                    full_name: { type: 'string', nullable: true },
                    process_1_access: { type: 'array', items: { type: 'string' }, minItems: 1 }
                },
                required: ['username', 'password', 'process_1_access']
            }
        }
    }, async (request, reply) => {
        const { username, password, full_name, process_1_access } = request.body;

        try {
            const user = await createUser({ username, password, full_name, role: 'respondent', process_1_access });
            return { user };
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({ error: 'create user failed' });
        }
    });
}
