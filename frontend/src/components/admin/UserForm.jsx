import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api.js';
import { X, Check } from 'lucide-react';

export default function UserForm({ user, onClose, onSuccess }) {
    const isEdit = !!user;
    const [formData, setFormData] = useState({
        username: user?.username || '',
        full_name: user?.full_name || '',
        role: user?.role || 'respondent',
        department_id: user?.department_id || '',
        profession_id: user?.profession_id || '',
        process_1_access: []
    });
    const [process1List, setProcess1List] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [professionsList, setProfessionsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resP1, resDep, resProf] = await Promise.all([
                apiFetch('/api/admin/process-1'),
                apiFetch('/api/admin/departments'),
                apiFetch('/api/admin/professions')
            ]);

            setProcess1List(resP1.process_1 || []);
            setDepartmentsList(resDep.departments || []);
            setProfessionsList(resProf.professions || []);

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
            if (isEdit) {
                // Сначала обновим профиль
                await apiFetch(`/api/admin/users/${user.id}/profile`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        full_name: formData.full_name || null,
                        department_id: formData.department_id ? Number(formData.department_id) : null,
                        profession_id: formData.profession_id ? Number(formData.profession_id) : null
                    })
                });

                // Затем доступы
                await apiFetch(`/api/admin/users/${user.id}/access`, {
                    method: 'POST',
                    body: JSON.stringify({ process_1_access: formData.process_1_access })
                });
            } else {
                // Создание нового пользователя
                const tempPassword = Math.random().toString(36).slice(-8) + 'X9!';
                await apiFetch('/api/admin/users', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...formData,
                        password: tempPassword,
                        department_id: formData.department_id ? Number(formData.department_id) : null,
                        profession_id: formData.profession_id ? Number(formData.profession_id) : null
                    })
                });
            }

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
                                Полное имя
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </label>

                            <label>
                                Подразделение
                                <select
                                    value={formData.department_id}
                                    onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                                >
                                    <option value="">-- Не выбрано --</option>
                                    {departmentsList.filter(d => d.is_active || d.id === user?.department_id).map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Профессия
                                <select
                                    value={formData.profession_id}
                                    onChange={e => setFormData({ ...formData, profession_id: e.target.value })}
                                >
                                    <option value="">-- Не выбрано --</option>
                                    {professionsList.filter(p => p.is_active || p.id === user?.profession_id).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Роль
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    disabled={isEdit} // Роль лучше менять отдельным бизнес-процессом
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
                                    key={p.id}
                                    className={`access-item ${formData.process_1_access.includes(p.id) ? 'selected' : ''}`}
                                    onClick={() => toggleAccess(p.id)}
                                >
                                    <div className="checkbox">
                                        {formData.process_1_access.includes(p.id) && <Check size={12} />}
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
