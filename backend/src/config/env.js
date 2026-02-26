import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // local (backend folder)
dotenv.config({ path: path.join(__dirname, '../../../.env') }); // root folder

export const env = {
    PORT: Number(process.env.PORT || 3001),
    HOST: process.env.HOST || '0.0.0.0',
    TARGET_DATABASE_URL: process.env.TARGET_DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
    ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'dev-admin-key',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    ADMIN_FULL_NAME: process.env.ADMIN_FULL_NAME || '',
    STATIC_DIR: process.env.STATIC_DIR || path.join(__dirname, '../../../frontend/dist'),
    APP_URL: process.env.APP_URL || 'http://localhost:3001',
    ORG_NAME: process.env.ORG_NAME || 'ProcessMeter',
};
