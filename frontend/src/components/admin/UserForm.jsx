import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api.js';
import { X, Check } from 'lucide-react';

export default function UserForm({ user, onClose, onSuccess }) {
    const isEdit = !!user;
    const [formData, setFormData] = useState({
        username: user?.username || '',
        password: '',
        full_name: user?.full_name || '',
        role: user?.role || 'respondent',
        process_1_access: []
    });
    const [process1List, setProcess1List] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await apiFetch('/api/admin/process-1');
            setProcess1List(res.process_1 || []);

            if (isEdit) {
                const accessRes = await apiFetch(`/api/admin/users/${user.id}/access`);
                setFormData(prev => ({ ...prev, process_1_access: accessRes.process_1_access || [] }));
            }
        } catch (err) {
            console.error('Failed to load form data:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const url = isEdit ? `/api/admin/users/${user.id}/access` : '/api/admin/users';
            const method = 'POST';

            // Если мы только редактируем доступ, бэкенд имеет другой эндпоинт для профиля и доступа
            // Для упрощения сейчас реализуем только создание в этом компоненте, 
            // или полное обновление если это респондент.

            await apiFetch(url, {
                method,
                body: JSON.stringify(formData)
            });
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleAccess = (id) => {
        setFormData(prev => {
            const current = prev.process_1_access;
            if (current.includes(id)) {
                return { ...prev, process_1_access: current.filter(x => x !== id) };
            } else {
                return { ...prev, process_1_access: [...current, id] };
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content user-form-modal">
                <div className="modal-header">
                    <h2>{isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}</h2>
                    <button className="ghost icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Основная информация</h3>
                        <div className="form-grid">
                            <label>
                                Имя пользователя (Email)
                                <input
                                    type="text"
                                    required
                                    disabled={isEdit}
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </label>
                            <label>
                                Пароль {isEdit && '(оставьте пустым, чтобы не менять)'}
                                <input
                                    type="password"
                                    required={!isEdit}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </label>
                            <label>
                                Полное имя
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </label>
                            <label>
                                Роль
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="respondent">Респондент</option>
                                    <option value="admin">Администратор</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Доступ к процессам 1 уровня</h3>
                        <div className="access-grid">
                            {process1List.map(p => (
                                <div
                                    key={p.f1_index}
                                    className={`access-item ${formData.process_1_access.includes(p.f1_index) ? 'selected' : ''}`}
                                    onClick={() => toggleAccess(p.f1_index)}
                                >
                                    <div className="checkbox">
                                        {formData.process_1_access.includes(p.f1_index) && <Check size={12} />}
                                    </div>
                                    <span>{p.f1_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-footer">
                        <button type="button" className="ghost" onClick={onClose}>Отмена</button>
                        <button type="submit" className="primary" disabled={loading}>
                            {loading ? 'Сохранение...' : (isEdit ? 'Обновить' : 'Создать')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
