import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, Play, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../api.js';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Label } from '../ui/label.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DataImport() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [connString, setConnString] = useState('postgresql://postgres:postgres@127.0.0.1:5433/refdb');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    setStatus('loading');
    setMessage('Запуск миграции данных из эталонной базы...');

    try {
      await apiFetch('/api/admin/import', {
        method: 'POST',
        body: JSON.stringify({ connectionString: connString }),
      });
      setStatus('success');
      setMessage('Миграция успешно завершена. Данные обновлены.');
    } catch (error) {
      setStatus('error');
      setMessage(`Ошибка миграции: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Database className="h-5 w-5" />
            </div>
            Импорт из эталонной базы
          </CardTitle>
          <CardDescription>Синхронизация справочников и процессов 1-4 уровней.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert variant="warning">
            <AlertTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Важное предупреждение
            </AlertTitle>
            <AlertDescription>Импорт полностью перезаписывает таблицы процессов. Все несохранённые анкеты респондентов будут удалены и созданы заново на основе новой структуры.</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Строка подключения</Label>
            <Input value={connString} onChange={(event) => setConnString(event.target.value)} disabled={loading} />
          </div>

          <Button onClick={() => setConfirmOpen(true)} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? 'Синхронизация...' : 'Запустить импорт данных'}
          </Button>

          {status !== 'idle' ? (
            <Alert variant={status === 'success' ? 'success' : status === 'error' ? 'destructive' : 'default'}>
              <AlertTitle className="flex items-center gap-2">
                {status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : null}
                {status === 'error' ? <AlertTriangle className="h-4 w-4" /> : null}
                Статус
              </AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Зачем это нужно</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Обновление списка процессов и операций.</p>
          <p>Добавление новых систем и исполнителей.</p>
          <p>Сброс ответов к исходному состоянию после изменения эталона.</p>
        </CardContent>
      </Card>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Запустить импорт?</AlertDialogTitle>
            <AlertDialogDescription>Будут очищены текущие справочники и ответы пользователей. Права доступа пользователей сохранятся.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                handleImport();
              }}
            >
              Запустить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
