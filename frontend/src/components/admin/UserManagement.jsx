import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api.js';
import {
    UserPlus,
    Search,
    UserCheck,
    UserMinus,
    Key,
    Edit,
    Mail,
    Loader2
} from 'lucide-react';

import UserForm from './UserForm.jsx';

const TOAST_DURATION_MS = 4000;

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [actionLoading, setActionLoading] = useState({}); // { [userId_type]: true }
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

    useEffect(() => {
        loadUsers();
    }, [searchTerm, roleFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/users?include_admins=true`;
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
            if (roleFilter !== 'all') url += `&role=${roleFilter}`;

            const res = await apiFetch(url);
            setUsers(res.users || []);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (user) => {
        try {
            await apiFetch(`/api/admin/users/${user.id}/status`, {
                method: 'POST',
                body: JSON.stringify({ is_active: !user.is_active })
            });
            loadUsers();
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        }
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), TOAST_DURATION_MS);
    };

    const sendEmail = async (userId, action) => {
        const key = `${userId}_${action}`;
        setActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            await apiFetch(`/api/admin/users/${userId}/${action}`, { method: 'POST' });
            showToast('success', action === 'send-invite'
                ? 'Приглашение отправлено!'
                : 'Ссылка для сброса пароля отправлена!');
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    return (
        <div className="user-management">
            {toast && (
                <div className={`toast-message ${toast.type}`}>
                    {toast.msg}
                </div>
            )}
            <div className="page-actions">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по имени или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">Все роли</option>
                        <option value="admin">Администраторы</option>
                        <option value="respondent">Респонденты</option>
                    </select>
                </div>

                <button className="primary" onClick={() => { setEditingUser(null); setShowForm(true); }}>
                    <UserPlus size={18} />
                    Добавить пользователя
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Загрузка пользователей...</div>
            ) : (
                <div className="admin-card table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Пользователь</th>
                                <th>Роль</th>
                                <th>Доступы</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {u.full_name?.charAt(0) || u.username.charAt(0)}
                                            </div>
                                            <div className="user-details">
                                                <span className="user-name">{u.full_name || 'Без имени'}</span>
                                                <span className="user-email">{u.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.role}`}>
                                            {u.role === 'admin' ? 'Админ' : 'Респондент'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="access-count">
                                            {u.access_count} процессов
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}></span>
                                        {u.is_active ? 'Активен' : 'Заблокирован'}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="ghost icon-btn"
                                                title="Редактировать"
                                                onClick={() => { setEditingUser(u); setShowForm(true); }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="ghost icon-btn"
                                                title="Отправить приглашение"
                                                onClick={() => sendEmail(u.id, 'send-invite')}
                                                disabled={actionLoading[`${u.id}_send-invite`]}
                                            >
                                                {actionLoading[`${u.id}_send-invite`]
                                                    ? <Loader2 size={16} className="animate-spin" />
                                                    : <Mail size={16} />}
                                            </button>
                                            <button
                                                className="ghost icon-btn"
                                                title="Отправить сброс пароля"
                                                onClick={() => sendEmail(u.id, 'send-reset')}
                                                disabled={actionLoading[`${u.id}_send-reset`]}
                                            >
                                                {actionLoading[`${u.id}_send-reset`]
                                                    ? <Loader2 size={16} className="animate-spin" />
                                                    : <Key size={16} />}
                                            </button>
                                            <button
                                                className="ghost icon-btn"
                                                onClick={() => toggleUserStatus(u)}
                                                title={u.is_active ? 'Заблокировать' : 'Разблокировать'}
                                            >
                                                {u.is_active ? <UserMinus size={16} color="#ef4444" /> : <UserCheck size={16} color="#10b981" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && !loading && (
                        <div className="empty-state">Пользователи не найдены</div>
                    )}
                </div>
            )}

            {showForm && (
                <UserForm
                    user={editingUser}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => { setShowForm(false); loadUsers(); }}
                />
            )}
        </div>
    );
}
