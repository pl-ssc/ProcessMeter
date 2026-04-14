import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, FileText, Search, X } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { ScrollArea } from './ui/scroll-area.jsx';

const ProcessTree = React.memo(function ProcessTree({ processes, selectedF3Index, onSelectF3 }) {
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('pm_tree_expanded');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('pm_tree_expanded', JSON.stringify(Array.from(expanded)));
  }, [expanded]);

  const tree = useMemo(() => {
    const map = new Map();
    for (const process of processes) {
      const f1Key = String(process.process_1_id);
      const f2Key = String(process.process_2_id);
      const f3Key = String(process.process_3_id);

      if (!map.has(f1Key)) {
        map.set(f1Key, {
          process_1_id: f1Key,
          f1_name: process.f1_name,
          has_data: false,
          children: new Map(),
        });
      }

      const p1 = map.get(f1Key);
      if (process.has_data) p1.has_data = true;

      if (!p1.children.has(f2Key)) {
        p1.children.set(f2Key, {
          process_2_id: f2Key,
          f2_name: process.f2_name,
          has_data: false,
          children: [],
        });
      }

      const p2 = p1.children.get(f2Key);
      if (process.has_data) p2.has_data = true;
      p2.children.push({
        process_3_id: f3Key,
        f3_name: process.f3_name,
        has_data: process.has_data,
      });
    }

    return Array.from(map.values()).sort((a, b) => a.f1_name.localeCompare(b.f1_name));
  }, [processes]);

  useEffect(() => {
    if (tree.length > 0 && expanded.size === 0) {
      const hasSavedState = !!localStorage.getItem('pm_tree_expanded');
      if (!hasSavedState) {
        const initial = new Set();
        tree.forEach((p1) => initial.add(`p1-${p1.process_1_id}`));
        const topP1 = tree[0];
        if (topP1 && topP1.children.size > 0) {
          const topP2 = Array.from(topP1.children.values())[0];
          if (topP2) initial.add(`p2-${topP2.process_2_id}`);
        }
        setExpanded(initial);
      }
    }
  }, [tree, expanded.size]);

  useEffect(() => {
    if (!selectedF3Index || processes.length === 0) return;
    const selectedProcess = processes.find((process) => String(process.process_3_id) === String(selectedF3Index));
    if (!selectedProcess) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(`p1-${selectedProcess.process_1_id}`);
      next.add(`p2-${selectedProcess.process_2_id}`);
      return next;
    });
  }, [selectedF3Index, processes]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return processes
      .filter((process) => [process.f1_name, process.f2_name, process.f3_name].some((label) => label.toLowerCase().includes(query)))
      .map((process) => ({
        process_3_id: String(process.process_3_id),
        f1_name: process.f1_name,
        f2_name: process.f2_name,
        f3_name: process.f3_name,
        has_data: process.has_data,
      }));
  }, [processes, searchQuery]);

  const toggleExpand = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExpandAll = () => {
    const all = new Set();
    tree.forEach((p1) => {
      all.add(`p1-${p1.process_1_id}`);
      Array.from(p1.children.values()).forEach((p2) => all.add(`p2-${p2.process_2_id}`));
    });
    setExpanded(all);
  };

  const renderNodeButton = ({ label, selected = false, hasData = false, onClick, icon, depth = 0 }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-all ${
        selected
          ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
          : 'text-foreground hover:bg-secondary'
      }`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      title={label}
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      <span className={`min-w-0 flex-1 whitespace-normal break-words leading-5 ${selected ? 'font-semibold' : ''}`}>{label}</span>
      {hasData ? <FileText className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${selected ? 'text-primary' : 'text-accent'}`} /> : null}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="sticky top-0 z-20 space-y-2 border-b border-border/80 bg-card p-3">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-foreground">Дерево процессов</div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по процессам..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 rounded-lg pl-9 pr-9 text-sm shadow-none"
            />
            {searchQuery ? (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 size-7 -translate-y-1/2 rounded-md" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <Button variant="outline" size="icon" className="size-9 rounded-lg shadow-none" onClick={handleExpandAll} title="Развернуть все">
            <ChevronsDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-9 rounded-lg shadow-none" onClick={() => setExpanded(new Set())} title="Свернуть все">
            <ChevronsUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2.5">
          {searchQuery.trim()
            ? searchResults.map((result) => (
                <div key={result.process_3_id} className="rounded-lg border border-border bg-background p-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectF3(result.process_3_id);
                      setSearchQuery('');
                    }}
                    className={`w-full rounded-lg p-2.5 text-left text-sm transition-colors ${
                      selectedF3Index === result.process_3_id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">{result.f1_name} / {result.f2_name}</div>
                    <div className="mt-1 flex items-center gap-2 font-medium">
                      <span className="min-w-0 flex-1 whitespace-normal break-words leading-5">{result.f3_name}</span>
                      {result.has_data ? <FileText className="h-3.5 w-3.5" /> : null}
                    </div>
                  </button>
                </div>
              ))
            : tree.map((p1) => (
                <div key={p1.process_1_id} className="pm-soft-rise space-y-1 rounded-xl border border-border bg-background p-2">
                  {tree.length > 1 &&
                    renderNodeButton({
                      label: p1.f1_name,
                      hasData: p1.has_data,
                      onClick: () => toggleExpand(`p1-${p1.process_1_id}`),
                      icon: expanded.has(`p1-${p1.process_1_id}`) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
                    })}
                  {(tree.length === 1 || expanded.has(`p1-${p1.process_1_id}`)) &&
                    Array.from(p1.children.values()).map((p2) => (
                      <div key={p2.process_2_id} className="space-y-1">
                        {renderNodeButton({
                          label: p2.f2_name,
                          hasData: p2.has_data,
                          onClick: () => toggleExpand(`p2-${p2.process_2_id}`),
                          icon: expanded.has(`p2-${p2.process_2_id}`) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
                          depth: tree.length === 1 ? 0 : 1,
                        })}
                        {expanded.has(`p2-${p2.process_2_id}`) &&
                          p2.children.map((p3) => (
                            <div key={p3.process_3_id}>
                              {renderNodeButton({
                                label: p3.f3_name,
                                selected: selectedF3Index === p3.process_3_id,
                                hasData: p3.has_data,
                                onClick: () => onSelectF3(p3.process_3_id),
                                icon: null,
                                depth: tree.length === 1 ? 1 : 2,
                              })}
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              ))}
          {!searchQuery.trim() && tree.length === 0 ? <div className="p-6 text-center text-sm text-muted-foreground">Процессы пока не загружены</div> : null}
          {searchQuery.trim() && searchResults.length === 0 ? <div className="p-6 text-center text-sm text-muted-foreground">Ничего не найдено</div> : null}
        </div>
      </ScrollArea>
    </div>
  );
});

export default ProcessTree;
