import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Save, Wifi } from 'lucide-react';
import { apiFetch } from '../../api.js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const DEFAULT_STATE = {
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_password: '',
  smtp_from: '',
  smtp_from_name: '',
  smtp_secure: 'false',
};

export default function SmtpSettings() {
  const [form, setForm] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    apiFetch('/api/admin/settings')
      .then((data) => setForm((previous) => ({ ...previous, ...data.settings })))
      .catch((error) => setAlert({ type: 'error', msg: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setAlert({ type: 'success', msg: 'Настройки сохранены.' });
    } catch (error) {
      setAlert({ type: 'error', msg: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setAlert(null);
    try {
      await apiFetch('/api/admin/settings/test-smtp', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setAlert({ type: 'success', msg: 'Соединение с SMTP-сервером успешно установлено.' });
    } catch (error) {
      setAlert({ type: 'error', msg: `Ошибка соединения: ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-3 rounded-3xl border p-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Загрузка настроек...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            SMTP - настройки почты
          </CardTitle>
          <CardDescription>Используются для приглашений, сброса пароля и уведомлений.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SMTP-сервер</Label>
              <Input value={form.smtp_host} onChange={(event) => set('smtp_host', event.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label>Порт</Label>
              <Input type="number" value={form.smtp_port} onChange={(event) => set('smtp_port', event.target.value)} placeholder="587" />
            </div>
            <div className="space-y-2">
              <Label>Логин (Email)</Label>
              <Input value={form.smtp_user} onChange={(event) => set('smtp_user', event.target.value)} placeholder="mail@company.ru" />
            </div>
            <div className="space-y-2">
              <Label>Пароль / App Password</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={form.smtp_password}
                  onChange={(event) => set('smtp_password', event.target.value)}
                  placeholder="••••••••"
                  className="pr-11"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => setShowPass((value) => !value)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Адрес отправителя</Label>
              <Input type="email" value={form.smtp_from} onChange={(event) => set('smtp_from', event.target.value)} placeholder="noreply@company.ru" />
            </div>
            <div className="space-y-2">
              <Label>Имя отправителя</Label>
              <Input value={form.smtp_from_name} onChange={(event) => set('smtp_from_name', event.target.value)} placeholder="ProcessMeter" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <div className="font-medium">SSL/TLS</div>
              <div className="text-sm text-muted-foreground">Используйте для порта 465 и защищённых SMTP-серверов.</div>
            </div>
            <Switch checked={form.smtp_secure === 'true'} onCheckedChange={(checked) => set('smtp_secure', checked ? 'true' : 'false')} />
          </div>

          {alert ? (
            <Alert variant={alert.type === 'success' ? 'success' : 'destructive'}>
              <AlertTitle>{alert.type === 'success' ? 'Готово' : 'Ошибка'}</AlertTitle>
              <AlertDescription>{alert.msg}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleTest} disabled={testing || saving || !form.smtp_host}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
              {testing ? 'Проверка...' : 'Проверить соединение'}
            </Button>
            <Button onClick={handleSave} disabled={saving || testing}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Подсказки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Gmail:</strong> `smtp.gmail.com`, порт `587`, используйте пароль приложения.</p>
          <p><strong className="text-foreground">Yandex:</strong> `smtp.yandex.ru`, порт `465`, включите SSL/TLS.</p>
          <p><strong className="text-foreground">Mail.ru:</strong> `smtp.mail.ru`, порт `465`, включите SSL/TLS.</p>
          <p>Пароль хранится в базе приложения и не возвращается пользователю в открытом виде.</p>
        </CardContent>
      </Card>
    </div>
  );
}
