import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, ChevronsDown, ChevronsUp } from 'lucide-react';

const ProcessTree = React.memo(function ProcessTree({ processes, selectedF3Index, onSelectF3 }) {
    const [expanded, setExpanded] = useState(() => {
        try {
            const saved = localStorage.getItem('pm_tree_expanded');
            if (saved) return new Set(JSON.parse(saved));
        } catch (e) { }
        return new Set();
    });

    useEffect(() => {
        localStorage.setItem('pm_tree_expanded', JSON.stringify(Array.from(expanded)));
    }, [expanded]);

    const tree = useMemo(() => {
        const map = new Map();

        for (const p of processes) {
            const f1Key = String(p.process_1_id);
            const f2Key = String(p.process_2_id);
            const f3Key = String(p.process_3_id);
            const hasData = p.has_data;

            if (!map.has(f1Key)) {
                map.set(f1Key, {
                    process_1_id: f1Key,
                    f1_name: p.f1_name,
                    has_data: false,
                    children: new Map(),
                });
            }

            const p1 = map.get(f1Key);
            if (hasData) p1.has_data = true;

            if (!p1.children.has(f2Key)) {
                p1.children.set(f2Key, {
                    process_2_id: f2Key,
                    f2_name: p.f2_name,
                    has_data: false,
                    children: [],
                });
            }

            const p2 = p1.children.get(f2Key);
            if (hasData) p2.has_data = true;

            p2.children.push({
                process_3_id: f3Key,
                f3_name: p.f3_name,
                has_data: hasData,
            });
        }

        return Array.from(map.values()).sort((a, b) => a.f1_name.localeCompare(b.f1_name));
    }, [processes]);

    // Авто-развертывание при загрузке данных первоначально
    useEffect(() => {
        if (tree.length > 0 && expanded.size === 0) {
            const hasSavedState = !!localStorage.getItem('pm_tree_expanded');
            if (!hasSavedState) {
                const initial = new Set();

                // Разворачиваем все процессы 1 уровня (чтобы были видны процессы 2 уровня)
                tree.forEach(p1 => {
                    initial.add(String(p1.process_1_id));
                });

                // Разворачиваем самый верхний процесс 2 уровня
                const topP1 = tree[0];
                if (topP1 && topP1.children.size > 0) {
                    const topP2 = Array.from(topP1.children.values())[0];
                    if (topP2) {
                        initial.add(String(topP2.process_2_id));
                    }
                }

                setExpanded(initial);
            }
        }
    }, [tree, expanded.size]);

    // Раскрыть родителей выбранного процесса при инициализации или изменении
    useEffect(() => {
        if (selectedF3Index && processes.length > 0) {
            const selectedProcess = processes.find(p => String(p.process_3_id) === String(selectedF3Index));
            if (selectedProcess) {
                setExpanded(prev => {
                    const p1Id = String(selectedProcess.process_1_id);
                    const p2Id = String(selectedProcess.process_2_id);
                    if (!prev.has(p1Id) || !prev.has(p2Id)) {
                        const next = new Set(prev);
                        next.add(p1Id);
                        next.add(p2Id);
                        return next;
                    }
                    return prev;
                });
            }
        }
    }, [selectedF3Index, processes]);

    const handleExpandAll = () => {
        const all = new Set();
        tree.forEach(p1 => {
            all.add(String(p1.process_1_id));
            Array.from(p1.children.values()).forEach(p2 => {
                all.add(String(p2.process_2_id));
            });
        });
        setExpanded(all);
    };

    const handleCollapseAll = () => {
        setExpanded(new Set());
    };

    const toggleExpand = (key) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="process-tree-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div className="process-tree-toolbar" style={{ display: 'flex', gap: '8px', padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
                <button className="icon-btn" onClick={handleExpandAll} title="Развернуть все" style={{ padding: '4px' }}>
                    <ChevronsDown size={16} />
                </button>
                <button className="icon-btn" onClick={handleCollapseAll} title="Свернуть все" style={{ padding: '4px' }}>
                    <ChevronsUp size={16} />
                </button>
            </div>
            <div className="process-tree" style={{ flex: 1, borderTop: 'none', overflowY: 'auto' }}>
                {tree.map((p1) => (
                    <div key={p1.process_1_id} className="tree-level-1">
                        <div
                            className="tree-node tree-node-1"
                            onClick={() => toggleExpand(p1.process_1_id)}
                            title={p1.f1_name}
                        >
                            <span className="tree-icon">
                                {expanded.has(p1.process_1_id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                            <span className="tree-label">{p1.f1_name}</span>
                            {p1.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: '#10b981' }} />}
                        </div>
                        {expanded.has(p1.process_1_id) && (
                            <div className="tree-children">
                                {Array.from(p1.children.values()).map((p2) => (
                                    <div key={p2.process_2_id} className="tree-level-2">
                                        <div
                                            className="tree-node tree-node-2"
                                            onClick={() => toggleExpand(p2.process_2_id)}
                                            title={p2.f2_name}
                                        >
                                            <span className="tree-icon">
                                                {expanded.has(p2.process_2_id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </span>
                                            <span className="tree-label">{p2.f2_name}</span>
                                            {p2.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: '#10b981' }} />}
                                        </div>
                                        {expanded.has(p2.process_2_id) && (
                                            <div className="tree-children">
                                                {p2.children.map((p3) => (
                                                    <div
                                                        key={p3.process_3_id}
                                                        className={`tree-node tree-node-3 ${selectedF3Index === p3.process_3_id ? 'selected' : ''}`}
                                                        onClick={() => onSelectF3(p3.process_3_id)}
                                                        title={p3.f3_name}
                                                    >
                                                        <span className="tree-label">{p3.f3_name}</span>
                                                        {p3.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: '#10b981' }} />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ProcessTree;
