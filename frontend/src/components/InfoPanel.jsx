import React from 'react';
import { Send, Clock, Briefcase, Activity } from 'lucide-react';

export default function InfoPanel({ stats, onSubmit, hasChanges, isDark }) {
    const { total_hours = 0, fte = 0, status = 'not_started' } = stats;

    const getStatusColor = () => {
        switch (status) {
            case 'completed': return '#10b981'; // green
            case 'in_progress': return '#3b82f6'; // blue
            default: return '#9ca3af'; // gray
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'completed': return 'Завершено';
            case 'in_progress': return 'В работе';
            default: return 'Не начата';
        }
    };

    return (
        <div className={`info-panel ${isDark ? 'dark' : ''}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            gap: '24px'
        }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} className="text-muted" />
                    <span className="text-sm text-muted">Трудозатраты:</span>
                    <span className="font-medium" style={{ fontSize: '1.1rem' }}>{total_hours} ч.</span>
                </div>

                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={18} className="text-muted" />
                    <span className="text-sm text-muted">FTE:</span>
                    <span className="font-medium" style={{ fontSize: '1.1rem' }}>{fte}</span>
                </div>

                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} style={{ color: getStatusColor() }} />
                    <span className="text-sm text-muted">Статус:</span>
                    <span className="font-medium" style={{ color: getStatusColor() }}>
                        {getStatusText()}
                    </span>
                </div>
            </div>

            <button
                className="primary"
                onClick={onSubmit}
                disabled={status === 'completed' && !hasChanges}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: status === 'completed' ? '#10b981' : undefined
                }}
            >
                <Send size={16} />
                {status === 'completed' ? 'Отправлено' : 'Отправить'}
            </button>
        </div>
    );
}
