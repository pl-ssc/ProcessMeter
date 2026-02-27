import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';

export default function DashboardView({ user }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const data = await apiFetch('/api/dashboards/token');
                setConfig(data);

                // Initialize Metabase Config
                window.metabaseConfig = {
                    theme: { preset: 'light' },
                    isGuest: true,
                    instanceUrl: data.instanceUrl
                };

                // Load Metabase Embed Script if not already loaded
                if (!document.getElementById('metabase-embed-script')) {
                    const script = document.createElement('script');
                    script.id = 'metabase-embed-script';
                    script.src = `${data.instanceUrl}/app/embed.js`;
                    script.defer = true;
                    document.body.appendChild(script);
                }
            } catch (err) {
                setError('Не удалось загрузить данные дашборда');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    if (loading) return <div className="p-8">Загрузка аналитики...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="dashboard-container" style={{ height: 'calc(100vh - 100px)', width: '100%', padding: '20px' }}>
            <metabase-dashboard
                token={config.token}
                with-title="true"
                with-downloads="true"
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
        </div>
    );
}
