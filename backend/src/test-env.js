import { env } from './config/env.js';
console.log('--- ENV DEBUG ---');
console.log('METABASE_SECRET_KEY:', env.METABASE_SECRET_KEY ? 'EXISTS (length: ' + env.METABASE_SECRET_KEY.length + ')' : 'MISSING');
console.log('METABASE_SITE_URL:', env.METABASE_SITE_URL || 'MISSING');
console.log('PORT:', env.PORT);
console.log('-----------------');
