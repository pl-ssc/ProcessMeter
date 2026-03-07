import React, { useEffect, useRef, useState } from 'react';
import { FileText, PlusSquare } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb.jsx';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog.jsx';
import { Input } from './ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.jsx';
import { Textarea } from './ui/textarea.jsx';

const EMPTY_SYSTEM_VALUE = '__none__';

export default function AnswerGrid({ answers, systems, onEdit, dirtyMap, isDark, isSubmitted, selectedProcess }) {
  const [editingNote, setEditingNote] = useState(null);
  const [notice, setNotice] = useState('');
  const [activeCell, setActiveCell] = useState(null);
  const [isBreadcrumbCollapsed, setIsBreadcrumbCollapsed] = useState(false);
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
    const item = answers[editingNote.rowIndex];
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

  if (!answers || answers.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground">Загрузка данных...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden rounded-[28px] border-border/80 bg-card/95 shadow-none backdrop-blur-sm">
        <CardHeader className="sticky top-0 z-20 gap-2 border-b bg-card/95 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-[18px] leading-none">Операции и трудозатраты</CardTitle>
            </div>
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
                  <TableHead className="sticky left-0 top-0 z-40 h-[58px] border-r border-b bg-slate-50 px-4 align-middle text-sm dark:bg-slate-900/70">
                    {renderHeader('Операция', headerTooltips.f4_name)}
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 h-[58px] border-r border-b bg-slate-50 px-4 align-middle text-sm dark:bg-slate-900/70">
                    {renderHeader('Трудозатраты', headerTooltips.labor_hours)}
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 h-[58px] border-r border-b bg-slate-50 px-4 align-middle text-sm dark:bg-slate-900/70">
                    {renderHeader('ИТ-система', headerTooltips.system_id)}
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 h-[58px] border-b bg-slate-50 px-0 align-middle text-sm dark:bg-slate-900/70">
                    <div className="flex h-full items-center justify-center" title={headerTooltips.note}>
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {answers.map((item, index) => {
                  const isDirty = dirtyMap.has(item.operation_id);
                  const hasData =
                    (item.labor_hours !== null && item.labor_hours !== undefined) ||
                    (item.system_id !== null && item.system_id !== undefined) ||
                    (item.note && item.note.trim() !== '');
                  const rowTint = isDirty
                    ? isDark
                      ? 'bg-emerald-950/40'
                      : 'bg-emerald-50'
                    : hasData
                      ? isDark
                        ? 'bg-sky-950/30'
                        : 'bg-sky-50/70'
                      : '';
                  const hasNote = !!(item.note && item.note.trim() !== '');

                  return (
                    <TableRow key={item.operation_id} className={`pm-soft-rise ${rowTint} hover:bg-transparent`}>
                      <TableCell className={`sticky left-0 z-10 border-r px-4 py-3 align-middle text-[15px] font-medium leading-6 ${rowTint || 'bg-card'}`}>
                        <div className="max-w-3xl">{item.f4_name || 'Без названия'}</div>
                      </TableCell>
                      <TableCell className="border-r px-3 py-2.5 align-middle">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          inputMode="decimal"
                          value={item.labor_hours ?? ''}
                          onChange={(event) => handleLaborHoursChange(item, event.target.value)}
                          onFocus={() => setActiveCell({ row: item.operation_id, column: 'labor_hours' })}
                          onBlur={() => setActiveCell((current) => (current?.row === item.operation_id && current?.column === 'labor_hours' ? null : current))}
                          disabled={isSubmitted}
                          placeholder="0"
                          className={
                            activeCell?.row === item.operation_id && activeCell?.column === 'labor_hours'
                              ? 'pm-focus-ring h-10 w-full rounded-xl border-2 border-emerald-400 bg-emerald-50/60 text-sm shadow-none transition-all dark:bg-emerald-950/20'
                              : 'h-10 w-full rounded-xl border-slate-200 bg-background text-sm shadow-none transition-all'
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
                            onFocus={() => setActiveCell({ row: item.operation_id, column: 'system_id' })}
                            onBlur={() => setActiveCell((current) => (current?.row === item.operation_id && current?.column === 'system_id' ? null : current))}
                            className={
                              activeCell?.row === item.operation_id && activeCell?.column === 'system_id'
                                ? 'pm-focus-ring h-10 rounded-xl border-2 border-emerald-400 bg-emerald-50/60 text-sm shadow-none transition-all dark:bg-emerald-950/20'
                                : 'h-10 rounded-xl border-slate-200 bg-background text-sm shadow-none transition-all'
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
                            onClick={() => !isSubmitted && setEditingNote({ rowIndex: index, text: item.note || '' })}
                            disabled={isSubmitted}
                            className={
                              hasNote
                                ? 'h-10 w-10 rounded-xl border-slate-200 bg-sky-50 text-primary shadow-none hover:bg-sky-100 dark:bg-sky-950/30'
                                : 'h-10 w-10 rounded-xl border-dashed border-slate-300 bg-transparent text-muted-foreground shadow-none hover:bg-slate-50 dark:hover:bg-slate-900'
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
    </>
  );
}
