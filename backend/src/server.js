import { env } from './config/env.js';
import { ensureAdminUser } from './db/init.js';
import { buildApp } from './app.js';

const start = async () => {
  try {
    const app = await buildApp({ logger: true });
    await ensureAdminUser(app);

    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Server listening on ${env.HOST}:${env.PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
