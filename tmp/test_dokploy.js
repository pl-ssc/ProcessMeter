async function testDokploy() {
    const DOKPLOY_URL = 'https://srv.processlabs.ru';
    const DOKPLOY_TOKEN = 'ag3LGYEZLBrUNivptzkJCXbDstndxPJkuldbVsRWZkCldTSCENaAHrYKixGijYdCicD';

    console.log(`Testing Dokploy at ${DOKPLOY_URL}...`);
    try {
        // Используем типичный endpoint для проверки прав (например, /api/user или /api/projects)
        // Dokploy API обычно ожидает токен в заголовке Authorization: Bearer
        const response = await fetch(`${DOKPLOY_URL}/api/trpc/project.all?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${DOKPLOY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dokploy connection successful!');
            console.log('Projects count:', data.length);
        } else {
            console.error('❌ Dokploy connection failed:', response.status, response.statusText);
            const text = await response.text();
            console.log('Response body:', text);
        }
    } catch (error) {
        console.error('❌ Error testing Dokploy:', error.message);
    }
}

testDokploy();
