import React, { useState } from 'react';
import { ArrowRight, Briefcase, Building2, Eye, FlaskConical, UserCog, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'ProcessMeter';

const DEMO_ROLES = [
  {
    role: 'admin',
    title: 'Администратор',
    description: 'Показать управление пользователями, справочниками, настройками и точкой входа в аналитику.',
    icon: UserCog,
  },
  {
    role: 'auditor',
    title: 'Аналитик',
    description: 'Сразу открыть отдельную аналитическую страницу с дашбордами, FTE и срезами по процессам.',
    icon: Eye,
  },
  {
    role: 'respondent',
    title: 'Респондент',
    description: 'Показать основной сценарий заполнения трудозатрат по операциям и завершения анкеты.',
    icon: Briefcase,
  },
];

export default function DemoEntryPage({ onDemoLogin, onOpenPasswordLogin, error }) {
  const [loadingRole, setLoadingRole] = useState('');

  const handleEnter = async (role) => {
    setLoadingRole(role);
    try {
      await onDemoLogin(role);
    } finally {
      setLoadingRole('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl space-y-6">
        <Card className="overflow-hidden border-border/80 shadow-lg">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.3fr_0.9fr] lg:p-10">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <FlaskConical className="h-4 w-4" />
                Демо-сценарии
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ProcessLabs / Product Review</div>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">{ORG_NAME}</h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  Для демонстрации продукта можно войти в приложение в один клик и посмотреть каждый сценарий глазами нужной роли. Боевая авторизация сохранена и доступна по ссылке ниже.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <MiniStat icon={Building2} label="Отдельная аналитика" value="5 дашбордов" />
                <MiniStat icon={UserRound} label="Сценарии" value="3 роли" />
                <MiniStat icon={ArrowRight} label="Вход" value="1 клик" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/55 p-6">
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Как показать продукт</div>
                <div className="text-2xl font-semibold tracking-tight">Выберите роль</div>
                <div className="text-sm text-muted-foreground">
                  Каждая карточка откроет соответствующий рабочий сценарий без ввода логина и пароля.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          {DEMO_ROLES.map((item) => (
            <Card
              key={item.role}
              className="group border-border/80 transition-all hover:border-primary/25 hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col gap-6 p-6">
                <div className="flex size-14 items-center justify-center rounded-xl bg-secondary text-primary">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-semibold tracking-tight">{item.title}</div>
                  <p className="min-h-[72px] text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleEnter(item.role)}
                  disabled={Boolean(loadingRole)}
                  className="mt-auto w-full justify-between"
                >
                  <span>{loadingRole === item.role ? 'Открываем...' : 'Открыть сценарий'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" onClick={onOpenPasswordLogin}>
            Войти по логину и паролю
          </Button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-background px-5 py-4">
      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
