async function addDatabase() {
    const METABASE_URL = 'https://pmbi.processlabs.ru';
    const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';

    const payload = {
        name: "ProcessMeter Production",
        engine: "postgres",
        details: {
            host: "processmeterapp-pmprodbase-c952hq",
            port: 5432,
            dbname: "postgres",
            user: "postgres",
            password: "483fwwik4gmijf2p",
            ssl: false
        }
    };

    console.log(`Adding database to ${METABASE_URL}...`);
    try {
        const response = await fetch(`${METABASE_URL}/api/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': METABASE_API_TOKEN,
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const db = await response.json();
            console.log('✅ Database added successfully! ID:', db.id);
        } else {
            console.error('❌ Failed to add database:', response.status);
            const err = await response.text();
            console.error('Error info:', err);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addDatabase();
