import React, { useEffect, useRef, useState } from 'react';
import { Edit, Ellipsis, Info, KeyRound, Loader2, Mail, Search, Trash2, Unlock, Upload, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiFetch } from '../../api.js';
import { Alert, AlertDescription } from '../ui/alert.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog.jsx';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Input } from '../ui/input.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip.jsx';
import { Textarea } from '../ui/textarea.jsx';
import UserForm from './UserForm.jsx';

const TOAST_DURATION_MS = 4000;
const ROLE_LABELS = {
  admin: 'Администраторы',
  auditor: 'Аналитики',
  respondent: 'Респонденты',
};
const ROLE_ORDER = {
  admin: 0,
  auditor: 1,
  respondent: 2,
};

export default function UserManagement({ role = 'respondent' }) {
  const selectedRole = role === 'admin' || role === 'auditor' || role === 'respondent' ? role : 'respondent';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToUnlock, setUserToUnlock] = useState(null);
  const [unlockReason, setUnlockReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, [searchTerm, selectedRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/users?include_admins=true&role=${selectedRole}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      const response = await apiFetch(url);
      const orderedUsers = (response.users || []).slice().sort((left, right) => {
        const leftOrder = ROLE_ORDER[left.role] ?? 99;
        const rightOrder = ROLE_ORDER[right.role] ?? 99;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return String(left.full_name || left.username || '').localeCompare(String(right.full_name || right.username || ''), 'ru');
      });
      setUsers(orderedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUnlockDialog = (user) => {
    setUserToUnlock(user);
    setUnlockReason('');
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const handleFormSuccess = (result) => {
    const wasEdit = !!editingUser;
    setShowForm(false);
    setEditingUser(null);
    loadUsers();

    if (!wasEdit && result?.invite_sent === false) {
      showToast('error', result.invite_error || 'Пользователь создан, но приглашение не отправлено.');
      return;
    }

    if (!wasEdit && result?.invite_sent === true) {
      showToast('success', 'Пользователь создан, приглашение отправлено!');
      return;
    }

    showToast('success', wasEdit ? 'Пользователь обновлен.' : 'Пользователь сохранен.');
  };

  const toggleUserStatus = async (user) => {
    try {
      await apiFetch(`/api/admin/users/${user.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      loadUsers();
    } catch (error) {
      showToast('error', `Ошибка: ${error.message}`);
    }
  };

  const sendEmail = async (userId, action) => {
    const key = `${userId}_${action}`;
    setActionLoading((previous) => ({ ...previous, [key]: true }));
    try {
      await apiFetch(`/api/admin/users/${userId}/${action}`, { method: 'POST' });
      showToast('success', action === 'send-invite' ? 'Приглашение отправлено!' : 'Ссылка для сброса пароля отправлена!');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((previous) => ({ ...previous, [key]: false }));
    }
  };

  const unlockCompletion = async () => {
    if (!userToUnlock) return;

    const reason = unlockReason.trim();
    const key = `${userToUnlock.id}_unlock-completion`;
    setActionLoading((previous) => ({ ...previous, [key]: true }));
    try {
      const response = await apiFetch(`/api/admin/users/${userToUnlock.id}/unlock-completion`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      setUserToUnlock(null);
      setUnlockReason('');
      loadUsers();

      if (response.notification_sent) {
        showToast('success', 'Завершение снято, респондент снова может редактировать данные.');
      } else {
        showToast('warning', `Завершение снято, но письмо не отправлено: ${response.notification_error || 'проверьте SMTP-настройки.'}`);
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((previous) => ({ ...previous, [key]: false }));
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    const key = `${userToDelete.id}_delete`;
    setActionLoading((previous) => ({ ...previous, [key]: true }));
    try {
      await apiFetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
      setUserToDelete(null);
      showToast('success', 'Пользователь удален.');
      loadUsers();
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((previous) => ({ ...previous, [key]: false }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      const usersPayload = rawData
        .map((row) => {
          const getVal = (keys) => {
            for (const key of keys) {
              if (row[key] !== undefined) return String(row[key]).trim();
            }
            return null;
          };

          const username = getVal(['Email', 'Почта', 'username', 'email']);
          const full_name = getVal(['ФИО', 'Имя', 'Имя пользователя', 'full_name']);
          const roleRaw = getVal(['Роль', 'role']);
          const normalizedRole = roleRaw?.toLowerCase();
          const role = normalizedRole === 'администратор'
            ? 'admin'
            : normalizedRole === 'аналитик' || normalizedRole === 'аудитор'
              ? 'auditor'
              : 'respondent';
          const department_name = getVal(['Подразделение', 'Отдел', 'department_name', 'department']);
          const profession_name = getVal(['Профессия', 'Должность', 'profession_name', 'profession']);

          return { username, full_name, role, department_name, profession_name };
        })
        .filter((item) => item.username);

      if (usersPayload.length === 0) {
        showToast('error', 'Не найдено пользователей с колонкой Email/Почта');
        return;
      }

      const response = await apiFetch('/api/admin/users/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ users: usersPayload }),
      });
      showToast('success', `Импорт завершен. Добавлено: ${response.imported}, пропущено: ${response.skipped}`);
      loadUsers();
    } catch (error) {
      console.error(error);
      showToast('error', `Ошибка импорта: ${error.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const showDepartmentColumn = selectedRole !== 'admin';
  const showProfessionColumn = selectedRole !== 'admin';
  const showAccessColumn = selectedRole !== 'admin';
  const showSurveyStatusColumn = selectedRole === 'respondent';
  const getDeleteDisabledReason = (user) => {
    if (user.can_delete === false && user.role === 'admin') {
      return 'Нельзя удалить последнего администратора';
    }

    return null;
  };
  const HeaderHint = ({ label, hint }) => (
    <Tooltip>
      <div className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex cursor-help text-muted-foreground transition-colors hover:text-foreground" aria-label={`Подсказка: ${label}`}>
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
      </div>
      <TooltipContent>
        {hint}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={120}>
      <div className="space-y-4">
      {toast ? (
        <Alert variant={toast.type === 'success' ? 'success' : toast.type === 'warning' ? 'warning' : 'destructive'}>
          <AlertDescription>{toast.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{ROLE_LABELS[selectedRole]}</CardTitle>
            <div className="text-sm text-muted-foreground">Список пользователей в выбранной роли.</div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по имени или email..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9" />
            </div>
            <input ref={fileInputRef} type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Импорт из Excel
            </Button>
            <Button onClick={() => { setEditingUser(null); setShowForm(true); }}>
              <UserPlus className="h-4 w-4" />
              Добавить пользователя
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Загрузка пользователей...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <HeaderHint
                        label="Пользователь"
                        hint="ФИО и email пользователя в выбранной роли."
                      />
                    </TableHead>
                    {showDepartmentColumn ? (
                      <TableHead>
                        <HeaderHint label="Подразделение" hint="Подразделение пользователя из справочника компании." />
                      </TableHead>
                    ) : null}
                    {showProfessionColumn ? (
                      <TableHead>
                        <HeaderHint label="Профессия" hint="Профессия или должность пользователя из справочника." />
                      </TableHead>
                    ) : null}
                    {showAccessColumn ? (
                      <TableHead>
                        <HeaderHint label="Доступы" hint="Количество процессов 1 уровня, к которым у пользователя есть доступ." />
                      </TableHead>
                    ) : null}
                    <TableHead>
                      <HeaderHint
                        label="Статус пользователя"
                        hint="Статус учетной записи: активен — может входить, заблокирован — вход запрещен."
                      />
                    </TableHead>
                    {showSurveyStatusColumn ? (
                      <TableHead>
                        <HeaderHint label="Статус анкеты" hint="Текущий статус заполнения анкеты респондента." />
                      </TableHead>
                    ) : null}
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary font-bold">
                            {user.full_name?.charAt(0) || user.username.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-semibold">
                              {user.full_name || 'Без имени'}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      {showDepartmentColumn ? <TableCell>{user.department_name || '—'}</TableCell> : null}
                      {showProfessionColumn ? <TableCell>{user.profession_name || '—'}</TableCell> : null}
                      {showAccessColumn ? <TableCell>{user.access_count} процессов</TableCell> : null}
                      <TableCell>
                        <Badge variant={user.is_active ? 'success' : 'secondary'}>{user.is_active ? 'Активен' : 'Заблокирован'}</Badge>
                      </TableCell>
                      {showSurveyStatusColumn ? (
                        <TableCell>
                          <Badge variant={user.is_survey_completed ? 'success' : 'secondary'}>
                            {user.is_survey_completed ? 'Анкета завершена' : 'Анкета в работе'}
                          </Badge>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
                                {actionLoading[`${user.id}_send-invite`] || actionLoading[`${user.id}_send-reset`] || actionLoading[`${user.id}_unlock-completion`] || actionLoading[`${user.id}_delete`]
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Ellipsis className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60">
                              <DropdownMenuItem onClick={() => { setEditingUser(user); setShowForm(true); }}>
                                <Edit className="h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => sendEmail(user.id, 'send-invite')}
                                disabled={actionLoading[`${user.id}_send-invite`]}
                              >
                                <Mail className="h-4 w-4" />
                                Отправить приглашение
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => sendEmail(user.id, 'send-reset')}
                                disabled={actionLoading[`${user.id}_send-reset`]}
                              >
                                <KeyRound className="h-4 w-4" />
                                Сбросить пароль
                              </DropdownMenuItem>
                              {user.role === 'respondent' && user.is_survey_completed ? (
                                <DropdownMenuItem
                                  onClick={() => openUnlockDialog(user)}
                                  disabled={actionLoading[`${user.id}_unlock-completion`]}
                                >
                                  <Unlock className="h-4 w-4" />
                                  Снять завершение
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                                {user.is_active ? <UserMinus className="h-4 w-4 text-destructive" /> : <UserCheck className="h-4 w-4 text-emerald-500" />}
                                {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => setUserToDelete(user)}
                                disabled={actionLoading[`${user.id}_delete`] || user.can_delete === false}
                              >
                                <Trash2 className="h-4 w-4" />
                                {getDeleteDisabledReason(user) || 'Удалить пользователя'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">Пользователи не найдены</div> : null}
            </>
          )}
        </CardContent>
      </Card>

      {showForm ? (
        <UserForm
          user={editingUser}
          defaultRole={selectedRole}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      ) : null}

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete
                ? `Пользователь ${userToDelete.full_name || userToDelete.username} будет удален вместе с доступами, ответами и токенами восстановления. Это действие нельзя отменить.`
                : 'Это действие нельзя отменить.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!(userToDelete && actionLoading[`${userToDelete.id}_delete`])}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!userToUnlock} onOpenChange={(open) => !open && setUserToUnlock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Снять завершение ввода?</DialogTitle>
            <DialogDescription>
              {userToUnlock
                ? `Пользователь ${userToUnlock.full_name || userToUnlock.username} снова сможет редактировать ответы. Причина будет сохранена в логе событий, а респонденту уйдет письмо.`
                : 'Причина будет сохранена в логе событий, а респонденту уйдет письмо.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm font-medium">Причина разблокировки</div>
            <Textarea
              value={unlockReason}
              onChange={(event) => setUnlockReason(event.target.value)}
              placeholder="Например: требуется уточнение ответов после проверки"
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToUnlock(null)}
              disabled={actionLoading[`${userToUnlock?.id}_unlock-completion`]}
            >
              Отмена
            </Button>
            <Button
              onClick={unlockCompletion}
              disabled={actionLoading[`${userToUnlock?.id}_unlock-completion`] || unlockReason.trim().length < 3}
            >
              {actionLoading[`${userToUnlock?.id}_unlock-completion`] ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}
