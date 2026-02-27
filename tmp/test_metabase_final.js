async function testConnection() {
    const METABASE_URL = 'https://pmbi.processlabs.ru';
    const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';

    console.log(`Connecting to ${METABASE_URL}...`);
    try {
        const response = await fetch(`${METABASE_URL}/api/user/current`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': METABASE_API_TOKEN,
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Connection successful!');
            console.log('User ID:', data.id);
            console.log('User Email:', data.email);
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
