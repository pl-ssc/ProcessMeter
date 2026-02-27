const METABASE_URL = 'https://pmbi.processlabs.ru';
const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';

const TAB_STATS = 23;
const TAB_LABOR = 24;

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

async function createDashboard() {
    try {
        console.log('Creating Questions...');

        const card1 = await api('/card', 'POST', {
            name: 'Прогресс заполнения анкет (%)',
            dataset_query: {
                database: 2,
                type: 'query',
                query: { "source-table": TAB_STATS, aggregation: [["avg", ["field", "completion_percentage", null]]] }
            },
            display: 'scalar',
            visualization_settings: {}
        });
        console.log(`Created Card 1: ID=${card1.id}`);

        const card2 = await api('/card', 'POST', {
            name: 'Распределение FTE по подразделениям',
            dataset_query: {
                database: 2,
                type: 'query',
                query: {
                    "source-table": TAB_LABOR,
                    aggregation: [["sum", ["field", "fte", null]]],
                    breakout: [["field", "executor_type", null]]
                }
            },
            display: 'pie',
            visualization_settings: {}
        });
        console.log(`Created Card 2: ID=${card2.id}`);

        const card3 = await api('/card', 'POST', {
            name: 'Топ-10 процессов по трудозатратам',
            dataset_query: {
                database: 2,
                type: 'query',
                query: {
                    "source-table": TAB_LABOR,
                    aggregation: [["sum", ["field", "fte", null]]],
                    breakout: [["field", "process_level_1", null]],
                    limit: 10
                }
            },
            display: 'bar',
            visualization_settings: { "graph.dimensions": ["process_level_1"], "graph.metrics": ["sum"] }
        });
        console.log(`Created Card 3: ID=${card3.id}`);

        console.log('Creating Dashboard...');
        const dashboard = await api('/dashboard', 'POST', {
            name: 'Управление ОЦО (SSC Dashboard)',
            description: 'Аналитический дашборд для проектирования Общего Центра Обслуживания'
        });
        console.log(`Created Dashboard: ID=${dashboard.id}`);

        console.log('Adding cards to dashboard...');
        // Try /api/dashboard/:id/cards (common in modern MB)
        await api(`/dashboard/${dashboard.id}/cards`, 'POST', {
            card_id: card1.id,
            size_x: 4, size_y: 4, row: 0, col: 0
        });
        await api(`/dashboard/${dashboard.id}/cards`, 'POST', {
            card_id: card2.id,
            size_x: 8, size_y: 7, row: 0, col: 4
        });
        await api(`/dashboard/${dashboard.id}/cards`, 'POST', {
            card_id: card3.id,
            size_x: 12, size_y: 8, row: 7, col: 0
        });

        console.log(`✅ Success! Dashboard: ${METABASE_URL}/dashboard/${dashboard.id}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createDashboard();
