import { env } from '../src/config/env.js';

function isSafeTestDatabase(databaseUrl) {
    if (!databaseUrl) return false;

    try {
        const parsed = new URL(databaseUrl);
        const hostname = parsed.hostname;
        const dbName = parsed.pathname.replace(/^\//, '').toLowerCase();

        const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
        const hasTestName = dbName.includes('test');

        return localHosts.has(hostname) || hasTestName;
    } catch {
        return false;
    }
}

export function assertSafeTestDatabase() {
    if (isSafeTestDatabase(env.TARGET_DATABASE_URL)) {
        return;
    }

    throw new Error(
        `Unsafe test database configuration. Refusing to run tests against TARGET_DATABASE_URL=${env.TARGET_DATABASE_URL}`
    );
}
