import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, Search } from 'lucide-react';
import { apiFetch } from '../../api.js';

function DictionarySection({ type }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Для создания
    const [newItemName, setNewItemName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Для редактирования
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const endpoint = type === 'departments' ? '/api/admin/departments' : '/api/admin/professions';

    useEffect(() => {
        loadItems();
    }, [type]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(endpoint);
            setItems(data[type] || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newItemName.trim()) return;
        try {
            setError('');
            await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ name: newItemName.trim() })
            });
            setNewItemName('');
            setIsCreating(false);
            loadItems();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdate = async (id, isActive = undefined) => {
        try {
            setError('');
            const body = {};
            if (editName.trim() && editingId === id) {
                body.name = editName.trim();
            }
            if (isActive !== undefined) {
                body.is_active = isActive;
            }

            await apiFetch(`${endpoint}/${id}`, {
                method: 'PUT',
                body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
            });

            setEditingId(null);
            setEditName('');
            loadItems();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="dictionary-section">
            <div className="page-actions">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="primary" onClick={() => setIsCreating(true)} disabled={isCreating}>
                    <Plus size={18} /> Добавить
                </button>
            </div>

            {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="admin-card table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60%' }}>Название</th>
                            <th style={{ width: '20%' }}>Статус</th>
                            <th style={{ width: '20%', textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isCreating && (
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={e => setNewItemName(e.target.value)}
                                        placeholder="Введите название..."
                                        className="input-field"
                                        autoFocus
                                    />
                                </td>
                                <td><span className="badge success">Активен</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                        <button className="ghost icon-btn success" onClick={handleCreate} title="Сохранить">
                                            <Check size={18} />
                                        </button>
                                        <button className="ghost icon-btn danger" onClick={() => setIsCreating(false)} title="Отмена">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {loading && items.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>Загрузка...</td>
                            </tr>
                        )}

                        {!loading && filteredItems.length === 0 && !isCreating && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    Нет записей
                                </td>
                            </tr>
                        )}

                        {filteredItems.map(item => (
                            <tr key={item.id} style={{ opacity: item.is_active ? 1 : 0.6 }}>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="input-field"
                                            autoFocus
                                        />
                                    ) : (
                                        <strong>{item.name}</strong>
                                    )}
                                </td>
                                <td>
                                    <span
                                        onClick={() => handleUpdate(item.id, !item.is_active)}
                                        className={`badge ${item.is_active ? '' : 'admin'}`}
                                        style={{ cursor: 'pointer' }}
                                        title="Нажмите для переключения статуса"
                                    >
                                        {item.is_active ? 'Активен' : 'Отключен'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                        {editingId === item.id ? (
                                            <>
                                                <button className="ghost icon-btn success" onClick={() => handleUpdate(item.id)} title="Сохранить">
                                                    <Check size={18} />
                                                </button>
                                                <button className="ghost icon-btn danger" onClick={() => setEditingId(null)} title="Отмена">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="ghost icon-btn"
                                                onClick={() => {
                                                    setEditingId(item.id);
                                                    setEditName(item.name);
                                                }}
                                                title="Редактировать"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Dictionaries() {
    const [activeTab, setActiveTab] = useState('departments');

    return (
        <div className="user-management">
            <div className="tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(128, 128, 128, 0.2)', marginBottom: '1.5rem' }}>
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 0',
                        borderBottom: activeTab === 'departments' ? '2px solid #3b82f6' : '2px solid transparent',
                        color: activeTab === 'departments' ? '#3b82f6' : 'inherit',
                        fontWeight: activeTab === 'departments' ? '600' : 'normal',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                    onClick={() => setActiveTab('departments')}
                >
                    Подразделения
                </button>
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 0',
                        borderBottom: activeTab === 'professions' ? '2px solid #3b82f6' : '2px solid transparent',
                        color: activeTab === 'professions' ? '#3b82f6' : 'inherit',
                        fontWeight: activeTab === 'professions' ? '600' : 'normal',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                    onClick={() => setActiveTab('professions')}
                >
                    Профессии
                </button>
            </div>

            {activeTab === 'departments' && <DictionarySection type="departments" />}
            {activeTab === 'professions' && <DictionarySection type="professions" />}
        </div>
    );
}
