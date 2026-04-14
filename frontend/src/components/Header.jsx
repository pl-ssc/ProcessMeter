import React from 'react';
import { CheckCircle2, ChevronDown, Cloud, LogOut, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { Badge } from './ui/badge.jsx';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const ROLE_LABELS = {
  admin: 'Администратор',
  auditor: 'Аналитик',
  respondent: 'Респондент',
};

export default function Header({ user, onLogout, autoSaveStatus, isDark, onToggleTheme, onSwitchRole, leftAction = null }) {
  const roles = Array.isArray(user.roles) ? user.roles : [user.role].filter(Boolean);
  const activeRole = user.active_role || user.role;
  const initials = (user.full_name || user.username || '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = ROLE_LABELS[activeRole] || activeRole;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="flex h-[72px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-4">
          {leftAction ? <div className="shrink-0">{leftAction}</div> : null}
          <div className="flex h-11 w-40 items-center overflow-hidden rounded-lg border border-border bg-card px-2">
            <img
              src={isDark ? '/logo-dark-true-transparent.png' : '/logo-light-true-transparent.png'}
              alt="ProcessLabs"
              className="h-14 w-auto"
            />
          </div>
          <Separator orientation="vertical" className="hidden h-10 md:block" />
          <div className="min-w-0">
            <div className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ProcessLabs / ProcessMeter</div>
            <div className="truncate text-sm text-muted-foreground">Анализ трудоемкости операций</div>
          </div>
          {roles.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 h-9 rounded-full border-border bg-card px-3">
                  <span className="max-w-[180px] truncate">Режим: {roleLabel}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Активный режим</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={activeRole} onValueChange={onSwitchRole || (() => {})}>
                  {roles.map((role) => (
                    <DropdownMenuRadioItem key={role} value={role}>
                      {ROLE_LABELS[role] || role}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge variant="secondary" className="ml-2 hidden md:inline-flex">
              {roleLabel}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {autoSaveStatus === 'saving' ? (
            <Badge variant="warning" className="hidden sm:inline-flex">
              <Cloud className="h-3.5 w-3.5 animate-pulse" />
              Сохранение...
            </Badge>
          ) : null}
          {autoSaveStatus === 'saved' ? (
            <Badge variant="success" className="hidden sm:inline-flex">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Сохранено
            </Badge>
          ) : null}
          <Button variant="ghost" size="icon" className="rounded-lg" onClick={onToggleTheme} title="Сменить тему">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden items-center gap-3 rounded-lg border border-border bg-card px-3 py-1.5 md:flex">
            <Avatar className="size-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{user.full_name || user.username}</div>
              <div className="truncate text-xs uppercase tracking-wide text-muted-foreground">{roleLabel}</div>
            </div>
          </div>
          <Button variant="outline" size="icon" className="rounded-lg" onClick={onLogout} title="Выйти">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
