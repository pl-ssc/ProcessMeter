import React, { useState } from 'react';
import { Send, Clock, Briefcase, Activity, Info } from 'lucide-react';

export default function InfoPanel({ stats, onSubmit, hasChanges, isDark }) {
    const { total_hours = 0, fte = 0, status = 'not_started' } = stats;
    const [showHelp, setShowHelp] = useState(false);

    const getFteColor = () => {
        const numericFte = Number(fte);
        if (Number.isNaN(numericFte)) return '#9ca3af';
        if (numericFte < 0.8) return '#3b82f6'; // blue
        if (numericFte <= 1.2) return '#10b981'; // green
        return '#ef4444'; // red
    };

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
                    <Briefcase size={18} style={{ color: getFteColor() }} />
                    <span className="text-sm text-muted">FTE:</span>
                    <span className="font-medium" style={{ fontSize: '1.1rem', color: getFteColor() }}>{fte}</span>
                </div>

                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} style={{ color: getStatusColor() }} />
                    <span className="text-sm text-muted">Статус:</span>
                    <span className="font-medium" style={{ color: getStatusColor() }}>
                        {getStatusText()}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => setShowHelp(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        background: isDark ? '#111827' : '#ffffff',
                        color: isDark ? '#e2e8f0' : '#0f172a',
                        cursor: 'pointer',
                        fontSize: 12,
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Info size={14} />
                    Инструкция
                </button>
            </div>

            <button
                className="primary"
                onClick={onSubmit}
                disabled={(status === 'completed' && !hasChanges) || Number(total_hours) === 0}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: status === 'completed' ? '#10b981' : undefined
                }}
            >
                <Send size={16} />
                {status === 'completed' ? 'Завершено' : 'Завершить ввод данных'}
            </button>

            {showHelp && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50
                    }}
                    onClick={() => setShowHelp(false)}
                >
                    <div
                        style={{
                            width: 'min(520px, 90vw)',
                            background: isDark ? '#0f172a' : '#ffffff',
                            color: isDark ? '#e2e8f0' : '#0f172a',
                            borderRadius: 12,
                            padding: '18px 20px',
                            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                            boxShadow: isDark
                                ? '0 20px 40px rgba(0, 0, 0, 0.45)'
                                : '0 20px 40px rgba(15, 23, 42, 0.18)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 10 }}>
                            <Info size={16} />
                            <strong>Как заполнить опросник</strong>
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                            1. В каждой строке укажите трудозатраты по операции за период в чел-часах (0–240).
                            <br />
                            2. Выберите ИТ-систему из списка, если она используется (можно оставить пустым).
                            <br />
                            3. В примечании кратко опишите допущения, редкие случаи или важные детали.
                            <br />
                            4. Когда все строки заполнены, нажмите «Завершить ввод данных».
                        </div>
                        <div style={{ marginTop: 14, textAlign: 'right' }}>
                            <button
                                type="button"
                                onClick={() => setShowHelp(false)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                                    background: isDark ? '#111827' : '#f8fafc',
                                    color: isDark ? '#e2e8f0' : '#0f172a',
                                    cursor: 'pointer'
                                }}
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
