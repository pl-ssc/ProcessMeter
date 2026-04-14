import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../api.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import Header from './Header.jsx';
import InfoPanel from './InfoPanel.jsx';
import ProcessTree from './ProcessTree.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog.jsx';
import { Skeleton } from './ui/skeleton.jsx';

const AnswerGrid = lazy(() => import('./AnswerGrid.jsx'));

export default function RespondentView({ user, onLogout, isDark, onToggleTheme, onSwitchRole }) {
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
  const [stats, setStats] = useState({ total_hours: 0, fte: 0, status: 'not_started' });
  const [notice, setNotice] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, type: null, target: null });
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.innerWidth < 1280);

  useEffect(() => {
    localStorage.setItem('pm_sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const handleResize = () => setIsCompactLayout(window.innerWidth < 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiFetch('/api/user/stats');
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    const loadMeta = async () => {
      const [systemsResponse, processesResponse] = await Promise.all([apiFetch('/api/systems'), apiFetch('/api/processes')]);
      setSystems(systemsResponse.systems || []);

      const processList = processesResponse.process_3 || [];
      setProcesses(processList);

      if (processList.length > 0) {
        const savedF3 = localStorage.getItem('pm_selected_f3');
        if (savedF3 && processList.some((process) => String(process.process_3_id) === savedF3)) {
          setSelectedF3Index(savedF3);
          return;
        }

        try {
          const sortedP1 = Array.from(new Set(processList.map((process) => process.f1_name))).sort((a, b) => a.localeCompare(b));
          const topP1Name = sortedP1[0];
          const firstF3 = processList.find((process) => process.f1_name === topP1Name);
          setSelectedF3Index(String(firstF3 ? firstF3.process_3_id : processList[0].process_3_id));
        } catch {
          setSelectedF3Index(String(processList[0].process_3_id));
        }
      }
    };

    loadMeta();
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!selectedF3Index) return;

    const loadAnswers = async () => {
      const response = await apiFetch(`/api/answers?process_3_id=${encodeURIComponent(selectedF3Index)}`);
      setAnswers(response.answers || []);
      setDirtyMap(new Map());
    };

    loadAnswers();
  }, [selectedF3Index]);

  const handleSave = useCallback(async () => {
    if (dirtyMap.size === 0) return;
    try {
      const items = Array.from(dirtyMap.values()).map((item) => ({
        answer_kind: item.answer_kind,
        row_id: item.row_id,
        operation_id: item.operation_id,
        custom_operation_id: item.custom_operation_id ?? null,
        labor_hours: item.labor_hours ?? null,
        system_id: item.system_id ?? null,
        note: item.note ?? null,
      }));

      await apiFetch('/api/answers/bulk', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      setDirtyMap(new Map());
      loadStats();
    } catch (error) {
      setNotice({ type: 'error', message: `Ошибка сохранения: ${error.message}` });
      throw error;
    }
  }, [dirtyMap, loadStats]);

  const { trigger: triggerAutoSave, status: autoSaveStatus } = useAutoSave(handleSave);

  const handleEdit = useCallback(
    (updatedItem) => {
      setAnswers((previous) => {
        const index = previous.findIndex((answer) => (answer.row_id || answer.operation_id) === (updatedItem.row_id || updatedItem.operation_id));
        if (index === -1) return previous;
        const next = [...previous];
        next[index] = updatedItem;
        return next;
      });

      setDirtyMap((previous) => {
        const next = new Map(previous);
        next.set(updatedItem.row_id || updatedItem.operation_id, updatedItem);
        return next;
      });

      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  const handleRemoveAnswer = useCallback((removedItem) => {
    setAnswers((previous) => previous.filter((answer) => (answer.row_id || answer.operation_id) !== (removedItem.row_id || removedItem.operation_id)));
    setDirtyMap((previous) => {
      const next = new Map(previous);
      next.delete(removedItem.row_id || removedItem.operation_id);
      return next;
    });
  }, []);

  const confirmComplete = async () => {
    if (dirtyMap.size > 0) {
      await handleSave();
    }
    try {
      await apiFetch('/api/answers/complete', { method: 'POST' });
      loadStats();
      setNotice({ type: 'success', message: 'Ввод данных завершен.' });
    } catch (error) {
      setNotice({ type: 'error', message: `Ошибка: ${error.message}` });
    }
  };

  const handleSubmit = () => {
    setConfirmState({ open: true, type: 'complete', target: null });
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
      setConfirmState({ open: true, type: 'switch-process', target: f3Index });
      return;
    }
    setSelectedF3Index(f3Index);
  }, []);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (event) => {
      if (!isResizing) return;
      const newWidth = event.clientX;
      const maxWidth = window.innerWidth * 0.5;
      if (newWidth > 260 && newWidth < maxWidth) {
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

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
    return processes.find((process) => String(process.process_3_id) === String(selectedF3Index));
  }, [processes, selectedF3Index]);

  return (
    <div className="flex h-full flex-col">
      <Header
        user={user}
        onLogout={onLogout}
        autoSaveStatus={autoSaveStatus}
        hasChanges={dirtyMap.size > 0}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onSwitchRole={onSwitchRole}
      />
      <InfoPanel stats={stats} onSubmit={handleSubmit} hasChanges={dirtyMap.size > 0} />
      {notice ? (
        <div className="px-4 pt-4 md:px-6">
          <Alert variant={notice.type === 'success' ? 'success' : 'destructive'}>
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>{notice.message}</span>
              <button type="button" className="text-xs font-semibold uppercase tracking-wide" onClick={() => setNotice(null)}>
                Закрыть
              </button>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      <div
        className="grid min-h-0 flex-1 gap-4 px-4 pb-4 pt-4 md:px-6"
        style={isCompactLayout ? { gridTemplateColumns: '1fr', gridTemplateRows: 'minmax(280px, 36vh) 1fr' } : { gridTemplateColumns: `${sidebarWidth}px 8px 1fr` }}
      >
        <div className="min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <ProcessTree processes={processes} selectedF3Index={selectedF3Index} onSelectF3={handleSelectF3} />
        </div>
        {!isCompactLayout ? (
          <div
            className="cursor-col-resize rounded-full bg-gradient-to-b from-transparent via-border to-transparent transition-colors hover:via-primary/35"
            onMouseDown={startResizing}
          />
        ) : null}
        <div className="min-h-0 overflow-hidden">
          <Suspense fallback={<Skeleton className="h-full rounded-3xl" />}>
            <AnswerGrid
              answers={answers}
              systems={systems}
              onEdit={handleEdit}
              onAnswersChange={setAnswers}
              onRemoveAnswer={handleRemoveAnswer}
              dirtyMap={dirtyMap}
              isDark={isDark}
              isSubmitted={stats.status === 'completed'}
              selectedProcess={selectedProcess}
              onStatsRefresh={loadStats}
            />
          </Suspense>
        </div>
      </div>
      <AlertDialog open={confirmState.open} onOpenChange={(open) => setConfirmState((previous) => ({ ...previous, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState.type === 'complete' ? 'Завершить ввод данных?' : 'Перейти к другому процессу?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState.type === 'complete'
                ? 'После завершения ввода данных таблица будет заблокирована для редактирования.'
                : 'Есть несохраненные изменения. При переходе к другому процессу они будут потеряны.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmState.type === 'complete') {
                  confirmComplete();
                }
                if (confirmState.type === 'switch-process' && confirmState.target) {
                  setSelectedF3Index(confirmState.target);
                }
                setConfirmState({ open: false, type: null, target: null });
              }}
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
