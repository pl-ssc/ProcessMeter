import React, { useState } from 'react';
import { apiFetch } from '../../api.js';
import {
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Database,
    Play
} from 'lucide-react';

export default function DataImport() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [connString, setConnString] = useState('postgresql://postgres:postgres@127.0.0.1:5433/refdb');

    const handleImport = async () => {
        if (!window.confirm('ВНИМАНИЕ: При импорте будут ОЧИЩЕНЫ все текущие справочники и ответы пользователей. Права доступа пользователей будут сохранены. Продолжить?')) {
            return;
        }

        setLoading(true);
        setStatus('loading');
        setMessage('Запуск миграции данных из эталонной базы...');

        try {
            await apiFetch('/api/admin/import', {
                method: 'POST',
                body: JSON.stringify({ connectionString: connString })
            });
            setStatus('success');
            setMessage('Миграция успешно завершена! Данные обновлены.');
        } catch (err) {
            setStatus('error');
            setMessage(`Ошибка миграции: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="data-import-page">
            <div className="admin-card import-card">
                <div className="card-header">
                    <Database size={24} className="text-accent" />
                    <div>
                        <h2>Импорт из эталонной базы</h2>
                        <p className="text-muted">Синхронизация справочников и процессов (1-4 уровни).</p>
                    </div>
                </div>

                <div className="card-body">
                    <div className="warning-banner">
                        <AlertTriangle size={20} />
                        <div>
                            <strong>Важное предупреждение</strong>
                            <p>Импорт полностью перезаписывает таблицы процессов. Все несохраненные анкеты респондентов будут удалены и созданы заново на основе новой структуры.</p>
                        </div>
                    </div>

                    <label className="form-label">
                        Строка подключения (Source Database)
                        <input
                            type="text"
                            className="input-full"
                            value={connString}
                            onChange={(e) => setConnString(e.target.value)}
                            disabled={loading}
                        />
                    </label>

                    <div className="import-actions">
                        <button
                            className="primary large-btn"
                            onClick={handleImport}
                            disabled={loading}
                        >
                            {loading ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} />}
                            {loading ? 'Синхронизация...' : 'Запустить импорт данных'}
                        </button>
                    </div>

                    {status !== 'idle' && (
                        <div className={`status-message ${status}`}>
                            {status === 'success' && <CheckCircle2 size={20} />}
                            {status === 'error' && <AlertTriangle size={20} />}
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="admin-card info-card">
                <h3>Зачем это нужно?</h3>
                <ul>
                    <li>Обновление списка процессов и операций.</li>
                    <li>Добавление новых систем и исполнителей.</li>
                    <li>Сброс всех ответов к исходному состоянию после изменения эталона.</li>
                </ul>
            </div>
        </div>
    );
}
