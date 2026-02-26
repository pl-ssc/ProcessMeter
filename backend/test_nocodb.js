async function testNocoDB() {
    const url = 'https://plnsi.processlabs.ru/api/v2/meta/bases';
    const token = 'kSQFoSziI3yL7Lx9PXRuGlVSDU0ZCFvzvT4ix4w5';

    console.log(`[TEST] Проверка подключения к NocoDB по адресу: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'xc-token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`[TEST] Ошибка HTTP: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('[TEST] Ответ сервера:', text);
            process.exit(1);
        }

        const data = await response.json();
        console.log('[TEST] Успешное подключение! Получены данные о базах:');
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[TEST] Сетевая ошибка:', err.message);
        process.exit(1);
    }
}

testNocoDB();
