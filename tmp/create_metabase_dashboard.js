const METABASE_URL = 'https://pmbi.processlabs.ru';
const METABASE_API_TOKEN = 'mb_D7kZ+wqvOqi5oevyBBxU3EXptd1ya+w116nVKAv6+gM=';

const TAB_STATS = 23;
const TAB_LABOR = 24;
const TAB_EFFICIENCY = 25;

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
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
    }
    return response.json();
}

async function createDashboard() {
    try {
        console.log('Creating Questions...');

        // 1. Completion Percentage Average
        const card1 = await api('/card', 'POST', {
            name: '% Заполнения анкет (средний)',
            dataset_query: {
                database: 2,
                type: 'query',
                query: { "source-table": TAB_STATS, aggregation: [["avg", ["field", "completion_percentage", null]]] }
            },
            display: 'scalar',
            visualization_settings: {}
        });

        // 2. FTE by Executor Type
        const card2 = await api('/card', 'POST', {
            name: 'Распределение FTE по типам сотрудников (SSC Analysis)',
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

        // 3. Top 20 Labor Intensive Processes
        const card3 = await api('/card', 'POST', {
            name: 'Топ-10 трудоемких процессов (Уровень 1)',
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

        console.log('Creating Dashboard...');
        const dashboard = await api('/dashboard', 'POST', {
            name: 'Аналитика ОЦО (SSC Development)',
            description: 'Дашборд для анализа трудозатрат и хода проекта по созданию Общего Центра Обслуживания'
        });

        console.log('Adding cards to dashboard...');
        await api(`/dashboard/${dashboard.id}/cards`, 'POST', {
            cardId: card1.id,
            size_x: 4, size_y: 4, row: 0, col: 0
        });
        await api(`/dashboard/${dashboard.id}/cards`, 'POST', {
            cardId: card2.id,
            size_x: 8, size_y: 6, row: 0, col: 4
        });
        await api(`/dashboard/${dashboard.id}/cards`, 'POST', {
            cardId: card3.id,
            size_x: 12, size_y: 6, row: 6, col: 0
        });

        console.log(`✅ Dashboard created! ID: ${dashboard.id}`);
        console.log(`URL: ${METABASE_URL}/dashboard/${dashboard.id}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createDashboard();
