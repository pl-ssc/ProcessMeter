import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../api.js';
import {
    UserPlus,
    Search,
    UserCheck,
    UserMinus,
    Key,
    Edit,
    Mail,
    Loader2,
    Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';

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
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(ws);

            const usersPayload = rawData.map(row => {
                const getVal = (keys) => {
                    for (let k of keys) {
                        if (row[k] !== undefined) return String(row[k]).trim();
                    }
                    return null;
                };

                const username = getVal(['Email', 'Почта', 'username', 'email']);
                const full_name = getVal(['ФИО', 'Имя', 'Имя пользователя', 'full_name']);
                const roleRaw = getVal(['Роль', 'role']);
                const role = (roleRaw && roleRaw.toLowerCase() === 'администратор') ? 'admin' : 'respondent';
                const department_name = getVal(['Подразделение', 'Отдел', 'department_name', 'department']);
                const profession_name = getVal(['Профессия', 'Должность', 'profession_name', 'profession']);

                return { username, full_name, role, department_name, profession_name };
            }).filter(u => u.username);

            if (usersPayload.length === 0) {
                showToast('error', 'Не найдено пользователей с колонкой Email/Почта');
                setIsImporting(false);
                return;
            }

            const res = await apiFetch('/api/admin/users/bulk-import', {
                method: 'POST',
                body: JSON.stringify({ users: usersPayload })
            });

            showToast('success', `Импорт завершен! Добавлено: ${res.imported}, пропущено (дубли): ${res.skipped}`);
            loadUsers();
        } catch (err) {
            console.error(err);
            showToast('error', `Ошибка импорта: ${err.message}`);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
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

                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button
                        className="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                    >
                        {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        Импорт из Excel
                    </button>
                    <button className="primary" onClick={() => { setEditingUser(null); setShowForm(true); }}>
                        <UserPlus size={18} />
                        Добавить пользователя
                    </button>
                </div>
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
                                <th>Подразделение</th>
                                <th>Профессия</th>
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
                                                <span className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {u.full_name || 'Без имени'}
                                                    {u.role === 'respondent' && (
                                                        <span
                                                            title={u.is_survey_completed ? 'Опрос завершен' : 'Опрос в процессе'}
                                                            style={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                backgroundColor: u.is_survey_completed ? '#f97316' : '#10b981',
                                                                display: 'inline-block',
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                    )}
                                                </span>
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
                                        <span className="info-text">{u.department_name || '—'}</span>
                                    </td>
                                    <td>
                                        <span className="info-text">{u.profession_name || '—'}</span>
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
