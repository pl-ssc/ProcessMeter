import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataEditor, GridCellKind } from '@glideapps/glide-data-grid';
import { DropdownCell, useExtraCells } from '@glideapps/glide-data-grid-cells';
import { apiFetch, getToken, setToken } from './api.js';

const columns = [
  { title: 'Процесс 1', width: 180 },
  { title: 'Процесс 2', width: 220 },
  { title: 'Процесс 3', width: 240 },
  { title: 'Операция', width: 320 },
  { title: 'Исполнитель', width: 180 },
  { title: 'Трудоемкость (чел-часы)', width: 180 },
  { title: 'ИТ-система', width: 220 },
  { title: 'Примечание', width: 320 },
];

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'ProcessMeter';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [route, setRoute] = useState(window.location.pathname || '/');

  const [systems, setSystems] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [answers, setAnswers] = useState([]);
  const [dirtyMap, setDirtyMap] = useState(new Map());
  const [saving, setSaving] = useState(false);
  const customRenderers = useExtraCells([DropdownCell]);
  const [gridSelection, setGridSelection] = useState({
    current: undefined,
    columns: [],
    rows: [],
  });

  const navigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(path);
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const boot = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await apiFetch('/api/auth/me');
        setUser(me.user);
      } catch {
        setToken('');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      if (route !== '/admin') navigate('/admin');
    } else {
      if (route !== '/app') navigate('/app');
    }
  }, [user, route, navigate]);

  useEffect(() => {
    if (!user) return;
    const loadMeta = async () => {
      const [sys, proc] = await Promise.all([
        apiFetch('/api/systems'),
        apiFetch('/api/processes'),
      ]);
      setSystems(sys.systems || []);
      setProcesses(proc.process_3 || []);
      if (proc.process_3 && proc.process_3.length > 0) {
        setSelectedProcess(proc.process_3[0].f3_index);
      }
    };
    loadMeta();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedProcess) return;
    const loadAnswers = async () => {
      const res = await apiFetch(`/api/answers?f3_index=${encodeURIComponent(selectedProcess)}`);
      setAnswers(res.answers || []);
      setDirtyMap(new Map());
    };
    loadAnswers();
  }, [user, selectedProcess]);

  const systemsById = useMemo(() => {
    const map = new Map();
    for (const s of systems) map.set(s.system_id, s.system_name);
    return map;
  }, [systems]);

  const systemsByName = useMemo(() => {
    const map = new Map();
    for (const s of systems) map.set(s.system_name.toLowerCase(), s.system_id);
    return map;
  }, [systems]);

  const isDone = answers.length > 0 && answers.every((a) => a.is_done);

  const getCellContent = useCallback((cell) => {
    const [col, row] = cell;
    const item = answers[row];
    if (!item) return { kind: GridCellKind.Text, data: '', displayData: '' };
    const isDirty = dirtyMap.has(item.operation_id);
    const editableCols = new Set([5, 6, 7]);
    const themeOverride = isDirty && editableCols.has(col) ? { bgCell: '#fff3cd' } : undefined;

    switch (col) {
      case 0:
        return { kind: GridCellKind.Text, data: item.f1_name || '', displayData: item.f1_name || '', themeOverride };
      case 1:
        return { kind: GridCellKind.Text, data: item.f2_name || '', displayData: item.f2_name || '', themeOverride };
      case 2:
        return { kind: GridCellKind.Text, data: item.f3_name || '', displayData: item.f3_name || '', themeOverride };
      case 3:
        return { kind: GridCellKind.Text, data: item.f4_name || '', displayData: item.f4_name || '', themeOverride };
      case 4:
        return { kind: GridCellKind.Text, data: item.executor_name || '', displayData: item.executor_name || '', themeOverride };
      case 5:
        return {
          kind: GridCellKind.Number,
          data: item.labor_hours === null || item.labor_hours === undefined ? null : Number(item.labor_hours),
          displayData: item.labor_hours === null || item.labor_hours === undefined ? '' : String(item.labor_hours),
          themeOverride,
        };
      case 6: {
        const name = item.system_id ? systemsById.get(item.system_id) || '' : '';
        return {
          kind: GridCellKind.Custom,
          allowOverlay: true,
          copyData: name,
          data: {
            kind: 'dropdown-cell',
            allowedValues: systems.map((s) => s.system_name),
            value: name,
          },
          themeOverride,
        };
      }
      case 7:
        return { kind: GridCellKind.Text, data: item.note || '', displayData: item.note || '', themeOverride };
      default:
        return { kind: GridCellKind.Text, data: '', displayData: '' };
    }
  }, [answers, systemsById, systems, dirtyMap]);

  const onCellEdited = useCallback((cell, newValue) => {
    const [col, row] = cell;
    const item = answers[row];
    if (!item) return;

    if (![5, 6, 7].includes(col)) return;

    const next = { ...item };

    if (col === 5 && newValue.kind === GridCellKind.Number) {
      const val = newValue.data === null ? null : Number(newValue.data);
      if (val !== null && (Number.isNaN(val) || val < 0 || val > 240)) {
        window.alert('Трудоемкость должна быть числом от 0 до 240');
        return;
      }
      next.labor_hours = val;
    }

    if (col === 6 && newValue.kind === GridCellKind.Custom) {
      const text = (newValue.data?.value || '').trim();
      if (!text) {
        next.system_id = null;
      } else {
        const id = systemsByName.get(text.toLowerCase());
        if (!id) {
          window.alert('ИТ-система не найдена в справочнике');
          return;
        }
        next.system_id = id;
      }
    }

    if (col === 7 && newValue.kind === GridCellKind.Text) {
      next.note = newValue.data || '';
    }

    const updated = [...answers];
    updated[row] = next;
    setAnswers(updated);

    const nextMap = new Map(dirtyMap);
    nextMap.set(next.operation_id, next);
    setDirtyMap(nextMap);
  }, [answers, dirtyMap, systemsByName]);

  const handleSave = async () => {
    if (dirtyMap.size === 0) return;
    setSaving(true);
    try {
      const items = Array.from(dirtyMap.values()).map((item) => ({
        operation_id: item.operation_id,
        labor_hours: item.labor_hours ?? null,
        system_id: item.system_id ?? null,
        note: item.note ?? null,
      }));
      await apiFetch('/api/answers/bulk', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      setDirtyMap(new Map());
    } catch (err) {
      window.alert(`Ошибка сохранения: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Отметить анкетирование как завершенное?')) return;
    try {
      await apiFetch('/api/answers/complete', { method: 'POST' });
      setAnswers((prev) => prev.map((r) => ({ ...r, is_done: true, done_at: new Date().toISOString() })));
    } catch (err) {
      window.alert(`Ошибка: ${err.message}`);
    }
  };

  const handleProcessChange = (value) => {
    if (dirtyMap.size > 0) {
      const ok = window.confirm('Есть несохраненные изменения. Перейти и потерять изменения?');
      if (!ok) return;
    }
    setSelectedProcess(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const form = new FormData(e.currentTarget);
    const username = form.get('username');
    const password = form.get('password');

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(res.token);
      setUser(res.user);
      if (res.user?.role === 'admin') navigate('/admin');
      else navigate('/app');
    } catch (err) {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setAnswers([]);
    setProcesses([]);
    setSystems([]);
    navigate('/');
  };

  if (loading) {
    return <div className="page">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>{ORG_NAME}</h1>
          <p>Вход для заполнения трудоемкости операций</p>
          <form onSubmit={handleLogin}>
            <label>
              Логин
              <input name="username" type="text" required />
            </label>
            <label>
              Пароль
              <input name="password" type="password" required />
            </label>
            {loginError && <div className="error">{loginError}</div>}
            <button type="submit">Войти</button>
          </form>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return <AdminPanel user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="title">{ORG_NAME}</div>
          <div className="subtitle">Заполнение трудоемкости операций</div>
        </div>
        <div className="topbar-actions">
          {dirtyMap.size > 0 && (
            <span className="dirty-indicator">Есть несохраненные изменения</span>
          )}
          <span>{user.full_name || user.username}</span>
          <button className="ghost" onClick={handleLogout}>Выйти</button>
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar-left">
          <label>
            Процесс 3 уровня
            <select value={selectedProcess} onChange={(e) => handleProcessChange(e.target.value)}>
              {processes.map((p) => (
                <option key={p.f3_index} value={p.f3_index}>
                  {p.f1_name} / {p.f2_name} / {p.f3_name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="toolbar-right">
          <button onClick={handleSave} disabled={dirtyMap.size === 0 || saving}>
            {saving ? 'Сохранение...' : `Сохранить (${dirtyMap.size})`}
          </button>
          <button className="primary" onClick={handleComplete} disabled={isDone}>
            {isDone ? 'Анкетирование завершено' : 'Завершить анкетирование'}
          </button>
        </div>
      </div>

      <div className="grid-wrap">
        <DataEditor
          columns={columns}
          getCellContent={getCellContent}
          rows={answers.length}
          onCellEdited={onCellEdited}
          customRenderers={customRenderers}
          gridSelection={gridSelection}
          onGridSelectionChange={setGridSelection}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            const current = gridSelection?.current?.cell;
            if (!current) return;
            const [col, row] = current;
            if (![5, 6, 7].includes(col)) return;

            let nextCol = col;
            let nextRow = row;
            if (col === 5) nextCol = 6;
            else if (col === 6) nextCol = 7;
            else if (col === 7) {
              nextCol = 5;
              nextRow = Math.min(row + 1, Math.max(answers.length - 1, 0));
            }

            setGridSelection({
              current: {
                cell: [nextCol, nextRow],
                range: {
                  x: nextCol,
                  y: nextRow,
                  width: 1,
                  height: 1,
                },
              },
              columns: [],
              rows: [],
            });
            return true;
          }}
          rowMarkers="both"
          smoothScrollX
          smoothScrollY
          height={600}
        />
      </div>
    </div>
  );
}

function AdminPanel({ user, onLogout }) {
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'respondent', process_1_access: [] });
  const [status, setStatus] = useState('');
  const [importConn, setImportConn] = useState('');
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [process1List, setProcess1List] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserAccess, setSelectedUserAccess] = useState([]);
  const [bulkUserIds, setBulkUserIds] = useState([]);
  const [bulkAccess, setBulkAccess] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status !== 'all') params.set('status', filters.status);
      params.set('include_admins', 'false');
      const qs = params.toString();
      const res = await apiFetch(`/api/admin/users${qs ? `?${qs}` : ''}`);
      setUsers(res.users || []);
    } catch (err) {
      setStatus(`Ошибка загрузки пользователей: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  }, [filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const loadProcess1 = async () => {
      try {
        const res = await apiFetch('/api/admin/process-1');
        setProcess1List(res.process_1 || []);
      } catch (err) {
        setStatus(`Ошибка загрузки процессов 1 уровня: ${err.message}`);
      }
    };
    loadProcess1();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setStatus('Пользователь создан');
      setForm({ username: '', password: '', full_name: '', role: 'respondent', process_1_access: [] });
      setShowCreateModal(false);
      loadUsers();
    } catch (err) {
      setStatus(`Ошибка: ${err.message}`);
    }
  };

  const handleResetPassword = async (target) => {
    const password = window.prompt(`Новый пароль для ${target.username}`);
    if (!password) return;
    try {
      await apiFetch(`/api/admin/users/${target.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setStatus(`Пароль обновлён для ${target.username}`);
    } catch (err) {
      setStatus(`Ошибка: ${err.message}`);
    }
  };

  const handleToggleActive = async (target) => {
    const next = !target.is_active;
    const label = next ? 'активировать' : 'деактивировать';
    if (!window.confirm(`Подтвердить: ${label} пользователя ${target.username}?`)) return;
    try {
      await apiFetch(`/api/admin/users/${target.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ is_active: next }),
      });
      setStatus(`Статус обновлён для ${target.username}`);
      loadUsers();
    } catch (err) {
      setStatus(`Ошибка: ${err.message}`);
    }
  };

  const loadUserAccess = async (userId) => {
    if (!userId) {
      setSelectedUserAccess([]);
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/access`);
      setSelectedUserAccess(res.process_1_access || []);
    } catch (err) {
      setStatus(`Ошибка загрузки доступов: ${err.message}`);
    }
  };

  const saveUserAccess = async () => {
    if (!selectedUserId) return;
    try {
      await apiFetch(`/api/admin/users/${selectedUserId}/access`, {
        method: 'POST',
        body: JSON.stringify({ process_1_access: selectedUserAccess }),
      });
      setStatus('Доступы пользователя обновлены');
      loadUsers();
    } catch (err) {
      setStatus(`Ошибка сохранения доступов: ${err.message}`);
    }
  };

  const applyBulkAccess = async () => {
    if (bulkUserIds.length === 0) {
      setStatus('Выбери пользователей для массового назначения');
      return;
    }
    const ok = window.confirm('Назначить выбранные процессы всем выбранным пользователям? Их ответы будут пересозданы.');
    if (!ok) return;
    try {
      await apiFetch('/api/admin/users/access-bulk', {
        method: 'POST',
        body: JSON.stringify({ user_ids: bulkUserIds, process_1_access: bulkAccess, mode: 'replace' }),
      });
      setStatus('Массовое назначение выполнено');
      setBulkUserIds([]);
      setBulkAccess([]);
      loadUsers();
    } catch (err) {
      setStatus(`Ошибка массового назначения: ${err.message}`);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="title">{ORG_NAME}</div>
          <div className="subtitle">Администрирование</div>
        </div>
        <div className="topbar-actions">
          <span>{user.full_name || user.username}</span>
          <button className="ghost" onClick={onLogout}>Выйти</button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button
          className={`admin-tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Импорт справочников
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-wrap">
          <div className="admin-card admin-card-wide">
            <div className="admin-header-row">
              <h2>Пользователи</h2>
              <button type="button" onClick={() => setShowCreateModal(true)}>
                Добавить пользователя
              </button>
            </div>
            <div className="admin-filters">
              <input
                name="search"
                type="text"
                placeholder="Поиск по логину или ФИО"
                value={filters.search}
                onChange={handleFilterChange}
              />
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
              <button className="ghost" type="button" onClick={loadUsers}>
                Обновить
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Логин</th>
                    <th>ФИО</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers && (
                    <tr>
                      <td colSpan="6">Загрузка...</td>
                    </tr>
                  )}
                  {!loadingUsers && users.length === 0 && (
                    <tr>
                      <td colSpan="6">Пользователи не найдены</td>
                    </tr>
                  )}
                  {!loadingUsers && users.map((u) => (
                    <tr
                      key={u.id}
                      className={`${!u.is_active ? 'inactive' : u.access_count === 0 ? 'no-access' : ''} ${String(selectedUserId) === String(u.id) ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedUserId(String(u.id));
                        loadUserAccess(String(u.id));
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={bulkUserIds.includes(u.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setBulkUserIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(u.id);
                              else next.delete(u.id);
                              return Array.from(next);
                            });
                          }}
                        />
                      </td>
                      <td>{u.username}</td>
                      <td>{u.full_name || '-'}</td>
                      <td>{u.role === 'admin' ? 'Администратор' : 'Респондент'}</td>
                      <td>{u.is_active ? 'Активен' : 'Неактивен'}</td>
                      <td className="admin-actions">
                        <button className="ghost" type="button" onClick={(e) => { e.stopPropagation(); handleResetPassword(u); }}>
                          Сброс пароля
                        </button>
                        <button
                          className="ghost"
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleActive(u); }}
                          disabled={u.id === user.id}
                        >
                          {u.is_active ? 'Деактивировать' : 'Активировать'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-split">
              <div>
                <h3>Доступы выбранного пользователя</h3>
                <div className="admin-hint">
                  Выбери пользователя в таблице, затем настрой доступы.
                </div>
                <div className="admin-checkboxes">
                  {process1List.map((p) => (
                    <label key={p.f1_index} className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUserAccess.includes(p.f1_index)}
                        onChange={(e) => {
                          setSelectedUserAccess((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(p.f1_index);
                            else next.delete(p.f1_index);
                            return Array.from(next);
                          });
                        }}
                        disabled={!selectedUserId}
                      />
                      {p.f1_name}
                    </label>
                  ))}
                </div>
                <button className="ghost" type="button" onClick={saveUserAccess} disabled={!selectedUserId}>
                  Сохранить доступы
                </button>
              </div>

              <div>
                <h3>Массовое назначение доступов</h3>
                <div className="admin-hint">
                  Выбери пользователей чекбоксами в таблице, затем задай процессы.
                </div>
                <div className="admin-checkboxes">
                  {process1List.map((p) => (
                    <label key={p.f1_index} className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={bulkAccess.includes(p.f1_index)}
                        onChange={(e) => {
                          setBulkAccess((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(p.f1_index);
                            else next.delete(p.f1_index);
                            return Array.from(next);
                          });
                        }}
                      />
                      {p.f1_name}
                    </label>
                  ))}
                </div>
                <button type="button" onClick={applyBulkAccess}>
                  Применить массовое назначение
                </button>
              </div>
            </div>
            {status && <div className="admin-status">{status}</div>}
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="admin-wrap">
          <div className="admin-card admin-card-wide">
            <h2>Импорт процессов и справочников</h2>
            <p className="admin-hint">
              Будут загружены таблицы процессов (1-4), ИТ-систем и исполнителей. Все ответы пользователей будут очищены.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="admin-form"
            >
              <label>
                Строка подключения к источнику
                <input
                  name="connection"
                  type="text"
                  placeholder="postgresql://user:pass@host:port/db"
                  value={importConn}
                  onChange={(e) => setImportConn(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={async () => {
                  if (!importConn) {
                    setStatus('Укажи строку подключения');
                    return;
                  }
                  const ok = window.confirm('Импорт перезапишет справочники и удалит ответы пользователей. Продолжить?');
                  if (!ok) return;
                  try {
                    await apiFetch('/api/admin/import', {
                      method: 'POST',
                      body: JSON.stringify({ connectionString: importConn }),
                    });
                    setStatus('Импорт завершён');
                    setImportConn('');
                    loadUsers();
                  } catch (err) {
                    setStatus(`Ошибка импорта: ${err.message}`);
                  }
                }}
              >
                Импортировать
              </button>
              {status && <div className="admin-status">{status}</div>}
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Добавить пользователя</h2>
              <button className="ghost" type="button" onClick={() => setShowCreateModal(false)}>
                Закрыть
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                Логин (email)
                <input name="username" type="email" required value={form.username} onChange={handleChange} />
              </label>
              <label>
                Пароль
                <input name="password" type="text" required value={form.password} onChange={handleChange} />
              </label>
              <label>
                ФИО
                <input name="full_name" type="text" value={form.full_name} onChange={handleChange} />
              </label>
              <label>
                Роль
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="respondent">Респондент</option>
                  <option value="admin">Администратор</option>
                </select>
              </label>
              <label>
                Доступные процессы 1 уровня
                <div className="admin-checkboxes">
                  {process1List.map((p) => (
                    <label key={p.f1_index} className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={form.process_1_access.includes(p.f1_index)}
                        onChange={(e) => {
                          setForm((prev) => {
                            const next = new Set(prev.process_1_access);
                            if (e.target.checked) next.add(p.f1_index);
                            else next.delete(p.f1_index);
                            return { ...prev, process_1_access: Array.from(next) };
                          });
                        }}
                      />
                      {p.f1_name}
                    </label>
                  ))}
                </div>
              </label>
              <button type="submit">Создать пользователя</button>
              {status && <div className="admin-status">{status}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
