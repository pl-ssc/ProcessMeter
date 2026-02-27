import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';

export default function DashboardView({ user }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await apiFetch('/api/dashboards/token');

                // 1. Define Metabase Config globally as required by SDK
                window.defineMetabaseConfig = (cfg) => {
                    window.metabaseConfig = cfg;
                };

                window.defineMetabaseConfig({
                    theme: { preset: 'light' },
                    isGuest: true,
                    instanceUrl: data.instanceUrl
                });

                // 2. Load script
                if (!document.getElementById('metabase-embed-script')) {
                    const script = document.createElement('script');
                    script.id = 'metabase-embed-script';
                    script.src = `${data.instanceUrl}/app/embed.js`;
                    script.defer = true;
                    // When script loads, it will use window.metabaseConfig
                    document.body.appendChild(script);
                }

                setConfig(data);
            } catch (err) {
                setError(`Не удалось загрузить данные дашборда: ${err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) return <div className="p-8">Загрузка аналитики...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!config) return null;

    return (
        <div className="dashboard-container" style={{ height: 'calc(100vh - 120px)', width: '100%', padding: '20px' }}>
            <metabase-dashboard
                token={config.token}
                with-title="true"
                with-downloads="true"
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
        </div>
    );
}
