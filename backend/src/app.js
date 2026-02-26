import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import fastifyCookie from '@fastify/cookie';

import authPlugin from './plugins/auth.js';
import adminPlugin from './plugins/admin.js';

import authRoutes from './routes/auth.js';
import adminUsersRoutes from './routes/admin/users.js';
import adminDepartmentsRoutes from './routes/admin/departments.js';
import adminProfessionsRoutes from './routes/admin/professions.js';
import adminProcessesRoutes from './routes/admin/processes.js';
import adminImportRoutes from './routes/admin/import.js';
import adminSettingsRoutes from './routes/admin/settings.js';
import adminNocodbRoutes from './routes/admin/nocodb.js';
import usersRoutes from './routes/users.js';
import processesRoutes from './routes/processes.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export async function buildApp(opts = {}) {
    const app = Fastify(opts);

    await app.register(cors, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
    });

    await app.register(rateLimit, {
        global: false, // only routes with config.rateLimit will be limited
        addHeaders: { 'x-ratelimit-limit': true, 'x-ratelimit-remaining': true, 'retry-after': true },
    });

    await app.register(fastifyCookie, {
        secret: env.JWT_SECRET,
        hook: 'onRequest'
    });

    await app.register(authPlugin);
    await app.register(adminPlugin);

    app.get('/api/health', async () => ({ ok: true }));

    app.register(authRoutes, { prefix: '/api/auth' });
    app.register(adminUsersRoutes, { prefix: '/api/admin/users' });
    app.register(adminDepartmentsRoutes, { prefix: '/api/admin/departments' });
    app.register(adminProfessionsRoutes, { prefix: '/api/admin/professions' });
    app.register(adminProcessesRoutes, { prefix: '/api/admin' });
    app.register(adminImportRoutes, { prefix: '/api/admin' });
    app.register(adminSettingsRoutes, { prefix: '/api/admin' });
    app.register(adminNocodbRoutes, { prefix: '/api/admin/nocodb' });
    app.register(usersRoutes, { prefix: '/api/users' });
    app.register(processesRoutes, { prefix: '/api' });

    if (fs.existsSync(env.STATIC_DIR)) {
        await app.register(fastifyStatic, {
            root: env.STATIC_DIR,
            prefix: '/',
        });

        app.setNotFoundHandler((request, reply) => {
            const indexPath = path.join(env.STATIC_DIR, 'index.html');
            if (fs.existsSync(indexPath)) {
                reply.type('text/html').send(fs.createReadStream(indexPath));
                return;
            }
            reply.code(404).send({ error: 'not found' });
        });
    }

    return app;
}
