async function syncDatabase() {
    const METABASE_URL = 'https://pmbi.processlabs.ru';
    const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';
    const DB_ID = 2;

    console.log(`Triggering sync for DB ${DB_ID}...`);
    try {
        const response = await fetch(`${METABASE_URL}/api/database/${DB_ID}/sync_schema`, {
            method: 'POST',
            headers: {
                'x-api-key': METABASE_API_TOKEN,
            }
        });

        if (response.ok) {
            console.log('✅ Sync triggered successfully!');
        } else {
            console.error('❌ Failed:', response.status);
            console.error(await response.text());
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

syncDatabase();
