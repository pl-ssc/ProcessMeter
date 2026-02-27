async function getTableIds() {
    const METABASE_URL = 'https://pmbi.processlabs.ru';
    const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';
    const DB_ID = 2;

    console.log(`Fetching tables for DB ${DB_ID}...`);
    try {
        const response = await fetch(`${METABASE_URL}/api/database/${DB_ID}/metadata`, {
            headers: {
                'x-api-key': METABASE_API_TOKEN,
            }
        });

        if (response.ok) {
            const metadata = await response.json();
            console.log('Tables found:');
            metadata.tables.forEach(t => {
                if (t.schema === 'public' && t.name.startsWith('view_bi')) {
                    console.log(`- ${t.name}: ID=${t.id}`);
                }
            });
        } else {
            console.error('❌ Failed:', response.status);
            console.error(await response.text());
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getTableIds();
