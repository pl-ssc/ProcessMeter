async function getTables() {
    // Получаем структуру базы данных EtalonBase (источник bpkkcwvdoh1asmy)
    const url = 'https://plnsi.processlabs.ru/api/v2/meta/bases/pl4l0sklo4i1f4c/sources/bpkkcwvdoh1asmy/tables';
    const token = 'kSQFoSziI3yL7Lx9PXRuGlVSDU0ZCFvzvT4ix4w5';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'xc-token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            process.exit(1);
        }

        const data = await response.json();
        console.log(`Найдено таблиц: ${data.list.length}`);

        for (const table of data.list) {
            console.log(`\n=== Таблица: ${table.table_name} (${table.title}) ===`);
            // Выведем колонки
            const colsUrl = `https://plnsi.processlabs.ru/api/v2/meta/tables/${table.id}/columns`;
            const colsRes = await fetch(colsUrl, { headers: { 'xc-token': token } });
            if (colsRes.ok) {
                const colsData = await colsRes.json();
                colsData.list.forEach(col => {
                    console.log(`  - ${col.column_name} [${col.uidt}] (PK: ${col.pk})`);
                });
            }
        }
    } catch (err) {
        console.error('Сетевая ошибка:', err.message);
    }
}

getTables();
