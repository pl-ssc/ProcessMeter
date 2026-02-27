import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, ChevronsDown, ChevronsUp, Search, X } from 'lucide-react';

const ProcessTree = React.memo(function ProcessTree({ processes, selectedF3Index, onSelectF3 }) {
    const [expanded, setExpanded] = useState(() => {
        try {
            const saved = localStorage.getItem('pm_tree_expanded');
            if (saved) return new Set(JSON.parse(saved));
        } catch (e) { }
        return new Set();
    });

    const [searchQuery, setSearchQuery] = useState('');

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
                    initial.add(`p1-${p1.process_1_id}`);
                });

                // Разворачиваем самый верхний процесс 2 уровня
                const topP1 = tree[0];
                if (topP1 && topP1.children.size > 0) {
                    const topP2 = Array.from(topP1.children.values())[0];
                    if (topP2) {
                        initial.add(`p2-${topP2.process_2_id}`);
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
                    const p1Id = `p1-${selectedProcess.process_1_id}`;
                    const p2Id = `p2-${selectedProcess.process_2_id}`;
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
            all.add(`p1-${p1.process_1_id}`);
            Array.from(p1.children.values()).forEach(p2 => {
                all.add(`p2-${p2.process_2_id}`);
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

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        const results = [];
        for (const p of processes) {
            const match1 = p.f1_name.toLowerCase().includes(query);
            const match2 = p.f2_name.toLowerCase().includes(query);
            const match3 = p.f3_name.toLowerCase().includes(query);

            if (match1 || match2 || match3) {
                results.push({
                    process_3_id: String(p.process_3_id),
                    f1_name: p.f1_name,
                    f2_name: p.f2_name,
                    f3_name: p.f3_name,
                    has_data: p.has_data,
                    path: `${p.f1_name} → ${p.f2_name} → ${p.f3_name}`,
                });
            }
        }
        return results;
    }, [processes, searchQuery]);

    const handleSelectSearchResult = (p3_id) => {
        onSelectF3(p3_id);
        setSearchQuery('');
    };

    const highlightText = (text, query) => {
        if (!query.trim()) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ?
                <span key={i} style={{ backgroundColor: 'var(--accent-hover)', color: 'white', borderRadius: '2px', padding: '0 2px' }}>{part}</span> : part
        );
    };

    return (
        <div className="process-tree-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div className="process-tree-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 28px',
                            fontSize: '0.8125rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-app)',
                            height: '28px'
                        }}
                    />
                    {searchQuery && (
                        <button
                            className="icon-btn"
                            onClick={() => setSearchQuery('')}
                            style={{ position: 'absolute', right: '4px', padding: '2px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button
                    className="icon-btn"
                    onClick={handleExpandAll}
                    title="Развернуть все"
                    style={{
                        padding: '6px',
                        background: 'var(--bg-panel)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ChevronsDown size={16} />
                </button>
                <button
                    className="icon-btn"
                    onClick={handleCollapseAll}
                    title="Свернуть все"
                    style={{
                        padding: '6px',
                        background: 'var(--bg-panel)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ChevronsUp size={16} />
                </button>
            </div>

            <div className="process-tree" style={{ flex: 1, borderTop: 'none', overflowY: 'auto' }}>
                {searchQuery.trim() ? (
                    <div className="search-results" style={{ padding: '8px' }}>
                        {searchResults.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Ничего не найдено
                            </div>
                        ) : (
                            searchResults.map(res => (
                                <div
                                    key={res.process_3_id}
                                    className={`tree-node search-result-node ${selectedF3Index === res.process_3_id ? 'selected' : ''}`}
                                    onClick={() => handleSelectSearchResult(res.process_3_id)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        padding: '8px 12px',
                                        gap: '4px',
                                        borderBottom: '1px solid var(--border)',
                                        margin: '0',
                                        borderRadius: '0'
                                    }}
                                >
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'normal', lineHeight: 1.2 }}>
                                        {highlightText(`${res.f1_name} → ${res.f2_name}`, searchQuery)}
                                    </div>
                                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                        <span className="tree-label" style={{ fontWeight: 500, whiteSpace: 'normal', lineHeight: 1.2 }}>
                                            {highlightText(res.f3_name, searchQuery)}
                                        </span>
                                        {res.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--accent-highlight)' }} />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : tree.length === 1 ? (
                    Array.from(tree[0].children.values()).map((p2) => (
                        <div key={p2.process_2_id} className="tree-level-1">
                            <div
                                className="tree-node tree-node-1"
                                onClick={() => toggleExpand(`p2-${p2.process_2_id}`)}
                                title={p2.f2_name}
                            >
                                <span className="tree-icon">
                                    {expanded.has(`p2-${p2.process_2_id}`) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                                <span className="tree-label">{p2.f2_name}</span>
                                {p2.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: 'var(--accent-highlight)' }} />}
                            </div>
                            {expanded.has(`p2-${p2.process_2_id}`) && (
                                <div className="tree-children">
                                    {p2.children.map((p3) => (
                                        <div key={p3.process_3_id} className="tree-level-2">
                                            <div
                                                className={`tree-node tree-node-2 ${selectedF3Index === p3.process_3_id ? 'selected' : ''}`}
                                                onClick={() => onSelectF3(p3.process_3_id)}
                                                title={p3.f3_name}
                                            >
                                                <span className="tree-icon"></span>
                                                <span className="tree-label">{p3.f3_name}</span>
                                                {p3.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: 'var(--accent-highlight)' }} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    tree.map((p1) => (
                        <div key={p1.process_1_id} className="tree-level-1">
                            <div
                                className="tree-node tree-node-1"
                                onClick={() => toggleExpand(`p1-${p1.process_1_id}`)}
                                title={p1.f1_name}
                            >
                                <span className="tree-icon">
                                    {expanded.has(`p1-${p1.process_1_id}`) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                                <span className="tree-label">{p1.f1_name}</span>
                                {p1.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: 'var(--accent-highlight)' }} />}
                            </div>
                            {expanded.has(`p1-${p1.process_1_id}`) && (
                                <div className="tree-children">
                                    {Array.from(p1.children.values()).map((p2) => (
                                        <div key={p2.process_2_id} className="tree-level-2">
                                            <div
                                                className="tree-node tree-node-2"
                                                onClick={() => toggleExpand(`p2-${p2.process_2_id}`)}
                                                title={p2.f2_name}
                                            >
                                                <span className="tree-icon">
                                                    {expanded.has(`p2-${p2.process_2_id}`) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </span>
                                                <span className="tree-label">{p2.f2_name}</span>
                                                {p2.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: 'var(--accent-highlight)' }} />}
                                            </div>
                                            {expanded.has(`p2-${p2.process_2_id}`) && (
                                                <div className="tree-children">
                                                    {p2.children.map((p3) => (
                                                        <div
                                                            key={p3.process_3_id}
                                                            className={`tree-node tree-node-3 ${selectedF3Index === p3.process_3_id ? 'selected' : ''}`}
                                                            onClick={() => onSelectF3(p3.process_3_id)}
                                                            title={p3.f3_name}
                                                        >
                                                            <span className="tree-label">{p3.f3_name}</span>
                                                            {p3.has_data && <FileText size={12} className="data-icon" style={{ marginLeft: 'auto', color: 'var(--accent-highlight)' }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

export default ProcessTree;
