import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
console.log('Debug: __dirname is', __dirname);
console.log('Debug: envPath is', envPath);
console.log('Debug: .env exists?', fs.existsSync(envPath));

dotenv.config({ path: envPath });

const { METABASE_URL, METABASE_API_TOKEN } = process.env;
console.log('Debug: METABASE_URL is', METABASE_URL);

async function testConnection() {
    console.log(`Connecting to ${METABASE_URL}...`);
    try {
        const response = await fetch(`${METABASE_URL}/api/user/current`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Metabase-Session': METABASE_API_TOKEN, // Note: Metabase usually takes session token here, 
                // but some versions support static API token in headers
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Connection successful!');
            console.log('Current user:', data.common_name || data.email);
        } else {
            console.error('❌ Connection failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Response:', errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testConnection();
