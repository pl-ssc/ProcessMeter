import React from 'react';
import { CheckCircle2, Cloud, LogOut, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { Separator } from './ui/separator.jsx';

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'ProcessMeter';

const ROLE_LABELS = {
  admin: 'Администратор',
  auditor: 'Аналитик',
  respondent: 'Респондент',
};

export default function Header({ user, onLogout, autoSaveStatus, isDark, onToggleTheme, leftAction = null }) {
  const initials = (user.full_name || user.username || '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-4">
          {leftAction ? <div className="shrink-0">{leftAction}</div> : null}
          <div className="flex h-12 w-44 items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 px-2 dark:border-slate-800 dark:bg-slate-950/40">
            <img
              src={isDark ? '/logo-dark-true-transparent.png' : '/logo-light-true-transparent.png'}
              alt="ProcessLabs"
              className="h-16 w-auto"
            />
          </div>
          <Separator orientation="vertical" className="hidden h-10 md:block" />
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold">{ORG_NAME}</div>
            <div className="truncate text-sm text-muted-foreground">Анализ трудоемкости операций</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {autoSaveStatus === 'saving' ? (
            <Badge variant="warning" className="hidden rounded-full sm:inline-flex">
              <Cloud className="h-3.5 w-3.5 animate-pulse" />
              Сохранение...
            </Badge>
          ) : null}
          {autoSaveStatus === 'saved' ? (
            <Badge variant="success" className="hidden rounded-full sm:inline-flex">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Сохранено
            </Badge>
          ) : null}
          <Button variant="ghost" size="icon" className="rounded-2xl" onClick={onToggleTheme} title="Сменить тему">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden items-center gap-3 rounded-full border border-slate-200/80 bg-background/70 px-3 py-1.5 md:flex dark:border-slate-800">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{user.full_name || user.username}</div>
              <div className="truncate text-xs uppercase tracking-wide text-muted-foreground">{ROLE_LABELS[user.role] || user.role}</div>
            </div>
          </div>
          <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 bg-background/80 shadow-none dark:border-slate-800" onClick={onLogout} title="Выйти">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
