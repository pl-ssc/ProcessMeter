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
}

const JWT_SECRET_DEFAULT = 'dev-secret-change-me';

const getEnv = (key, defaultValue = '') => {
    const value = process.env[key];
    return (value && value.trim() !== '') ? value : defaultValue;
};

export const env = {
    PORT: Number(getEnv('PORT', '3001')),
    HOST: getEnv('HOST', '0.0.0.0'),
    TARGET_DATABASE_URL: getEnv('TARGET_DATABASE_URL'),
    JWT_SECRET: getEnv('JWT_SECRET', JWT_SECRET_DEFAULT),
    DEMO_MODE: getEnv('DEMO_MODE', 'false') === 'true',
    ADMIN_API_KEY: getEnv('ADMIN_API_KEY', 'dev-admin-key'),
    ADMIN_USERNAME: getEnv('ADMIN_USERNAME'),
    ADMIN_PASSWORD: getEnv('ADMIN_PASSWORD'),
    ADMIN_FULL_NAME: getEnv('ADMIN_FULL_NAME'),
    STATIC_DIR: getEnv('STATIC_DIR', path.join(__dirname, '../../../frontend/dist')),
    APP_URL: getEnv('APP_URL', 'http://localhost:3001'),
    ORG_NAME: getEnv('ORG_NAME', 'ProcessMeter'),
    NOCODB_URL: getEnv('NOCODB_URL'),
    NOCODB_API_TOKEN: getEnv('NOCODB_API_TOKEN'),
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
