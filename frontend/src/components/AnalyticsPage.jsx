import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Building2, Clock3, Cpu, Filter, Gauge, RefreshCw, Search, Users } from 'lucide-react';
import { apiFetch } from '../api.js';
import Header from './Header.jsx';
import { Badge } from './ui/badge.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formatHours(value) {
  return `${Number(value || 0).toFixed(1)} ч`;
}

function formatFte(value) {
  return `${Number(value || 0).toFixed(2)} FTE`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function colorVar(index) {
  return `hsl(var(--chart-${(index % 5) + 1}))`;
}

export default function AnalyticsPage({ user, onLogout, isDark, onToggleTheme, onBackToAdmin, onSwitchRole }) {
  const [meta, setMeta] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department_id: 'all',
    profession_id: 'all',
    status: 'all',
  });
  const [selectedProcessIds, setSelectedProcessIds] = useState([]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (filters.department_id !== 'all') query.set('department_id', filters.department_id);
      if (filters.profession_id !== 'all') query.set('profession_id', filters.profession_id);
      if (filters.status !== 'all') query.set('status', filters.status);
      if (selectedProcessIds.length > 0) query.set('process_1_ids', selectedProcessIds.join(','));

      const [metaResponse, dashboardResponse] = await Promise.all([
        apiFetch('/api/analytics/meta'),
        apiFetch(`/api/analytics/dashboard${query.toString() ? `?${query.toString()}` : ''}`),
      ]);

      setMeta(metaResponse);
      setData(dashboardResponse);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось загрузить аналитику');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filters.department_id, filters.profession_id, filters.status, selectedProcessIds.join(',')]);

  useEffect(() => {
    const allowedIds = (meta?.allowed_process_1_ids || []).map((value) => Number(value)).filter((value) => Number.isFinite(value));
    if (allowedIds.length === 0) return;

    setSelectedProcessIds((current) => {
      const currentSet = new Set(current.map((value) => Number(value)));
      const next = allowedIds.filter((value) => currentSet.has(value));
      return next.length > 0 ? next : allowedIds;
    });
  }, [meta?.allowed_process_1_ids?.join(',')]);

  const filteredRespondents = useMemo(() => {
    if (!data?.respondents) return [];
    return data.respondents.filter((respondent) => {
      const haystack = [
        respondent.full_name,
        respondent.username,
        respondent.department_name,
        respondent.profession_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  return (
    <div className="flex h-full flex-col">
      <Header user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={onToggleTheme} onSwitchRole={onSwitchRole} />
      <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">ProcessLabs / Analytics</div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">Раздел аналитики</h1>
                {onBackToAdmin ? (
                  <Button variant="outline" onClick={onBackToAdmin}>
                    <ArrowLeft className="h-4 w-4" />
                    Вернуться в админ-панель
                  </Button>
                ) : null}
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Отдельная аналитическая страница для роли «Аналитик»: прогресс кампании, трудозатраты, FTE, узкие места процессов, использование ИТ-систем и орг-срезы.
              </p>
            </div>

            <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
              <ProcessScopeSelect
                processes={meta?.process_level_1 || []}
                selectedProcessIds={selectedProcessIds}
                onChange={setSelectedProcessIds}
              />
              <FilterSelect
                label="Подразделение"
                value={filters.department_id}
                onChange={(value) => setFilters((current) => ({ ...current, department_id: value }))}
                options={meta?.departments || []}
              />
              <FilterSelect
                label="Профессия"
                value={filters.profession_id}
                onChange={(value) => setFilters((current) => ({ ...current, profession_id: value }))}
                options={meta?.professions || []}
              />
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Статус анкеты</div>
                <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                  <SelectTrigger className="w-full min-w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="in_progress">В процессе</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={loadAnalytics} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Обновить
                </Button>
              </div>
            </div>
          </div>

          {error ? <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{error}</div> : null}
          {loading ? <AnalyticsSkeleton /> : null}

          {!loading && data ? (
            <Tabs defaultValue="overview" className="space-y-2">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                <TabsTrigger value="overview">Сводка</TabsTrigger>
                <TabsTrigger value="labor">Трудозатраты</TabsTrigger>
                <TabsTrigger value="processes">Процессы</TabsTrigger>
                <TabsTrigger value="systems">ИТ-системы</TabsTrigger>
                <TabsTrigger value="organization">Орг-аналитика</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <StatsGrid summary={data.summary} />
                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Динамика завершения анкет</CardTitle>
                      <CardDescription>Показывает, как быстро продвигается кампания по дням завершения.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart data={data.trends} dataKey="completed" labelKey="date" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Завершение по подразделениям</CardTitle>
                      <CardDescription>Помогает увидеть, где опрос уже закрыт, а где нужна догоняющая коммуникация.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarList items={data.department_progress.map((item) => ({ label: item.department, value: item.completion_rate, hint: `${item.completed} из ${item.total}` }))} suffix="%" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <CardTitle>Респонденты</CardTitle>
                      <CardDescription>Операционный контроль прогресса и качества заполнения.</CardDescription>
                    </div>
                    <div className="relative w-full max-w-sm">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Поиск по ФИО, email, подразделению..." className="pl-9" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Респондент</TableHead>
                          <TableHead>Подразделение</TableHead>
                          <TableHead>Профессия</TableHead>
                          <TableHead>% заполнения</TableHead>
                          <TableHead>Часы</TableHead>
                          <TableHead>Приглашён</TableHead>
                          <TableHead>Завершён</TableHead>
                          <TableHead>Статус</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRespondents.map((respondent) => (
                          <TableRow key={respondent.user_id}>
                            <TableCell>
                              <div className="font-semibold">{respondent.full_name || 'Без имени'}</div>
                              <div className="text-xs text-muted-foreground">{respondent.username}</div>
                            </TableCell>
                            <TableCell>{respondent.department_name || '—'}</TableCell>
                            <TableCell>{respondent.profession_name || '—'}</TableCell>
                            <TableCell>{respondent.completion_percentage}%</TableCell>
                            <TableCell>{formatHours(respondent.total_labor_hours)}</TableCell>
                            <TableCell>{formatDate(respondent.invitation_at)}</TableCell>
                            <TableCell>{formatDate(respondent.completion_at)}</TableCell>
                            <TableCell>
                              <Badge variant={respondent.is_survey_completed ? 'success' : 'warning'}>
                                {respondent.is_survey_completed ? 'Завершено' : 'В процессе'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="labor" className="space-y-6">
                <DashboardIntent
                  icon={Gauge}
                  title="Трудозатраты и FTE"
                  description="Здесь мы отвечаем на вопрос, где сосредоточена нагрузка и какие функции формируют наибольший объём труда."
                />
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Топ процессов L2 внутри L1</CardTitle>
                      <CardDescription>ТОП-5 процессов 2 уровня по трудозатратам внутри каждого процесса 1 уровня.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <GroupedProcessBarList groups={data.labor.process_level_2_top_by_level_1} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Распределение по типам исполнителей</CardTitle>
                      <CardDescription>Показывает, где нагрузка распределена между фронтом, мидлом и бэк-офисом.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DonutLegend items={data.labor.executor_distribution.map((item) => ({ label: item.name, value: item.labor_hours }))} />
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <MetricTable
                    title="Подразделения по FTE"
                    description="Сравнение нагрузки между орг-единицами."
                    rows={data.labor.department_hours}
                    valueKey="fte"
                    valueFormatter={(value) => formatFte(value)}
                  />
                  <MetricTable
                    title="Профессии по FTE"
                    description="Сравнение профилей нагрузки по ролям и должностям."
                    rows={data.labor.profession_hours}
                    valueKey="fte"
                    valueFormatter={(value) => formatFte(value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="processes" className="space-y-6">
                <DashboardIntent
                  icon={BarChart3}
                  title="Процессы и узкие места"
                  description="Эти виджеты нужны, чтобы быстро увидеть дорогие операции, разброс трудоёмкости и процессы с большим числом комментариев."
                />
                <div className="grid gap-6 xl:grid-cols-2">
                  <MetricTable
                    title="Операции с наибольшим средним временем"
                    description="Кандидаты на приоритизацию и детальную декомпозицию."
                    rows={data.processes.top_operations_by_avg}
                    labelKey="operation_name"
                    valueKey="avg_labor_hours"
                  />
                  <MetricTable
                    title="Операции с наибольшим числом комментариев"
                    description="Сигналы о проблемных местах, неоднозначностях и ручных обходах."
                    rows={data.processes.top_operations_by_notes}
                    labelKey="operation_name"
                    valueKey="notes_count"
                    valueFormatter={(value) => `${value} комм.`}
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Таблица операций</CardTitle>
                    <CardDescription>Объединяет трудозатраты, охват респондентов и проблемные сигналы на одном экране.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Операция</TableHead>
                          <TableHead>Процесс L1</TableHead>
                          <TableHead>Среднее</TableHead>
                          <TableHead>Мин</TableHead>
                          <TableHead>Макс</TableHead>
                          <TableHead>Респондентов</TableHead>
                          <TableHead>Комментариев</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.processes.operations_table.map((item) => (
                          <TableRow key={`${item.process_level_1}-${item.operation_name}`}>
                            <TableCell>
                              <div className="font-medium">{item.operation_name}</div>
                              <div className="text-xs text-muted-foreground">{item.process_level_2 || '—'} / {item.process_level_3 || '—'}</div>
                            </TableCell>
                            <TableCell>{item.process_level_1}</TableCell>
                            <TableCell>{formatHours(item.avg_labor_hours)}</TableCell>
                            <TableCell>{formatHours(item.min_labor_hours)}</TableCell>
                            <TableCell>{formatHours(item.max_labor_hours)}</TableCell>
                            <TableCell>{item.total_respondents}</TableCell>
                            <TableCell>{item.notes_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="systems" className="space-y-6">
                <DashboardIntent
                  icon={Cpu}
                  title="ИТ-системы и автоматизация"
                  description="Этот набор нужен, чтобы связать объём труда с системным ландшафтом и найти тяжёлые ручные операции."
                />
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Топ ИТ-систем по объёму работ</CardTitle>
                      <CardDescription>Понимаем, где сейчас сосредоточено выполнение операций.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DonutLegend items={data.systems.systems.map((item) => ({ label: item.system_name, value: item.labor_hours }))} />
                    </CardContent>
                  </Card>
                  <MetricTable
                    title="Процессы и системы"
                    description="Связка процесса и системы помогает искать области автоматизации."
                    rows={data.systems.process_system_matrix}
                    labelKey="process_level_1"
                    secondaryKey="system_name"
                    valueKey="labor_hours"
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Тяжёлые операции без системы</CardTitle>
                    <CardDescription>Прямой список кандидатов на цифровизацию или перепроектирование.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Операция</TableHead>
                          <TableHead>Процесс</TableHead>
                          <TableHead>Часы без системы</TableHead>
                          <TableHead>Среднее время</TableHead>
                          <TableHead>Комментарии</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.systems.manual_heavy_operations.map((item) => (
                          <TableRow key={`${item.process_level_1}-${item.operation_name}`}>
                            <TableCell>{item.operation_name}</TableCell>
                            <TableCell>{item.process_level_1}</TableCell>
                            <TableCell>{formatHours(item.labor_hours_without_system)}</TableCell>
                            <TableCell>{formatHours(item.avg_labor_hours)}</TableCell>
                            <TableCell>{item.notes_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organization" className="space-y-6">
                <DashboardIntent
                  icon={Building2}
                  title="Орг-аналитика"
                  description="Нужна для сравнения нагрузки между подразделениями и профессиями и для оценки полноты охвата выборки."
                />
                <div className="grid gap-6 xl:grid-cols-2">
                  <MetricTable
                    title="Подразделения"
                    description="Сравнение трудозатрат и FTE по организационным единицам."
                    rows={data.organization.department_hours}
                  />
                  <MetricTable
                    title="Профессии"
                    description="Сравнение функций и профилей нагрузки по должностям."
                    rows={data.organization.profession_hours}
                  />
                </div>
                <MetricTable
                  title="Подразделение -> процесс L2"
                  description="Показывает, какие функции доминируют внутри каждого подразделения."
                  rows={data.organization.department_process_mix}
                  labelKey="department_name"
                  secondaryKey="process_level_2"
                  valueKey="labor_hours"
                />
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-xl border bg-card" />
        ))}
      </div>
      <div className="h-96 rounded-xl border bg-card" />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full min-w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProcessScopeSelect({ processes, selectedProcessIds, onChange }) {
  const defaultSelected = processes.map((process) => Number(process.id)).filter((value) => Number.isFinite(value));
  const normalizedSelected = selectedProcessIds.length > 0
    ? selectedProcessIds.map((value) => Number(value)).filter((value) => Number.isFinite(value))
    : defaultSelected;
  const allSelected = processes.length > 0 && normalizedSelected.length === processes.length;
  const label = processes.length <= 1
    ? processes[0]?.name || 'Нет доступа'
    : allSelected
      ? 'Все доступные процессы'
      : `Выбрано: ${normalizedSelected.length} из ${processes.length}`;

  if (processes.length <= 1) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Процесс</div>
        <Badge variant="secondary" className="w-full justify-center rounded-lg px-3 py-2 text-sm">
          {processes[0]?.name || 'Нет доступных процессов'}
        </Badge>
      </div>
    );
  }

  const toggleProcess = (id) => {
    const next = normalizedSelected.includes(id)
      ? normalizedSelected.filter((value) => value !== id)
      : [...normalizedSelected, id];

    if (next.length === 0) return;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Процессы</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="truncate">{label}</span>
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72">
          <DropdownMenuLabel>Доступные процессы</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {processes.map((process) => (
            <DropdownMenuCheckboxItem
              key={process.id}
              checked={normalizedSelected.includes(Number(process.id))}
              onCheckedChange={() => toggleProcess(Number(process.id))}
            >
              {process.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function StatsGrid({ summary }) {
  const cards = [
    { title: 'Респонденты', value: `${summary.completed_respondents} / ${summary.total_respondents}`, description: `${summary.completion_rate}% завершения`, icon: Users },
    { title: 'Среднее время', value: `${summary.avg_completion_days} дн`, description: 'От приглашения до завершения', icon: Clock3 },
    { title: 'Трудозатраты', value: formatHours(summary.total_hours), description: formatFte(summary.total_fte), icon: Gauge },
    { title: 'Среднее заполнение', value: `${summary.avg_completion_percentage}%`, description: `${summary.avg_hours_per_respondent} ч на респондента`, icon: BarChart3 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="flex items-start justify-between p-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">{card.title}</div>
              <div className="text-3xl font-semibold tracking-tight">{card.value}</div>
              <div className="text-sm text-muted-foreground">{card.description}</div>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <card.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DashboardIntent({ icon: Icon, title, description }) {
  return (
    <Card className="border-dashed border-border/80 bg-secondary/35 shadow-none">
      <CardContent className="flex items-start gap-4 p-6">
        <div className="rounded-xl bg-card p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChart({ data, dataKey, labelKey }) {
  if (!data?.length) {
    return <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Нет данных для графика.</div>;
  }

  const width = 720;
  const height = 240;
  const padding = 28;
  const maxValue = Math.max(...data.map((item) => Number(item[dataKey] || 0)), 1);
  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (Number(item[dataKey] || 0) / maxValue) * (height - padding * 2);
    return { x, y, label: item[labelKey], value: item[dataKey] };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full">
      <defs>
        <linearGradient id="analytics-line-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="hsl(var(--border))" />
      <path d={`${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#analytics-line-gradient)" />
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
      {points.map((point) => (
        <g key={`${point.label}-${point.value}`}>
          <circle cx={point.x} cy={point.y} r="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
          <title>{`${point.label}: ${point.value}`}</title>
        </g>
      ))}
      <text x={padding} y={height - 6} fill="hsl(var(--muted-foreground))" fontSize="12">{points[0].label}</text>
      <text x={width - padding} y={height - 6} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize="12">{points[points.length - 1].label}</text>
    </svg>
  );
}

function BarList({ items, suffix = '' }) {
  if (!items?.length) {
    return <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Нет данных для сравнения.</div>;
  }

  const max = Math.max(...items.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="min-w-0">
              <div className="truncate font-medium">{item.label}</div>
              {item.hint ? <div className="truncate text-xs text-muted-foreground">{item.hint}</div> : null}
            </div>
            <div className="shrink-0 font-semibold">{Number(item.value).toFixed(suffix === '%' ? 0 : 1)}{suffix}</div>
          </div>
          <div className="h-3 rounded-full bg-secondary">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${Math.max((Number(item.value || 0) / max) * 100, 6)}%`,
                background: colorVar(index),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutLegend({ items }) {
  if (!items?.length) {
    return <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Нет данных для распределения.</div>;
  }

  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
  let offset = 0;
  const segments = items.map((item, index) => {
    const value = Number(item.value || 0);
    const ratio = value / total;
    const currentOffset = offset;
    offset += ratio * 100;
    return {
      ...item,
      ratio,
      offset: currentOffset,
      color: colorVar(index),
    };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
      <svg viewBox="0 0 42 42" className="mx-auto h-52 w-52 -rotate-90">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="hsl(var(--secondary))" strokeWidth="6" />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke={segment.color}
            strokeWidth="6"
            strokeDasharray={`${segment.ratio * 100} ${100 - segment.ratio * 100}`}
            strokeDashoffset={-segment.offset}
          />
        ))}
      </svg>
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: segment.color }} />
              <span className="truncate font-medium">{segment.label}</span>
            </div>
            <div className="shrink-0 text-sm font-semibold">{Math.round(segment.ratio * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupedProcessBarList({ groups }) {
  if (!groups?.length) {
    return <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Нет данных для отображения.</div>;
  }

  const max = Math.max(...groups.flatMap((group) => group.top_processes_level_2.map((item) => Number(item.labor_hours || 0))), 1);

  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <div key={group.process_level_1} className="space-y-3 rounded-2xl border px-4 py-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">{group.process_level_1}</div>
              <div className="text-sm text-muted-foreground">{formatFte(group.fte)} • {formatHours(group.labor_hours)}</div>
            </div>
            <Badge variant="secondary">Топ-5 L2</Badge>
          </div>
          <div className="space-y-3">
            {group.top_processes_level_2.map((item, index) => (
              <div key={`${group.process_level_1}-${item.name}`} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{formatFte(item.fte)}</div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold">{formatHours(item.labor_hours)}</div>
                </div>
                <div className="h-2.5 rounded-full bg-secondary">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.max((Number(item.labor_hours || 0) / max) * 100, 8)}%`,
                      background: colorVar(groupIndex + index),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricTable({ title, description, rows, labelKey = 'name', secondaryKey, valueKey = 'labor_hours', valueFormatter }) {
  const formatValue = valueFormatter || ((value) => formatHours(value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Показатель</TableHead>
              {secondaryKey ? <TableHead>Детализация</TableHead> : null}
              <TableHead className="text-right">Значение</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows?.map((row, index) => (
              <TableRow key={`${row[labelKey]}-${secondaryKey ? row[secondaryKey] : index}`}>
                <TableCell className="font-medium">{row[labelKey]}</TableCell>
                {secondaryKey ? <TableCell>{row[secondaryKey]}</TableCell> : null}
                <TableCell className="text-right">{formatValue(row[valueKey])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
