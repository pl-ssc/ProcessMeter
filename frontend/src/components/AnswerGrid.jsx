import React, { useEffect, useRef, useState } from 'react';
import { FileText, PlusSquare, Trash2 } from 'lucide-react';
import { apiFetch } from '../api.js';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb.jsx';
import { Textarea } from './ui/textarea.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const EMPTY_SYSTEM_VALUE = '__none__';

export default function AnswerGrid({ answers, systems, onEdit, onAnswersChange, onRemoveAnswer, dirtyMap, isDark, isSubmitted, selectedProcess, onStatsRefresh }) {
  const [editingNote, setEditingNote] = useState(null);
  const [notice, setNotice] = useState('');
  const [activeCell, setActiveCell] = useState(null);
  const [isBreadcrumbCollapsed, setIsBreadcrumbCollapsed] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isDeletingCustomId, setIsDeletingCustomId] = useState(null);
  const [customForm, setCustomForm] = useState({ name: '', labor_hours: '', system_id: EMPTY_SYSTEM_VALUE, note: '' });
  const breadcrumbContainerRef = useRef(null);
  const breadcrumbMeasureRef = useRef(null);

  const headerTooltips = {
    f4_name: 'Название операции, которую вы выполняете.',
    labor_hours: 'Примерные трудозатраты по операции в месяц в человеко-часах.',
    system_id: 'ИТ-система, которая используется для выполнения операции.',
    note: 'Примечание к операции.',
  };

  useEffect(() => {
    if (!selectedProcess) {
      setIsBreadcrumbCollapsed(false);
      return;
    }

    const updateBreadcrumbState = () => {
      const container = breadcrumbContainerRef.current;
      const measure = breadcrumbMeasureRef.current;
      if (!container || !measure) return;
      setIsBreadcrumbCollapsed(measure.scrollWidth > container.clientWidth);
    };

    updateBreadcrumbState();

    const observer = new ResizeObserver(() => updateBreadcrumbState());
    if (breadcrumbContainerRef.current) observer.observe(breadcrumbContainerRef.current);
    if (breadcrumbMeasureRef.current) observer.observe(breadcrumbMeasureRef.current);
    window.addEventListener('resize', updateBreadcrumbState);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateBreadcrumbState);
    };
  }, [selectedProcess]);

  const onSaveNote = () => {
    if (!editingNote) return;
    const item = answers.find((answer) => answer.row_id === editingNote.rowId);
    if (item) {
      onEdit({ ...item, note: editingNote.text });
    }
    setEditingNote(null);
  };

  const handleLaborHoursChange = (item, rawValue) => {
    if (isSubmitted) return;
    setNotice('');

    const trimmed = rawValue.trim();
    if (!trimmed) {
      onEdit({ ...item, labor_hours: null });
      return;
    }

    const normalized = trimmed.replace(',', '.');
    const value = Number(normalized);
    if (Number.isNaN(value) || value < 0) {
      setNotice('Трудозатраты должны быть числом от 0.');
      return;
    }

    onEdit({ ...item, labor_hours: value });
  };

  const handleSystemChange = (item, value) => {
    if (isSubmitted) return;
    setNotice('');
    onEdit({ ...item, system_id: value === EMPTY_SYSTEM_VALUE ? null : Number(value) });
  };

  const renderHeader = (label, tooltip) => (
    <div className="flex h-full items-center justify-center text-center text-[15px] font-semibold text-muted-foreground" title={tooltip}>
      {label}
    </div>
  );

  const resetCustomForm = () => {
    setCustomForm({ name: '', labor_hours: '', system_id: EMPTY_SYSTEM_VALUE, note: '' });
  };

  const handleCreateCustomOperation = async () => {
    if (!selectedProcess) return;

    const trimmedName = customForm.name.trim();
    if (!trimmedName) {
      setNotice('Укажите название пользовательской операции.');
      return;
    }

    try {
      const response = await apiFetch('/api/answers/custom', {
        method: 'POST',
        body: JSON.stringify({
          process_3_id: selectedProcess.process_3_id,
          name: trimmedName,
          labor_hours: customForm.labor_hours === '' ? null : Number(customForm.labor_hours),
          system_id: customForm.system_id === EMPTY_SYSTEM_VALUE ? null : Number(customForm.system_id),
          note: customForm.note.trim() || null,
        }),
      });

      const created = response.operation;
      const newRow = {
        answer_kind: 'custom',
        row_id: `custom:${created.id}`,
        id: created.id,
        operation_id: null,
        custom_operation_id: created.id,
        labor_hours: created.labor_hours === null ? null : Number(created.labor_hours),
        system_id: created.system_id,
        note: created.note,
        p4_id: null,
        f4_name: created.name,
        process_3_id: Number(selectedProcess.process_3_id),
        p3_id: Number(selectedProcess.process_3_id),
        f3_name: selectedProcess.f3_name,
        p2_id: Number(selectedProcess.process_2_id),
        f2_name: selectedProcess.f2_name,
        p1_id: Number(selectedProcess.process_1_id),
        f1_name: selectedProcess.f1_name,
        executor_id: null,
        executor_name: null,
        is_custom: true,
      };

      onAnswersChange((previous) => [...previous, newRow]);
      onStatsRefresh();
      resetCustomForm();
      setIsAddingCustom(false);
      setNotice('');
    } catch (error) {
      setNotice(`Не удалось добавить операцию: ${error.message}`);
    }
  };

  const handleDeleteCustomOperation = async (item) => {
    if (!item?.custom_operation_id) return;

    try {
      setIsDeletingCustomId(item.custom_operation_id);
      await apiFetch(`/api/answers/custom/${item.custom_operation_id}`, { method: 'DELETE' });
      onRemoveAnswer(item);
      onStatsRefresh();
      setNotice('');
    } catch (error) {
      setNotice(`Не удалось удалить операцию: ${error.message}`);
    } finally {
      setIsDeletingCustomId(null);
    }
  };

  const renderFullBreadcrumb = (className = '') => (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex-nowrap whitespace-nowrap text-xs">
        <BreadcrumbItem className="shrink-0">{selectedProcess.f1_name}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="shrink-0">{selectedProcess.f2_name}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbPage className="text-xs">{selectedProcess.f3_name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  const renderCollapsedBreadcrumb = () => (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap overflow-hidden whitespace-nowrap text-xs">
        <BreadcrumbItem className="shrink-0">{selectedProcess.f1_name}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="shrink-0 max-w-[40%] truncate md:max-w-[32%]">{selectedProcess.f2_name}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis className="h-5 w-5 shrink-0" />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="min-w-0 flex-1">
          <BreadcrumbPage className="block truncate text-xs">{selectedProcess.f3_name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden rounded-xl border-border/80 shadow-sm">
        <CardHeader className="sticky top-0 z-20 gap-2 border-b border-border/80 bg-card px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-[18px] leading-none">Операции и трудозатраты</CardTitle>
            </div>
            {!isSubmitted ? (
              <Button type="button" variant="outline" onClick={() => setIsAddingCustom(true)}>
                <PlusSquare className="h-4 w-4" />
                Добавить свою операцию
              </Button>
            ) : null}
          </div>
          {selectedProcess ? (
            <div ref={breadcrumbContainerRef} className="relative min-w-0">
              {isBreadcrumbCollapsed ? renderCollapsedBreadcrumb() : renderFullBreadcrumb('min-w-0 overflow-hidden')}
              <div ref={breadcrumbMeasureRef} className="invisible absolute left-0 top-0 -z-10 whitespace-nowrap opacity-0 pointer-events-none">
                {renderFullBreadcrumb()}
              </div>
            </div>
          ) : null}
          {notice ? (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between gap-3">
                <span>{notice}</span>
                <Button variant="ghost" size="sm" onClick={() => setNotice('')}>
                  Закрыть
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          <div className="h-full overflow-hidden">
            <Table containerClassName="h-full overflow-auto" className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[52%]" />
                <col className="w-[15%]" />
                <col className="w-[27%]" />
                <col className="w-[6%]" />
              </colgroup>
              <TableHeader className="z-30 bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky left-0 top-0 z-40 h-[58px] border-r border-b bg-secondary px-4 align-middle text-sm">
                    {renderHeader('Операция', headerTooltips.f4_name)}
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 h-[58px] border-r border-b bg-secondary px-4 align-middle text-sm">
                    {renderHeader('Трудозатраты', headerTooltips.labor_hours)}
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 h-[58px] border-r border-b bg-secondary px-4 align-middle text-sm">
                    {renderHeader('ИТ-система', headerTooltips.system_id)}
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 h-[58px] border-b bg-secondary px-0 align-middle text-sm">
                    <div className="flex h-full items-center justify-center" title={headerTooltips.note}>
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {answers.map((item) => {
                  const dirtyKey = item.row_id ?? item.operation_id;
                  const isDirty = dirtyMap.has(dirtyKey) || dirtyMap.has(item.operation_id);
                  const hasData =
                    (item.labor_hours !== null && item.labor_hours !== undefined) ||
                    (item.system_id !== null && item.system_id !== undefined) ||
                    (item.note && item.note.trim() !== '');
                  const rowTint = isDirty
                    ? isDark
                      ? 'bg-primary/10'
                      : 'bg-primary/5'
                    : hasData
                      ? isDark
                        ? 'bg-secondary'
                        : 'bg-secondary/60'
                      : '';
                  const hasNote = !!(item.note && item.note.trim() !== '');

                  return (
                    <TableRow key={item.row_id || item.operation_id} className={`pm-soft-rise ${rowTint} hover:bg-transparent`}>
                      <TableCell className={`sticky left-0 z-10 border-r px-4 py-3 align-middle text-[15px] font-medium leading-6 ${rowTint || 'bg-card'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="max-w-3xl">
                            <div>{item.f4_name || 'Без названия'}</div>
                            {item.is_custom ? (
                              <Badge variant="secondary" className="mt-2">
                                Пользовательская
                              </Badge>
                            ) : null}
                          </div>
                          {item.is_custom && !isSubmitted ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground"
                              onClick={() => handleDeleteCustomOperation(item)}
                              disabled={isDeletingCustomId === item.custom_operation_id}
                              title="Удалить пользовательскую операцию"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="border-r px-3 py-2.5 align-middle">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          inputMode="decimal"
                          value={item.labor_hours ?? ''}
                          onChange={(event) => handleLaborHoursChange(item, event.target.value)}
                          onFocus={() => setActiveCell({ row: item.row_id || item.operation_id, column: 'labor_hours' })}
                          onBlur={() =>
                            setActiveCell((current) =>
                              current?.row === (item.row_id || item.operation_id) && current?.column === 'labor_hours' ? null : current
                            )
                          }
                          disabled={isSubmitted}
                          placeholder="0"
                          className={
                            activeCell?.row === (item.row_id || item.operation_id) && activeCell?.column === 'labor_hours'
                              ? 'pm-focus-ring h-10 w-full rounded-lg border-primary/40 bg-primary/5 text-sm shadow-none transition-all'
                              : 'h-10 w-full rounded-lg bg-background text-sm shadow-none transition-all'
                          }
                        />
                      </TableCell>
                      <TableCell className="border-r px-3 py-2.5 align-middle">
                        <Select
                          value={item.system_id === null || item.system_id === undefined ? EMPTY_SYSTEM_VALUE : String(item.system_id)}
                          onValueChange={(value) => handleSystemChange(item, value)}
                          disabled={isSubmitted}
                        >
                          <SelectTrigger
                            onFocus={() => setActiveCell({ row: item.row_id || item.operation_id, column: 'system_id' })}
                            onBlur={() =>
                              setActiveCell((current) =>
                                current?.row === (item.row_id || item.operation_id) && current?.column === 'system_id' ? null : current
                              )
                            }
                            className={
                              activeCell?.row === (item.row_id || item.operation_id) && activeCell?.column === 'system_id'
                                ? 'pm-focus-ring h-10 rounded-lg border-primary/40 bg-primary/5 text-sm shadow-none transition-all'
                                : 'h-10 rounded-lg bg-background text-sm shadow-none transition-all'
                            }
                          >
                            <SelectValue placeholder="Выберите систему" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={EMPTY_SYSTEM_VALUE}>Не выбрано</SelectItem>
                            {(systems || []).map((system) => (
                              <SelectItem key={system.system_id} value={String(system.system_id)}>
                                {system.system_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-0 py-2.5 align-middle">
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => !isSubmitted && setEditingNote({ rowId: item.row_id, text: item.note || '' })}
                            disabled={isSubmitted}
                            className={
                              hasNote
                                ? 'size-10 rounded-lg border-border bg-primary/5 text-primary shadow-none hover:bg-primary/10'
                                : 'size-10 rounded-lg border-dashed border-border bg-transparent text-muted-foreground shadow-none hover:bg-secondary'
                            }
                            title={hasNote ? 'Редактировать примечание' : 'Добавить примечание'}
                          >
                            {hasNote ? <FileText className="h-4 w-4 text-primary" /> : <PlusSquare className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {answers.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center p-10 text-center text-sm text-muted-foreground">
                Для этого процесса пока нет операций. Добавьте пользовательскую операцию, если она у вас есть.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Примечание к операции</DialogTitle>
          </DialogHeader>
          <Textarea
            autoFocus
            value={editingNote?.text || ''}
            onChange={(event) => setEditingNote((previous) => ({ ...previous, text: event.target.value }))}
            placeholder="Введите примечание..."
            className="min-h-[160px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Отмена
            </Button>
            <Button onClick={onSaveNote}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddingCustom}
        onOpenChange={(open) => {
          setIsAddingCustom(open);
          if (!open) resetCustomForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить свою операцию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Название операции</div>
              <Input
                value={customForm.name}
                onChange={(event) => setCustomForm((previous) => ({ ...previous, name: event.target.value }))}
                placeholder="Например, сверка нестандартных начислений"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Трудозатраты</div>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={customForm.labor_hours}
                  onChange={(event) => setCustomForm((previous) => ({ ...previous, labor_hours: event.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">ИТ-система</div>
                <Select
                  value={customForm.system_id}
                  onValueChange={(value) => setCustomForm((previous) => ({ ...previous, system_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите систему" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SYSTEM_VALUE}>Не выбрано</SelectItem>
                    {(systems || []).map((system) => (
                      <SelectItem key={system.system_id} value={String(system.system_id)}>
                        {system.system_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Комментарий</div>
              <Textarea
                value={customForm.note}
                onChange={(event) => setCustomForm((previous) => ({ ...previous, note: event.target.value }))}
                placeholder="Опишите, в каких случаях возникает эта операция и чем она отличается от типовых."
                className="min-h-[140px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCustom(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateCustomOperation}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
