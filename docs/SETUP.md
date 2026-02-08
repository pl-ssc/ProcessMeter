# Настройка локальной разработки

## 1) Запуск Postgres
```bash
cd /Users/romangaleev/Documents/CodeProject/ProcessMeter

docker compose up -d db
```

## 2) Применение схемы
```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/processmeter
npm --prefix /Users/romangaleev/Documents/CodeProject/ProcessMeter/backend run migrate
```

Если у тебя уже есть существующая БД и нужно добавить роль:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'respondent';
```

## 2.1) Автомиграции при первом запуске
Бэкенд сам применит `db/schema.sql`, если `AUTO_MIGRATE=true` (по умолчанию).  
При этом администратор будет создан автоматически из `ADMIN_USERNAME/ADMIN_PASSWORD`.

## 2.2) Импорт процессов и справочников
В админ‑интерфейсе есть раздел «Импорт процессов и справочников».  
Он загружает данные таблиц `process_1..4`, `systems`, `executors` из внешней БД.

Важно: при импорте **очищаются ответы пользователей** и создаются новые пустые ответы под новую структуру.

## 3) Импорт справочников (опционально)
Если нужно подтянуть реальные данные из удалённой БД, можно сделать так:
```bash
pg_dump "postgresql://postgres:xdlwaqfbwkiknibn@45.153.191.107:5436/postgres" \
  --data-only --column-inserts \
  --table=process_1 --table=process_2 --table=process_3 --table=process_4 \
  --table=systems --table=executors \
  > /tmp/pm_seed.sql

psql "postgres://postgres:postgres@localhost:5432/processmeter" -f /tmp/pm_seed.sql
```

## 4) Создание пользователя
```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/processmeter
node /Users/romangaleev/Documents/CodeProject/ProcessMeter/backend/scripts/create-user.js user1 pass123 "Иван Иванов"
```

## 5) Запуск бэкенда
```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/processmeter
export JWT_SECRET=change-me
export ADMIN_API_KEY=change-me
export ADMIN_USERNAME="r.i.galeev@gmail.com"
export ADMIN_PASSWORD="G@leevR0m@n"
export ADMIN_FULL_NAME="Роман Галеев"
npm --prefix /Users/romangaleev/Documents/CodeProject/ProcessMeter/backend run dev
```

## 6) Запуск фронтенда
```bash
export VITE_API_URL=http://localhost:3001
npm --prefix /Users/romangaleev/Documents/CodeProject/ProcessMeter/frontend run dev
```

Открой: `http://localhost:5173`

## Деплой (один контейнер приложения)
```bash
docker compose up --build
```
Фронт и бэк будут доступы на `http://localhost:3001`.
