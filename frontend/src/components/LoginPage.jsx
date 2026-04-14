import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'ProcessMeter';

export default function LoginPage({ onLogin, onForgotPassword, error, forgotPasswordState, forgotPasswordError, onBackToDemo }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onLogin(form.get('username'), form.get('password'));
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onForgotPassword(form.get('username'));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="gap-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isForgotMode ? <Mail className="h-7 w-7" /> : <KeyRound className="h-7 w-7" />}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ProcessLabs / Secure Access</div>
            <CardTitle className="text-3xl font-semibold tracking-tight">{ORG_NAME}</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              {isForgotMode ? 'Отправим ссылку для безопасного сброса пароля.' : 'Вход для заполнения трудоемкости операций'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isForgotMode ? (
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <div className="space-y-2">
                <Label htmlFor="forgot-username">Email</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="forgot-username" name="username" type="email" required className="pl-9" placeholder="name@company.ru" />
                </div>
              </div>
              {forgotPasswordState === 'success' ? (
                <Alert variant="success">
                  <AlertDescription className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Если такой аккаунт существует, мы отправили ссылку для сброса пароля на указанный email.</span>
                  </AlertDescription>
                </Alert>
              ) : null}
              {forgotPasswordError ? (
                <Alert variant="destructive">
                  <AlertDescription>{forgotPasswordError}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full" disabled={forgotPasswordState === 'loading'}>
                {forgotPasswordState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {forgotPasswordState === 'loading' ? 'Отправляем ссылку...' : 'Отправить ссылку'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setIsForgotMode(false)}>
                <ArrowLeft className="h-4 w-4" />
                Вернуться ко входу
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="username" name="username" required className="pl-9" placeholder="name@company.ru" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pr-11"
                    placeholder="Введите пароль"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full">
                Войти
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setIsForgotMode(true)}>
                Забыли пароль?
              </Button>
              {onBackToDemo ? (
                <Button type="button" variant="ghost" className="w-full" onClick={onBackToDemo}>
                  <ArrowLeft className="h-4 w-4" />
                  Вернуться к выбору роли
                </Button>
              ) : null}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
