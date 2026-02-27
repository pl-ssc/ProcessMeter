import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { apiFetch } from '../api.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import Header from './Header.jsx';
import InfoPanel from './InfoPanel.jsx';
import ProcessTree from './ProcessTree.jsx';
import AnswerGrid from './AnswerGrid.jsx';

export default function RespondentView({ user, onLogout }) {
    const [systems, setSystems] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [selectedF3Index, setSelectedF3Index] = useState('');
    const [answers, setAnswers] = useState([]);
    const [dirtyMap, setDirtyMap] = useState(new Map());
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = localStorage.getItem('pm_sidebar_width');
        return saved ? Number(saved) : window.innerWidth * 0.25;
    });
    const [isResizing, setIsResizing] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [stats, setStats] = useState({ total_hours: 0, fte: 0, status: 'not_started' });

    const toggleTheme = useCallback(() => {
        setIsDark(prev => !prev);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark-theme', isDark);
    }, [isDark]);

    useEffect(() => {
        localStorage.setItem('pm_sidebar_width', sidebarWidth.toString());
    }, [sidebarWidth]);

    const loadStats = useCallback(async () => {
        try {
            const res = await apiFetch('/api/user/stats');
            setStats(res);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }, []);

    useEffect(() => {
        const loadMeta = async () => {
            const [sys, proc] = await Promise.all([
                apiFetch('/api/systems'),
                apiFetch('/api/processes'),
            ]);
            setSystems(sys.systems || []);

            const processList = proc.process_3 || [];
            setProcesses(processList);

            if (processList.length > 0) {
                const savedF3 = localStorage.getItem('pm_selected_f3');
                if (savedF3 && processList.some(p => String(p.process_3_id) === savedF3)) {
                    setSelectedF3Index(savedF3);
                } else {
                    try {
                        const sortedP1 = Array.from(new Set(processList.map(p => p.f1_name))).sort((a, b) => a.localeCompare(b));
                        const topP1Name = sortedP1[0];
                        const firstF3 = processList.find(p => p.f1_name === topP1Name);
                        setSelectedF3Index(String(firstF3 ? firstF3.process_3_id : processList[0].process_3_id));
                    } catch (e) {
                        setSelectedF3Index(String(processList[0].process_3_id));
                    }
                }
            }
        };
        loadMeta();
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        if (!selectedF3Index) return;
        const loadAnswers = async () => {
            const res = await apiFetch(`/api/answers?process_3_id=${encodeURIComponent(selectedF3Index)}`);
            setAnswers(res.answers || []);
            setDirtyMap(new Map());
        };
        loadAnswers();
    }, [selectedF3Index]);

    const handleSave = useCallback(async () => {
        if (dirtyMap.size === 0) return;
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
            loadStats(); // Update stats after save
        } catch (err) {
            window.alert(`Ошибка сохранения: ${err.message}`);
            throw err;
        }
    }, [dirtyMap, loadStats]);

    const { trigger: triggerAutoSave, status: autoSaveStatus } = useAutoSave(handleSave);

    const handleEdit = useCallback((updatedItem) => {
        setAnswers((prev) => {
            const idx = prev.findIndex((a) => a.operation_id === updatedItem.operation_id);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = updatedItem;
            return next;
        });

        setDirtyMap((prev) => {
            const next = new Map(prev);
            next.set(updatedItem.operation_id, updatedItem);
            return next;
        });

        triggerAutoSave();
    }, [triggerAutoSave]);

    const handleSubmit = async () => {
        if (dirtyMap.size > 0) {
            await handleSave();
        }
        if (!window.confirm('После завершения ввода данных таблица будет заблокирована для ввода. Вы уверены?')) return;
        try {
            await apiFetch('/api/answers/complete', { method: 'POST' });
            loadStats(); // Update stats after submit
            window.alert('Ввод данных завершен');
        } catch (err) {
            window.alert(`Ошибка: ${err.message}`);
        }
    };

    const dirtyMapRef = useRef(dirtyMap);
    useEffect(() => {
        dirtyMapRef.current = dirtyMap;
    }, [dirtyMap]);

    useEffect(() => {
        if (selectedF3Index) {
            localStorage.setItem('pm_selected_f3', selectedF3Index);
        }
    }, [selectedF3Index]);

    const handleSelectF3 = useCallback((f3Index) => {
        if (dirtyMapRef.current.size > 0) {
            const ok = window.confirm('Есть несохраненные изменения. Перейти и потерять изменения?');
            if (!ok) return;
        }
        setSelectedF3Index(f3Index);
    }, []);

    const startResizing = useCallback((e) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            const maxWidth = window.innerWidth * 0.5;
            if (newWidth > 150 && newWidth < maxWidth) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const selectedProcess = useMemo(() => {
        if (!selectedF3Index || !processes) return null;
        return processes.find(p => String(p.process_3_id) === String(selectedF3Index));
    }, [processes, selectedF3Index]);

    return (
        <div className="app">
            <Header
                user={user}
                onLogout={onLogout}
                autoSaveStatus={autoSaveStatus}
                hasChanges={dirtyMap.size > 0}
                isDark={isDark}
                onToggleTheme={toggleTheme}
            />
            <InfoPanel
                stats={stats}
                onSubmit={handleSubmit}
                hasChanges={dirtyMap.size > 0}
                isDark={isDark}
            />
            <div
                className="respondent-layout"
                style={{ gridTemplateColumns: `${sidebarWidth}px 4px 1fr` }}
            >
                <ProcessTree
                    processes={processes}
                    selectedF3Index={selectedF3Index}
                    onSelectF3={handleSelectF3}
                />
                <div className="resizer" onMouseDown={startResizing} />
                <AnswerGrid
                    answers={answers}
                    systems={systems}
                    onEdit={handleEdit}
                    dirtyMap={dirtyMap}
                    isDark={isDark}
                    isSubmitted={stats.status === 'completed'}
                    selectedProcess={selectedProcess}
                />
            </div>
        </div>
    );
}
