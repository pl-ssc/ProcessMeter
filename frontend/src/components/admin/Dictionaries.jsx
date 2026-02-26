import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, BookOpen } from 'lucide-react';
import { apiFetch } from '../../api.js';

function DictionarySection({ title, type }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Для создания
    const [newItemName, setNewItemName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Для редактирования
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const endpoint = type === 'departments' ? '/api/admin/departments' : '/api/admin/professions';
    const itemName = type === 'departments' ? 'department' : 'profession';

    useEffect(() => {
        loadItems();
    }, []);

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

    return (
        <div className="dictionary-section" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={20} /> {title}
                </h3>
                <button className="primary" onClick={() => setIsCreating(true)} disabled={isCreating}>
                    <Plus size={16} /> Добавить
                </button>
            </div>

            {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

            <table className="data-table" style={{ width: '100%' }}>
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
                                <button className="icon-btn success" onClick={handleCreate} title="Сохранить">
                                    <Check size={18} />
                                </button>
                                <button className="icon-btn danger" onClick={() => setIsCreating(false)} title="Отмена">
                                    <X size={18} />
                                </button>
                            </td>
                        </tr>
                    )}

                    {loading && items.length === 0 && (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>Загрузка...</td>
                        </tr>
                    )}

                    {!loading && items.length === 0 && !isCreating && (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                                Нет записей
                            </td>
                        </tr>
                    )}

                    {items.map(item => (
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
                                    item.name
                                )}
                            </td>
                            <td>
                                <button
                                    className={`badge-btn ${item.is_active ? 'success' : 'danger'}`}
                                    onClick={() => handleUpdate(item.id, !item.is_active)}
                                    title="Нажмите для переключения статуса"
                                >
                                    {item.is_active ? 'Активен' : 'Отключен'}
                                </button>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                {editingId === item.id ? (
                                    <>
                                        <button className="icon-btn success" onClick={() => handleUpdate(item.id)} title="Сохранить">
                                            <Check size={18} />
                                        </button>
                                        <button className="icon-btn danger" onClick={() => setEditingId(null)} title="Отмена">
                                            <X size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="icon-btn"
                                        onClick={() => {
                                            setEditingId(item.id);
                                            setEditName(item.name);
                                        }}
                                        title="Редактировать"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Dictionaries() {
    return (
        <div className="dictionaries-container" style={{ maxWidth: '800px' }}>
            <DictionarySection title="Подразделения" type="departments" />
            <DictionarySection title="Профессии" type="professions" />
        </div>
    );
}
