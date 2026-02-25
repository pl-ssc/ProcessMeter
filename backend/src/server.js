import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { ensureAdminUser } from './db/init.js';
import fastifyCookie from '@fastify/cookie';

import authPlugin from './plugins/auth.js';
import adminPlugin from './plugins/admin.js';

import authRoutes from './routes/auth.js';
import adminUsersRoutes from './routes/admin/users.js';
import adminProcessesRoutes from './routes/admin/processes.js';
import adminImportRoutes from './routes/admin/import.js';
import usersRoutes from './routes/users.js';
import processesRoutes from './routes/processes.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
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
app.register(adminProcessesRoutes, { prefix: '/api/admin' });
app.register(adminImportRoutes, { prefix: '/api/admin' });
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

const start = async () => {
  try {
    await ensureAdminUser(app);
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
