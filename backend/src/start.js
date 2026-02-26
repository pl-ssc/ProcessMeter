import { execSync } from 'child_process';
import { env } from './config/env.js';

async function start() {
    console.log('=> Running database migrations...');
    try {
        execSync('npm run migrate:up', { stdio: 'inherit' });
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
