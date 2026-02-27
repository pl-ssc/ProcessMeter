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
            } catch (err) {
                setError(`Не удалось загрузить данные дашборда: ${err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    if (loading) return <div className="p-8">Загрузка аналитики...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!config) return null;

    const iframeUrl = `${config.instanceUrl}/embed/dashboard/${config.token}#bordered=true&titled=true`;

    return (
        <div className="dashboard-container" style={{ height: 'calc(100vh - 120px)', width: '100%', padding: '0px' }}>
            <iframe
                src={iframeUrl}
                frameBorder="0"
                width="100%"
                height="100%"
                allowTransparency
                title="Metabase Dashboard"
            ></iframe>
        </div>
    );
}
