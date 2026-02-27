import { env } from './src/config/env.js';

async function testAdmin() {
    const url = env.NOCODB_URL;
    const token = env.NOCODB_API_TOKEN;

    if (!url || !token) {
        console.error('Error: NOCODB_URL or NOCODB_API_TOKEN is missing in environment or env.js!');
        return;
    }

    const authHeaders = {
        'xc-token': token,
        'Accept': 'application/json'
    };

    console.log('Token starts with:', token.substring(0, 10));

    try {
        console.log('Fetching users list from base...');
        const usersRes = await fetch(`${url}api/v1/db/meta/users`, { headers: authHeaders });
        console.log('Endpoint /api/v1/db/meta/users response:', usersRes.status);
        if (usersRes.ok) console.log(await usersRes.json());
    } catch (e) { }

    try {
        console.log('\nFetching users via project/base endpoint...');
        // Let's first get bases to find base ID
        const baseRes = await fetch(`${url}api/v1/db/meta/projects`, { headers: authHeaders });
        const bases = await baseRes.json();
        console.log('Bases:', bases?.list?.map(b => b.id) || 'None');

        if (bases && bases.list && bases.list.length > 0) {
            const baseId = bases.list[0].id;
            const usersBaseRes = await fetch(`${url}api/v1/db/meta/projects/${baseId}/users`, { headers: authHeaders });
            console.log(`Endpoint /projects/${baseId}/users response:`, usersBaseRes.status);
            if (usersBaseRes.ok) console.log(await usersBaseRes.json());
        }
    } catch (e) {
        console.error(e);
    }
}

testAdmin();
