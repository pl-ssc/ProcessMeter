import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Search } from 'lucide-react';
import { apiFetch } from '../api.js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/api/stats/dashboard');
        setData(response);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const filteredRespondents = useMemo(() => {
    if (!data?.respondents) return [];
    return data.respondents.filter(
      (respondent) =>
        respondent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        respondent.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '—';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d} дн.`);
    if (h > 0) parts.push(`${h} ч.`);
    if (m > 0 || parts.length === 0) parts.push(`${m} мин.`);
    return parts.join(' ');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="rounded-3xl border border-dashed p-10 text-center text-sm text-muted-foreground">Загрузка аналитики...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-sm text-destructive">Ошибка: {error}</div>;
  }

  const { progress, averageDuration, trends } = data;
  const progressPercent = Math.round(progress.progress_percent);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1.4fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Прогресс заполнения</CardTitle>
            <CardDescription>Доля завершённых анкет по всем респондентам.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-secondary">
              <div
                className="absolute inset-2 rounded-full"
                style={{ background: `conic-gradient(hsl(var(--primary)) ${progressPercent}%, hsl(var(--secondary)) 0)` }}
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-card text-2xl font-extrabold">{progressPercent}%</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">
                {progress.completed_count} / {progress.total_count}
              </div>
              <div className="text-sm text-muted-foreground">анкет завершено</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Среднее время</CardTitle>
            <CardDescription>От приглашения до завершения анкеты.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary">
              <Clock3 className="h-8 w-8" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{formatDuration(averageDuration.avg_duration_seconds)}</div>
              <div className="text-sm text-muted-foreground">среднее по завершённым опросам</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Динамика завершения</CardTitle>
            <CardDescription>Последние 30 дней по количеству завершённых анкет.</CardDescription>
          </CardHeader>
          <CardContent>{trends.length > 0 ? <TrendChart trends={trends} /> : <div className="text-sm text-muted-foreground">Нет данных для графика</div>}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Статистика респондентов</CardTitle>
            <CardDescription>Поиск по ФИО и подразделению.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Респондент</TableHead>
                <TableHead>Подразделение</TableHead>
                <TableHead>Приглашен</TableHead>
                <TableHead>Завершил</TableHead>
                <TableHead>Трудоемкость (ч)</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRespondents.map((respondent) => (
                <TableRow key={respondent.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-bold">
                        {respondent.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-semibold">{respondent.full_name || 'Без имени'}</div>
                        <div className="text-xs text-muted-foreground">{respondent.username || '—'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{respondent.department_name || '—'}</TableCell>
                  <TableCell>{formatDate(respondent.invite_date)}</TableCell>
                  <TableCell>{formatDate(respondent.completed_date)}</TableCell>
                  <TableCell className="font-semibold">{Number(respondent.total_labor_hours).toFixed(1)}</TableCell>
                  <TableCell>
                    <Badge variant={respondent.is_survey_completed ? 'success' : 'default'}>
                      {respondent.is_survey_completed ? 'Завершено' : 'В процессе'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRespondents.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">Респонденты не найдены</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function TrendChart({ trends }) {
  const height = 180;
  const width = 700;
  const padding = 24;
  const maxValue = Math.max(...trends.map((trend) => trend.completed_today), 5);
  const points = trends.map((trend, index) => {
    const x = padding + (index / (trends.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (trend.completed_today / maxValue) * (height - 2 * padding);
    return { x, y, label: trend.completion_date, value: trend.completed_today };
  });
  const pathData = points.length > 1 ? `M ${points.map((point) => `${point.x},${point.y}`).join(' L ')}` : '';
  const areaData = points.length > 1 ? `${pathData} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z` : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
      <defs>
        <linearGradient id="trend-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="hsl(var(--border))" strokeWidth="1" />
      {points.length > 1 ? <path d={areaData} fill="url(#trend-gradient)" /> : null}
      {points.length > 1 ? <path d={pathData} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" /> : null}
      {points.map((point) => (
        <g key={`${point.label}-${point.value}`}>
          <circle cx={point.x} cy={point.y} r="5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
          <title>
            {point.label}: {point.value}
          </title>
        </g>
      ))}
      {points.length > 0 ? (
        <>
          <text x={padding} y={height - 6} fill="hsl(var(--muted-foreground))" fontSize="12">
            {points[0].label}
          </text>
          <text x={width - padding} y={height - 6} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize="12">
            {points[points.length - 1].label}
          </text>
        </>
      ) : null}
    </svg>
  );
}
