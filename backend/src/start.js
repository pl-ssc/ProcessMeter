import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';

async function start() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    console.log('=> Running database migrations...');
    try {
        execSync('npm run migrate:up', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log('=> Migrations completed successfully.');
    } catch (error) {
        console.error('❌ Migration failed. Server will not start.');
        process.exit(1);
    }

    console.log('=> Starting the Node.js server...');
    // Dynamically import the main server file to start it
    await import('./server.js');
}

start();
