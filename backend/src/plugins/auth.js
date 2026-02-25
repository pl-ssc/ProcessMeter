import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '../config/env.js';

export default fp(async (fastify, opts) => {
    await fastify.register(jwt, {
        secret: env.JWT_SECRET,
        cookie: {
            cookieName: 'pm_token',
            signed: false
        }
    });

    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ error: 'unauthorized' });
        }
    });
});
