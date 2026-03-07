import React, { Suspense, lazy, useMemo, useState } from 'react';
import { ArrowUpRight, BookOpen, ChevronLeft, Database, LayoutDashboard, LogOut, Menu, Settings, Users } from 'lucide-react';
import Header from './Header.jsx';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { ScrollArea } from './ui/scroll-area.jsx';
import { Separator } from './ui/separator.jsx';
import { Skeleton } from './ui/skeleton.jsx';

const DataImport = lazy(() => import('./admin/DataImport.jsx'));
const Dictionaries = lazy(() => import('./admin/Dictionaries.jsx'));
const NocodbUsers = lazy(() => import('./admin/NocodbUsers.jsx'));
const SmtpSettings = lazy(() => import('./admin/SmtpSettings.jsx'));
const UserManagement = lazy(() => import('./admin/UserManagement.jsx'));

export default function AdminView({ user, onLogout, isDark, onToggleTheme, onOpenAnalytics }) {
  const [activeTab, setActiveTab] = useState('users');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = useMemo(
    () => [
      { id: 'users', label: 'Пользователи', icon: Users },
      { id: 'dictionaries', label: 'Справочники', icon: BookOpen },
      { id: 'dashboards', label: 'Аналитика', icon: LayoutDashboard },
      { id: 'settings', label: 'Настройки', icon: Settings },
      { type: 'divider' },
      { id: 'import', label: 'Импорт данных', icon: Database },
      { id: 'nocodb', label: 'Эталонная база', icon: Database },
    ],
    []
  );

  const titles = {
    users: 'Управление пользователями',
    dictionaries: 'Справочники',
    dashboards: 'Аналитика и дашборды',
    settings: 'Настройки приложения',
    import: 'Импорт и синхронизация',
    nocodb: 'Эталонная база (NocoDB)',
  };

  return (
    <div className="flex h-full flex-col">
      <Header user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={onToggleTheme} />
      <div className="grid min-h-0 flex-1 grid-cols-[auto_1fr]">
        <aside className={`border-r bg-card/80 transition-all ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-4">
              {isSidebarOpen ? (
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Console</div>
                  <div className="text-lg font-bold">Управление</div>
                </div>
              ) : (
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">UI</div>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen((value) => !value)}>
                {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
            <Separator />
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-2">
                {menuItems.map((item, index) => {
                  if (item.type === 'divider') {
                    return <Separator key={`divider-${index}`} className="my-4" />;
                  }

                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 rounded-xl px-3 ${isSidebarOpen ? '' : 'px-0 justify-center'}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {isSidebarOpen ? <span>{item.label}</span> : null}
                    </Button>
                  );
                })}
              </nav>
            </ScrollArea>
            <div className="p-3">
              <Button variant="outline" className={`w-full gap-3 rounded-xl ${isSidebarOpen ? 'justify-start' : 'justify-center px-0'}`} onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                {isSidebarOpen ? <span>Выйти</span> : null}
              </Button>
            </div>
          </div>
        </aside>
        <main className="min-h-0 overflow-auto p-6">
          <div className="mb-6 space-y-1">
            <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Админ-панель</div>
            <h1 className="text-3xl font-extrabold tracking-tight">{titles[activeTab]}</h1>
          </div>

          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-16 rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div>}>
            {activeTab === 'users' ? <UserManagement /> : null}
            {activeTab === 'dictionaries' ? <Dictionaries /> : null}
            {activeTab === 'dashboards' ? <AnalyticsLinkCard onOpenAnalytics={onOpenAnalytics} /> : null}
            {activeTab === 'import' ? <DataImport /> : null}
            {activeTab === 'settings' ? <SmtpSettings /> : null}
            {activeTab === 'nocodb' ? <NocodbUsers /> : null}
          </Suspense>
        </main>
      </div>
    </div>
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
          <ArrowUpRight className="h-4 w-4" />
          Открыть аналитику
        </Button>
      </CardContent>
    </Card>
  );
}
