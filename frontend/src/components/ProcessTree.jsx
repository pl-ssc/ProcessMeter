import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';

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

    // Авто-развертывание при загрузке данных первоначально
    useEffect(() => {
        if (processes.length > 0 && expanded.size === 0) {
            const hasSavedState = !!localStorage.getItem('pm_tree_expanded');
            if (!hasSavedState) {
                const initial = new Set();
                processes.forEach(p => {
                    initial.add(String(p.process_1_id));
                    initial.add(String(p.process_2_id));
                });
                setExpanded(initial);
            }
        }
    }, [processes, expanded.size]);

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

    const toggleExpand = (key) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="process-tree">
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
    );
});

export default ProcessTree;
