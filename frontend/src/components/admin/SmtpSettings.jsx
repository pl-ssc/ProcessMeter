import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api.js';
import {
    Mail, Save, Wifi, Eye, EyeOff,
    CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';

const DEFAULT_STATE = {
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from: '',
    smtp_from_name: '',
    smtp_secure: 'false',
};

export default function SmtpSettings() {
    const [form, setForm] = useState(DEFAULT_STATE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [alert, setAlert] = useState(null); // { type: 'success'|'error', msg }

    useEffect(() => {
        apiFetch('/api/admin/settings')
            .then(data => setForm(prev => ({ ...prev, ...data.settings })))
            .catch(err => setAlert({ type: 'error', msg: err.message }))
            .finally(() => setLoading(false));
    }, []);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        setAlert(null);
        try {
            await apiFetch('/api/admin/settings', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            setAlert({ type: 'success', msg: 'Настройки сохранены.' });
        } catch (err) {
            setAlert({ type: 'error', msg: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setAlert(null);
        try {
            await apiFetch('/api/admin/settings/test-smtp', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            setAlert({ type: 'success', msg: 'Соединение с SMTP-сервером успешно установлено!' });
        } catch (err) {
            setAlert({ type: 'error', msg: `Ошибка соединения: ${err.message}` });
        } finally {
            setTesting(false);
        }
    };

    if (loading) return (
        <div className="settings-loading">
            <Loader2 size={24} className="animate-spin" />
            <span>Загрузка настроек...</span>
        </div>
    );

    return (
        <div className="settings-page">
            <div className="admin-card">
                <div className="card-header">
                    <Mail size={24} className="text-accent" />
                    <div>
                        <h2>SMTP — настройки почты</h2>
                        <p className="text-muted">Используется для отправки приглашений, сброса пароля и уведомлений.</p>
                    </div>
                </div>

                <div className="card-body">
                    <div className="form-grid-2">
                        <label className="form-label">
                            SMTP-сервер (Host)
                            <input
                                type="text"
                                className="input-full"
                                placeholder="smtp.gmail.com"
                                value={form.smtp_host}
                                onChange={e => set('smtp_host', e.target.value)}
                            />
                        </label>

                        <label className="form-label">
                            Порт
                            <input
                                type="number"
                                className="input-full"
                                placeholder="587"
                                value={form.smtp_port}
                                onChange={e => set('smtp_port', e.target.value)}
                            />
                        </label>

                        <label className="form-label">
                            Логин (Email)
                            <input
                                type="text"
                                className="input-full"
                                placeholder="mail@company.ru"
                                value={form.smtp_user}
                                onChange={e => set('smtp_user', e.target.value)}
                            />
                        </label>

                        <label className="form-label">
                            Пароль / App Password
                            <div className="input-with-icon">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="input-full"
                                    placeholder="••••••••"
                                    value={form.smtp_password}
                                    onChange={e => set('smtp_password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="ghost icon-btn input-icon-btn"
                                    onClick={() => setShowPass(v => !v)}
                                    tabIndex={-1}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </label>

                        <label className="form-label">
                            Адрес отправителя (From)
                            <input
                                type="email"
                                className="input-full"
                                placeholder="noreply@company.ru"
                                value={form.smtp_from}
                                onChange={e => set('smtp_from', e.target.value)}
                            />
                        </label>

                        <label className="form-label">
                            Имя отправителя
                            <input
                                type="text"
                                className="input-full"
                                placeholder="ProcessMeter"
                                value={form.smtp_from_name}
                                onChange={e => set('smtp_from_name', e.target.value)}
                            />
                        </label>
                    </div>

                    <label className="form-label checkbox-label" style={{ marginTop: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={form.smtp_secure === 'true'}
                            onChange={e => set('smtp_secure', e.target.checked ? 'true' : 'false')}
                        />
                        <span>SSL/TLS (порт 465)</span>
                    </label>

                    {alert && (
                        <div className={`status-message ${alert.type}`} style={{ marginTop: '1rem' }}>
                            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            <span>{alert.msg}</span>
                        </div>
                    )}

                    <div className="settings-actions">
                        <button
                            className="secondary"
                            onClick={handleTest}
                            disabled={testing || saving || !form.smtp_host}
                        >
                            {testing ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                            {testing ? 'Проверка...' : 'Проверить соединение'}
                        </button>

                        <button
                            className="primary"
                            onClick={handleSave}
                            disabled={saving || testing}
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="admin-card info-card">
                <h3>Подсказки</h3>
                <ul>
                    <li><strong>Gmail</strong>: хост <code>smtp.gmail.com</code>, порт <code>587</code>, используйте <em>Пароль приложения</em> (не основной пароль).</li>
                    <li><strong>Yandex</strong>: хост <code>smtp.yandex.ru</code>, порт <code>465</code>, включите SSL/TLS.</li>
                    <li><strong>Mail.ru</strong>: хост <code>smtp.mail.ru</code>, порт <code>465</code>, включите SSL/TLS.</li>
                    <li>Пароль хранится в базе данных приложения и никогда не передаётся клиенту в открытом виде.</li>
                </ul>
            </div>
        </div>
    );
}
