import React, { useState, useEffect } from 'react';
import { Database, UserPlus, FileEdit, Trash2, Eye, ShieldAlert, Loader2, Send } from 'lucide-react';
import { apiFetch } from '../../utils/api.js';

export default function NocodbUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Invite state
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    const [inviting, setInviting] = useState(false);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/api/admin/nocodb/users');
            setUsers(data.users || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Ошибка загрузки пользователей эталонной базы');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            setInviting(true);
            await apiFetch('/api/admin/nocodb/users', {
                method: 'POST',
                body: JSON.stringify({ email, roles: role })
            });
            setShowInviteModal(false);
            setEmail('');
            setRole('editor');
            await loadUsers();
            alert('Приглашение успешно отправлено');
        } catch (err) {
            alert('Ошибка при приглашении: ' + err.message);
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
        if (rolesString.includes('editor')) return <span className="badge respondent" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>Editor</span>;
        if (rolesString.includes('commenter')) return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>Commenter</span>;
        return <span className="badge respondent">Viewer</span>;
    };

    return (
        <div className="admin-content">
            <div className="admin-header">
                <div>
                    <h2>Эталонная база (NocoDB)</h2>
                    <p className="subtitle">Управление списком экспертов и доступ к редактированию справочников.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="primary" onClick={() => setShowInviteModal(true)}>
                        <UserPlus size={18} />
                        Пригласить эксперта
                    </button>
                    <a href="https://plnsi.processlabs.ru/" target="_blank" rel="noopener noreferrer" className="nav-item" style={{
                        textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', margin: 0, padding: 'var(--space-2) var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 500
                    }}>
                        <Database size={18} />
                        Перейти в редактор
                    </a>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

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
                                            <div className="user-avatar" style={{ background: 'var(--accent-color)', color: 'white' }}>
                                                {u.display_name ? u.display_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
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
                                            <span className="info-text" style={{ color: '#f59e0b' }}>Приглашен (ожидает)</span>
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
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        Список экспертов пуст
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
