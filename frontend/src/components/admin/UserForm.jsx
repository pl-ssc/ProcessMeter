import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { apiFetch } from '../../api.js';
import { Alert, AlertDescription } from '../ui/alert.jsx';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { ScrollArea } from '../ui/scroll-area.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Separator } from '../ui/separator.jsx';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet.tsx';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор', description: 'Полный доступ к управлению системой.' },
  { value: 'auditor', label: 'Аналитик', description: 'Видит данные только по назначенным процессам.' },
  { value: 'respondent', label: 'Респондент', description: 'Заполняет анкеты и оценивает процессы.' },
];

function normalizeRoleSelection(roles, fallbackRole = 'respondent') {
  const source = Array.isArray(roles) ? roles : [roles];
  const normalized = [];

  for (const role of source) {
    if (typeof role !== 'string') continue;
    const value = role.trim().toLowerCase();
    if (!ROLE_OPTIONS.some((option) => option.value === value)) continue;
    if (!normalized.includes(value)) {
      normalized.push(value);
    }
  }

  if (normalized.includes('admin')) {
    return ['admin'];
  }

  if (normalized.length === 0 && ROLE_OPTIONS.some((option) => option.value === fallbackRole)) {
    return [fallbackRole];
  }

  return normalized;
}

function resolveActiveRole(roles, preferredRole) {
  if (preferredRole && roles.includes(preferredRole)) {
    return preferredRole;
  }

  if (roles.includes('respondent')) {
    return 'respondent';
  }

  return roles[0] || 'respondent';
}

function getInitialRoles(user, defaultRole) {
  return normalizeRoleSelection(user?.roles ?? user?.role ?? defaultRole, defaultRole);
}

export default function UserForm({ user, defaultRole = 'respondent', onClose, onSuccess }) {
  const isEdit = !!user;
  const initialRoles = getInitialRoles(user, defaultRole);
  const initialActiveRole = resolveActiveRole(initialRoles, user?.active_role || user?.role);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    role: initialRoles[0] || defaultRole || 'respondent',
    roles: initialRoles,
    active_role: initialActiveRole,
    department_id: user?.department_id ? String(user.department_id) : '',
    profession_id: user?.profession_id ? String(user.profession_id) : '',
    process_1_access: [],
  });
  const [process1List, setProcess1List] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [professionsList, setProfessionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formLoadError, setFormLoadError] = useState('');
  const [isFormDataLoading, setIsFormDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsFormDataLoading(true);
      setFormLoadError('');
      try {
        const [processesResult, departmentsResult, professionsResult] = await Promise.allSettled([
          apiFetch('/api/admin/process-1'),
          apiFetch('/api/admin/departments'),
          apiFetch('/api/admin/professions'),
        ]);

        setProcess1List(processesResult.status === 'fulfilled' ? (processesResult.value.process_1 || []) : []);
        setDepartmentsList(departmentsResult.status === 'fulfilled' ? (departmentsResult.value.departments || []) : []);
        setProfessionsList(professionsResult.status === 'fulfilled' ? (professionsResult.value.professions || []) : []);

        const failedSections = [];
        if (processesResult.status === 'rejected') failedSections.push('процессы 1 уровня');
        if (departmentsResult.status === 'rejected') failedSections.push('подразделения');
        if (professionsResult.status === 'rejected') failedSections.push('профессии');

        if (failedSections.length > 0) {
          setFormLoadError(`Не удалось загрузить данные формы: ${failedSections.join(', ')}.`);
        }

        if (isEdit) {
          const accessRes = await apiFetch(`/api/admin/users/${user.id}/access`);
          setFormData((previous) => ({ ...previous, process_1_access: accessRes.process_1_access || [] }));
        }
      } catch (requestError) {
        console.error('Failed to load form data:', requestError);
        setFormLoadError('Не удалось загрузить данные формы.');
      } finally {
        setIsFormDataLoading(false);
      }
    };

    loadData();
  }, [isEdit, user]);

  const isAdmin = formData.roles.includes('admin');

  const toggleRole = (value) => {
    setFormData((previous) => {
      const currentRoles = normalizeRoleSelection(previous.roles, previous.role);

      let nextRoles;
      if (value === 'admin') {
        nextRoles = ['admin'];
      } else {
        const withoutAdmin = currentRoles.filter((role) => role !== 'admin');
        if (currentRoles.includes('admin')) {
          nextRoles = [value];
        } else if (withoutAdmin.includes(value)) {
          nextRoles = withoutAdmin.filter((role) => role !== value);
          if (nextRoles.length === 0) {
            nextRoles = [value];
          }
        } else {
          nextRoles = [...withoutAdmin, value];
        }
      }

      const nextActiveRole = resolveActiveRole(nextRoles, previous.active_role);

      return {
        ...previous,
        role: nextRoles[0] || defaultRole || 'respondent',
        roles: nextRoles,
        active_role: nextActiveRole,
        ...(nextRoles.includes('admin')
          ? { department_id: '', profession_id: '', process_1_access: [] }
          : {}),
      };
    });
  };

  const toggleAccess = (id) => {
    if (isAdmin) return;

    setFormData((previous) => {
      const current = previous.process_1_access;
      return current.includes(id)
        ? { ...previous, process_1_access: current.filter((value) => value !== id) }
        : { ...previous, process_1_access: [...current, id] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const safeRoles = normalizeRoleSelection(formData.roles, formData.role);
    const safeActiveRole = resolveActiveRole(safeRoles, formData.active_role);
    const isAdminUser = safeRoles.includes('admin');

    if (!isAdminUser && formData.process_1_access.length === 0) {
      setError('Выберите хотя бы один процесс 1 уровня.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const profilePayload = {
        full_name: formData.full_name || null,
        role: safeRoles[0] || 'respondent',
        roles: safeRoles,
        active_role: safeActiveRole,
        department_id: isAdminUser ? null : (formData.department_id ? Number(formData.department_id) : null),
        profession_id: isAdminUser ? null : (formData.profession_id ? Number(formData.profession_id) : null),
      };

      if (isEdit) {
        await apiFetch(`/api/admin/users/${user.id}/profile`, {
          method: 'PUT',
          body: JSON.stringify(profilePayload),
        });

        await apiFetch(`/api/admin/users/${user.id}/access`, {
          method: 'POST',
          body: JSON.stringify({ process_1_access: isAdminUser ? [] : formData.process_1_access }),
        });
      } else {
        const tempPassword = `${Math.random().toString(36).slice(-8)}X9!`;
        const response = await apiFetch('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            ...profilePayload,
            username: formData.username,
            password: tempPassword,
            process_1_access: isAdminUser ? [] : formData.process_1_access,
          }),
        });
        onSuccess(response);
        return;
      }

      onSuccess();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRolesText = formData.roles
    .map((role) => ROLE_OPTIONS.find((option) => option.value === role)?.label || role)
    .join(', ');

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-4xl p-0" side="right">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle>{isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}</SheetTitle>
            <SheetDescription>Профиль, роли и доступ к процессам 1 уровня.</SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <form id="user-form" className="flex flex-col gap-6 px-6 py-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя (Email)</Label>
                  <Input
                    id="username"
                    type="email"
                    required
                    disabled={isEdit}
                    value={formData.username}
                    onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Полное имя</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(event) => setFormData({ ...formData, full_name: event.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 xl:col-span-1">
                  <Label>Роли</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {ROLE_OPTIONS.map((option) => {
                      const selected = formData.roles.includes(option.value);
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={selected ? 'default' : 'outline'}
                          className="h-auto justify-between rounded-2xl px-4 py-3 text-left whitespace-normal"
                          onClick={() => toggleRole(option.value)}
                        >
                          <span className="flex flex-col items-start gap-0.5">
                            <span>{option.label}</span>
                            <span className="text-xs font-normal opacity-80">{option.description}</span>
                          </span>
                          {selected ? <Check data-icon="inline-end" /> : null}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.roles.map((role) => {
                      const label = ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
                      return <Badge key={role} variant="secondary">{label}</Badge>;
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Администратор не может совмещаться с другими ролями. Респондент и аналитик могут быть назначены вместе.
                  </div>
                </div>

                {!isAdmin ? (
                  <>
                    <div className="space-y-2">
                      <Label>Подразделение</Label>
                      <Select value={formData.department_id || '__empty'} onValueChange={(value) => setFormData({ ...formData, department_id: value === '__empty' ? '' : value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Не выбрано" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty">Не выбрано</SelectItem>
                          {departmentsList
                            .filter((department) => department.is_active || department.id === user?.department_id)
                            .map((department) => (
                              <SelectItem key={department.id} value={String(department.id)}>
                                {department.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Профессия</Label>
                      <Select value={formData.profession_id || '__empty'} onValueChange={(value) => setFormData({ ...formData, profession_id: value === '__empty' ? '' : value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Не выбрано" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty">Не выбрано</SelectItem>
                          {professionsList
                            .filter((profession) => profession.is_active || profession.id === user?.profession_id)
                            .map((profession) => (
                              <SelectItem key={profession.id} value={String(profession.id)}>
                                {profession.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : null}
              </div>

              <Separator />

              {!isAdmin ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-base font-semibold">Доступ к процессам 1 уровня</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.roles.includes('respondent')
                        ? 'Для респондента выберите разделы, которые он будет оценивать.'
                        : 'Для аналитика выберите процессы, к которым он может смотреть данные.'}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {process1List.map((process) => {
                      const selected = formData.process_1_access.includes(process.id);
                      return (
                        <Button
                          key={process.id}
                          type="button"
                          variant={selected ? 'default' : 'outline'}
                          onClick={() => toggleAccess(process.id)}
                          className="h-auto items-start justify-start gap-3 rounded-2xl px-4 py-4 text-left whitespace-normal"
                        >
                          <div className={`mt-0.5 flex size-5 items-center justify-center rounded-md border ${selected ? 'border-primary-foreground bg-primary-foreground/15 text-primary-foreground' : 'border-input'}`}>
                            {selected ? <Check data-icon="inline-start" /> : null}
                          </div>
                          <span className="flex flex-col items-start gap-1">
                            <span className="font-medium">{process.f1_name}</span>
                            <span className="text-xs font-normal opacity-80">{process.f1_code || 'Процесс 1 уровня'}</span>
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Выбрано процессов: {formData.process_1_access.length}. {selectedRolesText ? `Активные роли: ${selectedRolesText}.` : null}
                  </div>
                  {isFormDataLoading ? (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                      Загружаем список процессов 1 уровня...
                    </div>
                  ) : null}
                  {!isFormDataLoading && process1List.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                      Нет доступных процессов 1 уровня. Проверьте справочник процессов или загрузку данных.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  Для администратора поля подразделения, профессии и доступов к процессам не требуются.
                </div>
              )}

              {formLoadError ? (
                <Alert variant="destructive">
                  <AlertDescription>{formLoadError}</AlertDescription>
                </Alert>
              ) : null}

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          </ScrollArea>

          <SheetFooter className="border-t px-6 py-4 sm:justify-end">
            <div className="flex w-full items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button
                type="submit"
                form="user-form"
                disabled={loading || isFormDataLoading || (!isAdmin && process1List.length === 0)}
              >
                {loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
