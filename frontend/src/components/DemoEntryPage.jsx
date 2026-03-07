import React, { useState } from 'react';
import { ArrowRight, Briefcase, Building2, Eye, Sparkles, UserCog, UserRound } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'ProcessMeter';

const DEMO_ROLES = [
  {
    role: 'admin',
    title: 'Администратор',
    description: 'Показать управление пользователями, справочниками, настройками и точкой входа в аналитику.',
    icon: UserCog,
    accent: 'from-sky-500/20 to-cyan-500/10',
  },
  {
    role: 'auditor',
    title: 'Аналитик',
    description: 'Сразу открыть отдельную аналитическую страницу с дашбордами, FTE и срезами по процессам.',
    icon: Eye,
    accent: 'from-emerald-500/20 to-lime-500/10',
  },
  {
    role: 'respondent',
    title: 'Респондент',
    description: 'Показать основной сценарий заполнения трудозатрат по операциям и завершения анкеты.',
    icon: Briefcase,
    accent: 'from-amber-500/20 to-orange-500/10',
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
        <Card className="overflow-hidden border-white/50 bg-card/95 shadow-2xl backdrop-blur">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.2fr_1fr] lg:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Demo mode
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight">{ORG_NAME}</h1>
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

            <div className="rounded-[2rem] border bg-secondary/35 p-6">
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Как показать продукт</div>
                <div className="text-2xl font-extrabold tracking-tight">Выберите роль</div>
                <div className="text-sm text-muted-foreground">
                  Каждая карточка откроет соответствующий рабочий сценарий без ввода логина и пароля.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          {DEMO_ROLES.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => handleEnter(item.role)}
              disabled={Boolean(loadingRole)}
              className="group rounded-[2rem] border bg-card/95 p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl disabled:cursor-wait disabled:opacity-70"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-foreground`}>
                <item.icon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold tracking-tight">{item.title}</div>
                <p className="min-h-[72px] text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {loadingRole === item.role ? 'Открываем...' : 'Открыть сценарий'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
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
    <div className="rounded-3xl border bg-background/70 px-5 py-4">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}
