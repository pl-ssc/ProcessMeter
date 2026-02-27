import React, { useState, useEffect } from 'react';
import { Database, UserPlus, FileEdit, Trash2, Eye, ShieldAlert, Loader2, Send } from 'lucide-react';
import { apiFetch } from '../../api.js';

export default function NocodbUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Invite state
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    const [inviting, setInviting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const loadUsers = async ({ silent } = {}) => {
        try {
            if (!silent) setLoading(true);
            const data = await apiFetch('/api/admin/nocodb/users');
            setUsers(data.users || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Ошибка загрузки пользователей эталонной базы');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            setInviting(true);

            // Optimistic UI: add user temporarily
            const tempUser = {
                id: 'temp-' + Date.now(),
                email: email,
                roles: role,
                invite_token: 'pending',
                created_at: new Date().toISOString()
            };
            setUsers(prev => [...prev, tempUser]);

            await apiFetch('/api/admin/nocodb/users', {
                method: 'POST',
                body: JSON.stringify({ email, roles: role })
            });
            setShowInviteModal(false);
            setEmail('');
            setRole('editor');
            setSuccessMessage(`Приглашение успешно отправлено на ${tempUser.email}`);

            // Reload to get real data (id etc)
            await loadUsers({ silent: true });

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            setUsers(prev => prev.filter(u => u.id !== tempUser.id)); // Rollback optimistic update
            setError('Ошибка при приглашении: ' + err.message);
        } finally {
            setInviting(false);
        }
    };

    const getRoleBadge = (rolesString) => {
        if (!rolesString) return <span className="badge respondent">Viewer</span>;
        if (rolesString.includes('owner') || rolesString.includes('creator')) {
            return <span className="badge admin" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={12} /> Admin
            </span>;
        }
        if (rolesString.includes('editor')) return <span className="badge editor">Editor</span>;
        if (rolesString.includes('commenter')) return <span className="badge commenter">Commenter</span>;
        return <span className="badge respondent">Viewer</span>;
    };

    return (
        <div className="user-management">
            <div className="page-actions" style={{ justifyContent: 'space-between' }}>
                <div className="search-bar" style={{ visibility: 'hidden' }}>
                    {/* Placeholder to keep alignment if we ever add search */}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                        href="https://plnsi.processlabs.ru/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nocodb-link ghost"
                    >
                        <Database size={18} />
                        Перейти в редактор
                    </a>
                    <button className="primary" onClick={() => {
                        setShowInviteModal(true);
                        setError(''); // Clear errors when opening modal
                    }}>
                        <UserPlus size={18} />
                        Пригласить эксперта
                    </button>
                </div>
            </div>

            {error && (
                <div className="nocodb-error-banner">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="nocodb-success-banner">
                    {successMessage}
                </div>
            )}

            {loading ? (
                <div className="loading-state">Загружаем список экспертов...</div>
            ) : (
                <div className="admin-card table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Пользователь</th>
                                <th>Роль в NocoDB</th>
                                <th>Статус</th>
                                <th>Дата добавления</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar" style={{ background: 'var(--accent)', color: 'white' }}>
                                                {(u.display_name?.charAt(0) || u.email?.charAt(0) || '?').toUpperCase()}
                                            </div>
                                            <div className="user-details">
                                                <span className="user-name">{u.display_name || 'Без имени'}</span>
                                                <span className="user-email">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {getRoleBadge(u.roles || u.main_roles)}
                                    </td>
                                    <td>
                                        {u.invite_token ? (
                                            <span className="info-text" style={{ color: '#f59e0b' }}>Приглашен</span>
                                        ) : (
                                            <span className="info-text" style={{ color: '#10b981' }}>Активен</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="info-text">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        <div className="nocodb-empty-state">
                                            <Database size={32} className="nocodb-empty-icon" />
                                            <span>Список экспертов пуст</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showInviteModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowInviteModal(false) }}>
                    <div className="modal-content">
                        <h2>Пригласить эксперта</h2>
                        <form onSubmit={handleInvite} className="admin-form">
                            <div className="form-group">
                                <label>Email эксперта <span className="required">*</span></label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Уровень доступа</label>
                                <select value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="editor">Редактор (Может добавлять/изменять справочники)</option>
                                    <option value="commenter">Комментатор (Только чтение и комментарии)</option>
                                    <option value="viewer">Читатель (Только чтение)</option>
                                </select>
                                <p className="helper-text">Инвайт со ссылкой будет отправлен на указанную почту.</p>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="ghost" onClick={() => setShowInviteModal(false)} disabled={inviting}>
                                    Отмена
                                </button>
                                <button type="submit" className="primary" disabled={inviting}>
                                    {inviting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Отправить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
