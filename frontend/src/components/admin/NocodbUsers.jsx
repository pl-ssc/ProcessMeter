import React, { useEffect, useState } from 'react';
import { Database, Loader2, Send, ShieldAlert, UserPlus } from 'lucide-react';
import { apiFetch } from '../../api.js';
import { Alert, AlertDescription } from '../ui/alert.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function NocodbUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadUsers = async ({ silent } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await apiFetch('/api/admin/nocodb/users');
      setUsers(data.users || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Ошибка загрузки пользователей эталонной базы');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleInvite = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setInviting(true);
    try {
      const optimisticUser = {
        id: `temp-${Date.now()}`,
        email,
        roles: role,
        invite_token: 'pending',
        created_at: new Date().toISOString(),
      };
      setUsers((previous) => [...previous, optimisticUser]);
      await apiFetch('/api/admin/nocodb/users', {
        method: 'POST',
        body: JSON.stringify({ email, roles: role }),
      });
      setShowInviteModal(false);
      setEmail('');
      setRole('editor');
      setSuccessMessage(`Приглашение успешно отправлено на ${optimisticUser.email}`);
      await loadUsers({ silent: true });
      window.setTimeout(() => setSuccessMessage(''), 5000);
    } catch (requestError) {
      setUsers((previous) => previous.filter((user) => !String(user.id).startsWith('temp-')));
      setError(`Ошибка при приглашении: ${requestError.message}`);
    } finally {
      setInviting(false);
    }
  };

  const getRoleBadge = (rolesString) => {
    if (!rolesString) return <Badge variant="secondary">Viewer</Badge>;
    if (rolesString.includes('owner') || rolesString.includes('creator')) {
      return (
        <Badge variant="destructive">
          <ShieldAlert className="mr-1 h-3.5 w-3.5" />
          Admin
        </Badge>
      );
    }
    if (rolesString.includes('editor')) return <Badge>Editor</Badge>;
    if (rolesString.includes('commenter')) return <Badge variant="warning">Commenter</Badge>;
    return <Badge variant="secondary">Viewer</Badge>;
  };

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {successMessage ? (
        <Alert variant="success">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Эксперты NocoDB</CardTitle>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href="https://plnsi.processlabs.ru/" target="_blank" rel="noopener noreferrer">
                <Database className="h-4 w-4" />
                Перейти в редактор
              </a>
            </Button>
            <Button onClick={() => { setShowInviteModal(true); setError(''); }}>
              <UserPlus className="h-4 w-4" />
              Пригласить эксперта
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Загружаем список экспертов...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Роль в NocoDB</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата добавления</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            {(user.display_name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{user.display_name || 'Без имени'}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.roles || user.main_roles)}</TableCell>
                      <TableCell>
                        <Badge variant={user.invite_token ? 'warning' : 'success'}>{user.invite_token ? 'Приглашен' : 'Активен'}</Badge>
                      </TableCell>
                      <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">Список экспертов пуст</div> : null}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пригласить эксперта</DialogTitle>
            <DialogDescription>Инвайт со ссылкой на вход будет отправлен на указанную почту.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleInvite}>
            <div className="space-y-2">
              <Label>Email эксперта</Label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Уровень доступа</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Редактор</SelectItem>
                  <SelectItem value="commenter">Комментатор</SelectItem>
                  <SelectItem value="viewer">Читатель</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)} disabled={inviting}>
                Отмена
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Отправить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
