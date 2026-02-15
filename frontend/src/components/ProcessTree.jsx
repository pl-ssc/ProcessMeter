import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function ProcessTree({ processes, selectedF3Index, onSelectF3 }) {
    const [expanded, setExpanded] = useState(new Set());

    // Авто-развертывание при загрузке данных
    useEffect(() => {
        if (processes.length > 0 && expanded.size === 0) {
            const initial = new Set();
            processes.forEach(p => {
                initial.add(p.f1_index);
                initial.add(p.f2_index);
            });
            setExpanded(initial);
        }
    }, [processes]);

    const tree = useMemo(() => {
        const map = new Map();

        for (const p of processes) {
            const f1Key = p.f1_index;
            const f2Key = p.f2_index;
            const f3Key = p.f3_index;

            if (!map.has(f1Key)) {
                map.set(f1Key, {
                    f1_index: f1Key,
                    f1_name: p.f1_name,
                    children: new Map(),
                });
            }

            const p1 = map.get(f1Key);
            if (!p1.children.has(f2Key)) {
                p1.children.set(f2Key, {
                    f2_index: f2Key,
                    f2_name: p.f2_name,
                    children: [],
                });
            }

            const p2 = p1.children.get(f2Key);
            p2.children.push({
                f3_index: f3Key,
                f3_name: p.f3_name,
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
                <div key={p1.f1_index} className="tree-level-1">
                    <div
                        className="tree-node tree-node-1"
                        onClick={() => toggleExpand(p1.f1_index)}
                    >
                        <span className="tree-icon">
                            {expanded.has(p1.f1_index) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        <span className="tree-label">{p1.f1_name}</span>
                    </div>
                    {expanded.has(p1.f1_index) && (
                        <div className="tree-children">
                            {Array.from(p1.children.values()).map((p2) => (
                                <div key={p2.f2_index} className="tree-level-2">
                                    <div
                                        className="tree-node tree-node-2"
                                        onClick={() => toggleExpand(p2.f2_index)}
                                    >
                                        <span className="tree-icon">
                                            {expanded.has(p2.f2_index) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </span>
                                        <span className="tree-label">{p2.f2_name}</span>
                                    </div>
                                    {expanded.has(p2.f2_index) && (
                                        <div className="tree-children">
                                            {p2.children.map((p3) => (
                                                <div
                                                    key={p3.f3_index}
                                                    className={`tree-node tree-node-3 ${selectedF3Index === p3.f3_index ? 'selected' : ''}`}
                                                    onClick={() => onSelectF3(p3.f3_index)}
                                                >
                                                    <span className="tree-label">{p3.f3_name}</span>
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
}
