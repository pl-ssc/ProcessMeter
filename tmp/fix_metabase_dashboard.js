const METABASE_URL = 'https://pmbi.processlabs.ru';
const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';

const DASHBOARD_ID = 3;
const CARDS = [
    { id: 41, w: 4, h: 4, r: 0, c: 0 },
    { id: 42, w: 8, h: 7, r: 0, c: 4 },
    { id: 43, w: 12, h: 8, r: 7, c: 0 }
];

async function api(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': METABASE_API_TOKEN,
        }
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${METABASE_URL}/api${endpoint}`, options);
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`API Error ${response.status} on ${endpoint}: ${text}`);
    }
    return text ? JSON.parse(text) : {};
}

async function addCards() {
    for (const card of CARDS) {
        console.log(`Adding Card ${card.id}...`);
        try {
            // Trying different endpoints just in case
            await api(`/dashboard/${DASHBOARD_ID}/cards`, 'POST', {
                card_id: card.id,
                width: card.w,
                height: card.h,
                row: card.r,
                col: card.c
            });
            console.log(`✅ Card ${card.id} added!`);
        } catch (e) {
            console.error(`❌ Failed with standard params: ${e.message}`);
            // Fallback or debug
        }
    }
}

addCards();
