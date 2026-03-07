import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { apiFetch } from '../../api.js';
import { Alert, AlertDescription } from '../ui/alert.jsx';
import { Button } from '../ui/button.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';

export default function UserForm({ user, onClose, onSuccess }) {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    role: user?.role || 'respondent',
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

        if (processesResult.status === 'fulfilled') {
          setProcess1List(processesResult.value.process_1 || []);
        } else {
          setProcess1List([]);
        }

        if (departmentsResult.status === 'fulfilled') {
          setDepartmentsList(departmentsResult.value.departments || []);
        } else {
          setDepartmentsList([]);
        }

        if (professionsResult.status === 'fulfilled') {
          setProfessionsList(professionsResult.value.professions || []);
        } else {
          setProfessionsList([]);
        }

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.role === 'respondent' && formData.process_1_access.length === 0) {
      setError('Выберите хотя бы один процесс 1 уровня.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/users/${user.id}/profile`, {
          method: 'PUT',
          body: JSON.stringify({
            full_name: formData.full_name || null,
            department_id: formData.department_id ? Number(formData.department_id) : null,
            profession_id: formData.profession_id ? Number(formData.profession_id) : null,
          }),
        });

        await apiFetch(`/api/admin/users/${user.id}/access`, {
          method: 'POST',
          body: JSON.stringify({ process_1_access: formData.process_1_access }),
        });
      } else {
        const tempPassword = `${Math.random().toString(36).slice(-8)}X9!`;
        const response = await apiFetch('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            password: tempPassword,
            department_id: formData.department_id ? Number(formData.department_id) : null,
            profession_id: formData.profession_id ? Number(formData.profession_id) : null,
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

  const toggleAccess = (id) => {
    setFormData((previous) => {
      const current = previous.process_1_access;
      return current.includes(id)
        ? { ...previous, process_1_access: current.filter((value) => value !== id) }
        : { ...previous, process_1_access: [...current, id] };
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}</DialogTitle>
          <DialogDescription>Профиль, роль и доступ к процессам 1 уровня.</DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
              <Input id="full_name" value={formData.full_name} onChange={(event) => setFormData({ ...formData, full_name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="respondent">Респондент</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="auditor">Аналитик</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>

            <div className="space-y-3">
            <div>
              <div className="text-base font-semibold">Доступ к процессам 1 уровня</div>
              <div className="text-sm text-muted-foreground">
                {formData.role === 'respondent'
                  ? 'Для респондента выберите разделы, которые он будет оценивать.'
                  : 'Для администратора и аналитика это поле необязательно.'}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {process1List.map((process) => {
                const selected = formData.process_1_access.includes(process.id);
                return (
                  <button
                    key={process.id}
                    type="button"
                    onClick={() => toggleAccess(process.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      selected ? 'border-primary bg-primary/5' : 'hover:bg-secondary'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>
                      {selected ? <Check className="h-3 w-3" /> : null}
                    </div>
                    <span className="font-medium">{process.f1_name}</span>
                  </button>
                );
              })}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || isFormDataLoading || (formData.role === 'respondent' && process1List.length === 0)}>
              {loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
