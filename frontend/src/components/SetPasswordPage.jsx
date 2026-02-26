import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function SetPasswordPage({ token, onDone }) {
    const [info, setInfo] = useState(null);      // { valid, type, full_name }
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [error, setError] = useState('');

    useEffect(() => {
        apiFetch(`/api/auth/token-info?token=${encodeURIComponent(token)}`)
            .then(setInfo)
            .catch(() => setInfo({ valid: false, error: 'Ошибка проверки ссылки.' }));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setError('Пароли не совпадают.');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен содержать не менее 6 символов.');
            return;
        }
        setStatus('loading');
        setError('');
        try {
            await apiFetch('/api/auth/set-password', {
                method: 'POST',
                body: JSON.stringify({ token, password })
            });
            setStatus('success');
        } catch (err) {
            setError(err.message);
            setStatus('idle');
        }
    };

    const typeLabel = info?.type === 'invite' ? 'Установка пароля' : 'Сброс пароля';

    if (!info) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <Loader2 size={32} className="animate-spin text-accent" style={{ margin: '0 auto', display: 'block' }} />
                    <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Проверяем ссылку...
                    </p>
                </div>
            </div>
        );
    }

    if (!info.valid) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div style={{ textAlign: 'center' }}>
                        <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                        <h2>Ссылка недействительна</h2>
                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                            {info.error || 'Срок действия ссылки истёк или она уже была использована.'}
                        </p>
                        <button className="primary" onClick={onDone}>Перейти ко входу</button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle2 size={40} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                        <h2>Пароль установлен!</h2>
                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                            Теперь вы можете войти в систему.
                        </p>
                        <button className="primary" onClick={onDone}>Войти</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <KeyRound size={32} className="text-accent" />
                    <h1>{typeLabel}</h1>
                    {info.full_name && (
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Здравствуйте, <strong>{info.full_name}</strong>!
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <label className="form-label">
                        Новый пароль
                        <div className="input-with-icon">
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="input-full"
                                placeholder="Не менее 6 символов"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
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
                        Подтверждение пароля
                        <input
                            type={showPass ? 'text' : 'password'}
                            className="input-full"
                            placeholder="Повторите пароль"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                        />
                    </label>

                    {error && (
                        <div className="status-message error">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="primary" style={{ width: '100%' }} disabled={status === 'loading'}>
                        {status === 'loading'
                            ? <><Loader2 size={16} className="animate-spin" /> Сохранение...</>
                            : 'Сохранить пароль'}
                    </button>
                </form>
            </div>
        </div>
    );
}
