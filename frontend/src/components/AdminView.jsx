import React, { Suspense, lazy, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Database,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import Header from './Header.jsx';
import { Badge } from './ui/badge.jsx';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card.jsx';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import UserManagement from './admin/UserManagement.jsx';

const DataImport = lazy(() => import('./admin/DataImport.jsx'));
const Dictionaries = lazy(() => import('./admin/Dictionaries.jsx'));
const NocodbUsers = lazy(() => import('./admin/NocodbUsers.jsx'));
const SmtpSettings = lazy(() => import('./admin/SmtpSettings.jsx'));

const USER_ROLE_ITEMS = [
  { id: 'respondent', label: 'Респонденты', shortLabel: 'Респонденты' },
  { id: 'auditor', label: 'Аналитики', shortLabel: 'Аналитики' },
  { id: 'admin', label: 'Администраторы', shortLabel: 'Администраторы' },
];

const MAIN_NAV_ITEMS = [
  { id: 'dictionaries', label: 'Справочники', icon: BookOpen },
  { id: 'dashboards', label: 'Аналитика', icon: LayoutDashboard },
  { id: 'settings', label: 'Настройки', icon: Settings },
  { id: 'import', label: 'Импорт данных', icon: Database },
  { id: 'nocodb', label: 'Эталонная база', icon: Database },
];

const PAGE_TITLES = {
  users: 'Пользователи',
  dictionaries: 'Справочники',
  dashboards: 'Аналитика и дашборды',
  settings: 'Настройки приложения',
  import: 'Импорт и синхронизация',
  nocodb: 'Эталонная база (NocoDB)',
};

const PAGE_DESCRIPTIONS = {
  users: 'Навигация по ролям и управление учетными записями.',
  dictionaries: 'Справочники подразделений и профессий.',
  dashboards: 'Отдельный раздел аналитики для роли аналитика.',
  settings: 'Параметры SMTP и системные настройки.',
  import: 'Загрузка и синхронизация данных.',
  nocodb: 'Подключение и управление эталонной базой.',
};

export default function AdminView({ user, onLogout, isDark, onToggleTheme, onOpenAnalytics }) {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUserRole, setSelectedUserRole] = useState('respondent');

  const activeRoleLabel = USER_ROLE_ITEMS.find((item) => item.id === selectedUserRole)?.label || 'Респонденты';

  return (
    <TooltipProvider delayDuration={120}>
      <SidebarProvider defaultOpen>
        <Sidebar
          collapsible="none"
          className="sticky top-20 self-start h-[calc(100svh-5rem)] border-r border-sidebar-border/70 bg-sidebar"
        >
          <SidebarHeader className="!px-4 !pt-4 !pb-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/25 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.22em] text-sidebar-foreground/60">Console</div>
                <div className="truncate text-sm font-semibold text-sidebar-foreground">Управление</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarSeparator className="!mx-4" />
          <SidebarContent className="!gap-1 !pb-4">
            <SidebarGroup className="!px-4 !py-3">
              <SidebarGroupLabel>Пользователи</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={activeTab === 'users'}
                      tooltip="Пользователи"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className="flex w-full items-center gap-2"
                      >
                        <Users />
                        <span>Все пользователи</span>
                      </button>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {USER_ROLE_ITEMS.map((item) => (
                        <SidebarMenuSubItem key={item.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={activeTab === 'users' && selectedUserRole === item.id}
                            className="pl-2"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('users');
                                setSelectedUserRole(item.id);
                              }}
                              className="flex w-full items-center gap-2"
                            >
                              <span>{item.shortLabel}</span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="!mx-4" />

            <SidebarGroup className="!px-4 !py-3">
              <SidebarGroupLabel>Разделы</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {MAIN_NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveTab(item.id)}
                            className="flex w-full items-center gap-2"
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex min-h-svh min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            user={user}
            onLogout={onLogout}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
          />

          <div className="flex-1 overflow-auto p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Админ-панель</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    {PAGE_TITLES[activeTab] || 'Админ-панель'}
                  </h1>
                  {activeTab === 'users' ? (
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide">
                      {activeRoleLabel}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {PAGE_DESCRIPTIONS[activeTab] || 'Управление приложением.'}
                </p>
              </div>
            </div>

            <Suspense fallback={<div className="space-y-4"><Skeleton className="h-16 rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div>}>
              {activeTab === 'users' ? <UserManagement role={selectedUserRole} /> : null}
              {activeTab === 'dictionaries' ? <Dictionaries /> : null}
              {activeTab === 'dashboards' ? <AnalyticsLinkCard onOpenAnalytics={onOpenAnalytics} /> : null}
              {activeTab === 'import' ? <DataImport /> : null}
              {activeTab === 'settings' ? <SmtpSettings /> : null}
              {activeTab === 'nocodb' ? <NocodbUsers /> : null}
            </Suspense>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AnalyticsLinkCard({ onOpenAnalytics }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Отдельный раздел аналитики</CardTitle>
        <CardDescription>
          Аналитика вынесена на самостоятельную страницу и доступна роли &quot;Аналитик&quot;. Из админ-панели можно открыть её в один клик.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm text-muted-foreground">
          На странице аналитики собраны сводка проекта, трудозатраты и FTE, узкие места процессов, использование ИТ-систем и орг-аналитика по подразделениям и профессиям.
        </div>
        <Button className="shrink-0" onClick={onOpenAnalytics}>
          <ArrowUpRight />
          <span>Открыть аналитику</span>
        </Button>
      </CardContent>
    </Card>
  );
}
