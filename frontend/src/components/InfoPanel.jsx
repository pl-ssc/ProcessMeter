import React, { useState } from 'react';
import { Activity, BriefcaseBusiness, Clock3, Info, Send } from 'lucide-react';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog.jsx';

export default function InfoPanel({ stats, onSubmit, hasChanges }) {
  const { total_hours = 0, fte = 0, status = 'not_started' } = stats;
  const [showHelp, setShowHelp] = useState(false);
  const statusMap = {
    completed: { label: 'Завершено', variant: 'success' },
    in_progress: { label: 'В работе', variant: 'default' },
    not_started: { label: 'Не начата', variant: 'secondary' },
  };
  const statusUi = statusMap[status] || statusMap.not_started;

  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-[hsl(var(--background)/0.88)] px-6 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-card/90 px-3 py-2 shadow-none dark:border-slate-800">
              <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                <Clock3 className="h-3.5 w-3.5" />
              </div>
              <div className="text-sm text-muted-foreground">Трудозатраты:</div>
              <div className="text-base font-semibold">{total_hours} ч.</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-card/90 px-3 py-2 shadow-none dark:border-slate-800">
              <div className="rounded-full bg-accent/10 p-1.5 text-accent">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
              </div>
              <div className="text-sm text-muted-foreground">FTE:</div>
              <div className="text-base font-semibold">{fte}</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-card/90 px-3 py-2 shadow-none dark:border-slate-800">
              <div className="rounded-full bg-secondary p-1.5 text-foreground">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="text-sm text-muted-foreground">Статус:</div>
              <Badge variant={statusUi.variant} className="px-2 py-0 text-[11px]">
                {statusUi.label}
              </Badge>
            </div>
            <Badge variant={hasChanges ? 'warning' : 'secondary'} className="px-3 py-1 text-[11px]">
              {hasChanges ? 'Есть несохраненные' : 'Все синхронизировано'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 rounded-full border-slate-200 bg-card/90 px-4 text-sm shadow-none" onClick={() => setShowHelp(true)}>
              <Info className="h-4 w-4" />
              Инструкция
            </Button>
            {status !== 'completed' ? (
              <Button className="h-10 rounded-full px-4 text-sm" onClick={onSubmit} disabled={Number(total_hours) === 0}>
                <Send className="h-4 w-4" />
                Завершить ввод данных
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Как заполнить опросник</DialogTitle>
            <DialogDescription>Короткая памятка перед финальной отправкой.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>1. В каждой строке укажите примерные трудозатраты по операции в месяц в человеко-часах.</p>
            <p>2. Выберите ИТ-систему из списка, если она используется. Поле можно оставить пустым.</p>
            <p>3. В примечании зафиксируйте допущения, редкие случаи или важные детали.</p>
            <p>4. Когда всё заполнено, нажмите «Завершить ввод данных».</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHelp(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
