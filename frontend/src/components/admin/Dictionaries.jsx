import React, { useEffect, useState } from 'react';
import { Check, Edit2, Plus, Search, X } from 'lucide-react';
import { apiFetch } from '../../api.js';
import { Alert, AlertDescription } from '../ui/alert.jsx';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Input } from '../ui/input.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.jsx';

const DICTIONARY_LABELS = {
  departments: 'Подразделения',
  professions: 'Профессии',
};

function DictionarySection({ type }) {
  const sectionLabel = DICTIONARY_LABELS[type] || 'Справочник';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const endpoint = type === 'departments' ? '/api/admin/departments' : '/api/admin/professions';

  useEffect(() => {
    loadItems();
  }, [type]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(endpoint);
      setItems(data[type] || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    try {
      setError('');
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ name: newItemName.trim() }),
      });
      setNewItemName('');
      setIsCreating(false);
      loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleUpdate = async (id, isActive = undefined) => {
    try {
      setError('');
      const body = {};
      if (editName.trim() && editingId === id) body.name = editName.trim();
      if (isActive !== undefined) body.is_active = isActive;

      await apiFetch(`${endpoint}/${id}`, {
        method: 'PUT',
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });

      setEditingId(null);
      setEditName('');
      loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Справочник</div>
          <div className="text-3xl font-extrabold tracking-tight">{sectionLabel}</div>
          <div className="text-sm text-muted-foreground">
            Управление записями справочника и их статусом.
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[280px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск по названию..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{sectionLabel}</CardTitle>
          <CardDescription>
            {sectionLabel === 'Подразделения'
              ? 'Список подразделений компании.'
              : 'Список профессий и должностей компании.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCreating ? (
                <TableRow>
                  <TableCell>
                    <Input value={newItemName} onChange={(event) => setNewItemName(event.target.value)} placeholder="Введите название..." autoFocus />
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Активен</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={handleCreate}>
                        <Check className="h-4 w-4 text-emerald-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && filteredItems.length === 0 && !isCreating ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Нет записей
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredItems.map((item) => (
                <TableRow key={item.id} className={!item.is_active ? 'opacity-60' : ''}>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input value={editName} onChange={(event) => setEditName(event.target.value)} autoFocus />
                    ) : (
                      <span className="font-semibold">{item.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button type="button" onClick={() => handleUpdate(item.id, !item.is_active)}>
                      <Badge variant={item.is_active ? 'success' : 'secondary'}>{item.is_active ? 'Активен' : 'Отключен'}</Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {editingId === item.id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleUpdate(item.id)}>
                            <Check className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditName(item.name);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dictionaries({ type = 'departments' }) {
  return <DictionarySection key={type} type={type} />;
}
