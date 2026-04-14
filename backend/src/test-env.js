import { env } from './config/env.js';
console.log('--- ENV DEBUG ---');
console.log('TARGET_DATABASE_URL:', env.TARGET_DATABASE_URL ? 'EXISTS' : 'MISSING');
console.log('APP_URL:', env.APP_URL || 'MISSING');
console.log('PORT:', env.PORT);
console.log('-----------------');
