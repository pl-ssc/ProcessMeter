import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { apiFetch } from '../api.js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SetPasswordPage({ token, onDone }) {
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/auth/token-info?token=${encodeURIComponent(token)}`)
      .then(setInfo)
      .catch(() => setInfo({ valid: false, error: 'Ошибка проверки ссылки.' }));
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('Пароли не совпадают.');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      await apiFetch('/api/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setStatus('success');
    } catch (requestError) {
      setError(requestError.message);
      setStatus('idle');
    }
  };

  const typeLabel = info?.type === 'invite' ? 'Установка пароля' : 'Сброс пароля';

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-lg border-border/80 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {status === 'loading' ? <Loader2 className="h-7 w-7 animate-spin" /> : <KeyRound className="h-7 w-7" />}
          </div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ProcessLabs / Password Flow</div>
          <CardTitle className="text-3xl font-semibold">{typeLabel}</CardTitle>
          <CardDescription>
            {info?.full_name ? `Здравствуйте, ${info.full_name}!` : 'Подготовим доступ к системе.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!info ? (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Проверяем ссылку...
            </div>
          ) : null}

          {info && !info.valid ? (
            <>
              <Alert variant="destructive">
                <AlertTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Ссылка недействительна
                </AlertTitle>
                <AlertDescription>{info.error || 'Срок действия ссылки истёк или она уже была использована.'}</AlertDescription>
              </Alert>
              <Button onClick={onDone} className="w-full">
                Перейти ко входу
              </Button>
            </>
          ) : null}

          {status === 'success' ? (
            <>
              <Alert variant="success">
                <AlertTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Пароль установлен
                </AlertTitle>
                <AlertDescription>Теперь можно войти в систему с новым паролем.</AlertDescription>
              </Alert>
              <Button onClick={onDone} className="w-full">
                Войти
              </Button>
            </>
          ) : null}

          {info?.valid && status !== 'success' ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Не менее 6 символов"
                    className="pr-11"
                    required
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setShowPass((value) => !value)}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Подтверждение пароля</Label>
                <Input
                  id="confirm"
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Повторите пароль"
                  required
                />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {status === 'loading' ? 'Сохранение...' : 'Сохранить пароль'}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
