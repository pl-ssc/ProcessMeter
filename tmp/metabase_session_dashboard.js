const METABASE_URL = 'https://pmbi.processlabs.ru';
const USERNAME = 'r.i.galeev@gmail.com';
const PASSWORD = 'G@leevR0m@n';

const DASHBOARD_ID = 3;
const CARDS = [
    { id: 41, size_x: 4, size_y: 4, row: 0, col: 0 },
    { id: 42, size_x: 8, size_y: 7, row: 0, col: 4 },
    { id: 43, size_x: 12, size_y: 8, row: 7, col: 0 }
];

async function run() {
    try {
        console.log('Logging in...');
        const sessionRes = await fetch(`${METABASE_URL}/api/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: USERNAME, password: PASSWORD })
        });

        if (!sessionRes.ok) throw new Error(`Login failed: ${await sessionRes.text()}`);
        const { id: sessionToken } = await sessionRes.json();
        console.log('✅ Logged in successfully!');

        for (const card of CARDS) {
            console.log(`Adding Card ${card.id}...`);
            const res = await fetch(`${METABASE_URL}/api/dashboard/${DASHBOARD_ID}/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Metabase-Session': sessionToken
                },
                body: JSON.stringify({
                    cardId: card.id,
                    size_x: card.size_x,
                    size_y: card.size_y,
                    row: card.row,
                    col: card.col
                })
            });

            if (res.ok) {
                console.log(`✅ Card ${card.id} added!`);
            } else {
                console.error(`❌ Failed: ${res.status} - ${await res.text()}`);
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

run();
