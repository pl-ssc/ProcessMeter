import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../api.js';
import {
    Users,
    CheckCircle,
    Clock,
    TrendingUp,
    Calendar,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';

export default function DashboardView({ user }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiFetch('/api/stats/dashboard');
                setData(res);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const filteredRespondents = useMemo(() => {
        if (!data?.respondents) return [];
        return data.respondents.filter(r =>
            (r.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.department_name?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [data, searchTerm]);

    const formatDuration = (seconds) => {
        if (!seconds || seconds <= 0) return '—';
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);

        const parts = [];
        if (d > 0) parts.push(`${d} дн.`);
        if (h > 0) parts.push(`${h} ч.`);
        if (m > 0 || parts.length === 0) parts.push(`${m} мин.`);

        return parts.join(' ');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return (
        <div className="loading-state">
            <div className="animate-pulse">Загрузка аналитики...</div>
        </div>
    );

    if (error) return <div className="p-8 text-red-500">Ошибка: {error}</div>;

    const { progress, averageDuration, trends } = data;
    const progressPercent = Math.round(progress.progress_percent);
    const strokeDasharray = 2 * Math.PI * 50;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * progressPercent) / 100;

    return (
        <div className="dashboard-view">
            <div className="admin-page">
                <h1>Аналитика и дашборды</h1>
            </div>

            <div className="stats-grid">
                {/* Progress Card */}
                <div className="stat-card">
                    <h3>Прогресс заполнения</h3>
                    <div className="gauge-wrapper">
                        <div style={{ position: 'relative', width: 120, height: 120 }}>
                            <svg className="gauge-svg" width="120" height="120">
                                <circle className="gauge-bg" cx="60" cy="60" r="50" />
                                <circle
                                    className="gauge-fill"
                                    cx="60" cy="60" r="50"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                />
                            </svg>
                            <div className="gauge-text">{progressPercent}%</div>
                        </div>
                        <div>
                            <div className="stat-value">{progress.completed_count} / {progress.total_count}</div>
                            <div className="stat-subvalue">анкет завершено</div>
                        </div>
                    </div>
                </div>

                {/* Avg Time Card */}
                <div className="stat-card">
                    <h3>Среднее время заполнения</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                        <div className="user-avatar" style={{ width: 56, height: 56, background: 'var(--accent-soft)' }}>
                            <Clock size={28} />
                        </div>
                        <div>
                            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                                {formatDuration(averageDuration.avg_duration_seconds)}
                            </div>
                            <div className="stat-subvalue">от приглашения до финиша</div>
                        </div>
                    </div>
                </div>

                {/* Completion Trend (Simplified SVG Chart) */}
                <div className="stat-card chart-card">
                    <h3>Динамика завершения (последние 30 дней)</h3>
                    {trends.length > 0 ? (
                        <TrendChart trends={trends} />
                    ) : (
                        <div className="empty-state" style={{ padding: '20px' }}>Нет данных для графика</div>
                    )}
                </div>

                {/* Detailed Table */}
                <div className="dashboard-table-card">
                    <div className="table-header">
                        <h2>Статистика респондентов</h2>
                        <div className="search-bar" style={{ maxWidth: '300px', minWidth: 'auto', marginBottom: 0 }}>
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Поиск по ФИО или отделу..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Респондент</th>
                                    <th>Подразделение</th>
                                    <th>Приглашен</th>
                                    <th>Завершил</th>
                                    <th>Трудоемкость (ч)</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRespondents.map(r => (
                                    <tr key={r.user_id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">{r.full_name?.charAt(0) || '?'}</div>
                                                <span className="user-name">{r.full_name || 'Без имени'}</span>
                                            </div>
                                        </td>
                                        <td>{r.department_name || '—'}</td>
                                        <td>{formatDate(r.invite_date)}</td>
                                        <td>{formatDate(r.completed_date)}</td>
                                        <td style={{ fontWeight: 600 }}>{Number(r.total_labor_hours).toFixed(1)}</td>
                                        <td>
                                            <span className={`badge ${r.is_survey_completed ? 'admin' : 'respondent'}`}>
                                                {r.is_survey_completed ? 'Завершено' : 'В процессе'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredRespondents.length === 0 && (
                            <div className="empty-state">Респонденты не найдены</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrendChart({ trends }) {
    const height = 150;
    const width = 600;
    const padding = 20;

    const maxVal = Math.max(...trends.map(t => t.completed_today), 5);
    const points = trends.map((t, i) => {
        const x = padding + (i / (trends.length - 1 || 1)) * (width - 2 * padding);
        const y = height - padding - (t.completed_today / maxVal) * (height - 2 * padding);
        return { x, y };
    });

    const pathData = points.length > 1
        ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
        : '';

    const areaData = points.length > 1
        ? `${pathData} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`
        : '';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart-svg">
            {/* Grid lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="chart-axis" />

            {/* Area & Line */}
            {points.length > 1 && (
                <>
                    <path d={areaData} className="chart-area" />
                    <path d={pathData} className="chart-line" />
                </>
            )}

            {/* Dots */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" className="chart-dot">
                    <title>{trends[i].completion_date}: {trends[i].completed_today}</title>
                </circle>
            ))}

            {/* Labels */}
            {trends.length > 0 && (
                <>
                    <text x={padding} y={height - 5} className="chart-label">{trends[0].completion_date}</text>
                    <text x={width - padding} y={height - 5} textAnchor="end" className="chart-label">{trends[trends.length - 1].completion_date}</text>
                </>
            )}
        </svg>
    );
}
