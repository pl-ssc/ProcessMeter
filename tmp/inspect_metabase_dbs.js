async function listDatabases() {
    const METABASE_URL = 'https://pmbi.processlabs.ru';
    const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';

    try {
        const response = await fetch(`${METABASE_URL}/api/database`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': METABASE_API_TOKEN,
            },
        });

        if (response.ok) {
            const databases = await response.json();
            console.log('✅ Response:', JSON.stringify(databases, null, 2));
        } else {
            console.error('❌ Failed to list databases:', response.status);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listDatabases();
