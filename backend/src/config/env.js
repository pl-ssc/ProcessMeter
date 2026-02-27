import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localEnv = dotenv.config();
const rootEnvPath = path.join(__dirname, '../../../.env');
const rootEnv = dotenv.config({ path: rootEnvPath });

if (process.env.DEBUG_ENV) {
    console.log('[ENV] Local .env result:', localEnv.error ? 'Not found/error' : 'Loaded');
    console.log('[ENV] Root .env path:', rootEnvPath);
    console.log('[ENV] Root .env result:', rootEnv.error ? 'Not found/error' : 'Loaded');
    console.log('[ENV] METABASE_SECRET_KEY present:', !!process.env.METABASE_SECRET_KEY);
}

const JWT_SECRET_DEFAULT = 'dev-secret-change-me';

export const env = {
    PORT: Number(process.env.PORT || 3001),
    HOST: process.env.HOST || '0.0.0.0',
    TARGET_DATABASE_URL: process.env.TARGET_DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || JWT_SECRET_DEFAULT,
    ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'dev-admin-key',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    ADMIN_FULL_NAME: process.env.ADMIN_FULL_NAME || '',
    STATIC_DIR: process.env.STATIC_DIR || path.join(__dirname, '../../../frontend/dist'),
    APP_URL: process.env.APP_URL || 'http://localhost:3001',
    ORG_NAME: process.env.ORG_NAME || 'ProcessMeter',
    NOCODB_URL: process.env.NOCODB_URL,
    NOCODB_API_TOKEN: process.env.NOCODB_API_TOKEN,
    METABASE_SECRET_KEY: process.env.METABASE_SECRET_KEY,
    METABASE_SITE_URL: process.env.METABASE_SITE_URL,
};

// Fail fast in production if critical secrets are not set
if (process.env.NODE_ENV === 'production') {
    const missing = [];
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === JWT_SECRET_DEFAULT) {
        missing.push('JWT_SECRET');
    }
    if (!process.env.TARGET_DATABASE_URL) {
        missing.push('TARGET_DATABASE_URL');
    }
    if (missing.length > 0) {
        console.error(`[FATAL] Missing required environment variables in production: ${missing.join(', ')}`);
        process.exit(1);
    }
}
